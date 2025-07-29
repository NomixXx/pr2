<?php
// Database configuration
define('DB_HOST', 'localhost');
define('DB_NAME', 'uptaxi_portal');
define('DB_USER', 'uptaxi_user');
define('DB_PASS', 'your_secure_password_here');

// Application configuration
define('UPLOAD_DIR', '../uploads/');
define('MAX_FILE_SIZE', 50 * 1024 * 1024); // 50MB
define('ALLOWED_EXTENSIONS', ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'zip', 'rar']);

// Create uploads directory if it doesn't exist
if (!file_exists(UPLOAD_DIR)) {
    mkdir(UPLOAD_DIR, 0755, true);
}

// Database connection
try {
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
        DB_USER,
        DB_PASS,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false
        ]
    );
} catch (PDOException $e) {
    http_response_code(500);
    die(json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]));
}

// CORS headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Helper functions
function sendResponse($data, $status = 200) {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit();
}

function sendError($message, $status = 400) {
    sendResponse(['error' => $message], $status);
}

function validateRequired($data, $fields) {
    foreach ($fields as $field) {
        if (!isset($data[$field]) || empty(trim($data[$field]))) {
            sendError("Field '$field' is required");
        }
    }
}
?>
