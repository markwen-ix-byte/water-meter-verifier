FROM php:8.3-apache

# Устанавливаем расширения PHP
RUN apt-get update && apt-get install -y \
    libzip-dev \
    && docker-php-ext-install pdo pdo_mysql mysqli zip \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Включаем mod_rewrite (нужен для красивых URL)
RUN a2enmod rewrite

# Копируем все файлы проекта
COPY . /var/www/html/

# Устанавливаем права
RUN chown -R www-data:www-data /var/www/html/ \
    && chmod -R 755 /var/www/html/

# Открываем порт
EXPOSE 80
