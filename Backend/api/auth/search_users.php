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

// Get search query parameter
$search = isset($_GET['search']) ? $_GET['search'] : '';

// Query to search users by name or email
$query = 'SELECT id, name, email, role FROM users WHERE role = :role';

if ($search) {
    $query .= ' AND (name LIKE :search OR email LIKE :search)';
}

$query .= ' ORDER BY name LIMIT 50';

$stmt = $db->prepare($query);
$role = 'customer'; // Only search for customers
$stmt->bindParam(':role', $role);

if ($search) {
    $searchTerm = "%{$search}%";
    $stmt->bindParam(':search', $searchTerm);
}

$stmt->execute();

$num = $stmt->rowCount();

if($num > 0) {
    $users_arr = array();
    $users_arr['data'] = array();

    while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        array_push($users_arr['data'], $row);
    }

    echo json_encode($users_arr);
} else {
    echo json_encode(array('data' => array()));
}
