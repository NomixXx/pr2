# UpTaxi Portal - Server Version

Серверная версия портала UpTaxi с базой данных MySQL для Ubuntu 24.04.2 LTS.

## Установка

### Автоматическая установка

1. Загрузите все файлы на сервер
2. Запустите скрипт установки:
\`\`\`bash
chmod +x install.sh
sudo ./install.sh
\`\`\`

### Ручная установка

1. **Установка пакетов:**
\`\`\`bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y apache2 mysql-server php php-mysql php-mbstring php-xml php-curl php-gd php-zip
\`\`\`

2. **Настройка MySQL:**
\`\`\`bash
sudo mysql -e "CREATE DATABASE uptaxi_portal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
sudo mysql -e "CREATE USER 'uptaxi_user'@'localhost' IDENTIFIED BY 'your_secure_password_here';"
sudo mysql -e "GRANT ALL PRIVILEGES ON uptaxi_portal.* TO 'uptaxi_user'@'localhost';"
sudo mysql -e "FLUSH PRIVILEGES;"
sudo mysql uptaxi_portal < database/setup.sql
\`\`\`

3. **Настройка веб-сервера:**
\`\`\`bash
sudo cp -r * /var/www/html/
sudo chown -R www-data:www-data /var/www/html
sudo chmod -R 755 /var/www/html
sudo mkdir -p /var/www/html/uploads
sudo chown -R www-data:www-data /var/www/html/uploads
\`\`\`

4. **Настройка Apache:**
\`\`\`bash
sudo a2enmod rewrite
sudo systemctl restart apache2
\`\`\`

## Конфигурация

### База данных
Отредактируйте файл `api/config.php`:
\`\`\`php
define('DB_HOST', 'localhost');
define('DB_NAME', 'uptaxi_portal');
define('DB_USER', 'uptaxi_user');
define('DB_PASS', 'your_secure_password_here');
\`\`\`

### Безопасность
1. Измените пароли по умолчанию после первого входа
2. Настройте SSL сертификат для HTTPS
3. Ограничьте доступ к директории `/api/` в конфигурации Apache

## Использование

### Доступ к системе
- URL: `http://your-server-ip/`
- Админ: `admin` / `admin123`
- Пользователь: `user` / `user123`

### API Endpoints
- `/api/auth.php` - Аутентификация
- `/api/users.php` - Управление пользователями
- `/api/sections.php` - Управление разделами
- `/api/content.php` - Управление контентом
- `/api/docs.php` - Google документы
- `/api/files.php` - Загрузка файлов
- `/api/activities.php` - Активности
- `/api/access-levels.php` - Уровни доступа

## Структура файлов

\`\`\`
/var/www/html/
├── api/                    # API endpoints
│   ├── config.php         # Конфигурация БД
│   ├── auth.php          # Аутентификация
│   ├── users.php         # Пользователи
│   ├── sections.php      # Разделы
│   ├── content.php       # Контент
│   ├── docs.php          # Google документы
│   ├── files.php         # Файлы
│   ├── activities.php    # Активности
│   └── access-levels.php # Уровни доступа
├── js/                    # JavaScript файлы
│   ├── api-client.js     # API клиент
│   ├── script-server.js  # Серверная версия скриптов
│   └── menu-server.js    # Серверная версия меню
├── database/              # База данных
│   └── setup.sql         # Схема БД
├── public/               # Публичные файлы
│   └── logo-uptaxi.svg   # Логотип
├── uploads/              # Загруженные файлы
├── index.html            # Страница входа
├── menu.html             # Главное меню
├── admin.html            # Админ-панель (оригинальная)
├── styles.css            # Стили входа
├── menu.css              # Стили меню
├── admin.css             # Стили админки
├── .htaccess             # Apache конфигурация
└── README.md             # Документация
\`\`\`

## Особенности

### Сохранение стилей
Все оригинальные стили, цвета и расположения элементов сохранены без изменений.

### База данных
- MySQL с полной поддержкой UTF-8
- Нормализованная структура таблиц
- Внешние ключи для целостности данных
- Автоматические временные метки

### Безопасность
- Хеширование паролей с помощью PHP password_hash()
- Защита от SQL инъекций через подготовленные запросы
- Проверка прав доступа на уровне API
- Валидация загружаемых файлов

### API
- RESTful архитектура
- JSON формат данных
- Обработка ошибок
- CORS поддержка

## Логи

- Apache error log: `/var/log/apache2/uptaxi_error.log`
- Apache access log: `/var/log/apache2/uptaxi_access.log`

## Поддержка

При возникновении проблем проверьте:
1. Логи Apache
2. Права доступа к файлам
3. Настройки PHP
4. Подключение к базе данных
