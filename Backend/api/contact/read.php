<?php
// Headers
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

include_once '../../config/Database.php';
include_once '../../config/Cors.php';

// Handle CORS
Cors::handle();

// Instantiate DB & Connect
$database = new Database();
$db = $database->connect();

$query = 'SELECT * FROM contact_messages ORDER BY created_at DESC';
$stmt = $db->prepare($query);
$stmt->execute();

$num = $stmt->rowCount();

if($num > 0) {
    $messages_arr = array();
    $messages_arr['data'] = array();

    while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        array_push($messages_arr['data'], $row);
    }
    echo json_encode($messages_arr);
} else {
    echo json_encode(array('message' => 'No Messages Found'));
}
