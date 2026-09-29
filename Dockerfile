# syntax=docker/dockerfile:1

# --- Build frontend + PHP deps ---
FROM php:8.3-cli-bookworm AS builder

RUN apt-get update && apt-get install -y --no-install-recommends \
    git unzip curl libsqlite3-dev \
    && docker-php-ext-install pdo_sqlite \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Node 20 for Vite
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY composer.json composer.lock ./
RUN composer install \
    --no-dev \
    --no-interaction \
    --no-scripts \
    --prefer-dist \
    --optimize-autoloader

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Wayfinder runs artisan during `vite build`
ENV APP_ENV=production \
    APP_KEY=base64:dGVzdGtleXRlc3RrZXl0ZXN0a2V5dGVzdGtleXRlc3Q= \
    DB_CONNECTION=sqlite \
    DB_DATABASE=/tmp/build.sqlite

RUN touch /tmp/build.sqlite \
    && php artisan package:discover --ansi \
    && npm run build \
    && rm -rf node_modules

# --- Runtime ---
FROM php:8.3-cli-bookworm

RUN apt-get update && apt-get install -y --no-install-recommends \
    libsqlite3-dev \
    && docker-php-ext-install pdo_sqlite \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /var/www/html

COPY --from=builder /app /var/www/html
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh \
    && mkdir -p database storage bootstrap/cache \
    && chmod -R ug+rwx storage bootstrap/cache database

ENV APP_ENV=production \
    APP_DEBUG=false \
    DB_CONNECTION=sqlite \
    DB_DATABASE=/var/www/html/database/database.sqlite \
    SESSION_DRIVER=database \
    CACHE_STORE=file \
    QUEUE_CONNECTION=sync \
    LOG_CHANNEL=stderr

EXPOSE 8000

ENTRYPOINT ["entrypoint.sh"]
