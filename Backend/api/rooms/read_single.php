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

// Query - JOIN with room_types to get complete information
$query = 'SELECT 
    r.room_id,
    r.room_number,
    r.room_type_id,
    r.status,
    rt.type_name,
    rt.description,
    rt.price_per_night,
    rt.image_url,
    rt.amenities,
    rt.max_occupancy
FROM rooms r
INNER JOIN room_types rt ON r.room_type_id = rt.type_id
WHERE r.room_id = :id
LIMIT 1';

// Prepare statement
$stmt = $db->prepare($query);

// Bind ID
$stmt->bindParam(':id', $id, PDO::PARAM_INT);

// Execute query
$stmt->execute();

$row = $stmt->fetch(PDO::FETCH_ASSOC);

if($row) {
    // Create array with proper structure
    $post_arr = array(
        'data' => array(
            'room_id' => $row['room_id'],
            'room_number' => $row['room_number'],
            'room_type_id' => $row['room_type_id'],
            'room_type' => $row['type_name'],
            'price_per_night' => $row['price_per_night'],
            'status' => $row['status'],
            'description' => html_entity_decode($row['description']),
            'image_url' => $row['image_url'],
            'amenities' => $row['amenities'],
            'max_occupancy' => $row['max_occupancy']
        )
    );

    // Make JSON
    echo json_encode($post_arr);
} else {
    echo json_encode(array('message' => 'Room Not Found'));
}
