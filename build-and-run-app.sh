#!/bin/bash

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функция для отображения сообщений с префиксом
log() {
  echo -e "${GREEN}[BUILD]${NC} $1"
}

error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

warn() {
  echo -e "${YELLOW}[WARN]${NC} $1"
}

info() {
  echo -e "${BLUE}[INFO]${NC} $1"
}

# Функция для сборки и запуска приложения
build_and_run() {
  log "Запуск комплексного процесса сборки и запуска приложения..."
  
  # Шаг 1: Сборка проекта
  log "Шаг 1: Сборка проекта..."
  if ! npm run build; then
    error "Ошибка при сборке проекта"
    exit 1
  fi
  
  # Шаг 2: Подготовка APK
  log "Шаг 2: Подготовка файлов для APK..."
  if ! node prepare-for-apk.js; then
    error "Ошибка при подготовке файлов для APK"
    exit 1
  fi
  
  # Шаг 3: Запуск веб-сервера
  log "Шаг 3: Запуск основного приложения..."
  npm run dev &
  WEB_SERVER_PID=$!
  
  # Шаг 4: Запуск push-сервера (если он существует)
  if [ -f "run-push-server.js" ]; then
    log "Шаг 4: Запуск сервера push-уведомлений..."
    node run-push-server.js &
    PUSH_SERVER_PID=$!
  fi
  
  # Ожидание завершения (Ctrl+C)
  log "Все сервисы запущены! 🚀"
  log "Приложение доступно по адресу: http://localhost:5000"
  
  if [ -n "$PUSH_SERVER_PID" ]; then
    info "Push-сервер запущен с PID: $PUSH_SERVER_PID"
  fi
  
  info "Нажмите Ctrl+C для завершения всех процессов"
  
  # Ожидание сигнала завершения
  trap cleanup INT TERM
  wait $WEB_SERVER_PID
}

# Функция для корректного завершения всех процессов
cleanup() {
  log "Завершение работы..."
  
  # Завершение веб-сервера
  if [ -n "$WEB_SERVER_PID" ]; then
    log "Остановка веб-сервера (PID: $WEB_SERVER_PID)..."
    kill $WEB_SERVER_PID 2>/dev/null
  fi
  
  # Завершение push-сервера
  if [ -n "$PUSH_SERVER_PID" ]; then
    log "Остановка push-сервера (PID: $PUSH_SERVER_PID)..."
    kill $PUSH_SERVER_PID 2>/dev/null
  fi
  
  log "Все процессы завершены"
  exit 0
}

# Запуск основной функции
build_and_run