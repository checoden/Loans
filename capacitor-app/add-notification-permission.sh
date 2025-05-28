#!/bin/bash

# Скрипт для добавления разрешений push-уведомлений в AndroidManifest.xml

MANIFEST_PATH="android/app/src/main/AndroidManifest.xml"

echo "🔧 Начинаем добавление разрешений push-уведомлений..."
echo "📂 Путь к манифесту: $MANIFEST_PATH"

# Проверяем существование файла
if [ ! -f "$MANIFEST_PATH" ]; then
  echo "❌ Ошибка: файл AndroidManifest.xml не найден по пути $MANIFEST_PATH"
  ls -la android/app/src/main/ || echo "Директория не существует"
  exit 1
fi

echo "✅ Файл AndroidManifest.xml найден"

# Проверяем, есть ли уже разрешение POST_NOTIFICATIONS
if grep -q "android.permission.POST_NOTIFICATIONS" "$MANIFEST_PATH"; then
  echo "✅ Разрешения push-уведомлений уже добавлены"
  exit 0
fi

echo "⚙️ Добавляем разрешения push-уведомлений в AndroidManifest.xml"

# Создаем блок разрешений
PERMISSIONS_BLOCK='
    <!-- Push notification permissions -->
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    <uses-permission android:name="android.permission.VIBRATE" />
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
    <uses-permission android:name="com.google.android.c2dm.permission.RECEIVE" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
'

# Добавляем разрешения перед закрывающим тегом </manifest>
sed -i "s|</manifest>|$PERMISSIONS_BLOCK</manifest>|" "$MANIFEST_PATH"

# Проверяем, что разрешения добавлены
if grep -q "android.permission.POST_NOTIFICATIONS" "$MANIFEST_PATH"; then
  echo "✅ Все разрешения push-уведомлений успешно добавлены в AndroidManifest.xml"
  echo "📋 Добавленные разрешения:"
  grep "uses-permission" "$MANIFEST_PATH" | tail -6
else
  echo "❌ Ошибка: не удалось добавить разрешения"
  echo "📄 Содержимое манифеста:"
  cat "$MANIFEST_PATH"
  exit 1
fi

exit 0