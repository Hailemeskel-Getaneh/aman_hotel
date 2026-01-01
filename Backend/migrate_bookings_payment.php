<?php
// Headers
header('Access-Control-Allow-Origin: *');
header('Content-Type: text/plain');

include_once 'config/Database.php';

$database = new Database();
$db = $database->connect();

try {
    // Add payment_ref column to bookings table
    $sql = "
    ALTER TABLE bookings
    ADD COLUMN IF NOT EXISTS payment_ref VARCHAR(255) NULL;
    ";

    $db->exec($sql);
    echo "Bookings table updated with payment_ref column.\n";

} catch(PDOException $e) {
    echo "Error updating table: " . $e->getMessage() . "\n";
}
?>
