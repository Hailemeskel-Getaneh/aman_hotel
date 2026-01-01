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

if(!isset($data->booking_id) || !isset($data->status)) {
    echo json_encode(array('message' => 'Missing required fields'));
    exit();
}

try {
    // First get current booking details
    $get_query = "SELECT payment_ref, total_price FROM event_bookings WHERE booking_id = :booking_id";
    $get_stmt = $db->prepare($get_query);
    $get_stmt->bindParam(':booking_id', $data->booking_id);
    $get_stmt->execute();
    $booking = $get_stmt->fetch(PDO::FETCH_ASSOC);

    if (!$booking) {
        echo json_encode(array('message' => 'Booking not found'));
        exit();
    }

    $payment_ref = $booking['payment_ref'];
    $total_price = $booking['total_price'];

    // Update booking status
    if ($data->status === 'cancelled' && $payment_ref) {
        // Cancelled and paid -> Pending Refund
        $query = 'UPDATE event_bookings SET status = :status, refund_status = "pending", refund_amount = :refund_amount WHERE booking_id = :booking_id';
        $stmt = $db->prepare($query);
        $stmt->bindParam(':refund_amount', $total_price);
    } else {
        // Normal update
        $query = 'UPDATE event_bookings SET status = :status WHERE booking_id = :booking_id';
        $stmt = $db->prepare($query);
    }
    
    // Bind common data
    $stmt->bindParam(':booking_id', $data->booking_id);
    $stmt->bindParam(':status', $data->status);
    
    if($stmt->execute()) {
        echo json_encode(array('message' => 'Booking status updated'));
    } else {
        echo json_encode(array('message' => 'Update failed'));
    }

} catch(PDOException $e) {
    echo json_encode(array('message' => 'Database Error: ' . $e->getMessage()));
}
?>
