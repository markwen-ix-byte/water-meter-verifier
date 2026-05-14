<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$host = 'sql305.infinityfree.com';
$dbname = 'if0_41909845_iot_system';
$username = 'if0_41909845';
$password = 'ZrhqgM9PBZg';   // ← ПРАВИЛЬНЫЙ ПАРОЛЬ!

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch(PDOException $e) {
    die(json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]));
}
?>