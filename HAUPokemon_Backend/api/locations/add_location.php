<?php
require_once __DIR__ . "/../../config/hauconnect.php";
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        "success" => false,
        "message" => "Only POST method is allowed"
    ]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

$location_name = trim($data['location_name'] ?? '');
$center_latitude = $data['center_latitude'] ?? null;
$center_longitude = $data['center_longitude'] ?? null;
$radius_meters = $data['radius_meters'] ?? null;

if (
    $location_name === '' ||
    $center_latitude === null ||
    $center_longitude === null ||
    $radius_meters === null
) {
    echo json_encode([
        "success" => false,
        "message" => "All fields are required"
    ]);
    exit;
}

try {
    $sql = "INSERT INTO locationstbl
            (location_name, center_latitude, center_longitude, radius_meters)
            VALUES
            (:location_name, :center_latitude, :center_longitude, :radius_meters)";
    $stmt = $conn->prepare($sql);
    $stmt->execute([
        ':location_name' => $location_name,
        ':center_latitude' => $center_latitude,
        ':center_longitude' => $center_longitude,
        ':radius_meters' => $radius_meters
    ]);

    echo json_encode([
        "success" => true,
        "message" => "Location added successfully",
        "location_id" => $conn->lastInsertId()
    ]);
} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "Failed to add location",
        "error" => $e->getMessage()
    ]);
}
?>
