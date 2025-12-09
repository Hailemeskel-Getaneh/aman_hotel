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
$room_type = isset($data->room_type) ? $data->room_type : null;
$price_per_night = isset($data->price_per_night) ? $data->price_per_night : null;
$status = isset($data->status) ? $data->status : null;
$description = isset($data->description) ? $data->description : null;

// Dynamic update query
$query = "UPDATE rooms SET ";
$params = [];

if($room_number) { $query .= "room_number = :room_number, "; $params[':room_number'] = $room_number; }
if($room_type) { $query .= "room_type = :room_type, "; $params[':room_type'] = $room_type; }
if($price_per_night) { $query .= "price_per_night = :price_per_night, "; $params[':price_per_night'] = $price_per_night; }
if($status) { $query .= "status = :status, "; $params[':status'] = $status; }
if($description) { $query .= "description = :description, "; $params[':description'] = $description; }

// Remove trailing comma
$query = rtrim($query, ", ");
$query .= " WHERE room_id = :room_id";
$params[':room_id'] = $room_id;

$stmt = $db->prepare($query);

if($stmt->execute($params)) {
    echo json_encode(array('message' => 'Room Updated'));
} else {
    echo json_encode(array('message' => 'Room Not Updated'));
}
