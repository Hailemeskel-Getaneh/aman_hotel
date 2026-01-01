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

// Query
$query = 'SELECT e.*, u.name as organizer_name 
          FROM events e 
          LEFT JOIN users u ON e.organizer_id = u.id 
          ORDER BY e.start_time ASC';

// Prepare statement
$stmt = $db->prepare($query);

// Execute query
$stmt->execute();

$num = $stmt->rowCount();

if($num > 0) {
    $events_arr = array();
    $events_arr['data'] = array();

    while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $event_id = $row['event_id'];
        
        // Calculate booked seats for VIP
        $vipBookedQuery = "SELECT COALESCE(SUM(quantity), 0) as booked 
                           FROM event_bookings 
                           WHERE event_id = :event_id 
                           AND ticket_type = 'vip' 
                           AND status IN ('confirmed', 'pending')";
        $vipStmt = $db->prepare($vipBookedQuery);
        $vipStmt->bindParam(':event_id', $event_id);
        $vipStmt->execute();
        $vipBooked = $vipStmt->fetch(PDO::FETCH_ASSOC)['booked'];
        
        // Calculate booked seats for Regular
        $regularBookedQuery = "SELECT COALESCE(SUM(quantity), 0) as booked 
                               FROM event_bookings 
                               WHERE event_id = :event_id 
                               AND ticket_type = 'regular' 
                               AND status IN ('confirmed', 'pending')";
        $regularStmt = $db->prepare($regularBookedQuery);
        $regularStmt->bindParam(':event_id', $event_id);
        $regularStmt->execute();
        $regularBooked = $regularStmt->fetch(PDO::FETCH_ASSOC)['booked'];
        
        // Calculate remaining seats
        $row['vip_available'] = max(0, intval($row['vip_capacity']) - intval($vipBooked));
        $row['regular_available'] = max(0, intval($row['regular_capacity']) - intval($regularBooked));
        
        array_push($events_arr['data'], $row);
    }

    echo json_encode($events_arr);
} else {
    echo json_encode(array('message' => 'No Events Found'));
}
