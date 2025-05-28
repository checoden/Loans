#!/bin/bash

# Скрипт для добавления разрешения POST_NOTIFICATIONS в AndroidManifest.xml
# Это необходимо для работы push-уведомлений на Android 13+

MANIFEST_PATH="android/app/src/main/AndroidManifest.xml"

# Проверяем существование файла
if [ ! -f "$MANIFEST_PATH" ]; then
  echo "❌ Ошибка: файл ManifestAndroid.xml не найден по пути $MANIFEST_PATH"
  exit 1
fi

# Проверяем, есть ли уже разрешение POST_NOTIFICATIONS
if grep -q "android.permission.POST_NOTIFICATIONS" "$MANIFEST_PATH"; then
  echo "✅ Разрешение POST_NOTIFICATIONS уже добавлено в AndroidManifest.xml"
  exit 0
fi

# Проверяем, есть ли тег tools в объявлении манифеста
if ! grep -q "xmlns:tools=" "$MANIFEST_PATH"; then
  echo "⚙️ Добавляем объявление пространства имен tools в манифест"
  # Заменяем строку с <manifest xmlns:android= на <manifest xmlns:android= xmlns:tools=
  sed -i 's/<manifest xmlns:android="http:\/\/schemas.android.com\/apk\/res\/android"/<manifest xmlns:android="http:\/\/schemas.android.com\/apk\/res\/android" xmlns:tools="http:\/\/schemas.android.com\/tools"/g' "$MANIFEST_PATH"
fi

# Добавляем все разрешения для push-уведомлений перед закрывающим тегом </manifest>
echo "⚙️ Добавляем разрешения для push-уведомлений в AndroidManifest.xml"
sed -i 's/<\/manifest>/    <!-- Разрешения для push-уведомлений -->\n    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" tools:targetApi="33" \/>\n    <uses-permission android:name="android.permission.WAKE_LOCK" \/>\n    <uses-permission android:name="android.permission.VIBRATE" \/>\n    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" \/>\n    <uses-permission android:name="com.google.android.c2dm.permission.RECEIVE" \/>\n    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" \/>\n<\/manifest>/g' "$MANIFEST_PATH"

# Проверяем, что разрешение добавлено
if grep -q "android.permission.POST_NOTIFICATIONS" "$MANIFEST_PATH"; then
  echo "✅ Разрешение POST_NOTIFICATIONS успешно добавлено в AndroidManifest.xml"
else
  echo "❌ Ошибка: не удалось добавить разрешение POST_NOTIFICATIONS"
  exit 1
fi

exit 0