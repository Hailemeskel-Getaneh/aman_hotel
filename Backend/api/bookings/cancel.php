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

if(!isset($data->id)) {
    echo json_encode(array('message' => 'Booking ID Required'));
    exit();
}

// Update query
$query = 'UPDATE bookings 
          SET status = :status
          WHERE id = :id';

$stmt = $db->prepare($query);

$status = 'cancelled';

// Bind data
$stmt->bindParam(':status', $status);
$stmt->bindParam(':id', $data->id);

// Execute query
if($stmt->execute()) {
    echo json_encode(
        array(
            'message' => 'Booking Cancelled',
            'id' => $data->id
        )
    );
} else {
    echo json_encode(
        array('message' => 'Booking Cancellation Failed')
    );
}
