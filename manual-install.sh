#!/bin/bash

# Manual step-by-step installation
echo "=== Manual Installation Steps ==="

echo "Step 1: Install packages"
echo "sudo apt update && sudo apt install -y apache2 mysql-server php php-mysql php-mbstring php-xml php-curl php-gd php-zip"

echo ""
echo "Step 2: Start services"
echo "sudo systemctl start apache2 mysql"
echo "sudo systemctl enable apache2 mysql"

echo ""
echo "Step 3: Secure MySQL (run this command and follow prompts):"
echo "sudo mysql_secure_installation"

echo ""
echo "Step 4: Create database:"
echo "sudo mysql -u root -p"
echo "Then run these SQL commands:"
echo "CREATE DATABASE uptaxi_portal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
echo "CREATE USER 'uptaxi_user'@'localhost' IDENTIFIED BY 'your_password';"
echo "GRANT ALL PRIVILEGES ON uptaxi_portal.* TO 'uptaxi_user'@'localhost';"
echo "FLUSH PRIVILEGES;"
echo "EXIT;"

echo ""
echo "Step 5: Copy files:"
echo "sudo mkdir -p /var/www/html/api /var/www/html/js /var/www/html/uploads"
echo "sudo cp *.html *.css /var/www/html/"
echo "sudo cp -r api/* /var/www/html/api/"
echo "sudo cp -r js/* /var/www/html/js/"
echo "sudo cp -r public /var/www/html/"

echo ""
echo "Step 6: Set permissions:"
echo "sudo chown -R www-data:www-data /var/www/html"
echo "sudo chmod -R 755 /var/www/html"
echo "sudo chmod -R 777 /var/www/html/uploads"

echo ""
echo "Step 7: Enable Apache modules:"
echo "sudo a2enmod rewrite headers"
echo "sudo systemctl restart apache2"
