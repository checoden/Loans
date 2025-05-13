#!/bin/bash

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функция для отображения сообщений с префиксом
log() {
  echo -e "${GREEN}[APK Builder]${NC} $1"
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

# Проверка OneSignal API Keys
check_onesignal_keys() {
  log "Проверка ключей OneSignal..."
  
  if [ -z "$VITE_ONESIGNAL_APP_ID" ] || [ -z "$VITE_ONESIGNAL_REST_API_KEY" ]; then
    warn "Ключи OneSignal не установлены в переменных окружения."
    warn "Push-уведомления могут не работать корректно."
    
    # Спрашиваем, хочет ли пользователь продолжить без ключей
    read -p "Продолжить сборку без ключей OneSignal? (y/n): " continue_build
    if [ "$continue_build" != "y" ]; then
      error "Сборка отменена пользователем."
      exit 1
    fi
  else
    log "Ключи OneSignal найдены ✅"
  fi
}

# Проверка Google Services JSON
check_google_services() {
  log "Проверка файла google-services.json..."
  
  if [ ! -f "capacitor-app/google-services.json" ]; then
    warn "Файл google-services.json не найден в директории capacitor-app."
    warn "Используется шаблонный файл, который не будет работать с Firebase."
    
    # Спрашиваем, хочет ли пользователь продолжить без настроенного Firebase
    read -p "Продолжить сборку с шаблонным файлом? (y/n): " continue_build
    if [ "$continue_build" != "y" ]; then
      error "Сборка отменена пользователем."
      exit 1
    fi
  else
    # Проверка, не является ли файл шаблоном
    if grep -q "YOUR_PROJECT_NUMBER" "capacitor-app/google-services.json"; then
      warn "Обнаружен шаблонный файл google-services.json. Push-уведомления могут не работать."
    else
      log "Файл google-services.json валидный ✅"
    fi
  fi
}

# Основная функция для сборки APK
build_apk() {
  log "Начинаем процесс сборки APK..."
  
  # Шаг 1: Проверка наличия Node.js
  if ! command -v node &> /dev/null; then
    error "Node.js не установлен. Пожалуйста, установите Node.js и повторите попытку."
    exit 1
  fi
  
  # Шаг 2: Проверка переменных окружения
  check_onesignal_keys
  
  # Шаг 3: Запуск скрипта подготовки
  log "Подготовка проекта для сборки..."
  if ! node prepare-for-apk.js; then
    error "Не удалось подготовить проект для сборки. См. ошибки выше."
    exit 1
  fi
  
  # Шаг 4: Проверка google-services.json
  check_google_services
  
  # Шаг 5: Вывод следующих шагов для сборки APK
  log "Проект подготовлен для сборки APK! ✅"
  info "Для завершения сборки выполните следующие шаги:"
  info "1. Установите Android Studio с сайта https://developer.android.com/studio"
  info "2. Выполните команду: npx cap sync android"
  info "3. Выполните команду: npx cap open android"
  info "4. В Android Studio выберите Build -> Build Bundle(s) / APK(s) -> Build APK(s)"
  info "5. После сборки APK файл будет находиться в android/app/build/outputs/apk/debug/app-debug.apk"
  
  log "Желаете выполнить команду 'npx cap sync android' сейчас? (y/n): "
  read answer
  if [ "$answer" = "y" ]; then
    log "Выполнение npx cap sync android..."
    npx cap sync android
    
    log "Готово! Теперь вы можете открыть проект в Android Studio командой 'npx cap open android'"
  else
    log "Вы можете выполнить 'npx cap sync android' вручную позже."
  fi
}

# Запуск основной функции
build_apk