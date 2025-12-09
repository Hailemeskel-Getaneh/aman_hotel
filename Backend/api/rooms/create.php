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

if(!isset($data->room_number) || !isset($data->room_type) || !isset($data->price_per_night)) {
    echo json_encode(array('message' => 'Missing required fields'));
    exit();
}

$room_number = $data->room_number;
$room_type = $data->room_type;
$price_per_night = $data->price_per_night;
$status = isset($data->status) ? $data->status : 'available';
$description = isset($data->description) ? $data->description : '';

// Create query
$query = 'INSERT INTO rooms SET 
    room_number = :room_number, 
    room_type = :room_type, 
    price_per_night = :price_per_night, 
    status = :status, 
    description = :description';

$stmt = $db->prepare($query);

// Bind data
$stmt->bindParam(':room_number', $room_number);
$stmt->bindParam(':room_type', $room_type);
$stmt->bindParam(':price_per_night', $price_per_night);
$stmt->bindParam(':status', $status);
$stmt->bindParam(':description', $description);

if($stmt->execute()) {
    echo json_encode(array('message' => 'Room Created'));
} else {
    echo json_encode(array('message' => 'Room Not Created'));
}
