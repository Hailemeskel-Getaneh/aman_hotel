<?php
// Headers
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: PUT');
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

if(!isset($data->booking_id)) {
    echo json_encode(array('message' => 'Missing booking ID'));
    exit();
}

try {
    // Update event booking refund status
    $query = "UPDATE event_bookings SET refund_status = 'completed', refund_date = NOW() WHERE booking_id = :booking_id";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':booking_id', $data->booking_id);
    
    if($stmt->execute()) {
        echo json_encode(array('message' => 'Refund marked as completed'));
    } else {
        echo json_encode(array('message' => 'Failed to update refund status'));
    }

} catch(PDOException $e) {
    echo json_encode(array('message' => 'Database Error: ' . $e->getMessage()));
}
?>
