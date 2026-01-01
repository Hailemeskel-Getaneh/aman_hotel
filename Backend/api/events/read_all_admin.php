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

// Query to get all event bookings with user and event details
// Only show bookings that have been paid (payment_ref IS NOT NULL)
$query = 'SELECT 
            eb.*, 
            u.name as user_name, 
            u.email as user_email,
            e.title as event_title,
            e.start_time as event_date,
            e.location
          FROM event_bookings eb
          JOIN users u ON eb.user_id = u.id
          JOIN events e ON eb.event_id = e.event_id
          WHERE eb.payment_ref IS NOT NULL
          ORDER BY eb.created_at DESC';

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
    echo json_encode(array('message' => 'No Event Bookings Found', 'data' => []));
}
?>
