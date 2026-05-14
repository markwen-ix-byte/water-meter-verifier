<?php
require '../db.php';
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$data = json_decode(file_get_contents('php://input'), true);

echo json_encode([
    "status" => "ok",
    "message" => "State received"
]);
?>
