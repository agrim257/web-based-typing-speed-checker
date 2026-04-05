<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once 'db.php';

$data = json_decode(file_get_contents("php://input"));

if(isset($data->username) && isset($data->wpm) && isset($data->accuracy)) {
    try {
        $query = "INSERT INTO scores (username, wpm, accuracy) VALUES (:username, :wpm, :accuracy)";
        $stmt = $conn->prepare($query);

        // Sanitize input
        $username = htmlspecialchars(strip_tags($data->username));
        $wpm = htmlspecialchars(strip_tags($data->wpm));
        $accuracy = htmlspecialchars(strip_tags($data->accuracy));

        // Bind parameters
        $stmt->bindParam(':username', $username);
        $stmt->bindParam(':wpm', $wpm);
        $stmt->bindParam(':accuracy', $accuracy);

        if($stmt->execute()) {
            http_response_code(201);
            echo json_encode(array("status" => "success", "message" => "Score saved successfully."));
        } else {
            http_response_code(503);
            echo json_encode(array("status" => "error", "message" => "Unable to save score."));
        }
    } catch (Exception $e) {
         http_response_code(500);
         echo json_encode(array("status" => "error", "message" => $e->getMessage()));
    }
} else {
    http_response_code(400);
    echo json_encode(array("status" => "error", "message" => "Incomplete data. Username, WPM, and accuracy are required."));
}
?>
