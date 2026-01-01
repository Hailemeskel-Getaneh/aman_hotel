<?php
// Headers
header('Access-Control-Allow-Origin: *');
header('Content-Type: text/plain');

include_once 'config/Database.php';

$database = new Database();
$db = $database->connect();

try {
    echo "Starting database cleanup...\n\n";

    // Disable foreign key checks temporarily
    $db->exec("SET FOREIGN_KEY_CHECKS = 0");

    // Clear event_bookings
    $db->exec("DELETE FROM event_bookings");
    echo "✓ Cleared event_bookings table\n";

    // Clear bookings
    $db->exec("DELETE FROM bookings");
    echo "✓ Cleared bookings table\n";

    // Clear contact_messages
    $db->exec("DELETE FROM contact_messages");
    echo "✓ Cleared contact_messages table\n";

    // Clear events
    $db->exec("DELETE FROM events");
    echo "✓ Cleared events table\n";

    // Clear rooms (will reset to default sample rooms)
    $db->exec("DELETE FROM rooms");
    echo "✓ Cleared rooms table\n";

    // Clear room_types (will reset to default sample types)
    $db->exec("DELETE FROM room_types");
    echo "✓ Cleared room_types table\n";

    // Clear users EXCEPT admin
    $db->exec("DELETE FROM users WHERE role != 'admin'");
    echo "✓ Cleared users table (kept admin)\n";

    // Re-enable foreign key checks
    $db->exec("SET FOREIGN_KEY_CHECKS = 1");

    echo "\n";
    echo "===========================================\n";
    echo "Database cleared successfully!\n";
    echo "Admin user preserved.\n";
    echo "===========================================\n";

} catch(PDOException $e) {
    echo "Error clearing database: " . $e->getMessage() . "\n";
}
?>
