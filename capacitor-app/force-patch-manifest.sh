#!/bin/bash

# Скрипт для принудительного добавления разрешения POST_NOTIFICATIONS
# в AndroidManifest.xml для всех версий Android, особенно 13+ (API 33+)

echo "🔍 Ищем все AndroidManifest.xml файлы в проекте..."

# Находим все AndroidManifest.xml в проекте
MANIFESTS=$(find android -name "AndroidManifest.xml")

for MANIFEST_PATH in $MANIFESTS; do
  echo "📝 Обрабатываем файл: $MANIFEST_PATH"
  
  # Проверяем, содержит ли файл уже разрешение
  if grep -q "android.permission.POST_NOTIFICATIONS" "$MANIFEST_PATH"; then
    echo "✅ Разрешение POST_NOTIFICATIONS уже присутствует в $MANIFEST_PATH"
  else
    echo "➕ Добавляем разрешение POST_NOTIFICATIONS в $MANIFEST_PATH"
    
    # Создаем временный файл для манифеста
    TEMP_FILE=$(mktemp)
    
    # Пытаемся добавить разрешение перед закрывающим тегом manifest
    sed '/<\/manifest>/i\    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />' "$MANIFEST_PATH" > "$TEMP_FILE"
    
    # Если не удалось (нет закрывающего тега manifest), пробуем добавить после первого тега uses-permission
    if ! grep -q "android.permission.POST_NOTIFICATIONS" "$TEMP_FILE"; then
      sed '/<uses-permission/a\    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />' "$MANIFEST_PATH" > "$TEMP_FILE"
    fi
    
    # Если не удалось найти uses-permission, добавляем после тега manifest
    if ! grep -q "android.permission.POST_NOTIFICATIONS" "$TEMP_FILE"; then
      sed '/<manifest/a\    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />' "$MANIFEST_PATH" > "$TEMP_FILE"
    fi
    
    # Копируем обратно и удаляем временный файл
    cat "$TEMP_FILE" > "$MANIFEST_PATH"
    rm "$TEMP_FILE"
    
    echo "✅ Манифест обновлен"
    
    # Вывод отладочной информации
    echo "📋 Содержимое обновленного манифеста (первые 20 строк):"
    head -n 20 "$MANIFEST_PATH"
  fi
done

# Также принудительно модифицируем основные манифесты
MAIN_MANIFEST="android/app/src/main/AndroidManifest.xml"
if [ -f "$MAIN_MANIFEST" ]; then
  echo "🔄 Обеспечиваем наличие разрешения в основном манифесте $MAIN_MANIFEST"
  
  # Создаем новый манифест с гарантированным разрешением
  cat > "$MAIN_MANIFEST.new" << EOF
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools"
    package="ru.checoden.onlineloans">
    
    <!-- Базовые разрешения -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    
    <!-- Разрешение для уведомлений на Android 13+ -->
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    
    <!-- Разрешения для Firebase и OneSignal -->
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    <uses-permission android:name="android.permission.VIBRATE" />
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
    
EOF

  # Добавляем оставшуюся часть манифеста начиная со строки, содержащей <application
  grep -n "<application" "$MAIN_MANIFEST" | cut -d ':' -f 1 | xargs -I{} tail -n +{} "$MAIN_MANIFEST" >> "$MAIN_MANIFEST.new"
  
  # Проверяем, что в новом файле есть нужные части
  if grep -q "<application" "$MAIN_MANIFEST.new" && grep -q "android.permission.POST_NOTIFICATIONS" "$MAIN_MANIFEST.new"; then
    mv "$MAIN_MANIFEST.new" "$MAIN_MANIFEST"
    echo "✅ Основной манифест успешно обновлен с явным разрешением POST_NOTIFICATIONS"
  else
    echo "❌ Ошибка при обновлении основного манифеста, оставляем исходный файл"
    rm "$MAIN_MANIFEST.new"
  fi
fi

echo "✅ Процесс обновления манифестов завершен"