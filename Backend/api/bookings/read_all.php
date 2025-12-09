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

// Query to get all bookings with user name and room details
$query = 'SELECT 
            b.*, 
            u.name as user_name, 
            u.email as user_email,
            r.room_number,
            r.room_type 
          FROM bookings b
          JOIN users u ON b.user_id = u.id
          JOIN rooms r ON b.room_id = r.room_id
          ORDER BY b.created_at DESC';

$stmt = $db->prepare($query);
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
