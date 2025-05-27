#!/bin/bash

# Скрипт для добавления настроек подписи в capacitor.build.gradle
KEYSTORE_PATH="$1"
GRADLE_FILE="capacitor.build.gradle"

echo "Добавляем настройки подписи в $GRADLE_FILE..."

# Добавляем compileSdk после android {
sed -i "/android {/a\\    compileSdk 34" "$GRADLE_FILE"

# Добавляем signingConfigs после compileSdk
sed -i "/compileSdk 34/a\\
\\    signingConfigs {\\
\\        release {\\
\\            storeFile file('android-keystore.keystore')\\
\\            storePassword System.getenv('KEYSTORE_PASSWORD')\\
\\            keyAlias System.getenv('KEY_ALIAS')\\
\\            keyPassword System.getenv('KEY_PASSWORD')\\
\\            v1SigningEnabled true\\
\\            v2SigningEnabled true\\
\\        }\\
\\    }" "$GRADLE_FILE"

# Добавляем signingConfig в buildTypes release
sed -i "/buildTypes {/,/release {/{/release {/a\\            signingConfig signingConfigs.release
}" "$GRADLE_FILE"

echo "☑️ Настройки подписи добавлены в $GRADLE_FILE"