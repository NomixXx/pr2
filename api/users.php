<?php
require_once 'config.php';
session_start();

// Check if user is admin
if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    sendError('Access denied', 403);
}

$method = $_SERVER['REQUEST_METHOD'];
$path = $_SERVER['PATH_INFO'] ?? '';

switch ($method) {
    case 'GET':
        if ($path === '') {
            getUsers();
        } else {
            sendError('Endpoint not found', 404);
        }
        break;
    case 'POST':
        createUser();
        break;
    case 'PUT':
        updateUser();
        break;
    case 'DELETE':
        if (preg_match('/^\/(\d+)$/', $path, $matches)) {
            deleteUser($matches[1]);
        } else {
            sendError('Invalid user ID', 400);
        }
        break;
    default:
        sendError('Method not allowed', 405);
}

function getUsers() {
    $stmt = $GLOBALS['pdo']->query("SELECT id, username, role, access_level FROM users ORDER BY username");
    $users = $stmt->fetchAll();
    sendResponse($users);
}

function createUser() {
    $input = json_decode(file_get_contents('php://input'), true);
    validateRequired($input, ['username', 'password', 'role']);
    
    $accessLevel = $input['role'] === 'admin' ? 10 : ($input['accessLevel'] ?? 1);
    $hashedPassword = password_hash($input['password'], PASSWORD_DEFAULT);
    
    try {
        $stmt = $GLOBALS['pdo']->prepare("INSERT INTO users (username, password, role, access_level) VALUES (?, ?, ?, ?)");
        $stmt->execute([$input['username'], $hashedPassword, $input['role'], $accessLevel]);
        
        sendResponse(['success' => true, 'id' => $GLOBALS['pdo']->lastInsertId()]);
    } catch (PDOException $e) {
        if ($e->getCode() == 23000) {
            sendError('Username already exists');
        } else {
            sendError('Database error: ' . $e->getMessage());
        }
    }
}

function updateUser() {
    $input = json_decode(file_get_contents('php://input'), true);
    validateRequired($input, ['id', 'username', 'password', 'role']);
    
    $accessLevel = $input['role'] === 'admin' ? 10 : ($input['accessLevel'] ?? 1);
    $hashedPassword = password_hash($input['password'], PASSWORD_DEFAULT);
    
    try {
        $stmt = $GLOBALS['pdo']->prepare("UPDATE users SET username = ?, password = ?, role = ?, access_level = ? WHERE id = ?");
        $stmt->execute([$input['username'], $hashedPassword, $input['role'], $accessLevel, $input['id']]);
        
        sendResponse(['success' => true]);
    } catch (PDOException $e) {
        if ($e->getCode() == 23000) {
            sendError('Username already exists');
        } else {
            sendError('Database error: ' . $e->getMessage());
        }
    }
}

function deleteUser($id) {
    $stmt = $GLOBALS['pdo']->prepare("DELETE FROM users WHERE id = ?");
    $stmt->execute([$id]);
    sendResponse(['success' => true]);
}
?>
