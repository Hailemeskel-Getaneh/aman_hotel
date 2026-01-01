<?php
// Headers
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers,Content-Type,Access-Control-Allow-Methods, Authorization, X-Requested-With');

include_once '../../config/Database.php';
include_once '../../config/Cors.php';
$chapaConfig = include_once '../../config/chapa.php';

Cors::handle();

$database = new Database();
$db = $database->connect();

$data = json_decode(file_get_contents("php://input"));

if(!isset($data->tx_ref)) {
    echo json_encode(array('message' => 'Transaction Reference Required'));
    exit();
}

$tx_ref = $data->tx_ref;

// Verify with Chapa
$chapaUrl = 'https://api.chapa.co/v1/transaction/verify/' . $tx_ref;
$ch = curl_init($chapaUrl);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $chapaConfig['secret_key'],
    'Content-Type: application/json'
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);

$response = curl_exec($ch);
curl_close($ch);

$result = json_decode($response, true);

if(isset($result['status']) && $result['status'] === 'success') {
    // Payment Successful
    // Find booking by payment_ref (which we saved as tx_ref)
    // Note: In initialize_event.php we saved tx_ref to payment_ref column
    
    // Update status to confirmed
    // We check if it starts with EVT-TX to be sure? 
    // The query will implicitly check.
    
    $query = "UPDATE event_bookings SET status = 'confirmed' WHERE payment_ref = :tx_ref";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':tx_ref', $tx_ref);
    
    if($stmt->execute()) {
        echo json_encode([
            'message' => 'Payment Verified', 
            'status' => 'success',
            'data' => $result['data']
        ]);
        
        // Optional: Reduce inventory (capacity) here if not done at booking time.
        // For now capacity is just a number in events table. 
        // We really should decrement it.
        // Let's optimize: Get event_id and ticket_type from booking first?
        
        // Fetch booking to get event details
        $fetchQ = "SELECT event_id, ticket_type, quantity FROM event_bookings WHERE payment_ref = :tx_ref";
        $fetchStmt = $db->prepare($fetchQ);
        $fetchStmt->bindParam(':tx_ref', $tx_ref);
        $fetchStmt->execute();
        $booking = $fetchStmt->fetch(PDO::FETCH_ASSOC);
        
        if($booking) {
            $col = $booking['ticket_type'] === 'vip' ? 'vip_capacity' : 'regular_capacity';
            $qty = $booking['quantity'];
            
            // Decrement capacity
            // Ensure we don't go below 0? MySQL unsigned int would error, but let's just sub.
            $updateCap = "UPDATE events SET $col = GRATEST(0, $col - :qty) WHERE event_id = :eid";
            // Correct SQL spelling: GREATEST
            $updateCap = "UPDATE events SET $col = CASE WHEN $col >= :qty THEN $col - :qty ELSE 0 END WHERE event_id = :eid";
            
            $capStmt = $db->prepare($updateCap);
            $capStmt->bindParam(':qty', $qty);
            $capStmt->bindParam(':eid', $booking['event_id']);
            $capStmt->execute();
        }

    } else {
         echo json_encode(['message' => 'Database Update Failed']);
    }

} else {
    echo json_encode([
        'message' => 'Payment Verification Failed', 
        'status' => 'failed',
        'chapa_response' => $result
    ]);
}
?>
