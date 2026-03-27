<?php
require_once __DIR__ . "/../../config/hauconnect.php"; // your PDO file

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['player_name'], $data['username'], $data['password'])) {
    echo json_encode([
        "success" => false,
        "message" => "Missing required fields"
    ]);
    exit;
}

$player_name = trim($data['player_name']);
$username = trim($data['username']);
$password = password_hash($data['password'], PASSWORD_BCRYPT);

try {
    $stmt = $conn->prepare("
        INSERT INTO playerstbl (player_name, username, password)
        VALUES (:player_name, :username, :password)
    ");

    $stmt->execute([
        ":player_name" => $player_name,
        ":username" => $username,
        ":password" => $password
    ]);

    echo json_encode([
        "success" => true,
        "message" => "Player registered successfully"
    ]);

} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "Username already exists"
    ]);
}
