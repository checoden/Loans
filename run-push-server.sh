#!/bin/bash
# Скрипт для запуска сервера push-уведомлений

# Убиваем все предыдущие экземпляры сервера
pkill -f "node push-server.js" || true
pkill -f "node run-push-server.js" || true

# Запускаем сервер с автоматическим перезапуском
echo "Запускаем сервер push-уведомлений..."
node run-push-server.js