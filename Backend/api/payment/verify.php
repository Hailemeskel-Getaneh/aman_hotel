<?php
// Headers
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers,Content-Type,Access-Control-Allow-Methods, Authorization, X-Requested-With');

include_once '../../config/Database.php';
include_once '../../config/Cors.php';
$chapaConfig = include_once '../../config/chapa.php';

// Handle CORS
Cors::handle();

// Instantiate DB & Connect
$database = new Database();
$db = $database->connect();

// Get raw posted data
$data = json_decode(file_get_contents("php://input"));

if(!isset($data->tx_ref)) {
    echo json_encode(array('message' => 'Transaction Reference Required'));
    exit();
}

$tx_ref = $data->tx_ref;

// Verify Payment via Chapa API
$chapaUrl = 'https://api.chapa.co/v1/transaction/verify/' . $tx_ref;
$ch = curl_init($chapaUrl);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $chapaConfig['secret_key'],
    'Content-Type: application/json'
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);


// DEBUG: Log the verification attempt
$logMsg = date('Y-m-d H:i:s') . " Verifying TX: " . $tx_ref . "\n";
file_put_contents('../../logs/payment_debug.log', $logMsg, FILE_APPEND);

$response = curl_exec($ch);

// DEBUG: Log the response
file_put_contents('../../logs/payment_debug.log', date('Y-m-d H:i:s') . " Verify Response: " . $response . "\n", FILE_APPEND);

if (curl_errno($ch)) {
    file_put_contents('../../logs/payment_debug.log', "Curl Error: " . curl_error($ch) . "\n", FILE_APPEND);
}

curl_close($ch);

$result = json_decode($response, true);

if(isset($result['status']) && $result['status'] === 'success') {
    // Payment Successful
    // Parse booking_id from tx_ref (Format: TX-{booking_id}-{timestamp})
    $parts = explode('-', $tx_ref);
    if(count($parts) >= 2) {
        $booking_id = $parts[1];

        // Update Booking Status to 'confirmed'
        $query = "UPDATE bookings SET status = 'confirmed' WHERE id = :booking_id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':booking_id', $booking_id);
        
        if($stmt->execute()) {
             // Fetch Full Booking Details for Receipt
             $receiptQuery = "SELECT 
                                b.*, 
                                u.name as user_name, 
                                u.email as user_email,
                                r.room_number,
                                rt.type_name as room_type
                              FROM bookings b
                              JOIN users u ON b.user_id = u.id
                              JOIN rooms r ON b.room_id = r.room_id
                              JOIN room_types rt ON r.room_type_id = rt.type_id
                              WHERE b.id = :booking_id";
             $receiptStmt = $db->prepare($receiptQuery);
             $receiptStmt->bindParam(':booking_id', $booking_id);
             $receiptStmt->execute();
             $bookingDetails = $receiptStmt->fetch(PDO::FETCH_ASSOC);

             echo json_encode([
                'message' => 'Payment Verified and Booking Confirmed',
                'data' => $result['data'],
                'receipt' => $bookingDetails
            ]);
        } else {
             echo json_encode([
                'message' => 'Payment Verified but Booking Update Failed',
                'error' => $stmt->errorInfo()
            ]);
        }
    } else {
         echo json_encode([
            'message' => 'Invalid Transaction Reference Format',
            'tx_ref' => $tx_ref
        ]);
    }

} else {
    echo json_encode([
        'message' => 'Payment Verification Failed',
        'chapa_response' => $result
    ]);
}
