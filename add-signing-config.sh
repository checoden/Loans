#!/bin/bash

# Скрипт для добавления настроек подписи в build.gradle для Capacitor
echo "Настраиваем подпись APK для Capacitor..."

# Проверяем что мы в правильной директории
if [ ! -f "build.gradle" ]; then
    echo "❌ Ошибка: файл build.gradle не найден"
    exit 1
fi

echo "📁 Текущая директория: $(pwd)"
echo "📄 Редактируем файл: build.gradle"

# Создаем временный файл с правильными настройками подписи
cat > temp_signing_config.txt << 'EOF'

    signingConfigs {
        release {
            if (System.getenv("KEYSTORE_PASSWORD")) {
                storeFile file("app/android-keystore.keystore")
                storePassword System.getenv("KEYSTORE_PASSWORD")
                keyAlias System.getenv("KEY_ALIAS")
                keyPassword System.getenv("KEY_PASSWORD")
                v1SigningEnabled true
                v2SigningEnabled true
            }
        }
    }
EOF

# Добавляем compileSdk если его нет
if ! grep -q "compileSdk" build.gradle; then
    sed -i '/android {/a\    compileSdk 34' build.gradle
    echo "✅ Добавлен compileSdk 34"
fi

# Добавляем signingConfigs если их нет
if ! grep -q "signingConfigs" build.gradle; then
    # Находим строку с android { и добавляем после неё
    sed -i '/android {/r temp_signing_config.txt' build.gradle
    echo "✅ Добавлены настройки signingConfigs"
fi

# Обновляем buildTypes release чтобы использовать signingConfig
if ! grep -q "signingConfig signingConfigs.release" build.gradle; then
    # Ищем release { в buildTypes и добавляем signingConfig
    sed -i '/buildTypes {/,/release {/{
        /release {/ {
            a\            if (signingConfigs.release.storeFile) {
            a\                signingConfig signingConfigs.release
            a\            }
        }
    }' build.gradle
    echo "✅ Добавлена ссылка на signing config в release build"
fi

# Удаляем временный файл
rm -f temp_signing_config.txt

echo "☑️ Настройки подписи успешно добавлены в build.gradle"
echo "🔍 Проверяем результат..."

# Показываем что получилось
if grep -q "signingConfigs" build.gradle && grep -q "signingConfig signingConfigs.release" build.gradle; then
    echo "✅ Все настройки подписи добавлены корректно"
else
    echo "❌ Ошибка: не все настройки добавлены"
    echo "Содержимое build.gradle:"
    cat build.gradle
fi