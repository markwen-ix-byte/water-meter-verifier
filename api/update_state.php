<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET');

require_once '../db.php';

$device_id = 'verifier_001';
$stateFile = '../data/state.json';

function saveStateToDB($pdo, $device_id, $state) {
    $stmt = $pdo->prepare("
        INSERT INTO states (
            device_id, mode, cnt_verified, cnt_etalon, 
            volume_verified, volume_etalon, error_percent,
            temperature, humidity, valve, coeff_verified, 
            status, timestamp
        ) VALUES (
            :device_id, :mode, :cnt_verified, :cnt_etalon,
            :volume_verified, :volume_etalon, :error_percent,
            :temperature, :humidity, :valve, :coeff_verified,
            :status, :timestamp
        )
    ");
    
    $stmt->execute([
        ':device_id' => $device_id,
        ':mode' => $state['mode'],
        ':cnt_verified' => $state['cnt_verified'],
        ':cnt_etalon' => $state['cnt_etalon'],
        ':volume_verified' => $state['volume_verified'],
        ':volume_etalon' => $state['volume_etalon'],
        ':error_percent' => $state['error_percent'],
        ':temperature' => $state['temperature'],
        ':humidity' => $state['humidity'],
        ':valve' => $state['valve'] ? 1 : 0,
        ':coeff_verified' => $state['coeff_verified'],
        ':status' => $state['status'],
        ':timestamp' => $state['timestamp']
    ]);
    
    return $pdo->lastInsertId();
}

if (!file_exists($stateFile)) {
    $state = [
        'device_id' => $device_id,
        'mode' => 'AUTO',
        'timestamp' => time(),
        'cnt_verified' => 0,
        'cnt_etalon' => 0,
        'volume_verified' => 0,
        'volume_etalon' => 0,
        'error_percent' => 0,
        'temperature' => 23.5,
        'humidity' => 45.0,
        'valve' => false,
        'status' => 'ok',
        'coeff_verified' => 1.0,
        'coeff_etalon' => 1.0,
        'last_pulse_time' => time()
    ];
} else {
    $state = json_decode(file_get_contents($stateFile), true);
}

$state['temperature'] = round(19 + mt_rand(0, 80) / 10, 1);
$state['humidity'] = round(35 + mt_rand(0, 300) / 10, 1);
$state['timestamp'] = time();

$currentTime = time();
$lastPulseTime = $state['last_pulse_time'] ?? 0;

if ($state['mode'] === 'AUTO') {
    if ($state['valve'] === true) {
        if ($currentTime - $lastPulseTime >= 2) {
            $etalonPulses = mt_rand(1, 3);
            $errorFactor = 1 + (mt_rand(-150, 150) / 1000);
            $verifiedPulses = max(1, round($etalonPulses * $errorFactor));
            
            $state['cnt_etalon'] += $etalonPulses;
            $state['cnt_verified'] += $verifiedPulses;
            $state['last_pulse_time'] = $currentTime;
            
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
            $state['status'] = 'ok';
        }
    }
    
} elseif ($state['mode'] === 'DEMO') {
    static $demoStep = 0;
    static $demoCounter = 0;
    
    $demoErrors = [-5, 0, 5, 10];
    $demoCounter++;
    
    if ($demoCounter >= 4) {
        $demoCounter = 0;
        $targetError = $demoErrors[$demoStep % 4];
        
        $state['cnt_etalon'] += 1;
        $state['cnt_verified'] += round(1 + $targetError / 100);
        
        $state['volume_verified'] = round($state['cnt_verified'] * $state['coeff_verified'], 2);
        $state['volume_etalon'] = round($state['cnt_etalon'] * $state['coeff_etalon'], 2);
        
        if ($state['volume_etalon'] > 0) {
            $state['error_percent'] = round(
                (($state['volume_verified'] - $state['volume_etalon']) / $state['volume_etalon']) * 100,
                2
            );
        }
        
        if ($state['cnt_etalon'] % 4 == 0) {
            $demoStep++;
        }
        $demoStep++;
    }
    $state['status'] = 'demo';
    
} elseif ($state['mode'] === 'MANUAL') {
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
    $state['status'] = 'manual';
    
} else {
    $state['error_percent'] = 0;
    $state['status'] = 'service';
}

file_put_contents($stateFile, json_encode($state, JSON_PRETTY_PRINT));

try {
    saveStateToDB($pdo, $device_id, $state);
} catch(PDOException $e) {
    error_log("[DB] Save error: " . $e->getMessage());
}

echo json_encode(['status' => 'ok', 'timestamp' => $state['timestamp']]);
?>