<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');

require_once '../db.php';

$stateFile = '../data/state.json';
$device_id = 'verifier_001';

$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['mode'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing mode parameter']);
    exit;
}

$newMode = $input['mode'];
$allowedModes = ['AUTO', 'MANUAL', 'DEMO', 'SERVICE'];

if (!in_array($newMode, $allowedModes)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid mode']);
    exit;
}

if (!file_exists($stateFile)) {
    http_response_code(404);
    echo json_encode(['error' => 'State file not found']);
    exit;
}

$state = json_decode(file_get_contents($stateFile), true);

$oldMode = $state['mode'];
$state['mode'] = $newMode;

if ($oldMode === 'AUTO' && $newMode !== 'AUTO') {
    $state['valve'] = false;
}

if ($newMode === 'DEMO') {
    $state['cnt_verified'] = 0;
    $state['cnt_etalon'] = 0;
    $state['volume_verified'] = 0;
    $state['volume_etalon'] = 0;
    $state['error_percent'] = 0;
}

if ($newMode === 'SERVICE') {
    $state['error_percent'] = 0;
}

$state['timestamp'] = time();

file_put_contents($stateFile, json_encode($state, JSON_PRETTY_PRINT));

try {
    $stmt = $pdo->prepare("
        INSERT INTO commands (device_id, command, value) 
        VALUES (:device_id, :command, :value)
    ");
    $stmt->execute([
        ':device_id' => $device_id,
        ':command' => 'set_mode',
        ':value' => "$oldMode -> $newMode"
    ]);
} catch(PDOException $e) {
    error_log("[DB] Command log error: " . $e->getMessage());
}

echo json_encode($state);
?>