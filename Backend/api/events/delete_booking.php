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

if(!isset($data->booking_id)) {
    echo json_encode(array('message' => 'Booking ID Required'));
    exit();
}

try {
    // Delete query
    $query = 'DELETE FROM event_bookings WHERE booking_id = :booking_id';

    // Prepare statement
    $stmt = $db->prepare($query);

    // Clean data
    $data->booking_id = htmlspecialchars(strip_tags($data->booking_id));

    // Bind data
    $stmt->bindParam(':booking_id', $data->booking_id);

    // Execute query
    if($stmt->execute()) {
        echo json_encode(
            array(
                'message' => 'Event Booking Deleted',
                'booking_id' => $data->booking_id
            )
        );
    } else {
        echo json_encode(
            array('message' => 'Event Booking Deletion Failed')
        );
    }
} catch (PDOException $e) {
    // Return error response if something goes wrong
    http_response_code(500); 
    echo json_encode(
        array('message' => 'Database Error: ' . $e->getMessage())
    );
}
?>
