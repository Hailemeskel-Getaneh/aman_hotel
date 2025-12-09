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

// Get ID from URL
$type_id = isset($_GET['id']) ? $_GET['id'] : die();

// Query
$query = 'SELECT * FROM room_types WHERE type_id = :type_id LIMIT 1';

// Prepare statement
$stmt = $db->prepare($query);

// Bind ID
$stmt->bindParam(':type_id', $type_id);

// Execute query
$stmt->execute();

$row = $stmt->fetch(PDO::FETCH_ASSOC);

if($row) {
    $type_item = array(
        'type_id' => $row['type_id'],
        'type_name' => $row['type_name'],
        'description' => html_entity_decode($row['description']),
        'price_per_night' => $row['price_per_night'],
        'image_url' => $row['image_url'],
        'amenities' => $row['amenities'],
        'max_occupancy' => $row['max_occupancy'],
        'created_at' => $row['created_at']
    );

    echo json_encode($type_item);
} else {
    echo json_encode(array('message' => 'Room Type Not Found'));
}
