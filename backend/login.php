<?php
header("Content-Type: application/json; charset=UTF-8");
session_start();

$env = parse_ini_file(__DIR__ . '/../.env');
$host = "mysql.caesar.elte.hu";
$dbname = "ofimate";
$username = "ofimate";
$password = $env["password"];
$jwt_secret = $env['jwt_secret'];

try {
    $db = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $db->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    echo json_encode(["error" => "Database connection failed"]);
    exit;
}

function base64UrlEncode($text) {
    return str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($text));
}

$data = json_decode(file_get_contents("php://input"), true);
if (!isset($data['username'], $data['password'])) {
    echo json_encode(["error" => "Invalid input"]);
    exit;
}

$username = $data['username'];
$password = $data['password'];

$stmt = $db->prepare("SELECT * FROM Users WHERE username = :username");
$stmt->bindParam(':username', $username);
$stmt->execute();
$user = $stmt->fetch();

if (!$user || !password_verify($password, $user['password'])) {
    echo json_encode(["error" => "Invalid username or password"]);
    exit;
}

// Set session
$_SESSION['user_id'] = $user['id'];
$_SESSION['username'] = $user['username'];

// Build JWT
$issuedAt = time();
$expire = $issuedAt + 3600;

$header = base64UrlEncode(json_encode(["alg" => "HS512", "typ" => "JWT"]));
$payload = base64UrlEncode(json_encode([
    "iss" => "Archion",
    "iat" => $issuedAt,
    "exp" => $expire,
    "sub" => $user['id'],
    "username" => $user['username']
]));
$signature = hash_hmac('sha512', "$header.$payload", $jwt_secret, true);
$signature_encoded = base64UrlEncode($signature);
$jwt = "$header.$payload.$signature_encoded";

echo json_encode(["status" => "success", "user" => $user['username']]);
setcookie(
    "token",
    $jwt,
    [
        "expires" => time() + 3600,
        "path" => "/",
        "secure" => true,      // only send over HTTPS
        "httponly" => true,    // JS can't read or modify it
        "samesite" => "Strict" // prevents CSRF
    ]
);
setcookie(
    "username",
    $user['username'],
    [
        "expires" => time() + 3600,
        "path" => "/",
        "secure" => true,
        "httponly" => false,
        "samesite" => "Strict"
    ]
);

?>