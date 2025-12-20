#!/bin/bash

# Создаем директорию для SSL сертификатов
mkdir -p docker/nginx/ssl

# Генерируем приватный ключ
openssl genrsa -out docker/nginx/ssl/localhost.key 2048

# Генерируем самоподписанный сертификат
openssl req -new -x509 -key docker/nginx/ssl/localhost.key -out docker/nginx/ssl/localhost.crt -days 365 -subj "/C=RU/ST=Moscow/L=Moscow/O=TelegramHotel/OU=Development/CN=localhost"

echo "✅ SSL сертификаты созданы:"
echo "   - docker/nginx/ssl/localhost.key"
echo "   - docker/nginx/ssl/localhost.crt"
echo ""
echo "🔒 Для использования HTTPS:"
echo "   1. Обновите docker-compose.yml (используйте ssl.conf вместо default.conf)"
echo "   2. Измените APP_URL в .env на https://localhost:8443"
echo "   3. Перезапустите контейнеры: make restart" 