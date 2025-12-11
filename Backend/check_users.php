<?php
include_once 'config/Database.php';
$database = new Database();
$db = $database->connect();

$query = "SELECT id, name, email FROM users";
$stmt = $db->prepare($query);
$stmt->execute();
$users = $stmt->fetchAll(PDO::FETCH_ASSOC);

print_r($users);
