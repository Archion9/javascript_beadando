//logout
<?php
session_start();
session_unset();
session_destroy();

// Clear the JWT cookie
setcookie('token', '', time() - 3600, '/');

echo json_encode(["status" => "success", "message" => "Sikeres kijelentkezés!"]);
?>