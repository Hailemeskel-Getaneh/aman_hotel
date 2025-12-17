<?php
// Headers
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers,Content-Type,Access-Control-Allow-Methods, Authorization, X-Requested-With');

include_once '../../config/Database.php';
include_once '../../config/Cors.php';

// Handle CORS
Cors::handle();

// Instantiate DB & Connect
$database = new Database();
$db = $database->connect();

// Get raw posted data
$data = json_decode(file_get_contents("php://input"));

if(!isset($data->event_id) || !isset($data->user_id) || !isset($data->ticket_type) || !isset($data->quantity)) {
    echo json_encode(array('message' => 'Missing required fields'));
    exit();
}

try {
    // 1. Check availability (Optional: You can implement stricter checks here against capacity)
    // For now, we trust the frontend but ideally we should query the event and check capacity - count(bookings)
    
    // 2. Insert Booking
    $query = 'INSERT INTO event_bookings SET 
        event_id = :event_id, 
        user_id = :user_id, 
        ticket_type = :ticket_type, 
        quantity = :quantity, 
        total_price = :total_price, 
        status = "pending"';

    $stmt = $db->prepare($query);

    // Bind data
    $stmt->bindParam(':event_id', $data->event_id);
    $stmt->bindParam(':user_id', $data->user_id);
    $stmt->bindParam(':ticket_type', $data->ticket_type);
    $stmt->bindParam(':quantity', $data->quantity);
    $stmt->bindParam(':total_price', $data->total_price);

    if($stmt->execute()) {
        $booking_id = $db->lastInsertId();
        echo json_encode(array(
            'message' => 'Booking Created', 
            'booking_id' => $booking_id
        ));
    } else {
        echo json_encode(array('message' => 'Booking Failed'));
    }

} catch(PDOException $e) {
    echo json_encode(array('message' => 'Database Error: ' . $e->getMessage()));
}
?>
