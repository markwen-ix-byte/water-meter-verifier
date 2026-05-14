<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');

require_once '../db.php';

$stateFile = '../data/state.json';
$device_id = 'verifier_001';

$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['coeff'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing coeff parameter']);
    exit;
}

$newCoeff = floatval($input['coeff']);

if (!file_exists($stateFile)) {
    http_response_code(404);
    echo json_encode(['error' => 'State file not found']);
    exit;
}

$state = json_decode(file_get_contents($stateFile), true);

if ($state['mode'] !== 'MANUAL') {
    http_response_code(403);
    echo json_encode(['error' => 'Can only change coefficient in MANUAL mode']);
    exit;
}

$state['coeff_verified'] = $newCoeff;
$state['volume_verified'] = round($state['cnt_verified'] * $state['coeff_verified'], 2);
$state['volume_etalon'] = round($state['cnt_etalon'] * $state['coeff_etalon'], 2);

if ($state['volume_etalon'] > 0) {
    $state['error_percent'] = round(
        (($state['volume_verified'] - $state['volume_etalon']) / $state['volume_etalon']) * 100,
        2
    );
} else {
    $state['error_percent'] = 0;
}

file_put_contents($stateFile, json_encode($state, JSON_PRETTY_PRINT));

try {
    $stmt = $pdo->prepare("
        INSERT INTO commands (device_id, command, value) 
        VALUES (:device_id, :command, :value)
    ");
    $stmt->execute([
        ':device_id' => $device_id,
        ':command' => 'set_coeff',
        ':value' => "$newCoeff"
    ]);
} catch(PDOException $e) {
    error_log("[DB] Command log error: " . $e->getMessage());
}

echo json_encode($state);
?>