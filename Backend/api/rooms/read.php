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
$query = 'SELECT * FROM rooms';

// Prepare statement
$stmt = $db->prepare($query);

// Execute query
$stmt->execute();

// Get row count
$num = $stmt->rowCount();

// Check if any rooms
if($num > 0) {
    // Room array
    $posts_arr = array();
    $posts_arr['data'] = array();

    while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        extract($row);

        $post_item = array(
            'room_id' => $room_id,
            'room_number' => $room_number,
            'room_type' => $room_type,
            'price_per_night' => $price_per_night,
            'status' => $status,
            'description' => html_entity_decode($description)
        );

        // Push to "data"
        array_push($posts_arr['data'], $post_item);
    }

    // Turn to JSON & output
    echo json_encode($posts_arr);

} else {
    // No Rooms
    echo json_encode(
        array('message' => 'No Rooms Found')
    );
}
