
<?php
require_once __DIR__ . "/../../config/hauconnect.php";

header("Content-Type: application/json");

try {
    $stmt = $conn->prepare("
        SELECT 
            p.player_id,
            p.player_name,
            COUNT(c.catch_id) AS total_catches
        FROM monster_catchestbl c
        JOIN playerstbl p ON c.player_id = p.player_id
        GROUP BY p.player_id
        ORDER BY total_catches DESC
        LIMIT 10
    ");

    $stmt->execute();
    $leaders = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "data" => $leaders
    ]);

} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "Failed to load leaderboard",
        "error" => $e->getMessage()
    ]);
}
