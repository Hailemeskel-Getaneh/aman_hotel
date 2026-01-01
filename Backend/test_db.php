<?php
include_once 'config/Database.php';

$database = new Database();
$db = $database->connect();

if ($db) {
    echo "Database Connected Successfully";
} else {
    echo "Database Connection Failed";
}
