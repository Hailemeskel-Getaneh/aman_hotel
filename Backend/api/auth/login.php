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

if(!isset($data->email) || !isset($data->password)) {
    echo json_encode(array('message' => 'Missing email or password'));
    exit();
}

$email = htmlspecialchars(strip_tags($data->email));
$password = htmlspecialchars(strip_tags($data->password));

// Query to check email
$query = 'SELECT id, name, email, password_hash, role, phone FROM users WHERE email = :email LIMIT 0,1';

// Prepare statement
$stmt = $db->prepare($query);

// Bind ID
$stmt->bindParam(':email', $email);

// Execute query
$stmt->execute();

if($stmt->rowCount() > 0) {
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    $id = $row['id'];
    $name = $row['name'];
    $hashed_password = $row['password_hash'];
    $role = $row['role'];
    $phone = $row['phone'];

    // Verify password
    if(password_verify($password, $hashed_password)) {
        // Return user data (could also generate a JWT here, but keeping it simple as per request)
        echo json_encode(array(
            'message' => 'Login Successful',
            'user' => array(
                'id' => $id,
                'name' => $name,
                'email' => $email,
                'role' => $role,
                'phone' => $phone
            )
        ));
    } else {
        echo json_encode(array('message' => 'Invalid Password'));
    }
} else {
    echo json_encode(array('message' => 'User not found'));
}
