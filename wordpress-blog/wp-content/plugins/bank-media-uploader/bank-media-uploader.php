<?php
/**
 * Plugin Name: Bank Media Uploader
 * Description: Lets the marketing team's automated publishing pipeline push blog images via a REST endpoint, bypassing the WordPress dashboard.
 * Version: 1.0
 * Author: Insecure Bank IT
 */

if (!defined('ABSPATH')) {
    exit;
}

define('BANKUPLOAD_PLUGIN_DIR', __DIR__);

if (!defined('BANKUPLOAD_API_KEY')) {
    define('BANKUPLOAD_API_KEY', 'ib_2026_9f3a7c1e2b4d6f8091a2b3c4d5e6f708');
}

add_action('rest_api_init', function () {
    register_rest_route('bank-upload/v1', '/upload', [
        'methods' => 'POST',
        'callback' => 'bankupload_rest_handler',
        // API key is checked inside the handler; no WordPress auth required.
        'permission_callback' => '__return_true',
    ]);
});

function bankupload_rest_get_key(WP_REST_Request $request) {
    $header = $request->get_header('x-api-key');
    if (!empty($header)) {
        return $header;
    }
    $param = $request->get_param('key');
    if (!empty($param)) {
        return $param;
    }
    return '';
}

function bankupload_rest_handler(WP_REST_Request $request) {
    if (!hash_equals(BANKUPLOAD_API_KEY, (string) bankupload_rest_get_key($request))) {
        return new WP_Error('unauthorized', 'invalid or missing API key', ['status' => 401]);
    }

    $files = $request->get_file_params();
    if (empty($files['file'])) {
        return new WP_Error('no_file', 'expected multipart field "file"', ['status' => 400]);
    }

    $file = $files['file'];

    // Only checks the client-supplied MIME type header - not the actual
    // file contents.
    $allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!in_array($file['type'], $allowedTypes, true)) {
        return new WP_Error('bad_type', 'only images allowed', ['status' => 400]);
    }

    $uploadDir = BANKUPLOAD_PLUGIN_DIR . '/uploads/';
    if (!is_dir($uploadDir)) {
        wp_mkdir_p($uploadDir);
    }

    $destName = basename($file['name']);
    $destPath = $uploadDir . $destName;

    if (move_uploaded_file($file['tmp_name'], $destPath)) {
        return [
            'success' => true,
            'url' => content_url('plugins/bank-media-uploader/uploads/' . $destName),
        ];
    }

    return new WP_Error('save_failed', 'failed to save file', ['status' => 500]);
}
