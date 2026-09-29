#!/bin/sh
set -e

cd /var/www/html

mkdir -p \
  database \
  storage/app/public \
  storage/framework/cache/data \
  storage/framework/sessions \
  storage/framework/views \
  storage/logs \
  bootstrap/cache

if [ ! -f database/database.sqlite ]; then
  touch database/database.sqlite
fi

chmod -R ug+rwx storage bootstrap/cache database

# Render sets RENDER_EXTERNAL_URL; use it when APP_URL is unset.
if [ -z "${APP_URL:-}" ] && [ -n "${RENDER_EXTERNAL_URL:-}" ]; then
  export APP_URL="$RENDER_EXTERNAL_URL"
fi

export DB_CONNECTION="${DB_CONNECTION:-sqlite}"
export DB_DATABASE="${DB_DATABASE:-/var/www/html/database/database.sqlite}"
export SESSION_DRIVER="${SESSION_DRIVER:-database}"
export CACHE_STORE="${CACHE_STORE:-file}"
export QUEUE_CONNECTION="${QUEUE_CONNECTION:-sync}"
export LOG_CHANNEL="${LOG_CHANNEL:-stderr}"

if [ -z "${APP_KEY:-}" ]; then
  echo "APP_KEY is required. Generate one with: php artisan key:generate --show" >&2
  exit 1
fi

php artisan migrate --force --no-interaction
php artisan config:cache
php artisan view:cache

PORT="${PORT:-8000}"
exec php artisan serve --host=0.0.0.0 --port="$PORT"
