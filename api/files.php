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
        if (preg_match('/^\/(.+)\/(.+)$/', $path, $matches)) {
            getFiles($matches[1], $matches[2]);
        } else {
            sendError('Invalid path', 400);
        }
        break;
    case 'POST':
        if ($_SESSION['role'] !== 'admin') {
            sendError('Access denied', 403);
        }
        if ($path === '/upload') {
            uploadFile();
        } else {
            sendError('Endpoint not found', 404);
        }
        break;
    case 'DELETE':
        if ($_SESSION['role'] !== 'admin') {
            sendError('Access denied', 403);
        }
        if (preg_match('/^\/(\d+)$/', $path, $matches)) {
            deleteFile($matches[1]);
        } else {
            sendError('Invalid file ID', 400);
        }
        break;
    default:
        sendError('Method not allowed', 405);
}

function getFiles($sectionId, $subsectionId) {
    $stmt = $GLOBALS['pdo']->prepare("SELECT * FROM files WHERE section_id = ? AND subsection_id = ? ORDER BY created_at DESC");
    $stmt->execute([$sectionId, $subsectionId]);
    sendResponse($stmt->fetchAll());
}

function uploadFile() {
    if (!isset($_FILES['file'])) {
        sendError('No file uploaded');
    }
    
    $file = $_FILES['file'];
    $sectionId = $_POST['sectionId'] ?? '';
    $subsectionId = $_POST['subsectionId'] ?? '';
    
    if (empty($sectionId) || empty($subsectionId)) {
        sendError('Section and subsection are required');
    }
    
    // Validate file size
    if ($file['size'] > MAX_FILE_SIZE) {
        sendError('File too large');
    }
    
    // Validate file extension
    $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    if (!in_array($extension, ALLOWED_EXTENSIONS)) {
        sendError('File type not allowed');
    }
    
    // Generate unique filename
    $filename = uniqid() . '_' . $file['name'];
    $filepath = UPLOAD_DIR . $filename;
    
    if (move_uploaded_file($file['tmp_name'], $filepath)) {
        // Save to database
        $stmt = $GLOBALS['pdo']->prepare("INSERT INTO files (section_id, subsection_id, name, url, type, size) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $sectionId,
            $subsectionId,
            $file['name'],
            '/uploads/' . $filename,
            $file['type'],
            $file['size']
        ]);
        
        sendResponse([
            'success' => true,
            'id' => $GLOBALS['pdo']->lastInsertId(),
            'url' => '/uploads/' . $filename,
            'filename' => $file['name'],
            'size' => $file['size'],
            'type' => $file['type']
        ]);
    } else {
        sendError('Failed to save file');
    }
}

function deleteFile($id) {
    // Get file info first
    $stmt = $GLOBALS['pdo']->prepare("SELECT url FROM files WHERE id = ?");
    $stmt->execute([$id]);
    $file = $stmt->fetch();
    
    if ($file) {
        // Delete from filesystem
        $filepath = '../' . $file['url'];
        if (file_exists($filepath)) {
            unlink($filepath);
        }
        
        // Delete from database
        $stmt = $GLOBALS['pdo']->prepare("DELETE FROM files WHERE id = ?");
        $stmt->execute([$id]);
    }
    
    sendResponse(['success' => true]);
}
?>
