<?php

header("Content-Type: application/json");
session_start();

ini_set('display_errors', 1);
error_reporting(E_ALL);

$env = parse_ini_file(__DIR__ . '/../.env');

// Database connection
$host = "mysql.caesar.elte.hu";
$dbname = "ofimate";
$db_user = "ofimate";
$db_pass = $env["password"];

try {
    $db = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $db_user, $db_pass);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Database connection failed: " . $e->getMessage()]);
    exit;
}

// Decode JSON input
$data = json_decode(file_get_contents("php://input"), true);
if (!$data || empty($data['username']) || empty($data['password'])) {
    echo json_encode(["status" => "error", "message" => "Hiányzó adatok."]);
    exit;
}

$username = $data['username'];
$password = $data['password'];

// Check if username already exists
$stmt = $db->prepare("SELECT id FROM Users WHERE username = :username");
$stmt->execute(['username' => $username]);

if ($stmt->fetch()) {
    echo json_encode(["status" => "error", "message" => "A felhasználónév már foglalt."]);
    exit;
}

// Insert new user
$stmt = $db->prepare("INSERT INTO Users (username, password) VALUES (:username, :password)");
$stmt->execute([
    'username' => $username,
    'password' => password_hash($password, PASSWORD_DEFAULT) // secure password storage
]);

$_SESSION['user_id'] = $db->lastInsertId(); 
$_SESSION['username'] = $username; 

echo json_encode(["status" => "success", "message" => "Sikeres regisztráció!"]);
?>