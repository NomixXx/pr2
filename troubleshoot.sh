#!/bin/bash

echo "=== UpTaxi Portal Troubleshooting ==="

echo "Checking system status..."

echo ""
echo "1. Checking Apache status:"
sudo systemctl status apache2 --no-pager -l

echo ""
echo "2. Checking MySQL status:"
sudo systemctl status mysql --no-pager -l

echo ""
echo "3. Checking PHP version:"
php -v

echo ""
echo "4. Checking Apache error log (last 20 lines):"
sudo tail -20 /var/log/apache2/error.log

echo ""
echo "5. Checking file permissions:"
ls -la /var/www/html/

echo ""
echo "6. Testing MySQL connection:"
mysql -u uptaxi_user -puptaxi_secure_pass_2024 -e "SELECT 'Connection OK' as status;" 2>/dev/null || echo "MySQL connection failed"

echo ""
echo "7. Checking Apache modules:"
apache2ctl -M | grep -E "(rewrite|headers)"

echo ""
echo "8. Testing web server:"
curl -I http://localhost/ 2>/dev/null || echo "Web server not responding"

echo ""
echo "=== Common fixes ==="
echo "If MySQL fails to start:"
echo "sudo systemctl stop mysql"
echo "sudo mysqld_safe --skip-grant-tables &"
echo "mysql -u root"
echo "FLUSH PRIVILEGES;"
echo "ALTER USER 'root'@'localhost' IDENTIFIED BY 'new_password';"
echo "sudo systemctl restart mysql"

echo ""
echo "If permissions are wrong:"
echo "sudo chown -R www-data:www-data /var/www/html"
echo "sudo chmod -R 755 /var/www/html"
echo "sudo chmod -R 777 /var/www/html/uploads"

echo ""
echo "If Apache won't start:"
echo "sudo apache2ctl configtest"
echo "sudo systemctl restart apache2"
