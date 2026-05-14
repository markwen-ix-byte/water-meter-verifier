<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Попытка подключения
$host = getenv('DB_HOST') ?: 'sql305.infinityfree.com';
$dbname = getenv('DB_NAME') ?: 'if0_41909845_iot_system';
$username = getenv('DB_USER') ?: 'if0_41909845';
$password = getenv('DB_PASS') ?: 'ZrhqgM9PBZg';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_TIMEOUT => 10
    ]);
    // echo json_encode(["status" => "connected"]); // можно раскомментировать для теста
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "DB Connection Failed", "details" => $e->getMessage()]);
    exit;
}
?>
