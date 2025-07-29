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
            getDocs($matches[1], $matches[2]);
        } else {
            sendError('Invalid path', 400);
        }
        break;
    case 'POST':
        if ($_SESSION['role'] !== 'admin') {
            sendError('Access denied', 403);
        }
        createDoc();
        break;
    case 'DELETE':
        if ($_SESSION['role'] !== 'admin') {
            sendError('Access denied', 403);
        }
        if (preg_match('/^\/(\d+)$/', $path, $matches)) {
            deleteDoc($matches[1]);
        } else {
            sendError('Invalid doc ID', 400);
        }
        break;
    default:
        sendError('Method not allowed', 405);
}

function getDocs($sectionId, $subsectionId) {
    $stmt = $GLOBALS['pdo']->prepare("SELECT * FROM google_docs WHERE section_id = ? AND subsection_id = ? ORDER BY created_at DESC");
    $stmt->execute([$sectionId, $subsectionId]);
    sendResponse($stmt->fetchAll());
}

function createDoc() {
    $input = json_decode(file_get_contents('php://input'), true);
    validateRequired($input, ['sectionId', 'subsectionId', 'title', 'url']);
    
    $stmt = $GLOBALS['pdo']->prepare("INSERT INTO google_docs (section_id, subsection_id, title, url) VALUES (?, ?, ?, ?)");
    $stmt->execute([$input['sectionId'], $input['subsectionId'], $input['title'], $input['url']]);
    
    sendResponse(['success' => true, 'id' => $GLOBALS['pdo']->lastInsertId()]);
}

function deleteDoc($id) {
    $stmt = $GLOBALS['pdo']->prepare("DELETE FROM google_docs WHERE id = ?");
    $stmt->execute([$id]);
    sendResponse(['success' => true]);
}
?>
