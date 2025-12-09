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

if(!isset($data->name) || !isset($data->email) || !isset($data->subject) || !isset($data->message)) {
    echo json_encode(array('message' => 'Missing required fields'));
    exit();
}

// Clean data
$name = htmlspecialchars(strip_tags($data->name));
$email = htmlspecialchars(strip_tags($data->email));
$subject = htmlspecialchars(strip_tags($data->subject));
$message = htmlspecialchars(strip_tags($data->message));
$user_id = isset($data->user_id) ? $data->user_id : null;

// Create query
$query = 'INSERT INTO contact_messages SET 
    name = :name, 
    email = :email, 
    subject = :subject, 
    message = :message,
    user_id = :user_id';

// Prepare statement
$stmt = $db->prepare($query);

// Bind data
$stmt->bindParam(':name', $name);
$stmt->bindParam(':email', $email);
$stmt->bindParam(':subject', $subject);
$stmt->bindParam(':message', $message);
$stmt->bindParam(':user_id', $user_id);

// Execute query
if($stmt->execute()) {
    echo json_encode(array('message' => 'Message Sent'));
} else {
    echo json_encode(array('message' => 'Message Failed'));
}
