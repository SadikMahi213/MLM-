#!/bin/sh
set -e

php /var/www/artisan optimize
php /var/www/artisan migrate --force

/usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
