<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

require_once '../db.php';

$device_id = 'verifier_001';

try {
    // Проверяем подключение к БД
    $stmt = $pdo->query("SELECT 1");
    
    // Получаем историю
    $stmt = $pdo->prepare("
        SELECT id, mode, cnt_verified, cnt_etalon, 
               volume_verified, volume_etalon, error_percent,
               temperature, humidity, valve, timestamp, created_at
        FROM states 
        WHERE device_id = ? 
        ORDER BY id DESC 
        LIMIT 20
    ");
    $stmt->execute([$device_id]);
    $history = $stmt->fetchAll();
    
    // Получаем команды
    $stmt2 = $pdo->prepare("
        SELECT command, value, created_at 
        FROM commands 
        WHERE device_id = ? 
        ORDER BY id DESC 
        LIMIT 20
    ");
    $stmt2->execute([$device_id]);
    $commands = $stmt2->fetchAll();
    
    echo json_encode([
        'success' => true,
        'history' => $history,
        'commands' => $commands
    ]);
    
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>