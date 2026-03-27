<?php
require_once __DIR__ . "/../../config/hauconnect.php";

header("Content-Type: application/json");

$data = json_decode(file_get_contents("php://input"), true);

if (
    !isset(
        $data['player_id'],
        $data['monster_id'],
        $data['location_id'],
        $data['latitude'],
        $data['longitude']
    )
) {
    echo json_encode([
        "success" => false,
        "message" => "Missing required fields"
    ]);
    exit;
}

try {
    $stmt = $conn->prepare("
        INSERT INTO monster_catchestbl
        (player_id, monster_id, location_id, latitude, longitude)
        VALUES
        (:player_id, :monster_id, :location_id, :latitude, :longitude)
    ");

    $stmt->execute([
        ":player_id" => $data['player_id'],
        ":monster_id" => $data['monster_id'],
        ":location_id" => $data['location_id'],
        ":latitude" => $data['latitude'],
        ":longitude" => $data['longitude']
    ]);

    echo json_encode([
        "success" => true,
        "message" => "Monster caught successfully"
    ]);

} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "Failed to insert catch",
        "error" => $e->getMessage()
    ]);
}
