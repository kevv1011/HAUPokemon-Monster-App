<?php
require_once __DIR__ . "/../../config/hauconnect.php";

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['username'], $data['password'])) {
    echo json_encode([
        "success" => false,
        "message" => "Missing credentials"
    ]);
    exit;
}

$username = trim($data['username']);
$password = $data['password'];

$stmt = $conn->prepare("
    SELECT player_id, player_name, username, password
    FROM playerstbl
    WHERE username = :username
");

$stmt->execute([":username" => $username]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if ($user && password_verify($password, $user['password'])) {

    unset($user['password']);

    echo json_encode([
        "success" => true,
        "message" => "Login successful",
        "data" => $user
    ]);

} else {
    echo json_encode([
        "success" => false,
        "message" => "Invalid username or password"
    ]);
}
