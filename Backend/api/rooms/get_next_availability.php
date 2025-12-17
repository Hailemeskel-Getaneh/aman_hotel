<?php
// Headers
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

include_once '../../config/Database.php';
include_once '../../config/Cors.php';

// Handle CORS
Cors::handle();

// Instantiate DB & Connect
$database = new Database();
$db = $database->connect();

// Get ID from URL
$room_type_id = isset($_GET['room_type_id']) ? $_GET['room_type_id'] : die();
$request_date = isset($_GET['from_date']) ? $_GET['from_date'] : date('Y-m-d');
$today = date('Y-m-d');

// We want to find gaps around the requested date, starting from Request Date.
// Range to check: Request Date -> Request Date + 45 days (plenty of horizon)
$check_start = $request_date;
$check_end = date('Y-m-d', strtotime($request_date . ' + 45 days'));

// 1. Get Total Rooms
$query_total = 'SELECT COUNT(*) as total_rooms FROM rooms WHERE room_type_id = :type_id';
$stmt_total = $db->prepare($query_total);
$stmt_total->bindParam(':type_id', $room_type_id);
$stmt_total->execute();
$row_total = $stmt_total->fetch(PDO::FETCH_ASSOC);
$total_rooms = $row_total['total_rooms'];

if ($total_rooms == 0) {
    echo json_encode(array('message' => 'No rooms of this type found.'));
    exit();
}

// 2. Get Bookings in Range (Aggregated + Specific)
$query_bookings = 'SELECT b.check_in, b.check_out, COALESCE(b.quantity, 1) as quantity
                  FROM bookings b 
                  LEFT JOIN rooms r ON b.room_id = r.room_id 
                  WHERE (b.room_type_id = :type_id OR r.room_type_id = :type_id)
                  AND b.status IN ("confirmed", "pending") 
                  AND b.check_out > :start_date 
                  AND b.check_in < :end_date
                  ORDER BY b.check_in ASC';

$stmt_bookings = $db->prepare($query_bookings);
$stmt_bookings->bindParam(':type_id', $room_type_id);
$stmt_bookings->bindParam(':start_date', $check_start);
$stmt_bookings->bindParam(':end_date', $check_end);
$stmt_bookings->execute();

$bookings = $stmt_bookings->fetchAll(PDO::FETCH_ASSOC);

// 3. Daily Occupancy Check
// Efficient enough for 45 days.
$gaps = [];
$current_gap_start = null;
$s_date = new DateTime($check_start);
$e_date = new DateTime($check_end);

for($d = clone $s_date; $d <= $e_date; $d->modify('+1 day')) {
    $current_date_str = $d->format('Y-m-d');
    
    // Count occupancy for this date
    // A booking covers a date if check_in <= date < check_out
    $occupancy = 0;
    foreach ($bookings as $b) {
        if ($b['check_in'] <= $current_date_str && $b['check_out'] > $current_date_str) {
            $occupancy += intval($b['quantity']);
        }
    }

    $is_free = ($occupancy < $total_rooms);

    if ($is_free) {
        if (!$current_gap_start) {
            $current_gap_start = $current_date_str;
        }
    } else {
        if ($current_gap_start) {
            // End of gap (gap was up to yesterday)
            // End date should be exclusive? 
            // Usually range is Start (Check-in) to End (Check-out).
            // Since we iterated daily, if we were free yesterday and busy today, 
            // Valid Check-out date is TODAY.
            $gaps[] = [
                'start' => $current_gap_start,
                'end' => $current_date_str
            ];
            $current_gap_start = null;
        }
    }
}

// Close final gap if exists
if ($current_gap_start) {
    $gaps[] = [
        'start' => $current_gap_start,
        'end' => $check_end // or open-ended
    ];
}

// 4. Filter/Format Gaps
// We want gaps "around" the request date.
// If request_date is blocked, we likely have gaps before and after.
// Let's return the simplified text as requested by user logic.
// "Free: [Gap1], [Gap2]"

$response_text = "";
$valid_gaps = [];

foreach ($gaps as $gap) {
    // Only keep gaps that are reasonably close?
    // Let's keep all for now, frontend can limit.
    $valid_gaps[] = $gap;
}

// Construct simplified response
// Find next available date (first gap start)
$next_date = null;
if (count($valid_gaps) > 0) {
    $next_date = $valid_gaps[0]['start'];
}

echo json_encode(array(
    'available_date' => $next_date,
    'gaps' => $valid_gaps
));
