<?php

header("Content-Type: application/json");
session_start();


$env = parse_ini_file(__DIR__ . '/../.env');

// Database connection
$host = "mysql.caesar.elte.hu";
$dbname = "ofimate";
$db_user = "ofimate";
$db_pass = $env["password"];
$jwt_secret = $env['jwt_secret'];

try {
    $db = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $db_user, $db_pass);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Database connection failed: " . $e->getMessage()]);
    exit;
}

function base64UrlDecode($data) {
    $pad = strlen($data) % 4;
    if ($pad > 0) {
        $data .= str_repeat('=', 4 - $pad);
    }
    return base64_decode(strtr($data, '-_', '+/'));
}

function base64UrlEncode($data) {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function validate_jwt($jwt, $secret) {
    $parts = explode('.', $jwt);
    if (count($parts) !== 3) return false;

    list($headerB64, $payloadB64, $signatureB64) = $parts;

    $payload = json_decode(base64UrlDecode($payloadB64), true);
    if (!$payload) return false;

    // Check expiration
    if (!isset($payload['exp']) || $payload['exp'] < time()) {
        return false;
    }

    // Check signature
    $expected = base64UrlEncode(hash_hmac('sha512', "$headerB64.$payloadB64", $secret, true));
    if (!hash_equals($expected, $signatureB64)) {
        return false;
    }

    return $payload;
}

// Check if the user is logged in
if (!isset($_COOKIE['token'])) {
    echo json_encode(["status" => "error", "message" => "Missing token"]);
    exit;
}
$payload = validate_jwt($_COOKIE['token'], $jwt_secret);

if (!$payload) {
    echo json_encode(["status" => "error", "message" => "Invalid or expired token"]);
    exit;
}

$user_id = (int)$payload['sub']; // Authenticated user ID from token

try{
    $stmt = $db->prepare(
"SELECT u.username, s.score, s.lives, s.time 
    FROM Users u
    JOIN ScoreTable s ON s.user_id = u.id 
    WHERE u.id = :user_id 
    ORDER BY score DESC 
    LIMIT 10");
    $stmt->execute(['user_id' => $user_id]);
    echo json_encode(["status"=>"success", "scores"=>$stmt->fetchAll(PDO::FETCH_ASSOC)]);

}catch(PDOException $e){
    echo json_encode(["status"=>"error", "message"=>"Database error: ".$e->getMessage()]);
    exit;
}

?>