#!/bin/bash
set -e

echo "Waiting for database..."
until mysql --ssl=0 -h"$DB_HOST" -u"$DB_USERNAME" -p"$DB_PASSWORD" -e "SELECT 1" &> /dev/null; do
    sleep 2
done

echo "Database is ready!"

# Generate app key if not set
if [ -z "$APP_KEY" ] || [ "$APP_KEY" = "base64:" ]; then
    php artisan key:generate --force
fi

# Run migrations
echo "Running migrations..."
php artisan migrate --force

# Run seeders
echo "Running seeders..."
php artisan db:seed --force

# Clear config
php artisan config:clear

# Create storage directories
echo "Setting up storage..."
mkdir -p storage/app/public/items
chmod -R 775 storage

# Create storage link
php artisan storage:link --force 2>/dev/null || true

echo "Starting Laravel server..."
exec php artisan serve --host=0.0.0.0 --port=8000
