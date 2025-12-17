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

if(!isset($data->booking_id)) {
    echo json_encode(array('message' => 'Event Booking ID Required'));
    exit();
}

$booking_id = $data->booking_id;

// Fetch Booking & User Details
$query = "SELECT b.*, u.email, u.name as user_name 
          FROM event_bookings b
          JOIN users u ON b.user_id = u.id
          WHERE b.booking_id = :booking_id";

$stmt = $db->prepare($query);
$stmt->bindParam(':booking_id', $booking_id);
$stmt->execute();
$booking = $stmt->fetch(PDO::FETCH_ASSOC);

if(!$booking) {
    echo json_encode(array('message' => 'Event Booking Not Found'));
    exit();
}

// Prepare Chapa Data
// Prefix EVT-TX to distinguish from room bookings
$tx_ref = 'EVT-TX-' . $booking_id . '-' . time();

$amount = floatval($booking['total_price']);
$email = trim($booking['email']);
$currency = 'ETB';

// Handle FREE events (amount = 0)
if ($amount == 0) {
    // Auto-confirm free event bookings
    $tx_ref = 'EVT-FREE-' . $booking_id . '-' . time();
    
    // Update booking status to confirmed
    $updateQuery = "UPDATE event_bookings SET status = 'confirmed', payment_ref = :tx_ref WHERE booking_id = :booking_id";
    $updateStmt = $db->prepare($updateQuery);
    $updateStmt->bindParam(':tx_ref', $tx_ref);
    $updateStmt->bindParam(':booking_id', $booking_id);
    $updateStmt->execute();
    
    // Return success with redirect to my bookings instead of checkout
    echo json_encode([
        'message' => 'Free Event Booking Confirmed',
        'checkout_url' => $chapaConfig['return_url'] . '?free=true&booking_id=' . $booking_id,
        'tx_ref' => $tx_ref,
        'is_free' => true
    ]);
    exit();
}

// Split Name
$parts = explode(' ', trim($booking['user_name']));
$first_name = $parts[0];
$last_name = isset($parts[1]) ? implode(' ', array_slice($parts, 1)) : ''; 

$payload = [
    'amount' => $amount,
    'currency' => $currency,
    'email' => $email,
    'first_name' => $first_name,
    'last_name' => $last_name,
    'tx_ref' => $tx_ref,
    'callback_url' => $chapaConfig['callback_url'],
    // We might want a different return URL for events? 
    // For now reuse same, but maybe append a type=event param so frontend knows?
    // Actually, Chapa verification usually relies on calling verify endpoint on backend.
    'return_url' => $chapaConfig['return_url'] . '?tx_ref=' . $tx_ref . '&type=event', 
    'customization' => [
        "title" => "Event Booking", // Max 16 chars
        "description" => "Payment for Event Booking " . $booking_id
    ]
];

// Ensure logs directory exists
if (!file_exists('../../logs')) {
    mkdir('../../logs', 0777, true);
}

// Log Payload
file_put_contents('../../logs/payment_debug.log', date('Y-m-d H:i:s') . " [EVENT] Payload: " . json_encode($payload) . "\n", FILE_APPEND);

// Initialize Payment via Curl
$chapaUrl = 'https://api.chapa.co/v1/transaction/initialize';
$ch = curl_init($chapaUrl);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $chapaConfig['secret_key'],
    'Content-Type: application/json'
]);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0); 
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);

$response = curl_exec($ch);

// Log Response
file_put_contents('../../logs/payment_debug.log', date('Y-m-d H:i:s') . " [EVENT] Response: " . $response . "\n", FILE_APPEND);

if (curl_errno($ch)) {
    $err = curl_error($ch);
    file_put_contents('../../logs/payment_debug.log', date('Y-m-d H:i:s') . " [EVENT] Curl Error: " . $err . "\n", FILE_APPEND);
    echo json_encode([
        'message' => 'Payment Initialization Failed', 
        'error' => $err
    ]);
    curl_close($ch);
    exit();
}

curl_close($ch);

$result = json_decode($response, true);

if(isset($result['status']) && $result['status'] === 'success') {
    // Ideally save tx_ref to booking now
    $updateQuery = "UPDATE event_bookings SET payment_ref = :tx_ref WHERE booking_id = :booking_id";
    $updateStmt = $db->prepare($updateQuery);
    $updateStmt->bindParam(':tx_ref', $tx_ref);
    $updateStmt->bindParam(':booking_id', $booking_id);
    $updateStmt->execute();

    echo json_encode([
        'message' => 'Payment Initialized',
        'checkout_url' => $result['data']['checkout_url'],
        'tx_ref' => $tx_ref
    ]);
} else {
    echo json_encode([
        'message' => 'Payment Initialization Failed',
        'error' => $result['message'] ?? 'Unknown Error',
        'chapa_response' => $result
    ]);
}
?>
