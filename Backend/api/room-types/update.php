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

if(!isset($data->type_id)) {
    echo json_encode(array('message' => 'Missing type_id'));
    exit();
}

$type_id = $data->type_id;
$type_name = isset($data->type_name) ? $data->type_name : null;
$description = isset($data->description) ? $data->description : null;
$price_per_night = isset($data->price_per_night) ? $data->price_per_night : null;
$image_url = isset($data->image_url) ? $data->image_url : null;
$amenities = isset($data->amenities) ? $data->amenities : null;
$max_occupancy = isset($data->max_occupancy) ? $data->max_occupancy : null;

// Build dynamic update query
$updates = array();
$params = array(':type_id' => $type_id);

if($type_name !== null) {
    $updates[] = 'type_name = :type_name';
    $params[':type_name'] = $type_name;
}
if($description !== null) {
    $updates[] = 'description = :description';
    $params[':description'] = $description;
}
if($price_per_night !== null) {
    $updates[] = 'price_per_night = :price_per_night';
    $params[':price_per_night'] = $price_per_night;
}
if($image_url !== null) {
    $updates[] = 'image_url = :image_url';
    $params[':image_url'] = $image_url;
}
if($amenities !== null) {
    $updates[] = 'amenities = :amenities';
    $params[':amenities'] = $amenities;
}
if($max_occupancy !== null) {
    $updates[] = 'max_occupancy = :max_occupancy';
    $params[':max_occupancy'] = $max_occupancy;
}

if(empty($updates)) {
    echo json_encode(array('message' => 'No fields to update'));
    exit();
}

$query = 'UPDATE room_types SET ' . implode(', ', $updates) . ' WHERE type_id = :type_id';

$stmt = $db->prepare($query);

foreach($params as $key => $value) {
    $stmt->bindValue($key, $value);
}

if($stmt->execute()) {
    echo json_encode(array('message' => 'Room Type Updated'));
} else {
    echo json_encode(array('message' => 'Room Type Not Updated'));
}
