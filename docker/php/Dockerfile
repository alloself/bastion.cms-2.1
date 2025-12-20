FROM php:8.4-fpm-bookworm

ARG PUID=1000
ARG PGID=1000

# Устанавливаем системные зависимости (принудительно включаем HTTPS-репозитории для Debian 12)
RUN set -eux; \
    if [ -f /etc/apt/sources.list.d/debian.sources ]; then \
        sed -i 's|http://|https://|g' /etc/apt/sources.list.d/debian.sources; \
    else \
        echo "deb https://deb.debian.org/debian bookworm main contrib non-free non-free-firmware" > /etc/apt/sources.list; \
        echo "deb https://deb.debian.org/debian bookworm-updates main contrib non-free non-free-firmware" >> /etc/apt/sources.list; \
        echo "deb https://security.debian.org/debian-security bookworm-security main contrib non-free non-free-firmware" >> /etc/apt/sources.list; \
    fi; \
    apt-get update; \
    apt-get install -y --no-install-recommends \
    git \
    curl \
    ca-certificates \
    zip \
    unzip \
    libpng-dev \
    libxml2-dev \
    libzip-dev \
    libonig-dev \
    libfreetype6-dev \
    libjpeg62-turbo-dev \
    build-essential \
    autoconf \
    pkg-config \
    vim \
    nano \
    supervisor \
 && rm -rf /var/lib/apt/lists/*

# Очищаем кеш apt
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Устанавливаем PHP расширения
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
 && docker-php-ext-install -j"$(nproc)" pdo_mysql mbstring exif pcntl bcmath gd zip

# Устанавливаем Redis расширение
RUN pecl install redis && docker-php-ext-enable redis

# Устанавливаем Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Создаем группу и пользователя с хостовыми UID/GID (по умолчанию 1000:1000)
RUN groupadd -g ${PGID} www \
 && useradd -u ${PUID} -ms /bin/bash -g www www

# Копируем исходники и назначаем владельца
COPY --chown=${PUID}:${PGID} . /var/www

# Меняем текущего пользователя на соответствующего PUID
USER ${PUID}

# Открываем порт 9000 и запускаем php-fpm сервер
EXPOSE 9000
CMD ["php-fpm"] 