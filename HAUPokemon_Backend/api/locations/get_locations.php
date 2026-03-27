get_locations.php
<?php
require_once __DIR__ . "/../../config/hauconnect.php";
header("Content-Type: application/json");

try {
    $sql = "SELECT 
                location_id,
                location_name,
                center_latitude,
                center_longitude,
                radius_meters
            FROM locationstbl
            ORDER BY location_name ASC";

    $stmt = $conn->prepare($sql);
    $stmt->execute();
    $locations = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "locations" => $locations
    ]);
} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "Failed to fetch locations",
        "error" => $e->getMessage()
    ]);
}
?>
