<?php
/**
 * Simple PHP Proxy for Datadog Events API v2
 * 
 * Usage:
 * POST /event-proxy.php?url=<datadog_api_url>
 * Headers: DD-API-KEY, DD-APPLICATION-KEY, Content-Type
 * Body: JSON payload
 */

// CORS Headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, DD-API-KEY, DD-APPLICATION-KEY");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Get the target URL from query parameter
$target_url = $_GET['url'] ?? '';

if (empty($target_url)) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing "url" query parameter']);
    exit;
}

// Validate URL (basic security to prevent open proxy abuse, restrict to Datadog domains)
$parsed_url = parse_url($target_url);
if (!isset($parsed_url['host']) || !preg_match('/\.datadoghq\.(com|eu)$|\.ddog-gov\.com$/', $parsed_url['host'])) {
    http_response_code(403);
    echo json_encode(['error' => 'Invalid target domain. Only Datadog domains are allowed.']);
    exit;
}

// Get request headers
$headers = getallheaders();
$forward_headers = [];

// Forward specific headers
$allowed_headers = ['Content-Type', 'DD-API-KEY', 'DD-APPLICATION-KEY'];
foreach ($headers as $key => $value) {
    // Case-insensitive check
    $key_upper = strtoupper($key);
    if (in_array($key, $allowed_headers) || in_array($key_upper, $allowed_headers)) {
        $forward_headers[] = "$key: $value";
    }
}

// Get request body
$body = file_get_contents('php://input');

// Initialize cURL
$ch = curl_init($target_url);

curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, $forward_headers);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $_SERVER['REQUEST_METHOD']);

if (!empty($body)) {
    curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
}

// Execute request
$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curl_error = curl_error($ch);

curl_close($ch);

// Handle cURL errors
if ($response === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Proxy error: ' . $curl_error]);
    exit;
}

// Return response
http_response_code($http_code);
header('Content-Type: application/json');
echo $response;
