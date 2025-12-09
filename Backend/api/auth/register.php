<?php
// Headers
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers,Content-Type,Access-Control-Allow-Methods, Authorization, X-Requested-With');

include_once '../../config/Database.php';
include_once '../../config/Cors.php';

// Handle CORS
Cors::handle();

// Instantiate DB & Connect
$database = new Database();
$db = $database->connect();

// Get raw posted data
$data = json_decode(file_get_contents("php://input"));

if(!isset($data->name) || !isset($data->email) || !isset($data->password) || !isset($data->phone)) {
    echo json_encode(array('message' => 'Missing required fields'));
    exit();
}

// Clean data
$name = htmlspecialchars(strip_tags($data->name));
$email = htmlspecialchars(strip_tags($data->email));
$phone = htmlspecialchars(strip_tags($data->phone));
$password = htmlspecialchars(strip_tags($data->password));

// Hash password
$password_hash = password_hash($password, PASSWORD_BCRYPT);
$role = 'customer'; // Default role

// Check if email exists
$query = "SELECT id FROM users WHERE email = :email LIMIT 0,1";
$stmt = $db->prepare($query);
$stmt->bindParam(':email', $email);
$stmt->execute();

if($stmt->rowCount() > 0) {
    echo json_encode(array('message' => 'Email already exists'));
    exit();
}

// Create query
$query = 'INSERT INTO users SET name = :name, email = :email, phone = :phone, password_hash = :password_hash, role = :role';

// Prepare statement
$stmt = $db->prepare($query);

// Bind data
$stmt->bindParam(':name', $name);
$stmt->bindParam(':email', $email);
$stmt->bindParam(':phone', $phone);
$stmt->bindParam(':password_hash', $password_hash);
$stmt->bindParam(':role', $role);

// Execute query
if($stmt->execute()) {
    echo json_encode(array('message' => 'User Created'));
} else {
    echo json_encode(array('message' => 'User Not Created'));
}
