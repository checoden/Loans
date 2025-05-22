#!/bin/bash

# Скрипт для создания необходимых директорий и файлов для Android

# Создаем директории для XML ресурсов
mkdir -p android/app/src/main/res/xml
mkdir -p android/app/src/main/res/drawable

# Копируем network_security_config.xml, если он существует
if [ -f "android/app/src/main/res/xml/network_security_config.xml" ]; then
  echo "✅ network_security_config.xml уже существует"
else
  # Копируем файл из шаблона, если он существует
  if [ -f "../capacitor-app/android/app/src/main/res/xml/network_security_config.xml" ]; then
    cp ../capacitor-app/android/app/src/main/res/xml/network_security_config.xml android/app/src/main/res/xml/
    echo "✅ network_security_config.xml скопирован из шаблона"
  else
    # Создаем базовый файл конфигурации безопасности сети
    cat > android/app/src/main/res/xml/network_security_config.xml << 'EOF'
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <base-config cleartextTrafficPermitted="false">
        <trust-anchors>
            <certificates src="system" />
        </trust-anchors>
    </base-config>
    <domain-config cleartextTrafficPermitted="false">
        <domain includeSubdomains="true">api.onesignal.com</domain>
        <domain includeSubdomains="true">onesignal.com</domain>
        <domain includeSubdomains="true">fcm.googleapis.com</domain>
        <trust-anchors>
            <certificates src="system" />
        </trust-anchors>
    </domain-config>
</network-security-config>
EOF
    echo "✅ network_security_config.xml создан"
  fi
fi

# Создаем иконку уведомлений по умолчанию, если её нет
if [ -f "android/app/src/main/res/drawable/ic_stat_onesignal_default.png" ]; then
  echo "✅ ic_stat_onesignal_default.png уже существует"
else
  # Создаем базовую иконку 24x24 px
  cat > android/app/src/main/res/drawable/ic_stat_onesignal_default.xml << 'EOF'
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="24dp"
    android:height="24dp"
    android:viewportWidth="24"
    android:viewportHeight="24"
    android:tint="#FFFFFF">
  <path
      android:fillColor="@android:color/white"
      android:pathData="M12,2C6.48,2 2,6.48 2,12s4.48,10 10,10 10,-4.48 10,-10S17.52,2 12,2zM13,17h-2v-2h2v2zM13,13h-2L11,7h2v6z"/>
</vector>
EOF
  echo "✅ ic_stat_onesignal_default.xml создан"
fi

echo "✅ Все необходимые директории и файлы для Android созданы"