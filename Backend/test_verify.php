<?php
// Test script to debug payment verification
include_once 'config/Database.php';

$database = new Database();
$db = $database->connect();

// Get the latest booking
$query = "SELECT * FROM bookings ORDER BY id DESC LIMIT 1";
$stmt = $db->prepare($query);
$stmt->execute();
$booking = $stmt->fetch(PDO::FETCH_ASSOC);

echo "Latest Booking:\n";
print_r($booking);

// Check if payment_ref column exists
$query = "SHOW COLUMNS FROM bookings LIKE 'payment_ref'";
$stmt = $db->prepare($query);
$stmt->execute();
$column = $stmt->fetch(PDO::FETCH_ASSOC);

echo "\n\nPayment_ref column exists: ";
echo $column ? "YES\n" : "NO\n";

if ($column) {
    print_r($column);
}

// Check table structure
echo "\n\nBookings table structure:\n";
$query = "DESCRIBE bookings";
$stmt = $db->prepare($query);
$stmt->execute();
$columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
foreach ($columns as $col) {
    echo $col['Field'] . " - " . $col['Type'] . " - " . $col['Null'] . " - " . $col['Key'] . "\n";
}
?>
