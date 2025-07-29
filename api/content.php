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
            getContent($matches[1], $matches[2]);
        } else {
            sendError('Invalid path', 400);
        }
        break;
    case 'POST':
        if ($_SESSION['role'] !== 'admin') {
            sendError('Access denied', 403);
        }
        createContent();
        break;
    case 'PUT':
        if ($_SESSION['role'] !== 'admin') {
            sendError('Access denied', 403);
        }
        updateContent();
        break;
    case 'DELETE':
        if ($_SESSION['role'] !== 'admin') {
            sendError('Access denied', 403);
        }
        if (preg_match('/^\/(\d+)$/', $path, $matches)) {
            deleteContent($matches[1]);
        } else {
            sendError('Invalid content ID', 400);
        }
        break;
    default:
        sendError('Method not allowed', 405);
}

function getContent($sectionId, $subsectionId) {
    $response = [];
    
    // Get text content
    $stmt = $GLOBALS['pdo']->prepare("SELECT * FROM content WHERE section_id = ? AND subsection_id = ? ORDER BY created_at DESC");
    $stmt->execute([$sectionId, $subsectionId]);
    $response['content'] = $stmt->fetchAll();
    
    // Get Google docs
    $stmt = $GLOBALS['pdo']->prepare("SELECT * FROM google_docs WHERE section_id = ? AND subsection_id = ? ORDER BY created_at DESC");
    $stmt->execute([$sectionId, $subsectionId]);
    $response['googleDocs'] = $stmt->fetchAll();
    
    // Get files
    $stmt = $GLOBALS['pdo']->prepare("SELECT * FROM files WHERE section_id = ? AND subsection_id = ? ORDER BY created_at DESC");
    $stmt->execute([$sectionId, $subsectionId]);
    $response['files'] = $stmt->fetchAll();
    
    sendResponse($response);
}

function createContent() {
    $input = json_decode(file_get_contents('php://input'), true);
    validateRequired($input, ['sectionId', 'subsectionId', 'title', 'description']);
    
    $stmt = $GLOBALS['pdo']->prepare("INSERT INTO content (section_id, subsection_id, title, description) VALUES (?, ?, ?, ?)");
    $stmt->execute([$input['sectionId'], $input['subsectionId'], $input['title'], $input['description']]);
    
    sendResponse(['success' => true, 'id' => $GLOBALS['pdo']->lastInsertId()]);
}

function updateContent() {
    $input = json_decode(file_get_contents('php://input'), true);
    validateRequired($input, ['id', 'title', 'description']);
    
    $stmt = $GLOBALS['pdo']->prepare("UPDATE content SET title = ?, description = ? WHERE id = ?");
    $stmt->execute([$input['title'], $input['description'], $input['id']]);
    
    sendResponse(['success' => true]);
}

function deleteContent($id) {
    $stmt = $GLOBALS['pdo']->prepare("DELETE FROM content WHERE id = ?");
    $stmt->execute([$id]);
    sendResponse(['success' => true]);
}
?>
