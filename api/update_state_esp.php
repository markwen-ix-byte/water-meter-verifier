<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');           // важно для Wokwi
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    echo json_encode(["status" => "error", "message" => "No data"]);
    exit;
}

// Здесь сохраняешь в базу...
// Пример:
require 'db.php';
$stmt = $pdo->prepare("INSERT INTO states (...) VALUES (...)");
$stmt->execute([...]);

echo json_encode(["status" => "ok", "message" => "State saved"]);
?>