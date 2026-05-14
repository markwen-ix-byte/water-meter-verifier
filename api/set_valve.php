<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');

require_once '../db.php';

$stateFile = '../data/state.json';
$device_id = 'verifier_001';

$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['valve'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing valve parameter']);
    exit;
}

if (!file_exists($stateFile)) {
    http_response_code(404);
    echo json_encode(['error' => 'State file not found']);
    exit;
}

$state = json_decode(file_get_contents($stateFile), true);

if ($state['mode'] !== 'AUTO') {
    http_response_code(403);
    echo json_encode(['error' => 'Can only control valve in AUTO mode']);
    exit;
}

$state['valve'] = (bool)$input['valve'];
if ($state['valve'] === true) {
    $state['last_pulse_time'] = time();
}

file_put_contents($stateFile, json_encode($state, JSON_PRETTY_PRINT));

try {
    $stmt = $pdo->prepare("
        INSERT INTO commands (device_id, command, value) 
        VALUES (:device_id, :command, :value)
    ");
    $stmt->execute([
        ':device_id' => $device_id,
        ':command' => 'set_valve',
        ':value' => $state['valve'] ? 'open' : 'closed'
    ]);
} catch(PDOException $e) {
    error_log("[DB] Command log error: " . $e->getMessage());
}

echo json_encode($state);
?>