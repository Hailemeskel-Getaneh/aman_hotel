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

// Get room type ID from query parameters
$type_id = isset($_GET['type_id']) ? $_GET['type_id'] : null;
$status = isset($_GET['status']) ? $_GET['status'] : 'available';

if (!$type_id) {
    echo json_encode(array('message' => 'Room type ID is required'));
    exit();
}

// Query - Get all rooms of a specific type with their details
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
WHERE r.room_type_id = :type_id';

// Add status filter if specified
if ($status !== 'all') {
    if ($status === 'available') {
        // If requesting 'available', we just want rooms that are NOT in maintenance.
        // We don't care if they are 'booked' for *some* dates, as long as they aren't out of order.
        $query .= " AND r.status != 'maintenance'";
    } else {
        $query .= ' AND r.status = :status';
    }
}

$query .= ' ORDER BY r.room_number';

// Prepare statement
$stmt = $db->prepare($query);

// Bind parameters
$stmt->bindParam(':type_id', $type_id, PDO::PARAM_INT);
if ($status !== 'all' && $status !== 'available') {
    $stmt->bindParam(':status', $status);
}

// Execute query
$stmt->execute();

// Get row count
$num = $stmt->rowCount();

// Check if any rooms found
if($num > 0) {
    // Room array
    $rooms_arr = array();
    $rooms_arr['data'] = array();

    while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        extract($row);

        $room_item = array(
            'room_id' => $room_id,
            'room_number' => $room_number,
            'room_type_id' => $room_type_id,
            'room_type' => $type_name,
            'price_per_night' => $price_per_night,
            'status' => $status,
            'description' => html_entity_decode($description),
            'image_url' => $image_url,
            'amenities' => $amenities,
            'max_occupancy' => $max_occupancy
        );

        // Push to "data"
        array_push($rooms_arr['data'], $room_item);
    }

    // Turn to JSON & output
    echo json_encode($rooms_arr);

} else {
    // No Rooms found for this type
    echo json_encode(
        array('message' => 'No rooms found for this room type')
    );
}
