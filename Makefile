.PHONY: help build up down restart logs shell composer npm artisan migrate seed fresh test vite-fix ssl-generate ssl-enable ssl-disable

# Цвета для вывода
GREEN=\033[0;32m
YELLOW=\033[1;33m
RED=\033[0;31m
NC=\033[0m # No Color

help: ## Показать справку
	@echo "$(GREEN)Доступные команды:$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "$(YELLOW)%-20s$(NC) %s\n", $$1, $$2}'

build: ## Собрать Docker образы
	@echo "$(GREEN)Сборка Docker образов...$(NC)"
	docker-compose build --no-cache

up: ## Запустить все контейнеры
	@echo "$(GREEN)Запуск контейнеров...$(NC)"
	docker-compose up -d
	@echo "$(GREEN)Контейнеры запущены!$(NC)"
	@echo "$(YELLOW)Приложение: http://localhost:8080$(NC)"
	@echo "$(YELLOW)phpMyAdmin: http://localhost:8081$(NC)"
	@echo "$(YELLOW)Vite dev server: http://localhost:5173$(NC)"

down: ## Остановить все контейнеры
	@echo "$(RED)Остановка контейнеров...$(NC)"
	docker-compose down

restart: down up ## Перезапустить все контейнеры

logs: ## Показать логи всех контейнеров
	docker-compose logs -f

logs-app: ## Показать логи PHP приложения
	docker-compose logs -f app

logs-nginx: ## Показать логи Nginx
	docker-compose logs -f nginx

logs-mysql: ## Показать логи MySQL
	docker-compose logs -f mysql

logs-node: ## Показать логи Node.js контейнера
	docker-compose logs -f node

wait-for-mysql: ## Дождаться готовности MySQL
	@echo "$(YELLOW)Ожидание готовности MySQL...$(NC)"
	@docker-compose exec mysql sh -lc 'export MYSQL_PWD="$$MYSQL_PASSWORD"; until mysqladmin ping -h "mysql" -u "$$MYSQL_USER" --protocol=tcp --silent; do sleep 2; done'
	@echo "$(GREEN)MySQL готов!$(NC)"

shell: ## Войти в контейнер приложения
	docker-compose exec app bash	
	
shell-node: ## Войти в контейнер Node.js
	docker-compose exec node sh


shell-mysql: ## Войти в контейнер MySQL
	docker-compose exec mysql mysql -u laravel_user -p rest-aggregator-miniapp

composer: ## Установить PHP зависимости
	docker-compose exec app composer install

composer-update: ## Обновить PHP зависимости
	docker-compose exec app composer update

npm: ## Установить Node.js зависимости
	docker-compose exec node npm install

npm-build: ## Собрать frontend
	docker-compose exec node npm run build

artisan: ## Выполнить artisan команду (использование: make artisan cmd="migrate")
	docker-compose exec app php artisan $(cmd)

key-generate: ## Сгенерировать APP_KEY
	docker-compose exec app php artisan key:generate

migrate: wait-for-mysql ## Выполнить миграции
	docker-compose exec app php artisan config:clear
	docker-compose exec app php artisan migrate --force --no-interaction

migrate-fresh: wait-for-mysql ## Пересоздать БД и выполнить миграции
	docker-compose exec app php artisan config:clear
	docker-compose exec app php artisan migrate:fresh --force --no-interaction

seed: ## Выполнить сидеры
	docker-compose exec app php artisan db:seed

fresh: migrate-fresh seed ## Пересоздать БД, выполнить миграции и сидеры

test: ## Запустить тесты
	docker-compose exec app php artisan test

cache-clear: ## Очистить кеш
	docker-compose exec app php artisan cache:clear
	docker-compose exec app php artisan config:clear
	docker-compose exec app php artisan route:clear
	docker-compose exec app php artisan view:clear

permissions: ## Установить правильные права доступа
	docker-compose exec app chown -R www:www /var/www/storage
	docker-compose exec app chown -R www:www /var/www/bootstrap/cache
	docker-compose exec app chmod -R 775 /var/www/storage
	docker-compose exec app chmod -R 775 /var/www/bootstrap/cache

permissions-fix: ## Исправить права доступа на frontend файлы и директории
	@echo "$(YELLOW)Исправление прав доступа...$(NC)"
	sudo chown -R $$USER:$$USER resources/ node_modules/ package*.json components*.json
	@echo "$(GREEN)Права доступа исправлены!$(NC)"

vite-fix: ## Исправить проблемы с Vite (перезапустить Node контейнер)
	@echo "$(YELLOW)Перезапуск Node контейнера для исправления Vite...$(NC)"
	docker-compose restart node
	@echo "$(GREEN)Node контейнер перезапущен!$(NC)"
	@echo "$(YELLOW)Проверьте Vite dev server: http://localhost:5173$(NC)"

ssl-generate: ## Сгенерировать SSL сертификаты для HTTPS
	@echo "$(YELLOW)Генерация SSL сертификатов...$(NC)"
	./docker/nginx/generate-ssl.sh
	@echo "$(GREEN)SSL сертификаты созданы!$(NC)"

ssl-enable: ssl-generate ## Включить HTTPS (требует перезапуск)
	@echo "$(YELLOW)Включение HTTPS...$(NC)"
	@if [ -f docker-compose.yml ]; then \
		sed -i 's|docker/nginx/default.conf|docker/nginx/ssl.conf|g' docker-compose.yml; \
		sed -i 's|"8080:80"|"8443:443"|g' docker-compose.yml; \
		sed -i 's|"80:80"|"8080:80"|g' docker-compose.yml; \
	fi
	@if [ -f .env ]; then \
		sed -i 's|APP_URL=http://localhost:8080|APP_URL=https://localhost:8443|g' .env; \
	fi
	@echo "$(GREEN)HTTPS включен! Перезапустите контейнеры: make restart$(NC)"
	@echo "$(YELLOW)Приложение будет доступно: https://localhost:8443$(NC)"

ssl-disable: ## Отключить HTTPS (вернуться к HTTP)
	@echo "$(YELLOW)Отключение HTTPS...$(NC)"
	@if [ -f docker-compose.yml ]; then \
		sed -i 's|docker/nginx/ssl.conf|docker/nginx/default.conf|g' docker-compose.yml; \
		sed -i 's|"8443:443"|"8080:80"|g' docker-compose.yml; \
		sed -i 's|"8080:80"|"80:80"|g' docker-compose.yml; \
	fi
	@if [ -f .env ]; then \
		sed -i 's|APP_URL=https://localhost:8443|APP_URL=http://localhost:8080|g' .env; \
	fi
	@echo "$(GREEN)HTTPS отключен! Перезапустите контейнеры: make restart$(NC)"
	@echo "$(YELLOW)Приложение будет доступно: http://localhost:8080$(NC)"

setup: build up composer key-generate migrate permissions ## Полная настройка проекта
	@echo "$(GREEN)Проект настроен и готов к работе!$(NC)"
	@echo "$(YELLOW)Приложение: http://localhost:8080$(NC)"
	@echo "$(YELLOW)phpMyAdmin: http://localhost:8081$(NC)"
	@echo "$(YELLOW)Vite dev server: http://localhost:5173$(NC)"

clean: ## Удалить все контейнеры и volumes
	docker-compose down -v
	docker system prune -f

types: ## Generate TypeScript types from Laravel models
	@echo "$(GREEN)🔧 Generating TypeScript types...$(NC)"
	@docker-compose exec app php artisan model:typer
	@echo "$(GREEN)✅ TypeScript types generated successfully!$(NC)"

dev: ## Запустить Vite dev серверы для всех интерфейсов  
	@echo "$(GREEN)🚀 Запуск Vite dev серверов...$(NC)"
	docker-compose exec node npm run dev 