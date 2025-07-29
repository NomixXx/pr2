-- UpTaxi Portal Database Setup
CREATE DATABASE IF NOT EXISTS uptaxi_portal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE uptaxi_portal;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    access_level INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Access levels table
CREATE TABLE IF NOT EXISTS access_levels (
    id INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Sections table
CREATE TABLE IF NOT EXISTS sections (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(10) NOT NULL,
    access_level INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (access_level) REFERENCES access_levels(id) ON DELETE CASCADE
);

-- Subsections table
CREATE TABLE IF NOT EXISTS subsections (
    id VARCHAR(50) NOT NULL,
    section_id VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    access_level INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id, section_id),
    FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE,
    FOREIGN KEY (access_level) REFERENCES access_levels(id) ON DELETE CASCADE
);

-- Content table
CREATE TABLE IF NOT EXISTS content (
    id INT AUTO_INCREMENT PRIMARY KEY,
    section_id VARCHAR(50) NOT NULL,
    subsection_id VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE
);

-- Google docs table
CREATE TABLE IF NOT EXISTS google_docs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    section_id VARCHAR(50) NOT NULL,
    subsection_id VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE
);

-- Files table
CREATE TABLE IF NOT EXISTS files (
    id INT AUTO_INCREMENT PRIMARY KEY,
    section_id VARCHAR(50) NOT NULL,
    subsection_id VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    type VARCHAR(100),
    size INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE
);

-- Activities table
CREATE TABLE IF NOT EXISTS activities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    icon VARCHAR(10) NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default data
INSERT IGNORE INTO access_levels (id, name, description) VALUES
(1, 'Базовый', 'Базовый уровень доступа'),
(2, 'Расширенный', 'Расширенный уровень доступа'),
(3, 'Полный', 'Полный уровень доступа'),
(10, 'Администратор', 'Полный административный доступ');

INSERT IGNORE INTO users (username, password, role, access_level) VALUES
('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 10),
('user', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 1);

INSERT IGNORE INTO sections (id, name, icon, access_level) VALUES
('section1', 'Раздел 1', '📁', 1),
('section2', 'Раздел 2', '📂', 2),
('section3', 'Раздел 3', '📋', 3);

INSERT IGNORE INTO subsections (id, section_id, name, access_level) VALUES
('subsection1', 'section1', 'Подраздел 1', 1),
('subsection2', 'section1', 'Подраздел 2', 2),
('subsection3', 'section1', 'Подраздел 3', 3),
('subsection1', 'section2', 'Подраздел 1', 2),
('subsection2', 'section2', 'Подраздел 2', 2),
('subsection3', 'section2', 'Подраздел 3', 3),
('subsection1', 'section3', 'Подраздел 1', 3),
('subsection2', 'section3', 'Подраздел 2', 3),
('subsection3', 'section3', 'Подраздел 3', 3);

INSERT IGNORE INTO activities (title, icon, date) VALUES
('Добро пожаловать в систему', '🎉', CURDATE());
