<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . "/../../config/hauconnect.php";

$data = json_decode(file_get_contents("php://input"), true);
$monster_id = $data['monster_id'] ?? null;

if (!$monster_id) {
    echo json_encode(["success" => false, "message" => "monster_id is required"]);
    exit;
}

try {
    // First, clear any captured instances to prevent foreign key constraint violations
    $sql1 = "DELETE FROM monster_catchestbl WHERE monster_id = :monster_id";
    $stmt1 = $conn->prepare($sql1);
    $stmt1->execute([':monster_id' => $monster_id]);

    $sql2 = "DELETE FROM monsterstbl WHERE monster_id = :monster_id";
    $stmt2 = $conn->prepare($sql2);
    $stmt2->execute([
        ':monster_id' => $monster_id
    ]);

    echo json_encode(["success" => true, "message" => "Monster deleted successfully"]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
