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

if(!isset($data->user_id) || !isset($data->room_id) || !isset($data->check_in) || !isset($data->check_out)) {
    echo json_encode(array('message' => 'Missing required fields'));
    exit();
}

$user_id = $data->user_id;
$room_id = $data->room_id;
$check_in = $data->check_in;
$check_out = $data->check_out;

// Calculate Nights
$date1 = new DateTime($check_in);
$date2 = new DateTime($check_out);
$interval = $date1->diff($date2);
$nights = $interval->days;

if($nights <= 0) {
    echo json_encode(array('message' => 'Invalid Date Range'));
    exit();
}

// Get Room Price from room_types table (after migration)
$query = "SELECT rt.price_per_night 
          FROM rooms r
          INNER JOIN room_types rt ON r.room_type_id = rt.type_id
          WHERE r.room_id = :room_id";
$stmt = $db->prepare($query);
$stmt->bindParam(':room_id', $room_id);
$stmt->execute();
$row = $stmt->fetch(PDO::FETCH_ASSOC);

if(!$row) {
    echo json_encode(array('message' => 'Room Not Found'));
    exit();
}

$price_per_night = $row['price_per_night'];
$base_price = $nights * $price_per_night;
$discount_rate = isset($data->discount_rate) ? $data->discount_rate : 0.00;
$final_price = $base_price - ($base_price * ($discount_rate / 100));
$status = 'pending';

// Check for conflicting bookings
$conflict_query = "SELECT COUNT(*) as conflict_count 
                   FROM bookings 
                   WHERE room_id = :room_id 
                   AND status IN ('pending', 'confirmed') 
                   AND (
                        (check_in < :check_out AND check_out > :check_in)
                   )";

$conflict_stmt = $db->prepare($conflict_query);
$conflict_stmt->bindParam(':room_id', $room_id);
$conflict_stmt->bindParam(':check_in', $check_in);
$conflict_stmt->bindParam(':check_out', $check_out);
$conflict_stmt->execute();
$conflict_result = $conflict_stmt->fetch(PDO::FETCH_ASSOC);

if($conflict_result['conflict_count'] > 0) {
    echo json_encode(array('message' => 'Room is already booked for these dates'));
    exit();
}

// Create Booking
$query = 'INSERT INTO bookings SET 
    user_id = :user_id, 
    room_id = :room_id, 
    check_in = :check_in, 
    check_out = :check_out, 
    nights = :nights, 
    base_price = :base_price, 
    discount_rate = :discount_rate, 
    final_price = :final_price, 
    status = :status';

$stmt = $db->prepare($query);

$stmt->bindParam(':user_id', $user_id);
$stmt->bindParam(':room_id', $room_id);
$stmt->bindParam(':check_in', $check_in);
$stmt->bindParam(':check_out', $check_out);
$stmt->bindParam(':nights', $nights);
$stmt->bindParam(':base_price', $base_price);
$stmt->bindParam(':discount_rate', $discount_rate);
$stmt->bindParam(':final_price', $final_price);
$stmt->bindParam(':status', $status);

if($stmt->execute()) {
    // DO NOT update room status to 'booked' globally. 
    // Availability is now checked dynamically by date.

    $booking_id = $db->lastInsertId();
    echo json_encode(array(
        'message' => 'Booking Created',
        'booking_id' => $booking_id
    ));
} else {
    echo json_encode(array('message' => 'Booking Failed'));
}
