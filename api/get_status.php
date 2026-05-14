<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

require_once '../db.php';

$device_id = 'verifier_001';

try {
  $stmt = $pdo->query("SELECT * FROM states ORDER BY created_at DESC LIMIT 1");
    $stmt->execute([$device_id]);
    $state = $stmt->fetch();
    
    if ($state) {
        $state['valve'] = (bool)$state['valve'];
        $state['cnt_verified'] = (int)$state['cnt_verified'];
        $state['cnt_etalon'] = (int)$state['cnt_etalon'];
        $state['volume_verified'] = (float)$state['volume_verified'];
        $state['volume_etalon'] = (float)$state['volume_etalon'];
        $state['error_percent'] = (float)$state['error_percent'];
        $state['temperature'] = (float)$state['temperature'];
        $state['humidity'] = (float)$state['humidity'];
        $state['coeff_verified'] = (float)$state['coeff_verified'];
        $state['timestamp'] = (int)$state['timestamp'];
        
        echo json_encode($state);
    } else {
        $defaultState = [
            'device_id' => $device_id,
            'mode' => 'AUTO',
            'cnt_verified' => 0,
            'cnt_etalon' => 0,
            'volume_verified' => 0,
            'volume_etalon' => 0,
            'error_percent' => 0,
            'temperature' => 23.5,
            'humidity' => 45.0,
            'valve' => false,
            'coeff_verified' => 1.0,
            'status' => 'ok',
            'timestamp' => time()
        ];
        echo json_encode($defaultState);
    }
    
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>
