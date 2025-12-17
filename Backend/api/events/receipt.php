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
$db = $database->connect();

// Get ID
if (!isset($_GET['id'])) {
    echo json_encode(array('message' => 'Booking ID Required'));
    exit();
}

$booking_id = $_GET['id'];

// Create Query
$query = "SELECT 
            eb.*,
            e.title as event_title,
            e.start_time,
            e.location,
            u.name as user_name,
            u.email as user_email
          FROM event_bookings eb
          JOIN events e ON eb.event_id = e.event_id
          JOIN users u ON eb.user_id = u.id
          WHERE eb.booking_id = ?";

// Prepare statement
$stmt = $db->prepare($query);

// Execute query
$stmt->execute([$booking_id]);

$row = $stmt->fetch(PDO::FETCH_ASSOC);

if($row) {
    extract($row);

    $booking_arr = array(
        'booking_id' => $booking_id,
        'event_title' => $event_title,
        'ticket_type' => $ticket_type,
        'quantity' => $quantity,
        'total_price' => $total_price,
        'status' => $status,
        'payment_ref' => $payment_ref,
        'created_at' => $created_at,
        'event_date' => $start_time,
        'location' => $location,
        'user_name' => $user_name,
        'user_email' => $user_email
    );

    echo json_encode($booking_arr);

} else {
    echo json_encode(
        array('message' => 'Booking not found')
    );
}
?>
