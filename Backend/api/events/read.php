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
        array_push($events_arr['data'], $row);
    }

    echo json_encode($events_arr);
} else {
    echo json_encode(array('message' => 'No Events Found'));
}
