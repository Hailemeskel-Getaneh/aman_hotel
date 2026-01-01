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

// Get ID
$booking_id = isset($_GET['booking_id']) ? $_GET['booking_id'] : die();

// Query
$query = "SELECT 
            b.*, 
            u.name as user_name, 
            u.email as user_email,
            r.room_number,
            rt.type_name as room_type
          FROM bookings b
          JOIN users u ON b.user_id = u.id
          LEFT JOIN rooms r ON b.room_id = r.room_id
          LEFT JOIN room_types rt ON rt.type_id = COALESCE(b.room_type_id, r.room_type_id)
          WHERE b.id = :booking_id";

// Prepare statement
$stmt = $db->prepare($query);

// Bind ID
$stmt->bindParam(':booking_id', $booking_id);

// Execute query
$stmt->execute();

$row = $stmt->fetch(PDO::FETCH_ASSOC);

if($row) {
    echo json_encode($row);
} else {
    echo json_encode(array('message' => 'Booking Not Found'));
}
