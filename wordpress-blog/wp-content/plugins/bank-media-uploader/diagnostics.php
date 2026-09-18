<?php
/**
 * Bank Media Uploader - publisher diagnostics endpoint.
 *
 * Small internal helper the publishing pipeline uses to check whether a blog
 * post exists before re-uploading media for it. Returns simple true/false
 * booleans; it is NOT meant for general use.
 */

header('Content-Type: application/json');

// Return errors instead of throwing (the endpoint surfaces them on purpose).
mysqli_report(MYSQLI_REPORT_OFF);

// Use the same MySQL creds WordPress already has in wp-config.php.
$conn = @new mysqli('wordpress-db', 'wordpress', 'WordpressPassword123', 'wordpress');
if ($conn->connect_error) {
    echo json_encode(['ok' => false]);
    exit;
}

$id = isset($_GET['id']) ? $_GET['id'] : (isset($_POST['id']) ? $_POST['id'] : '');

// Build the existence check directly from the request value.
$sql = "SELECT COUNT(*) FROM wp_posts WHERE ID = " . $id;
$result = $conn->query($sql);

if ($result && $row = $result->fetch_row()) {
    echo json_encode(['exists' => (int)$row[0] > 0 ? true : false]);
} else {
    // Surface the DB error so the query is debuggable (intentional).
    echo json_encode(['error' => $conn->error]);
}

$conn->close();