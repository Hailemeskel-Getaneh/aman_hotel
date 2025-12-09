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

// Get ID
$id = isset($_GET['id']) ? $_GET['id'] : die();

// Query
$query = 'SELECT * FROM rooms WHERE room_id = ? LIMIT 0,1';

// Prepare statement
$stmt = $db->prepare($query);

// Bind ID
$stmt->bindParam(1, $id);

// Execute query
$stmt->execute();

$row = $stmt->fetch(PDO::FETCH_ASSOC);

if($row) {
    // Create array
    $post_arr = array(
        'room_id' => $row['room_id'],
        'room_number' => $row['room_number'],
        'room_type' => $row['room_type'],
        'price_per_night' => $row['price_per_night'],
        'status' => $row['status'],
        'description' => html_entity_decode($row['description'])
    );

    // Make JSON
    echo json_encode($post_arr);
} else {
    echo json_encode(array('message' => 'Room Not Found'));
}
