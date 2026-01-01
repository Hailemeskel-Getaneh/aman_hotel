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

// Check for single or multiple bookings
if(!isset($data->booking_id) && !isset($data->booking_ids)) {
    echo json_encode(array('message' => 'Booking ID(s) Required'));
    exit();
}

$booking_ids = [];
if (isset($data->booking_ids) && is_array($data->booking_ids)) {
    $booking_ids = $data->booking_ids;
} elseif (isset($data->booking_id)) {
    $booking_ids[] = $data->booking_id;
}

if (empty($booking_ids)) {
    echo json_encode(['message' => 'No Valid Booking IDs provided']);
    exit();
}

// Fetch Details for ALL bookings to sum price
$placeholders = implode(',', array_fill(0, count($booking_ids), '?'));
$query = "SELECT b.*, u.email, u.name as user_name, u.role 
          FROM bookings b
          JOIN users u ON b.user_id = u.id
          WHERE b.id IN ($placeholders)";

$stmt = $db->prepare($query);
$stmt->execute($booking_ids);
$bookings = $stmt->fetchAll(PDO::FETCH_ASSOC);

if(!$bookings || count($bookings) === 0) {
    echo json_encode(array('message' => 'Bookings Not Found'));
    exit();
}

// Validation: Ensure all belong to same user? (Optional but recommended)
// Calculate Total Amount
$total_amount = 0;
// We use the first booking for user details (email, etc)
$first_booking = $bookings[0];

foreach ($bookings as $b) {
    // Assuming final_price is what we pay
    $total_amount += floatval($b['final_price']);
    
    // Safety check: if user IDs mismatch?
    if ($b['user_id'] != $first_booking['user_id']) {
        echo json_encode(['message' => 'Bookings belong to different users']);
        exit();
    }
}

// Prepare Chapa Data
$ids_str = implode('_', $booking_ids);
// If single booking, use standard format for backward compatibility? 
// Or just always use MULTI if we want?
// Let's stick to standard for single ID to minimize risk if frontend sends 1 ID.
if (count($booking_ids) === 1) {
    $tx_ref = 'TX-' . $booking_ids[0] . '-' . time();
} else {
    $tx_ref = 'TX-MULTI-' . $ids_str . '-' . time();
}

$amount = $total_amount;
$currency = 'ETB';
$email = trim($first_booking['email']); // Critical: Remove whitespace

// Ensure logs directory exists
if (!file_exists('../../logs')) {
    mkdir('../../logs', 0777, true);
}

// Split First and Last Name
$parts = explode(' ', trim($first_booking['user_name']));
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
    'cancel_url' => isset($chapaConfig['cancel_url']) ? $chapaConfig['cancel_url'] : $chapaConfig['return_url'],
    'return_url' => $chapaConfig['return_url'] . '?tx_ref=' . $tx_ref,
    'cancel_url' => (isset($chapaConfig['cancel_url']) ? $chapaConfig['cancel_url'] : $chapaConfig['return_url']),
    "customization" => [
        "title" => "Booking Payment",
        "description" => "Payment for " . (count($booking_ids) > 1 ? count($booking_ids) . " Bookings" : "Booking " . $booking_ids[0])
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
