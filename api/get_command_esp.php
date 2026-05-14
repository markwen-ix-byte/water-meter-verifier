<?php

header('Content-Type: application/json');

error_reporting(0);

require_once '../db.php';

try {

    $stmt = $pdo->query("
        SELECT id, command, value
        FROM commands
        WHERE status='pending'
        ORDER BY id ASC
        LIMIT 1
    ");

    $cmd = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($cmd) {

        $upd = $pdo->prepare("
            UPDATE commands
            SET status='done'
            WHERE id=?
        ");

        $upd->execute([$cmd['id']]);

        echo json_encode([
            "has_command" => true,
            "command" => trim($cmd['command']),
            "value" => trim($cmd['value'])
        ]);

    } else {

        echo json_encode([
            "has_command" => false
        ]);
    }

} catch(Exception $e) {

    echo json_encode([
        "has_command" => false,
        "error" => $e->getMessage()
    ]);
}
?>