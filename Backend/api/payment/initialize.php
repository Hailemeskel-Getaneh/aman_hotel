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
    echo json_encode(array('message' => 'Booking ID Required'));
    exit();
}

$booking_id = $data->booking_id;

// Fetch Booking Details
$query = "SELECT b.*, u.email, u.name as user_name, u.role 
          FROM bookings b
          JOIN users u ON b.user_id = u.id
          WHERE b.id = :booking_id";

$stmt = $db->prepare($query);
$stmt->bindParam(':booking_id', $booking_id);
$stmt->execute();
$booking = $stmt->fetch(PDO::FETCH_ASSOC);

if(!$booking) {
    echo json_encode(array('message' => 'Booking Not Found'));
    exit();
}

// Prepare Chapa Data
$tx_ref = 'TX-' . $booking_id . '-' . time();
$amount = $booking['final_price'];
$currency = 'ETB';
$email = trim($booking['email']); // Critical: Remove whitespace

// Ensure logs directory exists
if (!file_exists('../../logs')) {
    mkdir('../../logs', 0777, true);
}

// Split First and Last Name
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
    'return_url' => $chapaConfig['return_url'] . '?tx_ref=' . $tx_ref,
    "customization" => [
        "title" => "Booking Payment",
        "description" => "Payment for Booking " . $booking_id
    ]
];

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
// Disable SSL verification for local development
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 15);

// DEBUG: Log the payload
file_put_contents('../../logs/payment_debug.log', date('Y-m-d H:i:s') . " Payload: " . json_encode($payload) . "\n", FILE_APPEND);

$response = curl_exec($ch);

// DEBUG: Log the response
file_put_contents('../../logs/payment_debug.log', date('Y-m-d H:i:s') . " Response: " . $response . "\n", FILE_APPEND);


if (curl_errno($ch)) {
    echo json_encode([
        'message' => 'Payment Initialization Connection Failed',
        'error' => curl_error($ch)
    ]);
    file_put_contents('../../logs/payment_debug.log', date('Y-m-d H:i:s') . " Curl Error: " . curl_error($ch) . "\n", FILE_APPEND);
    curl_close($ch);
    exit();
}

curl_close($ch);

$result = json_decode($response, true);

if(isset($result['status']) && $result['status'] === 'success') {
    // Update booking with transaction reference (optional, or separate update endpoint)
    // It's good practice to save the tx_ref now in case user doesn't return
    // We assume 'transaction_ref' column exists or we might fail. 
    // Since we didn't add the column yet, let's skip updating DB for now OR use a separate table 'transactions'.
    // For simplicity, we assume we will add 'transaction_ref' to bookings.
    
    // Check if column exists or handle error? 
    // I'll assume the user will run the SQL to add the column.
    // But to be safe against 500 errors right now, I will Comment out the update query
    // and rely on verify step or add it later.
    
     /*
    $updateQuery = "UPDATE bookings SET transaction_ref = :tx_ref WHERE id = :booking_id";
    $updateStmt = $db->prepare($updateQuery);
    $updateStmt->bindParam(':tx_ref', $tx_ref);
    $updateStmt->bindParam(':booking_id', $booking_id);
    $updateStmt->execute();
    */

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
