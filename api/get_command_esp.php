<?php
require '../db.php';
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

echo json_encode([
    "has_command" => false,
    "command" => "",
    "value" => ""
]);
?>
