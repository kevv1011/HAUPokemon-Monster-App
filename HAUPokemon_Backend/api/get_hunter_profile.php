<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

// Adjust require_once to match your EC2 flat structure
require_once "hauconnect.php";

if (!isset($_GET['username'])) {
    echo json_encode(["success" => false, "message" => "Missing username"]);
    exit;
}

$username = $_GET['username'];

try {
    // 1. Fetch the user details
    $stmt = $conn->prepare("SELECT player_id, player_name, username, profile_url FROM playerstbl WHERE username = :username");
    $stmt->execute([":username" => $username]);
    $player = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$player) {
        // If the user isn't found, you might want it to return empty arrays instead of throwing an error for robust degradation
        echo json_encode(["success" => false, "message" => "Player not found"]);
        exit;
    }

    // 2. Fetch all catches for this player correctly joined with monster info
    $stmt2 = $conn->prepare("
        SELECT c.catch_id, c.monster_id, m.monster_name, m.monster_type, m.picture_url, c.catch_time
        FROM monster_catchestbl c
        JOIN monsterstbl m ON c.monster_id = m.monster_id
        WHERE c.player_id = :player_id
        ORDER BY c.catch_time DESC
    ");
    $stmt2->execute([":player_id" => $player['player_id']]);
    $captures = $stmt2->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "player" => $player,
        "captures" => $captures
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database error", "error" => $e->getMessage()]);
}
?>
