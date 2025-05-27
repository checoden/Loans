#!/bin/bash

# Скрипт для добавления настроек подписи в build.gradle
echo "Добавляем настройки подписи в build.gradle..."

# Добавляем compileSdk если его нет
if ! grep -q "compileSdk" build.gradle; then
    sed -i "/android {/a\\    compileSdk 34" build.gradle
fi

# Добавляем signingConfigs если их нет
if ! grep -q "signingConfigs" build.gradle; then
    sed -i "/compileSdk/a\\
    signingConfigs {\\
        release {\\
            storeFile file('android-keystore.keystore')\\
            storePassword System.getenv('KEYSTORE_PASSWORD')\\
            keyAlias System.getenv('KEY_ALIAS')\\
            keyPassword System.getenv('KEY_PASSWORD')\\
            v1SigningEnabled true\\
            v2SigningEnabled true\\
        }\\
    }" build.gradle
fi

# Добавляем signingConfig в buildTypes release если его нет
if ! grep -q "signingConfig signingConfigs.release" build.gradle; then
    sed -i "/buildTypes {/,/release {/{/release {/a\\            signingConfig signingConfigs.release
    }" build.gradle
fi

echo "☑️ Настройки подписи добавлены в build.gradle"