<?php
header("Content-Type: application/json");
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
    $db->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Database connection failed"]);
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

/* --------------------------
   VALIDATE JWT FROM COOKIE
--------------------------- */
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

/* --------------------------
   PARSE SCORE DATA
--------------------------- */
$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['score']) || !is_numeric($data['score'])) {
    echo json_encode(["status" => "error", "message" => "Invalid or missing score"]);
    exit;
}
if(!isset($data["lives"]) || !is_numeric($data["lives"])) {
    echo json_encode(["status"=> "error", "message"=> "Invalid or missing lives"]);
    exit;
}
if(!isset($data["time"]) || !is_numeric($data["time"])) {
    echo json_encode(["status"=> "error", "message"=> "Invalid or missing time"]);
    exit;
}

$score = (int)$data['score'];
$lives = isset($data['lives']) ? (int)$data['lives'] : 0;
$time  = isset($data['time'])  ? (int)$data['time']  : 0;

/* --------------------------
   INSERT SCORE
--------------------------- */
try {
    $stmt = $db->prepare("
        INSERT INTO ScoreTable (user_id, score, lives, time)
        VALUES (:user_id, :score, :lives, :time)
    ");

    $stmt->bindValue(":user_id", $user_id, PDO::PARAM_INT);
    $stmt->bindValue(":score", $score, PDO::PARAM_INT);
    $stmt->bindValue(":lives", $lives, PDO::PARAM_INT);
    $stmt->bindValue(":time", $time, PDO::PARAM_INT);

    $stmt->execute();

    echo json_encode(["status" => "success", "message" => "Score added successfully"]);
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Insert failed"]);
}
?>