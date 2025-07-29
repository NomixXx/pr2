<?php
require_once 'config.php';
session_start();

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    sendError('Access denied', 403);
}

$method = $_SERVER['REQUEST_METHOD'];
$path = $_SERVER['PATH_INFO'] ?? '';

switch ($method) {
    case 'GET':
        getAccessLevels();
        break;
    case 'POST':
        createAccessLevel();
        break;
    case 'PUT':
        updateAccessLevel();
        break;
    case 'DELETE':
        if (preg_match('/^\/(\d+)$/', $path, $matches)) {
            deleteAccessLevel($matches[1]);
        } else {
            sendError('Invalid access level ID', 400);
        }
        break;
    default:
        sendError('Method not allowed', 405);
}

function getAccessLevels() {
    $stmt = $GLOBALS['pdo']->query("SELECT * FROM access_levels ORDER BY id");
    sendResponse($stmt->fetchAll());
}

function createAccessLevel() {
    $input = json_decode(file_get_contents('php://input'), true);
    validateRequired($input, ['name', 'description']);
    
    // Find next available ID (1-10)
    $stmt = $GLOBALS['pdo']->query("SELECT id FROM access_levels WHERE id BETWEEN 1 AND 10 ORDER BY id");
    $existingIds = array_column($stmt->fetchAll(), 'id');
    
    $nextId = null;
    for ($i = 1; $i <= 10; $i++) {
        if (!in_array($i, $existingIds)) {
            $nextId = $i;
            break;
        }
    }
    
    if ($nextId === null) {
        sendError('Maximum number of access levels (10) reached');
    }
    
    $stmt = $GLOBALS['pdo']->prepare("INSERT INTO access_levels (id, name, description) VALUES (?, ?, ?)");
    $stmt->execute([$nextId, $input['name'], $input['description']]);
    
    sendResponse(['success' => true, 'id' => $nextId]);
}

function updateAccessLevel() {
    $input = json_decode(file_get_contents('php://input'), true);
    validateRequired($input, ['id', 'name', 'description']);
    
    $stmt = $GLOBALS['pdo']->prepare("UPDATE access_levels SET name = ?, description = ? WHERE id = ?");
    $stmt->execute([$input['name'], $input['description'], $input['id']]);
    
    sendResponse(['success' => true]);
}

function deleteAccessLevel($id) {
    $stmt = $GLOBALS['pdo']->prepare("DELETE FROM access_levels WHERE id = ?");
    $stmt->execute([$id]);
    sendResponse(['success' => true]);
}
?>
