<?php
// Headers
header('Access-Control-Allow-Origin: *');
header('Content-Type: text/plain');

include_once 'config/Database.php';

$database = new Database();
$db = $database->connect();

try {
    echo "Re-populating sample data...\n\n";

    // Insert sample room types
    $roomTypes = [
        [1, 'Single', 'Cozy single room with a garden view.', 100.00, null, 'Free WiFi, Air Conditioning, TV, Mini Bar', 1],
        [2, 'Double', 'Spacious double room perfect for couples.', 150.00, null, 'Free WiFi, Air Conditioning, TV, Mini Bar, King Size Bed', 2],
        [3, 'Suite', 'Luxury suite with a private balcony and jacuzzi.', 300.00, null, 'Free WiFi, Air Conditioning, TV, Mini Bar, Jacuzzi, Balcony, Living Room', 4],
        [4, 'Deluxe', 'Modern deluxe room with city view.', 200.00, null, 'Free WiFi, Air Conditioning, TV, Mini Bar, City View, Work Desk', 3]
    ];

    $stmt = $db->prepare("INSERT INTO room_types (type_id, type_name, description, price_per_night, image_url, amenities, max_occupancy) VALUES (?, ?, ?, ?, ?, ?, ?)");
    
    foreach ($roomTypes as $type) {
        $stmt->execute($type);
    }
    echo "✓ Added 4 room types\n";

    // Insert sample rooms
    $rooms = [
        [1, '101', 1, 'available'],
        [2, '102', 2, 'available'],
        [3, '201', 3, 'available'],
        [4, '202', 4, 'available'],
        [5, '103', 1, 'available'],
        [6, '104', 2, 'available'],
        [7, '203', 3, 'available'],
        [8, '204', 4, 'available']
    ];

    $stmt = $db->prepare("INSERT INTO rooms (room_id, room_number, room_type_id, status) VALUES (?, ?, ?, ?)");
    
    foreach ($rooms as $room) {
        $stmt->execute($room);
    }
    echo "✓ Added 8 rooms\n";

    // Insert sample events
    $events = [
        [1, 'Gala Dinner', 'An exclusive evening of fine dining and music.', '2025-12-25 19:00:00', '2025-12-25 23:00:00', 'Grand Ballroom', 1, 50, 100, 150.00, 50.00],
        [2, 'New Year Party', 'Celebrate the new year with us!', '2025-12-31 22:00:00', '2026-01-01 02:00:00', 'Rooftop Lounge', 1, 30, 80, 200.00, 75.00]
    ];

    $stmt = $db->prepare("INSERT INTO events (event_id, title, description, start_time, end_time, location, organizer_id, vip_capacity, regular_capacity, vip_price, regular_price) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    
    foreach ($events as $event) {
        $stmt->execute($event);
    }
    echo "✓ Added 2 sample events\n";

    echo "\n";
    echo "===========================================\n";
    echo "Sample data populated successfully!\n";
    echo "- 4 room types (Single, Double, Suite, Deluxe)\n";
    echo "- 8 rooms (2 of each type)\n";
    echo "- 2 events (Gala Dinner, New Year Party)\n";
    echo "===========================================\n";

} catch(PDOException $e) {
    echo "Error populating data: " . $e->getMessage() . "\n";
}
?>
