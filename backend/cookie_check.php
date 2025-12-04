<?php
header("Content-Type: application/json; charset=UTF-8");
$env = parse_ini_file(__DIR__ . '/../.env');
$jwt_secret = $env['jwt_secret'];

//Check if token exists
if (!isset($_COOKIE['token'])) {
    echo json_encode(["error" => "No token"]);
    exit;
}

$token = $_COOKIE['token'];
list($header, $payload, $signature) = explode('.', $token);

$expected_signature = base64_encode(
    hash_hmac('sha512', "$header.$payload", $jwt_secret, true)
);

function base64UrlDecode($input) {
    return base64_decode(strtr($input, '-_', '+/')); // Fix padding/base64 differences
}

if (!hash_equals(base64UrlDecode($signature), base64UrlDecode($expected_signature))) {
    echo json_encode(["error" => "Invalid signature"]);
    exit;
}

$decoded = json_decode(base64UrlDecode($payload), true);

if ($decoded['exp'] < time()) {
    echo json_encode(["error" => "Token expired"]);
    exit;
}

echo json_encode([
    "success" => true,
    "user" => $decoded['username'],
    "id" => $decoded['sub']
]);
?>