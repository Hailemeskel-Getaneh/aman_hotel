<?php
// Headers
header('Access-Control-Allow-Origin: *');
header('Content-Type: text/plain');

include_once 'config/Database.php';

$database = new Database();
$db = $database->connect();

try {
    // Create event_bookings table
    $sql = "
    CREATE TABLE IF NOT EXISTS event_bookings (
        booking_id INT AUTO_INCREMENT PRIMARY KEY,
        event_id INT NOT NULL,
        user_id INT NOT NULL,
        ticket_type ENUM('regular', 'vip') NOT NULL,
        quantity INT NOT NULL DEFAULT 1,
        total_price DECIMAL(10, 2) NOT NULL,
        status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
        payment_ref VARCHAR(255) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    ";

    $db->exec($sql);
    $db->exec($sql);
    echo "Event bookings table created successfully.\n";

    // Add columns to events table if not exists
    $alterSql = "
    ALTER TABLE events
    ADD COLUMN IF NOT EXISTS vip_capacity INT DEFAULT 0,
    ADD COLUMN IF NOT EXISTS regular_capacity INT DEFAULT 0,
    ADD COLUMN IF NOT EXISTS vip_price DECIMAL(10,2) DEFAULT 0.00,
    ADD COLUMN IF NOT EXISTS regular_price DECIMAL(10,2) DEFAULT 0.00;
    ";
    $db->exec($alterSql);
    echo "Events table updated with capacity/price columns.\n";

} catch(PDOException $e) {
    echo "Error creating table: " . $e->getMessage() . "\n";
}
?>
