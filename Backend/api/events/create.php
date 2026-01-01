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

if(!isset($data->title) || !isset($data->start_time)) {
    echo json_encode(array('message' => 'Missing required fields'));
    exit();
}

// Create query
$query = 'INSERT INTO events SET 
    title = :title, 
    description = :description, 
    start_time = :start_time, 
    end_time = :end_time,
    location = :location,
    organizer_id = :organizer_id,
    vip_capacity = :vip_capacity,
    regular_capacity = :regular_capacity,
    vip_price = :vip_price,
    regular_price = :regular_price';

$stmt = $db->prepare($query);

// Bind data
$stmt->bindParam(':title', $data->title);
$stmt->bindParam(':description', $data->description);
$stmt->bindParam(':start_time', $data->start_time);
$stmt->bindParam(':end_time', $data->end_time);
$stmt->bindParam(':location', $data->location);
$stmt->bindParam(':organizer_id', $data->organizer_id);
$stmt->bindParam(':vip_capacity', $data->vip_capacity);
$stmt->bindParam(':regular_capacity', $data->regular_capacity);
$stmt->bindParam(':vip_price', $data->vip_price);
$stmt->bindParam(':regular_price', $data->regular_price);

if($stmt->execute()) {
    echo json_encode(array('message' => 'Event Created'));
} else {
    echo json_encode(array('message' => 'Event Not Created'));
}
