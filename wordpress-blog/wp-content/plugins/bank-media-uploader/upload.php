<?php
/**
 * Bank Media Uploader - direct upload endpoint.
 *
 * Internal tool for the marketing team's automated publishing pipeline so
 * blog images can be pushed without going through the WordPress dashboard.
 * Reachable directly (no WordPress bootstrap / login needed) - just present
 * the API key below.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * Example upload request
 * ─────────────────────────────────────────────────────────────────────────
 *
 *   POST /blog/wp-content/plugins/bank-media-uploader/upload.php HTTP/1.1
 *   Host: localhost
 *   Content-Type: multipart/form-data; boundary=----WebKitFormBoundaryABC123
 *   X-API-Key: ib_2026_9f3a7c1e2b4d6f8091a2b3c4d5e6f708
 *
 *   ------WebKitFormBoundaryABC123
 *   Content-Disposition: form-data; name="file"; filename="hero.png"
 *   Content-Type: image/png
 *
 *   <image bytes>
 *   ------WebKitFormBoundaryABC123--
 *
 * Response on success:
 *   {"success":true,"url":"/wp-content/plugins/bank-media-uploader/uploads/hero.png"}
 *
 * The REST endpoint accepts the same multipart field:
 *   POST /blog/wp-json/bank-upload/v1/upload
 *   (multipart field "file", header "X-API-Key: <same key>")
 * ─────────────────────────────────────────────────────────────────────────
 */

define('BANKUPLOAD_API_KEY', 'ib_2026_9f3a7c1e2b4d6f8091a2b3c4d5e6f708');

function bankupload_get_key() {
    if (!empty($_SERVER['HTTP_X_API_KEY'])) {
        return $_SERVER['HTTP_X_API_KEY'];
    }
    if (!empty($_GET['key'])) {
        return $_GET['key'];
    }
    return '';
}

header('Content-Type: application/json');

if (!hash_equals(BANKUPLOAD_API_KEY, (string) bankupload_get_key())) {
    http_response_code(401);
    echo json_encode(['error' => 'invalid or missing API key']);
    exit;
}

if (empty($_FILES['file'])) {
    http_response_code(400);
    echo json_encode(['error' => 'no file uploaded, expected multipart field "file"']);
    exit;
}

$file = $_FILES['file'];

// Only checks the client-supplied MIME type header - not the actual file
// contents - so a PHP file sent with an image content-type sails through.
$allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
if (!in_array($file['type'], $allowedTypes, true)) {
    http_response_code(400);
    echo json_encode(['error' => 'invalid content-type, only images allowed']);
    exit;
}

$uploadDir = __DIR__ . '/uploads/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

// Keeps the client-supplied file name (and therefore extension) as-is.
$destName = basename($file['name']);
$destPath = $uploadDir . $destName;

if (move_uploaded_file($file['tmp_name'], $destPath)) {
    echo json_encode([
        'success' => true,
        'url' => '/wp-content/plugins/bank-media-uploader/uploads/' . $destName,
    ]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'failed to save file']);
}
