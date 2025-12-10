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

// Get query parameters
$check_in = isset($_GET['check_in']) ? $_GET['check_in'] : '';
$check_out = isset($_GET['check_out']) ? $_GET['check_out'] : '';
$room_type_id = isset($_GET['room_type_id']) ? $_GET['room_type_id'] : '';

// Validate required parameters
if (empty($check_in) || empty($check_out)) {
    echo json_encode(array('error' => 'check_in and check_out dates are required'));
    exit();
}

// Build query to get all rooms with their type information
$query = 'SELECT 
    r.room_id,
    r.room_number,
    r.room_type_id,
    r.status,
    rt.type_name as room_type,
    rt.description,
    rt.price_per_night,
    rt.image_url,
    rt.amenities,
    rt.max_occupancy
FROM rooms r
INNER JOIN room_types rt ON r.room_type_id = rt.type_id';

// Add room type filter if provided
if (!empty($room_type_id)) {
    $query .= ' WHERE r.room_type_id = :room_type_id';
}

$stmt = $db->prepare($query);

if (!empty($room_type_id)) {
    $stmt->bindParam(':room_type_id', $room_type_id);
}

$stmt->execute();

$rooms = $stmt->fetchAll(PDO::FETCH_ASSOC);

// For each room, check if there are conflicting bookings
$available_rooms = array();

foreach ($rooms as $room) {
    // Check for conflicting bookings
    // A booking conflicts if: (new_checkin < existing_checkout) AND (new_checkout > existing_checkin)
    $conflict_query = 'SELECT COUNT(*) as conflict_count
                       FROM bookings
                       WHERE room_id = :room_id
                       AND status IN (:status1, :status2)
                       AND check_in < :check_out
                       AND check_out > :check_in';
    
    $conflict_stmt = $db->prepare($conflict_query);
    $conflict_stmt->bindParam(':room_id', $room['room_id']);
    $status1 = 'pending';
    $status2 = 'confirmed';
    $conflict_stmt->bindParam(':status1', $status1);
    $conflict_stmt->bindParam(':status2', $status2);
    $conflict_stmt->bindParam(':check_in', $check_in);
    $conflict_stmt->bindParam(':check_out', $check_out);
    $conflict_stmt->execute();
    
    $conflict_result = $conflict_stmt->fetch(PDO::FETCH_ASSOC);
    
    // If no conflicts and room is not in maintenance, mark as available
    $is_available = ($conflict_result['conflict_count'] == 0 && $room['status'] != 'maintenance');
    
    $room['available_for_dates'] = $is_available;
    array_push($available_rooms, $room);
}

// Return results
echo json_encode(array('data' => $available_rooms));
