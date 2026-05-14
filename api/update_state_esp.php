<?php
require '../db.php';

$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    echo json_encode(["status" => "error", "message" => "No data"]);
    exit;
}

try {
    $stmt = $pdo->prepare("INSERT INTO states 
        (device_id, mode, cnt_verified, cnt_etalon, error_percent, temperature, humidity, valve) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    
    $stmt->execute([
        $data['device_id'],
        $data['mode'],
        $data['cnt_verified'],
        $data['cnt_etalon'],
        $data['error_percent'],
        $data['temperature'],
        $data['humidity'],
        $data['valve']
    ]);

    echo json_encode(["status" => "ok", "message" => "State saved"]);
} catch(Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
