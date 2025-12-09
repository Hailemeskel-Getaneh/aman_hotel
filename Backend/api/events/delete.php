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

$data = json_decode(file_get_contents("php://input"));

if(!isset($data->event_id)) {
    echo json_encode(array('message' => 'Missing event_id'));
    exit();
}

$query = 'DELETE FROM events WHERE event_id = :event_id';
$stmt = $db->prepare($query);
$stmt->bindParam(':event_id', $data->event_id);

if($stmt->execute()) {
    echo json_encode(array('message' => 'Event Deleted'));
} else {
    echo json_encode(array('message' => 'Event Not Deleted'));
}
