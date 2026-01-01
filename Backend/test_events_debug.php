<?php
// Test script for events
include_once 'config/Database.php';

$database = new Database();
$db = $database->connect();

echo "--- Testing Event Count ---\n";
$query = "SELECT COUNT(*) as count FROM events";
$stmt = $db->prepare($query);
$stmt->execute();
$row = $stmt->fetch(PDO::FETCH_ASSOC);
echo "Total Events in DB: " . $row['count'] . "\n\n";

echo "--- Testing Read Query (from read.php) ---\n";
try {
    $query = 'SELECT e.*, u.name as organizer_name 
              FROM events e 
              LEFT JOIN users u ON e.organizer_id = u.id 
              ORDER BY e.start_time ASC';
    $stmt = $db->prepare($query);
    $stmt->execute();
    $events = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo "Events fetched: " . count($events) . "\n";
    if (count($events) > 0) {
        print_r($events[0]);
    } else {
        echo "No events returned by query.\n";
    }
} catch (Exception $e) {
    echo "Read Query Error: " . $e->getMessage() . "\n";
    print_r($stmt->errorInfo());
}

echo "\n--- Testing Create Event ---\n";
try {
    // Try inserting a dummy event
    $title = "Test Event " . time();
    $start_time = date('Y-m-d H:i:s', strtotime('+1 day'));
    $end_time = date('Y-m-d H:i:s', strtotime('+2 days'));
    
    $query = 'INSERT INTO events SET 
        title = :title, 
        description = "Test Description", 
        start_time = :start_time, 
        end_time = :end_time,
        location = "Test Location",
        organizer_id = 1,
        vip_capacity = 10,
        regular_capacity = 50,
        vip_price = 100,
        regular_price = 50';

    $stmt = $db->prepare($query);
    $stmt->bindParam(':title', $title);
    $stmt->bindParam(':start_time', $start_time);
    $stmt->bindParam(':end_time', $end_time);
    
    if($stmt->execute()) {
        echo "Event created successfully.\n";
        echo "New ID: " . $db->lastInsertId() . "\n";
    } else {
        echo "Event Creation Failed.\n";
        print_r($stmt->errorInfo());
    }

} catch (Exception $e) {
    echo "Create Error: " . $e->getMessage() . "\n";
}
?>
