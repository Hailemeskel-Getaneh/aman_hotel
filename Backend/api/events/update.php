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

// Dynamic update query
$query = "UPDATE events SET ";
$params = [];

if($title) { $query .= "title = :title, "; $params[':title'] = $title; }
if($description) { $query .= "description = :description, "; $params[':description'] = $description; }
if($start_time) { $query .= "start_time = :start_time, "; $params[':start_time'] = $start_time; }
if($location) { $query .= "location = :location, "; $params[':location'] = $location; }

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
