<?php
// Add refund tracking columns to bookings and event_bookings tables

header('Content-Type: text/plain');

include_once 'config/Database.php';

$database = new Database();
$db = $database->connect();

try {
    echo "Adding refund tracking columns...\n\n";

    // Add columns to bookings table
    $db->exec("ALTER TABLE bookings ADD COLUMN IF NOT EXISTS refund_status VARCHAR(50) DEFAULT NULL");
    echo "✓ Added refund_status to bookings\n";
    
    $db->exec("ALTER TABLE bookings ADD COLUMN IF NOT EXISTS refund_amount DECIMAL(10,2) DEFAULT NULL");
    echo "✓ Added refund_amount to bookings\n";
    
    $db->exec("ALTER TABLE bookings ADD COLUMN IF NOT EXISTS refund_date DATETIME DEFAULT NULL");
    echo "✓ Added refund_date to bookings\n";

    // Add columns to event_bookings table
    $db->exec("ALTER TABLE event_bookings ADD COLUMN IF NOT EXISTS refund_status VARCHAR(50) DEFAULT NULL");
    echo "✓ Added refund_status to event_bookings\n";
    
    $db->exec("ALTER TABLE event_bookings ADD COLUMN IF NOT EXISTS refund_amount DECIMAL(10,2) DEFAULT NULL");
    echo "✓ Added refund_amount to event_bookings\n";
    
    $db->exec("ALTER TABLE event_bookings ADD COLUMN IF NOT EXISTS refund_date DATETIME DEFAULT NULL");
    echo "✓ Added refund_date to event_bookings\n";

    echo "\n===========================================\n";
    echo "Refund columns added successfully!\n";
    echo "===========================================\n";

} catch(PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
