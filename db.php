<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$host     = 'sql7.freesqldatabase.com';
$dbname   = 'sql7826838';
$username = 'sql7826838';
$password = '7MVcf3Ui4b';

try {
    $pdo = new PDO("mysql:host=$host;port=3306;dbname=$dbname;charset=utf8mb4", 
                   $username, $password, [
                       PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                       PDO::ATTR_TIMEOUT => 10
                   ]);
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "DB Connection Failed"]);
    exit;
}
?>
