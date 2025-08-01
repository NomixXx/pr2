<?php
// Тестовый файл для проверки авторизации
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Простая проверка подключения к БД
try {
    $pdo = new PDO(
        "mysql:host=localhost;dbname=uptaxi_portal;charset=utf8mb4",
        "uptaxi_user",
        "uptaxi_secure_pass_2024",
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
    
    echo json_encode([
        'status' => 'success',
        'message' => 'Database connection OK',
        'timestamp' => date('Y-m-d H:i:s')
    ]);
    
} catch (PDOException $e) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Database connection failed: ' . $e->getMessage(),
        'timestamp' => date('Y-m-d H:i:s')
    ]);
}
?>
