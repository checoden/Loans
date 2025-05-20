#!/bin/bash

# Скрипт для патчинга файла build.gradle для включения скрипта merge-post-notifications-permission.gradle

APP_GRADLE_PATH="android/app/build.gradle"

if [ ! -f "$APP_GRADLE_PATH" ]; then
  echo "❌ Файл build.gradle не найден по пути $APP_GRADLE_PATH"
  exit 1
fi

echo "Модифицируем файл build.gradle для добавления скрипта мерджа разрешений..."

# Проверяем, есть ли уже включение нашего скрипта
if grep -q "merge-post-notifications-permission.gradle" "$APP_GRADLE_PATH"; then
  echo "✅ Скрипт уже подключен в build.gradle"
else
  # Находим строку 'apply plugin: "com.android.application"' и добавляем после неё наш скрипт
  sed -i '/apply plugin: "com.android.application"/a apply from: "../merge-post-notifications-permission.gradle"' "$APP_GRADLE_PATH"
  echo "✅ Скрипт merge-post-notifications-permission.gradle успешно подключен в build.gradle"
fi

# Копируем скрипт в правильную директорию
if [ ! -f "android/merge-post-notifications-permission.gradle" ]; then
  cp merge-post-notifications-permission.gradle android/
  echo "✅ Скрипт скопирован в директорию android/"
fi

echo "Модификация build.gradle завершена"