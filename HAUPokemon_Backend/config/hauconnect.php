<?php
header("Content-Type: application/json");

$host = getenv('DB_HOST') ?: "localhost";
$dbname = getenv('DB_NAME') ?: "haupokemon_db";
$username = getenv('DB_USER') ?: "root";
$password = getenv('DB_PASS') ?: "";


try {
    $conn = new PDO(
        "mysql:host=$host;dbname=$dbname;charset=utf8mb4",
        $username,
        $password
        );
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
}
catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "Database connection failed",
        "error" => $e->getMessage()
    ]);
    exit;
}
?>