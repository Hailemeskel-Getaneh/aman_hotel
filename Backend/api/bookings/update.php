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

$query = 'UPDATE bookings SET status = :status WHERE id = :id';
$stmt = $db->prepare($query);

$stmt->bindParam(':status', $data->status);
$stmt->bindParam(':id', $data->id);

if($stmt->execute()) {
    echo json_encode(array('message' => 'Booking Status Updated'));
} else {
    echo json_encode(array('message' => 'Failed to Update Booking'));
}
