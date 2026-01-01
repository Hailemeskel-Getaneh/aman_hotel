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

// First, get the booking details including payment_ref and price
$get_booking_query = 'SELECT room_id, payment_ref, final_price FROM bookings WHERE id = :id';
$get_stmt = $db->prepare($get_booking_query);
$get_stmt->bindParam(':id', $data->id);
$get_stmt->execute();
$booking = $get_stmt->fetch(PDO::FETCH_ASSOC);

if(!$booking) {
    echo json_encode(array('message' => 'Booking not found'));
    exit();
}

$room_id = $booking['room_id'];
$payment_ref = $booking['payment_ref'];
$final_price = $booking['final_price'];

// Update booking status and refund info if cancelled and paid
if($data->status === 'cancelled' && $payment_ref) {
    // Booking is being cancelled and was paid - set refund status
    $query = 'UPDATE bookings SET status = :status, refund_status = :refund_status, refund_amount = :refund_amount WHERE id = :id';
    $stmt = $db->prepare($query);
    
    $refund_status = 'pending';
    $stmt->bindParam(':status', $data->status);
    $stmt->bindParam(':refund_status', $refund_status);
    $stmt->bindParam(':refund_amount', $final_price);
    $stmt->bindParam(':id', $data->id);
} else {
    // Normal status update without refund
    $query = 'UPDATE bookings SET status = :status WHERE id = :id';
    $stmt = $db->prepare($query);
    $stmt->bindParam(':status', $data->status);
    $stmt->bindParam(':id', $data->id);
}

if($stmt->execute()) {
    // Update room status based on booking status
    // Room becomes 'booked' only when admin approves (confirmed)
    // Room becomes 'available' when booking is cancelled or completed
    $new_room_status = 'available';
    if($data->status === 'confirmed') {
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
