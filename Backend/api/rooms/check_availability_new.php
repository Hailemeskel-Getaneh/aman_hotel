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
$check_in = isset($_GET['check_in']) ? $_GET['check_in'] : die();
$check_out = isset($_GET['check_out']) ? $_GET['check_out'] : die();
$room_type_id = isset($_GET['room_type_id']) ? $_GET['room_type_id'] : null;

// Query
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
    rt.max_occupancy,
    CASE
        WHEN EXISTS (
            SELECT 1 FROM bookings b
            WHERE b.room_id = r.room_id
            AND b.status IN ("confirmed", "pending")
            AND b.check_in < :check_out
            AND b.check_out > :check_in
        ) THEN 0
        ELSE 1
    END as available_for_dates
FROM rooms r
INNER JOIN room_types rt ON r.room_type_id = rt.type_id
WHERE 1=1';

if ($room_type_id) {
    $query .= ' AND r.room_type_id = :room_type_id';
}

$query .= ' ORDER BY rt.type_name, r.room_number';

// Prepare statement
$stmt = $db->prepare($query);

// Bind params
$stmt->bindParam(':check_in', $check_in);
$stmt->bindParam(':check_out', $check_out);
if ($room_type_id) {
    $stmt->bindParam(':room_type_id', $room_type_id);
}

// Execute query
$stmt->execute();

// Get row count
$num = $stmt->rowCount();

if($num > 0) {
    $posts_arr = array();
    $posts_arr['data'] = array();

    while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        extract($row);

        $post_item = array(
            'room_id' => $room_id,
            'room_number' => $room_number,
            'room_type_id' => $room_type_id,
            'room_type' => $type_name,
            'price_per_night' => $price_per_night,
            'status' => $status,
            'description' => html_entity_decode($description),
            'image_url' => $image_url,
            'amenities' => $amenities,
            'max_occupancy' => $max_occupancy,
            'available_for_dates' => (bool)$available_for_dates
        );

        array_push($posts_arr['data'], $post_item);
    }

    echo json_encode($posts_arr);
} else {
    echo json_encode(
        array('message' => 'No Rooms Found')
    );
}
