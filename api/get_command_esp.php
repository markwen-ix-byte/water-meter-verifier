<?php
require '../db.php';

$device_id = $_GET['device_id'] ?? 'verifier_001';

try {
    // Ищем новую команду
    $stmt = $pdo->prepare("SELECT command, value FROM commands 
                          WHERE device_id = ? AND executed = 0 
                          ORDER BY created_at DESC LIMIT 1");
    $stmt->execute([$device_id]);
    $cmd = $stmt->fetch();

    if ($cmd) {
        // Помечаем как выполненную
        $pdo->prepare("UPDATE commands SET executed = 1 WHERE device_id = ? AND executed = 0")
            ->execute([$device_id]);

        echo json_encode([
            "has_command" => true,
            "command" => $cmd['command'],
            "value" => $cmd['value']
        ]);
    } else {
        echo json_encode(["has_command" => false]);
    }
} catch(Exception $e) {
    echo json_encode(["has_command" => false]);
}
?>
