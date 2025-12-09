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

// Query to get room types with availability information
$query = 'SELECT 
    rt.type_id,
    rt.type_name,
    rt.description,
    rt.price_per_night,
    rt.image_url,
    rt.amenities,
    rt.max_occupancy,
    COUNT(r.room_id) as total_rooms,
    SUM(CASE WHEN r.status = "available" THEN 1 ELSE 0 END) as available_rooms,
    CASE 
        WHEN SUM(CASE WHEN r.status = "available" THEN 1 ELSE 0 END) > 0 THEN "available"
        ELSE "unavailable"
    END as availability_status
FROM room_types rt
LEFT JOIN rooms r ON rt.type_id = r.room_type_id
GROUP BY rt.type_id
ORDER BY rt.type_name ASC';

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
        $type_item = array(
            'type_id' => $row['type_id'],
            'type_name' => $row['type_name'],
            'description' => html_entity_decode($row['description']),
            'price_per_night' => $row['price_per_night'],
            'image_url' => $row['image_url'],
            'amenities' => $row['amenities'],
            'max_occupancy' => $row['max_occupancy'],
            'total_rooms' => (int)$row['total_rooms'],
            'available_rooms' => (int)$row['available_rooms'],
            'status' => $row['availability_status']
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
