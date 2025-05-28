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

# Добавляем разрешения по одному перед закрывающим тегом </manifest>
echo "Adding POST_NOTIFICATIONS permission..."
sed -i 's|</manifest>|    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />\n</manifest>|' "$MANIFEST_PATH"

echo "Adding WAKE_LOCK permission..."
sed -i 's|</manifest>|    <uses-permission android:name="android.permission.WAKE_LOCK" />\n</manifest>|' "$MANIFEST_PATH"

echo "Adding VIBRATE permission..."
sed -i 's|</manifest>|    <uses-permission android:name="android.permission.VIBRATE" />\n</manifest>|' "$MANIFEST_PATH"

echo "Adding RECEIVE_BOOT_COMPLETED permission..."
sed -i 's|</manifest>|    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />\n</manifest>|' "$MANIFEST_PATH"

echo "Adding Google Cloud Messaging permission..."
sed -i 's|</manifest>|    <uses-permission android:name="com.google.android.c2dm.permission.RECEIVE" />\n</manifest>|' "$MANIFEST_PATH"

echo "Adding ACCESS_NETWORK_STATE permission..."
sed -i 's|</manifest>|    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />\n</manifest>|' "$MANIFEST_PATH"

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