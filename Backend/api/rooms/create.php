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

if(!isset($data->room_number) || !isset($data->room_type_id)) {
    echo json_encode(array('message' => 'Missing required fields'));
    exit();
}

$room_number = $data->room_number;
$room_type_id = $data->room_type_id;
$status = isset($data->status) ? $data->status : 'available';

// Verify room type exists
$check_query = 'SELECT type_id FROM room_types WHERE type_id = :room_type_id';
$check_stmt = $db->prepare($check_query);
$check_stmt->bindParam(':room_type_id', $room_type_id);
$check_stmt->execute();

if($check_stmt->rowCount() === 0) {
    echo json_encode(array('message' => 'Invalid room type'));
    exit();
}

// Create query
$query = 'INSERT INTO rooms SET 
    room_number = :room_number, 
    room_type_id = :room_type_id, 
    status = :status';

$stmt = $db->prepare($query);

// Bind data
$stmt->bindParam(':room_number', $room_number);
$stmt->bindParam(':room_type_id', $room_type_id);
$stmt->bindParam(':status', $status);

if($stmt->execute()) {
    echo json_encode(array('message' => 'Room Created', 'room_id' => $db->lastInsertId()));
} else {
    echo json_encode(array('message' => 'Room Not Created'));
}
