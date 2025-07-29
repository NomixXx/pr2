<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$path = $_SERVER['PATH_INFO'] ?? '';

switch ($method) {
    case 'POST':
        if ($path === '/login') {
            handleLogin();
        } elseif ($path === '/logout') {
            handleLogout();
        } else {
            sendError('Endpoint not found', 404);
        }
        break;
    default:
        sendError('Method not allowed', 405);
}

function handleLogin() {
    $input = json_decode(file_get_contents('php://input'), true);
    validateRequired($input, ['username', 'password']);
    
    $stmt = $GLOBALS['pdo']->prepare("SELECT * FROM users WHERE username = ?");
    $stmt->execute([$input['username']]);
    $user = $stmt->fetch();
    
    if ($user && password_verify($input['password'], $user['password'])) {
        // Start session
        session_start();
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['role'] = $user['role'];
        $_SESSION['access_level'] = $user['access_level'];
        
        sendResponse([
            'success' => true,
            'user' => [
                'id' => $user['id'],
                'username' => $user['username'],
                'role' => $user['role'],
                'accessLevel' => $user['access_level']
            ]
        ]);
    } else {
        sendError('Invalid credentials', 401);
    }
}

function handleLogout() {
    session_start();
    session_destroy();
    sendResponse(['success' => true]);
}
?>
