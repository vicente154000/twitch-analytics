<?php
// public/index.php
header("Content-Type: application/json");

echo json_encode([
    "status" => "success",
    "message" => "API Twitch Analytics - Grupo Scrumshank",
    "version" => "1.0.0"
]);
?>