<?php
// Headers
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers,Content-Type,Access-Control-Allow-Methods, Authorization, X-Requested-With');

include_once '../../config/Database.php';
include_once '../../config/Cors.php';

// Handle CORS
Cors::handle();

// Instantiate DB & Connect
$database = new Database();
// Force Cache Update
$db = $database->connect();

// Get User ID from query param
if (!isset($_GET['user_id'])) {
    echo json_encode(array('message' => 'User ID Required'));
    exit();
}

$user_id = $_GET['user_id'];

// Create Query
// Join with events table to get event details
$query = "SELECT 
            eb.booking_id,
            eb.event_id,
            eb.ticket_type,
            eb.quantity,
            eb.total_price,
            eb.status,
            eb.created_at,
            eb.payment_ref,
            e.title,
            e.start_time,
            e.location,
            e.vip_capacity,
            e.regular_capacity
          FROM event_bookings eb
          JOIN events e ON eb.event_id = e.event_id
          WHERE eb.user_id = ?
          ORDER BY eb.created_at DESC";

// Prepare statement
$stmt = $db->prepare($query);

// Execute query
$stmt->execute([$user_id]);

// Get row count
$num = $stmt->rowCount();

if($num > 0) {
    $bookings_arr = array();
    $bookings_arr['data'] = array();

    while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        extract($row);

        $booking_item = array(
            'booking_id' => $booking_id,
            'event_id' => $event_id,
            'ticket_type' => $ticket_type,
            'quantity' => $quantity,
            'total_price' => $total_price,
            'status' => $status,
            'payment_ref' => $payment_ref,
            'created_at' => $created_at,
            'event_title' => $title,
            'event_date' => $start_time,
            'location' => $location,
            'vip_capacity' => $vip_capacity,
            'regular_capacity' => $regular_capacity
        );

        array_push($bookings_arr['data'], $booking_item);
    }

    // Turn to JSON & output
    echo json_encode($bookings_arr);

} else {
    // No bookings found
    echo json_encode(
        array('message' => 'No event bookings found', 'data' => [])
    );
}
?>
