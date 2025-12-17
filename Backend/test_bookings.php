<?php
// Headers
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

include_once './config/Database.php';

$database = new Database();
$db = $database->connect();

// 1. Check all event_bookings
$query = "SELECT * FROM event_bookings";
$stmt = $db->prepare($query);
$stmt->execute();
$all_bookings = $stmt->fetchAll(PDO::FETCH_ASSOC);

// 2. Check specific user bookings with JOIN
// Hardcode the user_id if you know it, or just show all with join
$query2 = "SELECT eb.*, e.title 
           FROM event_bookings eb 
           DATA_JOIN events e ON eb.event_id = e.event_id";
// Note: I wrote DATA_JOIN, I meant LEAD JOIN or just JOIN. Correcting to LEFT JOIN to see if event missing.
$query2 = "SELECT eb.*, e.title 
           FROM event_bookings eb 
           LEFT JOIN events e ON eb.event_id = e.event_id";

$stmt2 = $db->prepare($query2);
$stmt2->execute();
$joined_bookings = $stmt2->fetchAll(PDO::FETCH_ASSOC);

echo json_encode([
    "total_raw_bookings" => count($all_bookings),
    "raw_data" => $all_bookings,
    "joined_data" => $joined_bookings
]);
?>
