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
$user_id = isset($_GET['user_id']) ? $_GET['user_id'] : die();

// Query
$query = 'SELECT b.*, r.room_number, rt.type_name as room_type, rt.price_per_night
          FROM bookings b 
          JOIN rooms r ON b.room_id = r.room_id 
          JOIN room_types rt ON r.room_type_id = rt.type_id
          WHERE b.user_id = :user_id 
          ORDER BY b.created_at DESC';

// Prepare statement
$stmt = $db->prepare($query);

// Bind ID
$stmt->bindParam(':user_id', $user_id);

// Execute query
$stmt->execute();

$num = $stmt->rowCount();

if($num > 0) {
    $bookings_arr = array();
    $bookings_arr['data'] = array();

    while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        array_push($bookings_arr['data'], $row);
    }

    echo json_encode($bookings_arr);
} else {
    echo json_encode(array('message' => 'No Bookings Found'));
}
