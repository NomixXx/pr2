#!/bin/bash

echo "=== Открытие портов для UpTaxi Portal ==="

# Проверить UFW
if command -v ufw >/dev/null 2>&1; then
    echo "UFW найден. Настройка правил..."
    
    # Разрешить SSH (важно!)
    sudo ufw allow ssh
    
    # Разрешить HTTP и HTTPS
    sudo ufw allow 80/tcp
    sudo ufw allow 443/tcp
    
    # Показать статус
    sudo ufw status
    
    echo ""
    echo "Хотите включить UFW? (y/n)"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        sudo ufw --force enable
        echo "✅ UFW включен"
    fi
else
    echo "UFW не установлен. Проверка iptables..."
    
    # Проверить iptables
    if sudo iptables -L | grep -q "DROP\|REJECT"; then
        echo "⚠️  Обнаружены ограничения iptables"
        echo "Добавление правил для портов 80 и 443..."
        
        sudo iptables -I INPUT -p tcp --dport 80 -j ACCEPT
        sudo iptables -I INPUT -p tcp --dport 443 -j ACCEPT
        
        echo "✅ Правила добавлены"
    else
        echo "✅ Ограничений не обнаружено"
    fi
fi

echo ""
echo "=== Проверка открытых портов ==="
netstat -tlnp | grep -E ":80|:443" || echo "Порты 80/443 не прослушиваются"

echo ""
echo "=== Проверка процессов Apache ==="
ps aux | grep apache2 | grep -v grep || echo "Процессы Apache не найдены"
