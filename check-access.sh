#!/bin/bash

echo "=== Проверка доступности UpTaxi Portal ==="

# Получить IP адреса
EXTERNAL_IP=$(curl -s ifconfig.me 2>/dev/null)
LOCAL_IP=$(hostname -I | awk '{print $1}')

echo "Внешний IP: $EXTERNAL_IP"
echo "Локальный IP: $LOCAL_IP"

echo ""
echo "=== Тестирование доступа ==="

# Тест localhost
echo "1. Тест localhost:"
curl -I http://localhost/ 2>/dev/null | head -1 || echo "❌ Localhost недоступен"

# Тест локального IP
if [ ! -z "$LOCAL_IP" ]; then
    echo "2. Тест локального IP ($LOCAL_IP):"
    curl -I http://$LOCAL_IP/ 2>/dev/null | head -1 || echo "❌ Локальный IP недоступен"
fi

# Тест внешнего IP
if [ ! -z "$EXTERNAL_IP" ]; then
    echo "3. Тест внешнего IP ($EXTERNAL_IP):"
    curl -I http://$EXTERNAL_IP/ 2>/dev/null | head -1 || echo "❌ Внешний IP недоступен"
fi

echo ""
echo "=== Проверка Apache ==="
sudo systemctl is-active apache2 && echo "✅ Apache работает" || echo "❌ Apache не работает"

echo ""
echo "=== Проверка файлов ==="
if [ -f "/var/www/html/index.html" ]; then
    echo "✅ index.html найден"
else
    echo "❌ index.html не найден"
fi

echo ""
echo "=== Ссылки для доступа ==="
if [ ! -z "$EXTERNAL_IP" ]; then
    echo "🌐 Внешний доступ: http://$EXTERNAL_IP/"
fi
if [ ! -z "$LOCAL_IP" ]; then
    echo "🏠 Локальный доступ: http://$LOCAL_IP/"
fi
echo "💻 Localhost: http://localhost/"

echo ""
echo "=== Логи Apache (последние 5 строк) ==="
sudo tail -5 /var/log/apache2/access.log 2>/dev/null || echo "Логи недоступны"
