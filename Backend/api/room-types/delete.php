<?php
// Headers
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: DELETE');
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

// Check if any rooms are using this type
$check_query = 'SELECT COUNT(*) as room_count FROM rooms WHERE room_type_id = :type_id';
$check_stmt = $db->prepare($check_query);
$check_stmt->bindParam(':type_id', $type_id);
$check_stmt->execute();
$result = $check_stmt->fetch(PDO::FETCH_ASSOC);

if($result['room_count'] > 0) {
    echo json_encode(array(
        'message' => 'Cannot delete room type. ' . $result['room_count'] . ' room(s) are using this type.',
        'error' => true
    ));
    exit();
}

// Delete query
$query = 'DELETE FROM room_types WHERE type_id = :type_id';

$stmt = $db->prepare($query);
$stmt->bindParam(':type_id', $type_id);

if($stmt->execute()) {
    echo json_encode(array('message' => 'Room Type Deleted'));
} else {
    echo json_encode(array('message' => 'Room Type Not Deleted'));
}
