<?php
// Headers
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET, POST, DELETE');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers,Content-Type,Access-Control-Allow-Methods, Authorization, X-Requested-With');

include_once '../../config/Database.php';
include_once '../../config/Cors.php';

// Handle CORS
Cors::handle();

// Instantiate DB & Connect
$database = new Database();
$db = $database->connect();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // List all users (Exclude customers, show only Admin & Receptionist)
    $query = "SELECT id, name, email, phone, role, created_at FROM users WHERE role != 'customer' ORDER BY created_at DESC";
    $stmt = $db->prepare($query);
    $stmt->execute();

    $num = $stmt->rowCount();

    if ($num > 0) {
        $users_arr = array();
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            extract($row);
            $user_item = array(
                'id' => $id,
                'name' => $name,
                'email' => $email,
                'phone' => $phone,
                'role' => $role,
                'created_at' => $created_at
            );
            array_push($users_arr, $user_item);
        }
        echo json_encode(array('data' => $users_arr));
    } else {
        echo json_encode(array('data' => []));
    }

} elseif ($method === 'POST') {
    // Create new user (Admin capabilities)
    $data = json_decode(file_get_contents("php://input"));

    if(!isset($data->name) || !isset($data->email) || !isset($data->password) || !isset($data->role)) {
        echo json_encode(array('message' => 'Missing required fields'));
        exit();
    }

    // Clean data
    $name = htmlspecialchars(strip_tags($data->name));
    $email = htmlspecialchars(strip_tags($data->email));
    $phone = isset($data->phone) ? htmlspecialchars(strip_tags($data->phone)) : '';
    $password = htmlspecialchars(strip_tags($data->password));
    $role = htmlspecialchars(strip_tags($data->role));

    // Check if email exists
    $check_query = "SELECT id FROM users WHERE email = :email LIMIT 0,1";
    $check_stmt = $db->prepare($check_query);
    $check_stmt->bindParam(':email', $email);
    $check_stmt->execute();

    if($check_stmt->rowCount() > 0) {
        echo json_encode(array('message' => 'Email already exists'));
        exit();
    }

    // Hash password
    $password_hash = password_hash($password, PASSWORD_BCRYPT);

    $query = 'INSERT INTO users SET name = :name, email = :email, phone = :phone, password_hash = :password_hash, role = :role';
    $stmt = $db->prepare($query);

    $stmt->bindParam(':name', $name);
    $stmt->bindParam(':email', $email);
    $stmt->bindParam(':phone', $phone);
    $stmt->bindParam(':password_hash', $password_hash);
    $stmt->bindParam(':role', $role);

    if($stmt->execute()) {
        echo json_encode(array('message' => 'User Created'));
    } else {
        echo json_encode(array('message' => 'User Not Created'));
    }

} elseif ($method === 'DELETE') {
    // Delete user
    $id = isset($_GET['id']) ? $_GET['id'] : die();

    $query = 'DELETE FROM users WHERE id = :id';
    $stmt = $db->prepare($query);
    $stmt->bindParam(':id', $id);

    if($stmt->execute()) {
        echo json_encode(array('message' => 'User Deleted'));
    } else {
        echo json_encode(array('message' => 'User Not Deleted'));
    }

} else {
    echo json_encode(array('message' => 'Method Not Allowed'));
}
