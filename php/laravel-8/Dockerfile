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

ENV APACHE_DOCUMENT_ROOT /app/public
ENV APP_DEBUG false
ENV LOG_CHANNEL stderr

RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf \
    && sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf \
    && mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini" \
    && chown -R www-data:www-data /app \
    && a2enmod rewrite headers

EXPOSE 80
