<?php
// Упрощенная авторизация для тестирования
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Получить данные
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    echo json_encode(['error' => 'No input data', 'received' => $_POST]);
    exit;
}

$username = $input['username'] ?? '';
$password = $input['password'] ?? '';

// Простая проверка без БД
$users = [
    'admin' => ['password' => 'admin123', 'role' => 'admin', 'accessLevel' => 10],
    'user' => ['password' => 'user123', 'role' => 'user', 'accessLevel' => 1]
];

if (isset($users[$username]) && $users[$username]['password'] === $password) {
    session_start();
    $_SESSION['user'] = [
        'username' => $username,
        'role' => $users[$username]['role'],
        'accessLevel' => $users[$username]['accessLevel']
    ];
    
    echo json_encode([
        'success' => true,
        'user' => [
            'username' => $username,
            'role' => $users[$username]['role'],
            'accessLevel' => $users[$username]['accessLevel']
        ]
    ]);
} else {
    echo json_encode([
        'success' => false,
        'error' => 'Invalid credentials',
        'debug' => [
            'username' => $username,
            'password_length' => strlen($password),
            'available_users' => array_keys($users)
        ]
    ]);
}
?>
