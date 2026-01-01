<?php
// Headers
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers,Content-Type,Access-Control-Allow-Methods, Authorization, X-Requested-With');

include_once '../../config/Database.php';
include_once '../../config/Cors.php';

// Handle CORS
Cors::handle();

// Instantiate DB & Connect
$database = new Database();
$db = $database->connect();

// Get raw posted data
$data = json_decode(file_get_contents("php://input"));

if(!isset($data->user_id) || !isset($data->room_type_id) || !isset($data->check_in) || !isset($data->check_out) || !isset($data->count)) {
    echo json_encode(array('message' => 'Missing required fields'));
    exit();
}

$user_id = $data->user_id;
$room_type_id = $data->room_type_id;
$check_in = $data->check_in;
$check_out = $data->check_out;
$count = intval($data->count);

if ($count <= 0) {
    echo json_encode(array('message' => 'Invalid room count'));
    exit();
}

// Calculate Nights
$date1 = new DateTime($check_in);
$date2 = new DateTime($check_out);
$interval = $date1->diff($date2);
$nights = $interval->days;

if($nights <= 0) {
    echo json_encode(array('message' => 'Invalid Date Range'));
    exit();
}

// Get Room Price
$query = "SELECT price_per_night FROM room_types WHERE type_id = :type_id";
$stmt = $db->prepare($query);
$stmt->bindParam(':type_id', $room_type_id);
$stmt->execute();
$row = $stmt->fetch(PDO::FETCH_ASSOC);

if(!$row) {
    echo json_encode(array('message' => 'Room Type Not Found'));
    exit();
}

$price_per_night = $row['price_per_night'];
// Total price for ALL rooms
$base_price = $nights * $price_per_night * $count;
$discount_rate = isset($data->discount_rate) ? $data->discount_rate : 0.00;
$final_price = $base_price - ($base_price * ($discount_rate / 100));
$status = 'pending';

// --- AVAILABILITY CHECK ---

// 1. Total rooms of this type
$query_total = "SELECT COUNT(*) as total FROM rooms WHERE room_type_id = :type_id AND status != 'maintenance'";
$stmt_total = $db->prepare($query_total);
$stmt_total->bindParam(':type_id', $room_type_id);
$stmt_total->execute();
$row_total = $stmt_total->fetch(PDO::FETCH_ASSOC);
$total_rooms = intval($row_total['total']);

// 2. Booked rooms (sum of quantity) overlapping dates
// Overlap: check_in < requested_checkout AND check_out > requested_checkin
$query_booked = "
    SELECT COALESCE(SUM(quantity), 0) as booked 
    FROM bookings 
    WHERE room_type_id = :type_id 
    AND status IN ('confirmed', 'pending') 
    AND (check_in < :check_out AND check_out > :check_in)
";
// Note: We include 'pending' in availability check to prevent overbooking during payment
// 'cancelled' is ignored.

$stmt_booked = $db->prepare($query_booked);
$stmt_booked->bindParam(':type_id', $room_type_id);
$stmt_booked->bindParam(':check_in', $check_in);
$stmt_booked->bindParam(':check_out', $check_out);
$stmt_booked->execute();
$row_booked = $stmt_booked->fetch(PDO::FETCH_ASSOC);
$booked_rooms = intval($row_booked['booked']);

$available_rooms = $total_rooms - $booked_rooms;

if ($available_rooms < $count) {
    echo json_encode(array(
        'message' => 'Not enough rooms available for these dates',
        'available' => $available_rooms,
        'requested' => $count
    ));
    exit();
}

// --- FETCH AVAILABLE ROOM IDs ---

$query_ids = "SELECT r.room_id 
              FROM rooms r 
              WHERE r.room_type_id = :type_id 
              AND r.status != 'maintenance'
              AND r.room_id NOT IN (
                  SELECT b.room_id 
                  FROM bookings b 
                  WHERE b.status IN ('confirmed', 'pending') 
                  AND b.room_id IS NOT NULL 
                  AND (b.check_in < :check_out AND b.check_out > :check_in)
              )
              LIMIT :limit";

$stmt_ids = $db->prepare($query_ids);
$stmt_ids->bindParam(':type_id', $room_type_id);
$stmt_ids->bindParam(':check_in', $check_in);
$stmt_ids->bindParam(':check_out', $check_out);
$stmt_ids->bindParam(':limit', $count, PDO::PARAM_INT);
$stmt_ids->execute();
$available_ids = $stmt_ids->fetchAll(PDO::FETCH_COLUMN);

// Fallback: If we assume global availability is OK (from previous check), but we can't find specific IDs
// (e.g. because Ghost Bookings block capacity but not IDs), we might have an issue.
// However, since we want to assign IDs, we MUST find them.
if (count($available_ids) < $count) {
    echo json_encode(array(
        'message' => 'Not enough specific rooms available to assign IDs',
        'found' => count($available_ids),
        'needed' => $count
    ));
    exit();
}

// --- INSERT BOOKINGS ---

try {
    $db->beginTransaction();
    $booking_ids = [];
    
    // Calculate price per room
    $single_room_price = $nights * $price_per_night;
    $single_final_price = $single_room_price - ($single_room_price * ($discount_rate / 100));

    $query_insert = 'INSERT INTO bookings SET 
        user_id = :user_id, 
        room_type_id = :room_type_id,
        quantity = 1,
        room_id = :room_id,
        check_in = :check_in, 
        check_out = :check_out, 
        nights = :nights, 
        base_price = :base_price, 
        discount_rate = :discount_rate, 
        final_price = :final_price, 
        status = :status';

    $stmt_insert = $db->prepare($query_insert);

    foreach ($available_ids as $assigned_room_id) {
        $stmt_insert->bindParam(':user_id', $user_id);
        $stmt_insert->bindParam(':room_type_id', $room_type_id);
        // quantity is 1 per row
        $stmt_insert->bindParam(':room_id', $assigned_room_id);
        $stmt_insert->bindParam(':check_in', $check_in);
        $stmt_insert->bindParam(':check_out', $check_out);
        $stmt_insert->bindParam(':nights', $nights);
        $stmt_insert->bindParam(':base_price', $single_room_price);
        $stmt_insert->bindParam(':discount_rate', $discount_rate);
        $stmt_insert->bindParam(':final_price', $single_final_price);
        $stmt_insert->bindParam(':status', $status);
        
        if ($stmt_insert->execute()) {
            $booking_ids[] = $db->lastInsertId();
        } else {
             throw new Exception("Error inserting booking line");
        }
    }

    $db->commit();
    
    echo json_encode(array(
        'message' => 'Bookings Created',
        'booking_ids' => $booking_ids,
        'count' => count($booking_ids)
    ));

} catch (Exception $e) {
    $db->rollBack();
    echo json_encode(array('message' => 'Booking Failed: ' . $e->getMessage()));
}
?>
