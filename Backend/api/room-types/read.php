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

// Query
$query = 'SELECT * FROM room_types ORDER BY type_name ASC';

// Prepare statement
$stmt = $db->prepare($query);

// Execute query
$stmt->execute();

// Get row count
$num = $stmt->rowCount();

// Check if any room types
if($num > 0) {
    // Room types array
    $types_arr = array();
    $types_arr['data'] = array();

    while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        extract($row);

        $type_item = array(
            'type_id' => $type_id,
            'type_name' => $type_name,
            'description' => html_entity_decode($description),
            'price_per_night' => $price_per_night,
            'image_url' => $image_url,
            'amenities' => $amenities,
            'max_occupancy' => $max_occupancy,
            'created_at' => $created_at
        );

        // Push to "data"
        array_push($types_arr['data'], $type_item);
    }

    // Turn to JSON & output
    echo json_encode($types_arr);

} else {
    // No Room Types
    echo json_encode(
        array('message' => 'No Room Types Found')
    );
}
