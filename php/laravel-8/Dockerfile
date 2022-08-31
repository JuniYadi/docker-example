FROM composer:latest as builder
WORKDIR /app
COPY composer.* ./
RUN composer install --prefer-dist --no-scripts --no-interaction --ignore-platform-reqs


FROM builder as artifact
WORKDIR /app
COPY . ./
RUN composer dump-autoload --optimize


FROM php:7.4-apache as phpBuild
RUN apt-get update && apt-get install -y \
    apt-utils \
    curl \
    libfreetype6-dev \
    libjpeg62-turbo-dev \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    libzip-dev \
    libpq-dev \
    zip \
    unzip \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-configure pgsql -with-pgsql=/usr/local/pgsql \
    && docker-php-ext-install -j$(nproc) mysqli pgsql pdo pdo_mysql pdo_pgsql mbstring exif pcntl bcmath gd zip intl \
    && docker-php-ext-configure intl \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && apt-get clean \
    && apt-get autoremove -y \
    && rm -rf /var/lib/apt/lists/*

FROM phpBuild as production

WORKDIR /app

COPY . ./
COPY --from=artifact --chown=www-data:www-data /app/vendor ./vendor

# APACHE ENV #
ENV APACHE_DOCUMENT_ROOT /app/public

# PHP ENV #
ENV PHP_TIMEZONE Asia/Jakarta
ENV PHP_MAX_EXECUTION_TIME 300
ENV PHP_MEMORY_LIMIT 512M
ENV PHP_POST_MAX_SIZE 100M
ENV PHP_UPLOAD_MAX_FILESIZE 100M
ENV PHP_MAX_FILE_UPLOADS 100
ENV PHP_MAX_INPUT_TIME 300

# Laravel ENV #
ENV APP_DEBUG false
ENV LOG_CHANNEL stderr

RUN cp -r "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini" \
    && echo "date.timezone = $PHP_TIMEZONE" >> "$PHP_INI_DIR/conf.d/000-optimize.ini" \
    && echo "max_execution_time = $PHP_MAX_EXECUTION_TIME" >> "$PHP_INI_DIR/conf.d/000-optimize.ini" \
    && echo "max_input_time = $PHP_MAX_INPUT_TIME" >> "$PHP_INI_DIR/conf.d/000-optimize.ini" \
    && echo "memory_limit = $PHP_MEMORY_LIMIT" >> "$PHP_INI_DIR/conf.d/000-optimize.ini" \
    && echo "expose_php = off" >> "$PHP_INI_DIR/conf.d/000-optimize.ini" \
    && echo "post_max_size = $PHP_POST_MAX_SIZE" >> "$PHP_INI_DIR/conf.d/000-optimize.ini" \
    && echo "upload_max_filesize = $PHP_MAX_FILE_UPLOADS" >> "$PHP_INI_DIR/conf.d/000-optimize.ini" \
    && echo "max_file_uploads = $PHP_MAX_FILE_UPLOADS" >> "$PHP_INI_DIR/conf.d/000-optimize.ini" \
    && echo "log_errors = On" >> "$PHP_INI_DIR/conf.d/000-optimize.ini" \
    && echo "display_errors = Off" >> "$PHP_INI_DIR/conf.d/000-optimize.ini"

RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf \
    && sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf \
    && sed -ri \
    -e 's/ServerTokens OS/ServerTokens Prod/g' \
    -e 's/ServerSignature On/ServerSignature Off/g' \
    /etc/apache2/conf-enabled/security.conf \
    && chown -R www-data:www-data /app \
    && a2enmod rewrite headers

EXPOSE 80
