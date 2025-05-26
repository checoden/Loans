#!/bin/bash

# Скрипт для добавления настроек подписи в build.gradle
KEYSTORE_PATH="$1"

echo "Добавляем настройки подписи в build.gradle..."

# Добавляем signingConfigs после android {
sed -i "/android {/a\\
    signingConfigs {\\
        release {\\
            storeFile file(\"android-keystore.keystore\")\\
            storePassword System.getenv(\"KEYSTORE_PASSWORD\")\\
            keyAlias System.getenv(\"KEY_ALIAS\")\\
            keyPassword System.getenv(\"KEY_PASSWORD\")\\
            v1SigningEnabled true\\
            v2SigningEnabled true\\
        }\\
    }" build.gradle

# Добавляем signingConfig в buildTypes release
sed -i "/release {/a\\            signingConfig signingConfigs.release" build.gradle

echo "☑️ Настройки подписи добавлены в build.gradle"