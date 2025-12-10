<?php
// Headers
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: PUT');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers,Content-Type,Access-Control-Allow-Methods, Authorization, X-Requested-With');

include_once '../../config/Database.php';
include_once '../../config/Cors.php';

// Handle CORS
Cors::handle();

// Instantiate DB & Connect
$database = new Database();
$db = $database->connect();

$data = json_decode(file_get_contents("php://input"));

if(!isset($data->id) || !isset($data->status)) {
    echo json_encode(array('message' => 'Missing required fields'));
    exit();
}

// First, get the room_id for this booking
$get_room_query = 'SELECT room_id FROM bookings WHERE id = :id';
$get_stmt = $db->prepare($get_room_query);
$get_stmt->bindParam(':id', $data->id);
$get_stmt->execute();
$booking = $get_stmt->fetch(PDO::FETCH_ASSOC);

if(!$booking) {
    echo json_encode(array('message' => 'Booking not found'));
    exit();
}

$room_id = $booking['room_id'];

// Update booking status
$query = 'UPDATE bookings SET status = :status WHERE id = :id';
$stmt = $db->prepare($query);

$stmt->bindParam(':status', $data->status);
$stmt->bindParam(':id', $data->id);

if($stmt->execute()) {
    // Update room status based on booking status
    // If booking is cancelled or completed, make room available again
    $new_room_status = 'available';
    if($data->status === 'confirmed' || $data->status === 'pending') {
        $new_room_status = 'booked';
    }
    
    $update_room_query = 'UPDATE rooms SET status = :status WHERE room_id = :room_id';
    $update_room_stmt = $db->prepare($update_room_query);
    $update_room_stmt->bindParam(':status', $new_room_status);
    $update_room_stmt->bindParam(':room_id', $room_id);
    $update_room_stmt->execute();
    
    echo json_encode(array('message' => 'Booking Status Updated'));
} else {
    echo json_encode(array('message' => 'Failed to Update Booking'));
}
