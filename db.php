<?php
$host = "localhost";
// Default XAMPP/WAMP credentials
$username = "root";
$password = "";
$dbname = "typing_speed_db";

try {
    $conn = new PDO("mysql:host=$host", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Automatically create the database if it doesn't exist
    $conn->exec("CREATE DATABASE IF NOT EXISTS `$dbname`");
    $conn->exec("USE `$dbname`");

    // Automatically create the scores table if it doesn't exist
    $sql = "CREATE TABLE IF NOT EXISTS scores (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL,
        wpm INT NOT NULL,
        accuracy INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";
    $conn->exec($sql);
    
} catch(PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Database Connection failed: " . $e->getMessage()]);
    exit();
}
?>
