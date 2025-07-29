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
        if ($path === '') {
            getSections();
        } else {
            sendError('Endpoint not found', 404);
        }
        break;
    case 'POST':
        if ($_SESSION['role'] !== 'admin') {
            sendError('Access denied', 403);
        }
        createSection();
        break;
    case 'PUT':
        if ($_SESSION['role'] !== 'admin') {
            sendError('Access denied', 403);
        }
        updateSection();
        break;
    case 'DELETE':
        if ($_SESSION['role'] !== 'admin') {
            sendError('Access denied', 403);
        }
        if (preg_match('/^\/(.+)$/', $path, $matches)) {
            deleteSection($matches[1]);
        } else {
            sendError('Invalid section ID', 400);
        }
        break;
    default:
        sendError('Method not allowed', 405);
}

function getSections() {
    $userAccessLevel = $_SESSION['access_level'];
    $isAdmin = $_SESSION['role'] === 'admin';
    
    if ($isAdmin) {
        $stmt = $GLOBALS['pdo']->query("SELECT * FROM sections ORDER BY name");
    } else {
        $stmt = $GLOBALS['pdo']->prepare("SELECT * FROM sections WHERE access_level = ? ORDER BY name");
        $stmt->execute([$userAccessLevel]);
    }
    
    $sections = $stmt->fetchAll();
    
    // Get subsections for each section
    foreach ($sections as &$section) {
        if ($isAdmin) {
            $substmt = $GLOBALS['pdo']->prepare("SELECT * FROM subsections WHERE section_id = ? ORDER BY name");
            $substmt->execute([$section['id']]);
        } else {
            $substmt = $GLOBALS['pdo']->prepare("SELECT * FROM subsections WHERE section_id = ? AND access_level = ? ORDER BY name");
            $substmt->execute([$section['id'], $userAccessLevel]);
        }
        $section['subsections'] = $substmt->fetchAll();
    }
    
    sendResponse($sections);
}

function createSection() {
    $input = json_decode(file_get_contents('php://input'), true);
    validateRequired($input, ['name', 'icon', 'accessLevel']);
    
    $sectionId = 'section' . time();
    
    try {
        $GLOBALS['pdo']->beginTransaction();
        
        // Create section
        $stmt = $GLOBALS['pdo']->prepare("INSERT INTO sections (id, name, icon, access_level) VALUES (?, ?, ?, ?)");
        $stmt->execute([$sectionId, $input['name'], $input['icon'], $input['accessLevel']]);
        
        // Create default subsections
        $substmt = $GLOBALS['pdo']->prepare("INSERT INTO subsections (id, section_id, name, access_level) VALUES (?, ?, ?, ?)");
        for ($i = 1; $i <= 3; $i++) {
            $substmt->execute(["subsection$i", $sectionId, "Подраздел $i", $input['accessLevel']]);
        }
        
        $GLOBALS['pdo']->commit();
        sendResponse(['success' => true, 'id' => $sectionId]);
    } catch (PDOException $e) {
        $GLOBALS['pdo']->rollBack();
        sendError('Database error: ' . $e->getMessage());
    }
}

function updateSection() {
    $input = json_decode(file_get_contents('php://input'), true);
    validateRequired($input, ['id', 'name', 'icon', 'accessLevel', 'subsections']);
    
    try {
        $GLOBALS['pdo']->beginTransaction();
        
        // Update section
        $stmt = $GLOBALS['pdo']->prepare("UPDATE sections SET name = ?, icon = ?, access_level = ? WHERE id = ?");
        $stmt->execute([$input['name'], $input['icon'], $input['accessLevel'], $input['id']]);
        
        // Delete existing subsections
        $delstmt = $GLOBALS['pdo']->prepare("DELETE FROM subsections WHERE section_id = ?");
        $delstmt->execute([$input['id']]);
        
        // Insert new subsections
        $substmt = $GLOBALS['pdo']->prepare("INSERT INTO subsections (id, section_id, name, access_level) VALUES (?, ?, ?, ?)");
        foreach ($input['subsections'] as $subsection) {
            $substmt->execute([$subsection['id'], $input['id'], $subsection['name'], $subsection['accessLevel']]);
        }
        
        $GLOBALS['pdo']->commit();
        sendResponse(['success' => true]);
    } catch (PDOException $e) {
        $GLOBALS['pdo']->rollBack();
        sendError('Database error: ' . $e->getMessage());
    }
}

function deleteSection($id) {
    $stmt = $GLOBALS['pdo']->prepare("DELETE FROM sections WHERE id = ?");
    $stmt->execute([$id]);
    sendResponse(['success' => true]);
}
?>
