<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
include_once './config/Database.php';

$database = new Database();
$db = $database->connect();

$stmt = $db->prepare("DESCRIBE events");
$stmt->execute();
$columns = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($columns);
?>
