<?php
// Headers
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST'); // Using POST for delete to keep it simple with body, though DELETE method is standard
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

if(!isset($data->room_id)) {
    echo json_encode(array('message' => 'Missing room_id'));
    exit();
}

$query = 'DELETE FROM rooms WHERE room_id = :room_id';
$stmt = $db->prepare($query);
$stmt->bindParam(':room_id', $data->room_id);

if($stmt->execute()) {
    echo json_encode(array('message' => 'Room Deleted'));
} else {
    echo json_encode(array('message' => 'Room Not Deleted'));
}
