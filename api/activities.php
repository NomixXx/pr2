<?php
require_once 'config.php';
session_start();

if (!isset($_SESSION['user_id'])) {
    sendError('Not authenticated', 401);
}

$method = $_SERVER['REQUEST_METHOD'];
$path = $_SERVER['PATH_INFO'] ?? '';

switch ($method) {
    case 'GET':
        getActivities();
        break;
    case 'POST':
        if ($_SESSION['role'] !== 'admin') {
            sendError('Access denied', 403);
        }
        createActivity();
        break;
    case 'DELETE':
        if ($_SESSION['role'] !== 'admin') {
            sendError('Access denied', 403);
        }
        if (preg_match('/^\/(\d+)$/', $path, $matches)) {
            deleteActivity($matches[1]);
        } else {
            sendError('Invalid activity ID', 400);
        }
        break;
    default:
        sendError('Method not allowed', 405);
}

function getActivities() {
    $stmt = $GLOBALS['pdo']->query("SELECT * FROM activities ORDER BY created_at DESC LIMIT 10");
    sendResponse($stmt->fetchAll());
}

function createActivity() {
    $input = json_decode(file_get_contents('php://input'), true);
    validateRequired($input, ['title', 'icon']);
    
    $stmt = $GLOBALS['pdo']->prepare("INSERT INTO activities (title, icon, date) VALUES (?, ?, CURDATE())");
    $stmt->execute([$input['title'], $input['icon']]);
    
    sendResponse(['success' => true, 'id' => $GLOBALS['pdo']->lastInsertId()]);
}

function deleteActivity($id) {
    $stmt = $GLOBALS['pdo']->prepare("DELETE FROM activities WHERE id = ?");
    $stmt->execute([$id]);
    sendResponse(['success' => true]);
}
?>
