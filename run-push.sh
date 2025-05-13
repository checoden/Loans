#!/bin/bash
# Скрипт для запуска сервера push-уведомлений

# Убиваем все предыдущие экземпляры сервера
pkill -f "node push-server.js" || true

# Запускаем сервер через runner
node push-server-runner.js

# Показываем последние логи
echo "Последние 10 строк логов:"
tail -n 10 push-server.log 2>/dev/null || echo "Лог-файл пока не создан"