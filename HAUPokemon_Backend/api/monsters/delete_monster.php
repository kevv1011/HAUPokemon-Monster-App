<?php
require_once __DIR__ . "/../../config/hauconnect.php";

$data = json_decode(file_get_contents("php://input"), true);
$monster_id = $data['monster_id'] ?? null;

if (!$monster_id) {
    echo json_encode(["success" => false, "message" => "monster_id is required"]);
    exit;
}

try {
    $sql = "DELETE FROM monsterstbl WHERE monster_id = :monster_id";
    $stmt = $conn->prepare($sql);
    $stmt->execute([
        ':monster_id' => $monster_id
    ]);

    echo json_encode(["success" => true, "message" => "Monster deleted successfully"]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
