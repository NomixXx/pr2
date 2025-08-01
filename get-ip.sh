#!/bin/bash

echo "=== Получение IP адресов сервера ==="

echo ""
echo "1. Внешний IP адрес (через интернет):"
curl -s ifconfig.me || curl -s ipinfo.io/ip || curl -s icanhazip.com
echo ""

echo ""
echo "2. Внешний IP через другие сервисы:"
echo "Способ 1:" $(curl -s https://api.ipify.org)
echo "Способ 2:" $(curl -s https://ipecho.net/plain)
echo "Способ 3:" $(curl -s https://checkip.amazonaws.com)

echo ""
echo "3. Локальные IP адреса:"
hostname -I

echo ""
echo "4. Все сетевые интерфейсы:"
ip addr show | grep -E "inet [0-9]" | grep -v "127.0.0.1" | awk '{print $2}' | cut -d'/' -f1

echo ""
echo "5. Подробная информация о сети:"
ip route get 8.8.8.8 | grep -oP 'src \K[^ ]+'

echo ""
echo "=== Как подключиться ==="
EXTERNAL_IP=$(curl -s ifconfig.me 2>/dev/null)
LOCAL_IP=$(hostname -I | awk '{print $1}')

if [ ! -z "$EXTERNAL_IP" ]; then
    echo "Внешний доступ: http://$EXTERNAL_IP/"
    echo "HTTPS (если настроен): https://$EXTERNAL_IP/"
fi

if [ ! -z "$LOCAL_IP" ]; then
    echo "Локальный доступ: http://$LOCAL_IP/"
    echo "Localhost: http://localhost/"
fi

echo ""
echo "=== Проверка портов ==="
echo "Проверка порта 80 (HTTP):"
netstat -tlnp | grep :80 || echo "Порт 80 не открыт"

echo "Проверка порта 443 (HTTPS):"
netstat -tlnp | grep :443 || echo "Порт 443 не открыт"

echo ""
echo "=== Проверка файрвола ==="
sudo ufw status || echo "UFW не установлен"

echo ""
echo "=== Тест доступности ==="
if [ ! -z "$LOCAL_IP" ]; then
    echo "Тестирование локального доступа:"
    curl -I http://$LOCAL_IP/ 2>/dev/null | head -1 || echo "Локальный доступ недоступен"
fi
