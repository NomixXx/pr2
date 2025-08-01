#!/bin/bash

echo "=== Исправление конфликтов скриптов ==="

# 1. Удалить конфликтующие файлы
echo "1. Удаление конфликтующих файлов..."
sudo rm -f /var/www/html/js/script-server.js
sudo rm -f /var/www/html/js/menu-server.js
sudo rm -f /var/www/html/js/api-client.js

# 2. Обновить основные файлы
echo "2. Копирование исправленных файлов..."
sudo cp index.html /var/www/html/
sudo cp menu.html /var/www/html/
sudo cp admin.html /var/www/html/
sudo cp script.js /var/www/html/
sudo cp admin.js /var/www/html/

# 3. Создать placeholder.svg
echo "3. Создание placeholder.svg..."
sudo tee /var/www/html/placeholder.svg > /dev/null <<'EOF'
<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#f0f0f0"/>
  <text x="50%" y="50%" font-family="Arial" font-size="18" fill="#666" text-anchor="middle" dy=".3em">
    Placeholder Image
  </text>
</svg>
EOF

# 4. Установить права доступа
echo "4. Установка прав доступа..."
sudo chown -R www-data:www-data /var/www/html
sudo chmod -R 755 /var/www/html

# 5. Перезапустить Apache
echo "5. Перезапуск Apache..."
sudo systemctl restart apache2

echo ""
echo "=== Исправления завершены ==="
echo "Теперь попробуйте:"
echo "1. Очистить кэш браузера (Ctrl+F5)"
echo "2. Войти как admin/admin123 - должно перенаправить в админ-панель"
echo "3. Войти как user/user123 - должно перенаправить в обычное меню"

echo ""
echo "Доступ к сайту: http://$(hostname -I | awk '{print $1}')/"
