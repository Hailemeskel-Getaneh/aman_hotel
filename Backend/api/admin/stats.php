<?php
// Headers
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

include_once '../../config/Database.php';
include_once '../../config/Cors.php';

// Handle CORS
Cors::handle();

// Instantiate DB & Connect
$database = new Database();
$db = $database->connect();

try {
    $stats = [];

    // 1. Basic Counts
    $q_bookings = "SELECT COUNT(*) as total FROM bookings";
    $stmt = $db->query($q_bookings);
    $stats['total_bookings'] = $stmt->fetch()['total'];

    $q_rooms = "SELECT COUNT(*) as total FROM rooms";
    $stmt = $db->query($q_rooms);
    $stats['total_rooms'] = $stmt->fetch()['total'];

    $q_events = "SELECT COUNT(*) as total FROM events";
    $stmt = $db->query($q_events);
    $stats['total_events'] = $stmt->fetch()['total'];

    $q_messages = "SELECT COUNT(*) as total FROM contact_messages";
    $stmt = $db->query($q_messages);
    $stats['total_messages'] = $stmt->fetch()['total'];

    // 2. Revenue (Assuming final_price in bookings)
    $q_revenue = "SELECT SUM(final_price) as total FROM bookings WHERE status != 'cancelled'";
    $stmt = $db->query($q_revenue);
    $stats['total_revenue'] = $stmt->fetch()['total'] ?? 0;

    // 3. Bookings by Month (Last 6 months)
    $q_monthly = "SELECT 
                    DATE_FORMAT(created_at, '%b') as month, 
                    COUNT(*) as count,
                    SUM(final_price) as revenue
                  FROM bookings 
                  WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
                  GROUP BY DATE_FORMAT(created_at, '%Y-%m')
                  ORDER BY created_at ASC";
    $stmt = $db->query($q_monthly);
    $stats['monthly_data'] = $stmt->fetchAll();

    // 4. Room Type Distribution
    $q_room_dist = "SELECT 
                        rt.type_name as name, 
                        COUNT(r.room_id) as value
                     FROM room_types rt
                     LEFT JOIN rooms r ON rt.type_id = r.room_type_id
                     GROUP BY rt.type_id";
    $stmt = $db->query($q_room_dist);
    $stats['room_type_dist'] = $stmt->fetchAll();

    // 5. Booking Status Distribution
    $q_status_dist = "SELECT 
                        status as name, 
                        COUNT(*) as value
                      FROM bookings
                      GROUP BY status";
    $stmt = $db->query($q_status_dist);
    $stats['booking_status_dist'] = $stmt->fetchAll();

    echo json_encode([
        'status' => 'success',
        'data' => $stats
    ]);

} catch(PDOException $e) {
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}
