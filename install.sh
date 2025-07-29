#!/bin/bash

# UpTaxi Portal Installation Script for Ubuntu 24.04.2 LTS

echo "=== UpTaxi Portal Installation ==="
echo "Installing on Ubuntu 24.04.2 LTS..."

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
echo "Starting services..."
sudo systemctl start apache2
sudo systemctl enable apache2
sudo systemctl start mysql
sudo systemctl enable mysql

# Create database user
echo "Setting up database..."
sudo mysql -e "CREATE DATABASE IF NOT EXISTS uptaxi_portal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
sudo mysql -e "CREATE USER IF NOT EXISTS 'uptaxi_user'@'localhost' IDENTIFIED BY 'your_secure_password_here';"
sudo mysql -e "GRANT ALL PRIVILEGES ON uptaxi_portal.* TO 'uptaxi_user'@'localhost';"
sudo mysql -e "FLUSH PRIVILEGES;"

# Import database schema
echo "Importing database schema..."
sudo mysql uptaxi_portal < database/setup.sql

# Set up web directory
echo "Setting up web directory..."
sudo rm -rf /var/www/html/*
sudo cp -r * /var/www/html/
sudo chown -R www-data:www-data /var/www/html
sudo chmod -R 755 /var/www/html

# Create uploads directory
echo "Creating uploads directory..."
sudo mkdir -p /var/www/html/uploads
sudo chown -R www-data:www-data /var/www/html/uploads
sudo chmod -R 755 /var/www/html/uploads

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
        AllowOverride None
        Require all granted
    </Directory>
    
    ErrorLog \${APACHE_LOG_DIR}/uptaxi_error.log
    CustomLog \${APACHE_LOG_DIR}/uptaxi_access.log combined
</VirtualHost>
EOF

# Enable site
sudo a2ensite uptaxi.conf
sudo a2dissite 000-default.conf
sudo systemctl reload apache2

# Set PHP configuration
echo "Configuring PHP..."
sudo sed -i 's/upload_max_filesize = 2M/upload_max_filesize = 50M/' /etc/php/8.3/apache2/php.ini
sudo sed -i 's/post_max_size = 8M/post_max_size = 50M/' /etc/php/8.3/apache2/php.ini
sudo sed -i 's/max_execution_time = 30/max_execution_time = 300/' /etc/php/8.3/apache2/php.ini
sudo systemctl restart apache2

# Create .htaccess for API routing
echo "Creating .htaccess files..."
sudo tee /var/www/html/.htaccess > /dev/null <<EOF
RewriteEngine On
RewriteRule ^api/(.*)$ api/\$1 [L]
EOF

sudo tee /var/www/html/api/.htaccess > /dev/null <<EOF
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ \$1.php [L]
EOF

echo "=== Installation Complete ==="
echo "Your UpTaxi Portal is now installed!"
echo ""
echo "Access your portal at: http://your-server-ip/"
echo "Default admin login: admin / admin123"
echo "Default user login: user / user123"
echo ""
echo "IMPORTANT: Change the database password in api/config.php"
echo "IMPORTANT: Change default user passwords after first login"
echo ""
echo "Log files location:"
echo "- Apache error log: /var/log/apache2/uptaxi_error.log"
echo "- Apache access log: /var/log/apache2/uptaxi_access.log"
