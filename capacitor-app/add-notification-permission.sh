#!/bin/bash

# Скрипт для добавления разрешения POST_NOTIFICATIONS в AndroidManifest.xml

MANIFEST_PATH="android/app/src/main/AndroidManifest.xml"

if [ ! -f "$MANIFEST_PATH" ]; then
  echo "❌ AndroidManifest.xml не найден по пути $MANIFEST_PATH"
  exit 1
fi

echo "Добавляем разрешение POST_NOTIFICATIONS в AndroidManifest.xml"

# Проверяем, есть ли уже разрешение POST_NOTIFICATIONS
if grep -q "android.permission.POST_NOTIFICATIONS" "$MANIFEST_PATH"; then
  echo "✅ Разрешение POST_NOTIFICATIONS уже добавлено в AndroidManifest.xml"
else
  # Добавляем разрешение POST_NOTIFICATIONS после первого закрывающего тега uses-permission
  sed -i '/<uses-permission /a\    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />' "$MANIFEST_PATH"
  echo "✅ Разрешение POST_NOTIFICATIONS добавлено в AndroidManifest.xml"
fi

# Выводим текущий манифест (для проверки)
echo "Проверяем наличие разрешения POST_NOTIFICATIONS в AndroidManifest:"
grep "uses-permission" "$MANIFEST_PATH"