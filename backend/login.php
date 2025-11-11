<?php
header("Content-Type: application/json; charset=UTF-8");
session_start();


$env = parse_ini_file(__DIR__ . '/../.env');

$host = "mysql.caesar.elte.hu";
$dbname = "ofimate";
$username = "ofimate";
$password = $env["password"];
$db = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);

$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
$db->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

$data = json_decode(file_get_contents("php://input"), true);

if (isset($data['username']) && isset($data['password'])) {
    $username = $data['username'];
    $password = $data['password'];
} else {
    echo json_encode(["error" => "Invalid input"]);
}

$stmt = $db->prepare("SELECT * FROM users WHERE username = :username");
$stmt->bindParam(':username', $username);
$stmt->execute();

$user = $stmt->fetch();

if ($user && password_verify($password, $user['password'])) {
    $_SESSION['user_id'] = $user['id'];
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["error" => "Invalid username or password"]);
}

$_SESSION['user_id'] = $user['id'];
$_SESSION['username'] = $user['username'];

echo json_encode(["success" => true, "user" => $_SESSION['username']]);


 ?>