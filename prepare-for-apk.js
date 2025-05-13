/**
 * Скрипт для подготовки проекта к сборке в APK
 * 
 * Этот скрипт копирует необходимые файлы и настраивает проект
 * для компиляции с помощью Capacitor
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';

// ES Modules не имеют __dirname, создаём его эквивалент
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Конфигурация
const CONFIG = {
  // Директории для создания
  dirsToCreate: [
    'capacitor-app',
    'capacitor-app/www',
    'capacitor-app/resources',
    'capacitor-app/resources/android',
    'capacitor-app/resources/ios',
    'capacitor-app/resources/android/icon',
    'capacitor-app/resources/android/splash',
    'capacitor-app/resources/ios/icon',
    'capacitor-app/resources/ios/splash',
  ],
  // OneSignal App ID для замены в HTML
  oneSignalAppId: "YOUR_ONESIGNAL_APP_ID",
};

// Функция для копирования директории
function copyDirectory(source, destination) {
  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination, { recursive: true });
  }

  const files = fs.readdirSync(source);
  
  for (const file of files) {
    const sourcePath = path.join(source, file);
    const destPath = path.join(destination, file);
    
    if (fs.statSync(sourcePath).isDirectory()) {
      copyDirectory(sourcePath, destPath);
    } else {
      fs.copyFileSync(sourcePath, destPath);
    }
  }
}

// Функция для создания Capacitor конфигурации
function createCapacitorConfig() {
  const configContent = `{
  "appId": "ru.zaymyonline.app",
  "appName": "Займы онлайн",
  "webDir": "www",
  "bundledWebRuntime": false,
  "plugins": {
    "SplashScreen": {
      "launchShowDuration": 3000,
      "launchAutoHide": true,
      "androidScaleType": "CENTER_CROP"
    },
    "PushNotifications": {
      "presentationOptions": ["badge", "sound", "alert"]
    }
  },
  "android": {
    "allowMixedContent": true
  },
  "server": {
    "androidScheme": "https"
  }
}`;

  fs.writeFileSync(path.join(__dirname, 'capacitor-app', 'capacitor.config.json'), configContent);
  console.log('✅ Создан файл capacitor.config.json');
}

// Основная функция
async function prepareForApk() {
  console.log('🚀 Подготовка проекта для сборки APK');
  
  try {
    // 1. Создаем необходимые директории
    console.log('📁 Создание директорий...');
    CONFIG.dirsToCreate.forEach(dir => {
      const dirPath = path.join(__dirname, dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`  ✓ Создана директория: ${dir}`);
      }
    });
    
    // 2. Копируем файлы веб-приложения
    console.log('📋 Копирование файлов веб-приложения...');
    copyDirectory(path.join(__dirname, 'public'), path.join(__dirname, 'capacitor-app', 'www'));
    console.log('  ✓ Скопированы файлы веб-приложения');
    
    // 3. Создаем capacitor.config.json
    console.log('⚙️ Создание конфигурационных файлов...');
    createCapacitorConfig();
    
    // 4. Заменяем OneSignal App ID в HTML файлах
    console.log('🔄 Обновление OneSignal App ID...');
    const indexHtmlPath = path.join(__dirname, 'capacitor-app', 'www', 'index.html');
    const adminHtmlPath = path.join(__dirname, 'capacitor-app', 'www', 'admin.html');
    
    if (fs.existsSync(indexHtmlPath)) {
      let content = fs.readFileSync(indexHtmlPath, 'utf8');
      content = content.replace(/YOUR_ONESIGNAL_APP_ID/g, CONFIG.oneSignalAppId);
      fs.writeFileSync(indexHtmlPath, content);
      console.log('  ✓ Обновлен OneSignal App ID в index.html');
    }
    
    if (fs.existsSync(adminHtmlPath)) {
      let content = fs.readFileSync(adminHtmlPath, 'utf8');
      content = content.replace(/YOUR_ONESIGNAL_APP_ID/g, CONFIG.oneSignalAppId);
      fs.writeFileSync(adminHtmlPath, content);
      console.log('  ✓ Обновлен OneSignal App ID в admin.html');
    }
    
    // 5. Создаем package.json для Capacitor проекта
    const packageJsonContent = `{
  "name": "zaimy-online-app",
  "version": "1.0.0",
  "description": "Мобильное приложение для подбора займов от МФО",
  "main": "index.js",
  "scripts": {
    "start": "npx cap serve",
    "build": "npx cap add android && npx cap sync"
  },
  "keywords": ["loans", "mobile", "app"],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "@capacitor/android": "^5.6.0",
    "@capacitor/core": "^5.6.0",
    "@capacitor/ios": "^5.6.0",
    "onesignal-cordova-plugin": "^3.3.1"
  },
  "devDependencies": {
    "@capacitor/cli": "^5.6.0"
  }
}`;
    
    fs.writeFileSync(path.join(__dirname, 'capacitor-app', 'package.json'), packageJsonContent);
    console.log('✅ Создан файл package.json для Capacitor проекта');
    
    // 6. Инструкции по следующим шагам
    console.log('\n✨ Подготовка завершена успешно!');
    console.log('\n📱 Для сборки APK:');
    console.log('1. Перейдите в директорию capacitor-app');
    console.log('2. Установите зависимости: npm install');
    console.log('3. Добавьте платформу Android: npx cap add android');
    console.log('4. Синхронизируйте проект: npx cap sync');
    console.log('5. Откройте проект в Android Studio: npx cap open android');
    console.log('\n🔔 Перед сборкой не забудьте:');
    console.log('1. Заменить "YOUR_ONESIGNAL_APP_ID" на реальный App ID в capacitor.config.json');
    console.log('2. Настроить OneSignal для поддержки мобильных платформ в консоли OneSignal');
    
  } catch (error) {
    console.error('❌ Ошибка при подготовке проекта:', error);
    process.exit(1);
  }
}

// Запуск скрипта
prepareForApk();