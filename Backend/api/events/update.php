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

if(!isset($data->event_id)) {
    echo json_encode(array('message' => 'Missing event_id'));
    exit();
}

$event_id = $data->event_id;
$title = isset($data->title) ? $data->title : null;
$description = isset($data->description) ? $data->description : null;
$start_time = isset($data->start_time) ? $data->start_time : null;
$location = isset($data->location) ? $data->location : null;

$end_time = isset($data->end_time) ? $data->end_time : null;
$vip_capacity = isset($data->vip_capacity) ? $data->vip_capacity : null;
$regular_capacity = isset($data->regular_capacity) ? $data->regular_capacity : null;
$vip_price = isset($data->vip_price) ? $data->vip_price : null;
$regular_price = isset($data->regular_price) ? $data->regular_price : null;

// Dynamic update query
$query = "UPDATE events SET ";
$params = [];

if($title) { $query .= "title = :title, "; $params[':title'] = $title; }
if($description) { $query .= "description = :description, "; $params[':description'] = $description; }
if($start_time) { $query .= "start_time = :start_time, "; $params[':start_time'] = $start_time; }
if($end_time) { $query .= "end_time = :end_time, "; $params[':end_time'] = $end_time; }
if($location) { $query .= "location = :location, "; $params[':location'] = $location; }

// Allow updating to 0, so check strictly for null if these fields are optional. 
// However, frontend sends them. 
if($vip_capacity !== null) { $query .= "vip_capacity = :vip_capacity, "; $params[':vip_capacity'] = $vip_capacity; }
if($regular_capacity !== null) { $query .= "regular_capacity = :regular_capacity, "; $params[':regular_capacity'] = $regular_capacity; }
if($vip_price !== null) { $query .= "vip_price = :vip_price, "; $params[':vip_price'] = $vip_price; }
if($regular_price !== null) { $query .= "regular_price = :regular_price, "; $params[':regular_price'] = $regular_price; }

// Remove trailing comma
$query = rtrim($query, ", ");
$query .= " WHERE event_id = :event_id";
$params[':event_id'] = $event_id;

$stmt = $db->prepare($query);

if($stmt->execute($params)) {
    echo json_encode(array('message' => 'Event Updated'));
} else {
    echo json_encode(array('message' => 'Event Not Updated'));
}
