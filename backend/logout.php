<?php
header("Content-Type: application/json");
session_start();
session_unset();
session_destroy();

// Clear the JWT cookie
setcookie('token', '', ['expires' => time() - 3600, 'path' => '/']);

echo json_encode(["status" => "success", "message" => "Sikeres kijelentkezés!"]);
?>
