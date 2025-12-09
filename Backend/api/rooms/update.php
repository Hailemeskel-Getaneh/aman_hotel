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

// Get raw posted data
$data = json_decode(file_get_contents("php://input"));

if(!isset($data->room_id)) {
    echo json_encode(array('message' => 'Missing room_id'));
    exit();
}

$room_id = $data->room_id;
$room_number = isset($data->room_number) ? $data->room_number : null;
$room_type_id = isset($data->room_type_id) ? $data->room_type_id : null;
$status = isset($data->status) ? $data->status : null;

// Build dynamic update query
$updates = array();
$params = array(':room_id' => $room_id);

if($room_number !== null) {
    $updates[] = 'room_number = :room_number';
    $params[':room_number'] = $room_number;
}
if($room_type_id !== null) {
    $updates[] = 'room_type_id = :room_type_id';
    $params[':room_type_id'] = $room_type_id;
}
if($status !== null) {
    $updates[] = 'status = :status';
    $params[':status'] = $status;
}

if(empty($updates)) {
    echo json_encode(array('message' => 'No fields to update'));
    exit();
}

$query = 'UPDATE rooms SET ' . implode(', ', $updates) . ' WHERE room_id = :room_id';

$stmt = $db->prepare($query);

foreach($params as $key => $value) {
    $stmt->bindValue($key, $value);
}

if($stmt->execute()) {
    echo json_encode(array('message' => 'Room Updated'));
} else {
    echo json_encode(array('message' => 'Room Not Updated'));
}
