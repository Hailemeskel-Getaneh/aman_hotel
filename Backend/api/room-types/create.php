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

if(!isset($data->type_name) || !isset($data->price_per_night)) {
    echo json_encode(array('message' => 'Missing required fields'));
    exit();
}

$type_name = $data->type_name;
$description = isset($data->description) ? $data->description : '';
$price_per_night = $data->price_per_night;
$image_url = isset($data->image_url) ? $data->image_url : NULL;
$amenities = isset($data->amenities) ? $data->amenities : '';
$max_occupancy = isset($data->max_occupancy) ? $data->max_occupancy : 2;

// Create query
$query = 'INSERT INTO room_types SET 
    type_name = :type_name, 
    description = :description, 
    price_per_night = :price_per_night, 
    image_url = :image_url,
    amenities = :amenities,
    max_occupancy = :max_occupancy';

$stmt = $db->prepare($query);

// Bind data
$stmt->bindParam(':type_name', $type_name);
$stmt->bindParam(':description', $description);
$stmt->bindParam(':price_per_night', $price_per_night);
$stmt->bindParam(':image_url', $image_url);
$stmt->bindParam(':amenities', $amenities);
$stmt->bindParam(':max_occupancy', $max_occupancy);

if($stmt->execute()) {
    echo json_encode(array('message' => 'Room Type Created', 'type_id' => $db->lastInsertId()));
} else {
    echo json_encode(array('message' => 'Room Type Not Created'));
}
