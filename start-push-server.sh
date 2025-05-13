#!/bin/bash
# Скрипт для запуска сервера push-уведомлений на Replit

# Определение порта
export PORT=3000

# Убиваем все предыдущие экземпляры сервера
pkill -f "node push-server.js" || true

# Запускаем сервер push-уведомлений
echo "Запуск push-сервера на порту $PORT..."
node push-server.js