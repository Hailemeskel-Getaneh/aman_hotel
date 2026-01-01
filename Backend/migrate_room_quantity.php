<?php
// Headers
header('Access-Control-Allow-Origin: *');
header('Content-Type: text/plain');

include_once 'config/Database.php';

$database = new Database();
$db = $database->connect();

try {
    // 1. Add quantity column
    $sql1 = "ALTER TABLE bookings ADD COLUMN IF NOT EXISTS quantity INT NOT NULL DEFAULT 1;";
    $db->exec($sql1);
    echo "Added quantity column.\n";

    // 2. Add room_type_id column
    // We can populate it from rooms table if needed, but for new bookings it's essential.
    // Ideally we should backfill it if we want old bookings to work with new logic, 
    // but old bookings have room_id so they are fine (quantity 1).
    $sql2 = "ALTER TABLE bookings ADD COLUMN IF NOT EXISTS room_type_id INT NULL;";
    $db->exec($sql2);
    echo "Added room_type_id column.\n";

    // 3. Make room_id nullable
    $sql3 = "ALTER TABLE bookings MODIFY COLUMN room_id INT NULL;";
    $db->exec($sql3);
    echo "Made room_id nullable.\n";

} catch(PDOException $e) {
    echo "Error updating table: " . $e->getMessage() . "\n";
}
?>
