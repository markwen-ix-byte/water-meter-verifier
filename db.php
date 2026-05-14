<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Используем переменные окружения Render
$host = getenv('DB_HOST') ?: 'sql305.infinityfree.com';
$dbname = getenv('DB_NAME') ?: 'if0_41909845_iot_system';
$username = getenv('DB_USER') ?: 'if0_41909845';
$password = getenv('DB_PASS') ?: 'ZrhqgM9PBZg';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch(PDOException $e) {
    http_response_code(500);
    die(json_encode(['error' => 'Database connection failed']));
}
?>
