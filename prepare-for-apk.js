/**
 * Скрипт для подготовки проекта к сборке в APK
 * 
 * Этот скрипт копирует необходимые файлы и настраивает проект
 * для компиляции с помощью Capacitor
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// ES модули не имеют __dirname, поэтому создаем его
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Пути к файлам
const SOURCE_DIR = 'client/src';
const PUBLIC_DIR = 'public';
const CAPACITOR_DIR = 'capacitor-app';
const CONFIG_PATH = path.join(__dirname, 'client/app-config.json');
const FIREBASE_TEMPLATE_PATH = path.join(__dirname, 'client/google-services.json.template');

function copyDirectory(source, destination) {
  // Создаем директорию назначения, если она не существует
  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination, { recursive: true });
  }
  
  // Получаем все файлы и поддиректории в исходной директории
  const files = fs.readdirSync(source);
  
  // Копируем каждый файл/директорию
  for (const file of files) {
    const sourcePath = path.join(source, file);
    const destinationPath = path.join(destination, file);
    
    // Проверяем, является ли это директорией
    if (fs.statSync(sourcePath).isDirectory()) {
      // Если это директория, рекурсивно копируем ее содержимое
      copyDirectory(sourcePath, destinationPath);
    } else {
      // Если это файл, копируем его
      fs.copyFileSync(sourcePath, destinationPath);
    }
  }
}

function createCapacitorConfig() {
  // Создать config для Capacitor с нужными настройками
  const configTs = `
import { CapacitorConfig } from '@capacitor/cli';

// Получаем Replit домен для production
const replitDomain = process.env.REPLIT_DOMAIN || 'onlineloans.replit.app';

const config: CapacitorConfig = {
  appId: 'ru.checoden.onlineloans',
  appName: 'Займы онлайн',
  webDir: 'www',
  bundledWebRuntime: false,
  // Настраиваем сервер для корректной работы https и коммуникации с Replit
  server: {
    // Всегда используем полный URL Replit для мобильного приложения
    url: \`https://\${replitDomain}\`,
    cleartext: true, // Разрешить незашифрованный трафик для отладки
    androidScheme: 'https', // Схема для Android всегда должна быть https
    // Важно: отключаем проверку сертификатов для самоподписанных сертификатов Replit
    allowNavigation: ["*"],
    errorPath: "/error.html" 
  },
  plugins: {
    // Конфигурация OneSignal
    OneSignal: {
      appId: process.env.VITE_ONESIGNAL_APP_ID,
      // Используем полную HTTPS-ссылку для уведомлений
      notificationURLOpenDeeplink: true
    }
  },
  android: {
    // Подпись будет настроена в CI/CD workflow
    
    // Дополнительные настройки безопасности и отладки
    allowMixedContent: true, // Временно разрешаем смешанный контент для отладки
    captureInput: true,      // Разрешить захват ввода для WebView
    webContentsDebuggingEnabled: true // Включаем отладку WebView для диагностики проблем
  }
};

export default config;
`;

  fs.writeFileSync(path.join(CAPACITOR_DIR, 'capacitor.config.ts'), configTs);
  console.log('✅ Создан файл capacitor.config.ts');
}

async function prepareForApk() {
  console.log('🚀 Подготовка проекта для сборки APK с Capacitor');
  
  try {
    // 1. Создаем директорию для Capacitor, если не существует
    if (!fs.existsSync(CAPACITOR_DIR)) {
      fs.mkdirSync(CAPACITOR_DIR, { recursive: true });
      console.log('✅ Создана директория для Capacitor');
    }
    
    // 2. Создаем www директорию в Capacitor
    const wwwDir = path.join(CAPACITOR_DIR, 'www');
    if (!fs.existsSync(wwwDir)) {
      fs.mkdirSync(wwwDir, { recursive: true });
      console.log('✅ Создана директория www');
    }
    
    // 3. Копируем статические файлы в www директорию
    console.log('📋 Копирование файлов из public в www...');
    copyDirectory(PUBLIC_DIR, wwwDir);
    
    // google-services.json будет скопирован в CI/CD pipeline
    console.log('⏭️ Пропускаем копирование google-services.json - будет выполнено в CI/CD');
    
    // 5. Создаем/обновляем capacitor.config.ts
    createCapacitorConfig();
    
    // 6. Создаем package.json в директории Capacitor (если его нет)
    const packageJsonPath = path.join(CAPACITOR_DIR, 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
      const packageJson = {
        name: "microloans-app",
        version: "1.0.0",
        description: "Займы Онлайн - мобильное приложение",
        main: "index.js",
        scripts: {
          "build": "echo 'Building app'"
        },
        dependencies: {
          "@capacitor/android": "^7.2.0",
          "@capacitor/core": "^7.2.0",
          "onesignal-cordova-plugin": "^5.2.13"
        },
        devDependencies: {
          "@capacitor/cli": "^7.2.0"
        }
      };
      
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      console.log('✅ Создан файл package.json');
    }
    
    // 7. Копируем важные файлы из public в www
    const filesToCopy = ['index.html', 'error.html'];
    
    for (const file of filesToCopy) {
      const sourcePath = path.join(PUBLIC_DIR, file);
      const destPath = path.join(wwwDir, file);
      
      if (fs.existsSync(sourcePath)) {
        fs.copyFileSync(sourcePath, destPath);
        console.log(`✅ Скопирован файл ${file}`);
      } else {
        console.warn(`⚠️ Файл ${file} не найден в директории public`);
      }
    }
    
    // Получаем путь к index.html для дальнейших операций
    const publicIndexPath = path.join(PUBLIC_DIR, 'index.html');
    const wwwIndexPath = path.join(wwwDir, 'index.html');
    
    // 8. Добавляем инициализацию OneSignal в index.html с поддержкой HTTPS Replit
    if (fs.existsSync(wwwIndexPath)) {
      let indexHtml = fs.readFileSync(wwwIndexPath, 'utf8');
      
      // Проверяем, содержит ли index.html уже инициализацию OneSignal
      if (!indexHtml.includes('window.OneSignal')) {
        // Ищем тег head
        const headEndIndex = indexHtml.indexOf('</head>');
        
        if (headEndIndex !== -1) {
          // Добавляем скрипт определения Replit и полного URL сайта
          const oneSignalScript = `
  <!-- HTTPS URL Detection -->
  <script>
    // Определяем базовый URL для API и приложения
    function getBaseUrl() {
      // Обнаруживаем режим работы
      const isProd = window.location.hostname.includes('.replit.app') || 
                     window.location.hostname.includes('.repl.co');
      
      // В production используем полный URL
      if (isProd) {
        return window.location.origin;
      }
      
      // В режиме разработки и в мобильном приложении используем полный URL Replit
      return 'https://onlineloans.replit.app';
    }
    window.BASE_URL = getBaseUrl();
    
    // Определяем устройство для корректной инициализации OneSignal
    function detectDevice() {
      // Если доступна Capacitor, то это мобильное приложение
      if (typeof window.Capacitor !== 'undefined') {
        return 'mobile';
      }
      
      const userAgent = navigator.userAgent || '';
      if (userAgent.includes('MicroloansApp') || 
          /android|webos|iphone|ipad|ipod|blackberry|windows phone/i.test(userAgent)) {
        return 'mobile';
      }
      return 'web';
    }
    window.DEVICE_TYPE = detectDevice();
    console.log('Environment initialized:', { baseUrl: window.BASE_URL, deviceType: window.DEVICE_TYPE });
  </script>
  
  <!-- OneSignal Init -->
  <script src="OneSignalSDK.js" async=""></script>
  <script>
    window.OneSignal = window.OneSignal || [];
    OneSignal.push(function() {
      const isCapacitor = window.DEVICE_TYPE === 'mobile';
      
      OneSignal.init({
        appId: "${process.env.VITE_ONESIGNAL_APP_ID || 'a3060406-47e5-4331-91b3-296c3cbdcb86'}",
        notifyButton: {
          enable: !isCapacitor, // Показываем кнопку только на веб-версии
          size: 'medium',
          position: 'bottom-right'
        },
        allowLocalhostAsSecureOrigin: true,
        // Настройка HTTPS для уведомлений
        webhookUrl: window.BASE_URL + "/api/onesignal-webhook",
        // Настройки для Android специфичные
        androidChannelId: "займы-онлайн-уведомления",
        // Единый формат ссылок
        promptOptions: {
          slidedown: {
            prompts: [
              {
                type: "push",
                autoPrompt: true
              }
            ]
          }
        }
      });
      
      // Обработчик для открытия уведомлений
      OneSignal.setNotificationOpenedHandler(function(jsonData) {
        console.log('Notification opened:', jsonData);
        const url = jsonData.notification.additionalData && jsonData.notification.additionalData.url;
        if (url) {
          // В мобильном приложении обрабатываем внутри WebView
          if (isCapacitor && window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Browser) {
            window.Capacitor.Plugins.Browser.open({ url: url });
          } else {
            window.location.href = url;
          }
        }
      });
    });
  </script>`;
          
          indexHtml = indexHtml.slice(0, headEndIndex) + oneSignalScript + indexHtml.slice(headEndIndex);
          fs.writeFileSync(wwwIndexPath, indexHtml);
          console.log('✅ Добавлена инициализация OneSignal в index.html');
        }
      }
    }
    
    console.log('\n✅ Подготовка завершена успешно!');
    console.log('\n📱 Для сборки APK:');
    console.log('1. Установите Android Studio: https://developer.android.com/studio');
    console.log('2. Выполните: npx cap sync android');
    console.log('3. Выполните: npx cap open android');
    console.log('4. Соберите приложение в Android Studio');
    
    console.log('\n⚠️ Перед сборкой не забудьте:');
    console.log('1. Заменить google-services.json валидным файлом из Firebase');
    console.log('2. Проверить переменные окружения VITE_ONESIGNAL_APP_ID и VITE_ONESIGNAL_REST_API_KEY');
    
  } catch (error) {
    console.error('❌ Ошибка при подготовке проекта:', error);
    process.exit(1);
  }
}

// Запуск скрипта
prepareForApk().catch(error => {
  console.error('❌ Произошла ошибка:', error);
  process.exit(1);
});