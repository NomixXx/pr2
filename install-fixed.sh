#!/bin/bash

# UpTaxi Portal Installation Script for Ubuntu 24.04.2 LTS - FIXED VERSION

echo "=== UpTaxi Portal Installation (Fixed) ==="
echo "Installing on Ubuntu 24.04.2 LTS..."

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   echo "This script should not be run as root directly. Use sudo for individual commands."
   exit 1
fi

# Update system
echo "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install required packages
echo "Installing Apache, MySQL, PHP and required extensions..."
sudo apt install -y apache2 mysql-server php php-mysql php-mbstring php-xml php-curl php-gd php-zip unzip

# Enable Apache modules
echo "Enabling Apache modules..."
sudo a2enmod rewrite
sudo a2enmod headers

# Start and enable services
echo "Starting and enabling services..."
sudo systemctl start apache2
sudo systemctl enable apache2

# Fix MySQL installation and start service
echo "Configuring MySQL..."
sudo systemctl stop mysql
sudo systemctl start mysql
sudo systemctl enable mysql

# Wait for MySQL to start
echo "Waiting for MySQL to start..."
sleep 5

# Check if MySQL is running
if ! sudo systemctl is-active --quiet mysql; then
    echo "MySQL failed to start. Trying to fix..."
    sudo mysql_install_db --user=mysql --basedir=/usr --datadir=/var/lib/mysql
    sudo systemctl start mysql
    sleep 5
fi

# Secure MySQL installation (automated)
echo "Securing MySQL installation..."
sudo mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'root_password_123';" 2>/dev/null || true
sudo mysql -u root -proot_password_123 -e "DELETE FROM mysql.user WHERE User='';" 2>/dev/null || true
sudo mysql -u root -proot_password_123 -e "DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1');" 2>/dev/null || true
sudo mysql -u root -proot_password_123 -e "DROP DATABASE IF EXISTS test;" 2>/dev/null || true
sudo mysql -u root -proot_password_123 -e "DELETE FROM mysql.db WHERE Db='test' OR Db='test\\_%';" 2>/dev/null || true
sudo mysql -u root -proot_password_123 -e "FLUSH PRIVILEGES;" 2>/dev/null || true

# Create database and user
echo "Setting up database..."
sudo mysql -u root -proot_password_123 -e "CREATE DATABASE IF NOT EXISTS uptaxi_portal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
sudo mysql -u root -proot_password_123 -e "CREATE USER IF NOT EXISTS 'uptaxi_user'@'localhost' IDENTIFIED BY 'uptaxi_secure_pass_2024';"
sudo mysql -u root -proot_password_123 -e "GRANT ALL PRIVILEGES ON uptaxi_portal.* TO 'uptaxi_user'@'localhost';"
sudo mysql -u root -proot_password_123 -e "FLUSH PRIVILEGES;"

# Backup existing files if they exist
echo "Backing up existing files..."
if [ -d "/var/www/html" ] && [ "$(ls -A /var/www/html)" ]; then
    sudo mkdir -p /var/www/html_backup_$(date +%Y%m%d_%H%M%S)
    sudo cp -r /var/www/html/* /var/www/html_backup_$(date +%Y%m%d_%H%M%S)/ 2>/dev/null || true
fi

# Create web directory structure
echo "Setting up web directory..."
sudo mkdir -p /var/www/html
sudo mkdir -p /var/www/html/api
sudo mkdir -p /var/www/html/js
sudo mkdir -p /var/www/html/database
sudo mkdir -p /var/www/html/public
sudo mkdir -p /var/www/html/uploads

# Copy files (assuming they are in current directory)
echo "Copying application files..."
if [ -f "index.html" ]; then
    sudo cp index.html /var/www/html/
fi
if [ -f "menu.html" ]; then
    sudo cp menu.html /var/www/html/
fi
if [ -f "admin.html" ]; then
    sudo cp admin.html /var/www/html/
fi
if [ -f "styles.css" ]; then
    sudo cp styles.css /var/www/html/
fi
if [ -f "menu.css" ]; then
    sudo cp menu.css /var/www/html/
fi
if [ -f "admin.css" ]; then
    sudo cp admin.css /var/www/html/
fi

# Copy API files
if [ -d "api" ]; then
    sudo cp -r api/* /var/www/html/api/
fi

# Copy JS files
if [ -d "js" ]; then
    sudo cp -r js/* /var/www/html/js/
fi

# Copy database files
if [ -d "database" ]; then
    sudo cp -r database/* /var/www/html/database/
fi

# Copy public files
if [ -d "public" ]; then
    sudo cp -r public/* /var/www/html/public/
fi

# Set permissions
echo "Setting permissions..."
sudo chown -R www-data:www-data /var/www/html
sudo chmod -R 755 /var/www/html
sudo chmod -R 777 /var/www/html/uploads

# Import database schema
echo "Importing database schema..."
if [ -f "/var/www/html/database/setup.sql" ]; then
    sudo mysql -u root -proot_password_123 uptaxi_portal < /var/www/html/database/setup.sql
else
    echo "Warning: database/setup.sql not found. Creating basic structure..."
    sudo mysql -u root -proot_password_123 uptaxi_portal << 'EOF'
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    access_level INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT IGNORE INTO users (username, password, role, access_level) VALUES
('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 10),
('user', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 1);
EOF
fi

# Configure Apache
echo "Configuring Apache..."
sudo tee /etc/apache2/sites-available/uptaxi.conf > /dev/null <<EOF
<VirtualHost *:80>
    ServerName localhost
    DocumentRoot /var/www/html
    
    <Directory /var/www/html>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
    
    <Directory /var/www/html/api>
        Options -Indexes
        AllowOverride All
        Require all granted
    </Directory>
    
    <Directory /var/www/html/uploads>
        Options -Indexes
        AllowOverride None
        Require all granted
    </Directory>
    
    ErrorLog \${APACHE_LOG_DIR}/uptaxi_error.log
    CustomLog \${APACHE_LOG_DIR}/uptaxi_access.log combined
</VirtualHost>
EOF

# Enable site
sudo a2ensite uptaxi.conf
sudo a2dissite 000-default.conf 2>/dev/null || true
sudo systemctl reload apache2

# Set PHP configuration
echo "Configuring PHP..."
PHP_VERSION=$(php -v | head -n1 | cut -d' ' -f2 | cut -d'.' -f1,2)
PHP_INI="/etc/php/${PHP_VERSION}/apache2/php.ini"

if [ -f "$PHP_INI" ]; then
    sudo sed -i 's/upload_max_filesize = 2M/upload_max_filesize = 50M/' "$PHP_INI"
    sudo sed -i 's/post_max_size = 8M/post_max_size = 50M/' "$PHP_INI"
    sudo sed -i 's/max_execution_time = 30/max_execution_time = 300/' "$PHP_INI"
    sudo systemctl restart apache2
fi

# Create .htaccess files
echo "Creating .htaccess files..."
sudo tee /var/www/html/.htaccess > /dev/null <<EOF
RewriteEngine On

# API routing
RewriteRule ^api/(.*)$ api/\$1 [L]

# Security headers
Header always set X-Content-Type-Options nosniff
Header always set X-Frame-Options DENY
Header always set X-XSS-Protection "1; mode=block"

# Cache static files
<FilesMatch "\.(css|js|png|jpg|jpeg|gif|ico|svg)$">
    ExpiresActive On
    ExpiresDefault "access plus 1 month"
</FilesMatch>
EOF

sudo tee /var/www/html/api/.htaccess > /dev/null <<EOF
RewriteEngine On

# Route API requests to PHP files
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ \$1.php [L]

# Security
Options -Indexes
EOF

# Update config.php with correct database credentials
echo "Updating database configuration..."
if [ -f "/var/www/html/api/config.php" ]; then
    sudo sed -i "s/your_secure_password_here/uptaxi_secure_pass_2024/" /var/www/html/api/config.php
fi

# Test MySQL connection
echo "Testing database connection..."
mysql -u uptaxi_user -puptaxi_secure_pass_2024 -e "USE uptaxi_portal; SHOW TABLES;" 2>/dev/null && echo "Database connection successful!" || echo "Warning: Database connection failed"

# Final permissions check
sudo chown -R www-data:www-data /var/www/html
sudo chmod -R 755 /var/www/html
sudo chmod -R 777 /var/www/html/uploads

echo "=== Installation Complete ==="
echo "Your UpTaxi Portal is now installed!"
echo ""
echo "Access your portal at: http://$(hostname -I | awk '{print $1}')/"
echo "Or: http://localhost/"
echo ""
echo "Default login credentials:"
echo "Admin: admin / admin123"
echo "User: user / user123"
echo ""
echo "Database credentials:"
echo "Database: uptaxi_portal"
echo "User: uptaxi_user"
echo "Password: uptaxi_secure_pass_2024"
echo "MySQL root password: root_password_123"
echo ""
echo "Important files:"
echo "- Web root: /var/www/html/"
echo "- Config: /var/www/html/api/config.php"
echo "- Uploads: /var/www/html/uploads/"
echo "- Logs: /var/log/apache2/uptaxi_*.log"
echo ""
echo "IMPORTANT: Change default passwords after first login!"
