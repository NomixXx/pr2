#!/bin/bash

echo "=== Исправление проблем с авторизацией ==="

# 1. Проверить и создать тестовые файлы
echo "1. Создание тестовых файлов..."
sudo cp debug-login.html /var/www/html/
sudo cp api/test-auth.php /var/www/html/api/
sudo cp api/simple-auth.php /var/www/html/api/
sudo cp js/debug-auth.js /var/www/html/js/

# 2. Проверить права доступа
echo "2. Установка прав доступа..."
sudo chown -R www-data:www-data /var/www/html
sudo chmod -R 755 /var/www/html

# 3. Проверить PHP сессии
echo "3. Проверка PHP сессий..."
sudo mkdir -p /var/lib/php/sessions
sudo chown -R www-data:www-data /var/lib/php/sessions
sudo chmod -R 755 /var/lib/php/sessions

# 4. Перезапустить Apache
echo "4. Перезапуск Apache..."
sudo systemctl restart apache2

# 5. Проверить логи
echo "5. Проверка логов Apache..."
echo "Последние ошибки:"
sudo tail -10 /var/log/apache2/error.log

echo ""
echo "=== Тестирование ==="
echo "1. Откройте: http://$(hostname -I | awk '{print $1}')/debug-login.html"
echo "2. Используйте Debug Panel для тестирования"
echo "3. Проверьте консоль браузера (F12)"

echo ""
echo "=== Быстрые тесты ==="
echo "Тест API:"
curl -s http://localhost/api/test-auth.php | python3 -m json.tool 2>/dev/null || echo "API недоступно"

echo ""
echo "Тест авторизации:"
curl -s -X POST http://localhost/api/simple-auth.php \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' | python3 -m json.tool 2>/dev/null || echo "Auth недоступно"
