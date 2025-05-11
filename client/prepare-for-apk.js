/**
 * Скрипт для подготовки проекта к сборке в APK
 * 
 * Этот скрипт копирует необходимые файлы и настраивает проект
 * для компиляции с помощью Cordova или Capacitor
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Конфигурация
const CONFIG = {
  // Путь к файлам конфигурации
  configPath: path.join(__dirname, 'app-config.json'),
  // Путь к шаблону Firebase
  firebaseTemplatePath: path.join(__dirname, 'google-services.json.template'),
  // Директории для создания
  dirsToCreate: [
    'cordova-app',
    'cordova-app/www',
    'cordova-app/res',
    'cordova-app/res/android',
    'cordova-app/res/ios',
    'cordova-app/res/android/drawable-hdpi',
    'cordova-app/res/android/drawable-mdpi',
    'cordova-app/res/android/drawable-xhdpi',
    'cordova-app/res/android/drawable-xxhdpi',
    'cordova-app/res/android/drawable-xxxhdpi',
    'cordova-app/res/ios/AppIcon.appiconset',
    'cordova-app/res/ios/splash',
  ],
  // Файлы для копирования
  filesToCopy: [
    {
      src: path.join(__dirname, 'src/assets/app_icon.svg'),
      dest: 'cordova-app/res/icon.svg'
    },
    {
      src: path.join(__dirname, 'src/assets/ic_stat_onesignal_default.svg'),
      dest: 'cordova-app/res/android/notification_icon.svg'
    },
    {
      src: path.join(__dirname, 'google-services.json.template'),
      dest: 'cordova-app/google-services.json'
    }
  ]
};

// Основная функция
async function prepareForApk() {
  console.log('Подготовка проекта для сборки APK');
  
  try {
    // 1. Создаем необходимые директории
    console.log('Создание директорий...');
    CONFIG.dirsToCreate.forEach(dir => {
      const dirPath = path.join(__dirname, dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`  Создана директория: ${dir}`);
      }
    });
    
    // 2. Копируем файлы
    console.log('Копирование файлов...');
    CONFIG.filesToCopy.forEach(file => {
      const destPath = path.join(__dirname, file.dest);
      try {
        fs.copyFileSync(file.src, destPath);
        console.log(`  Скопирован файл: ${file.src} -> ${file.dest}`);
      } catch (err) {
        console.error(`  Ошибка при копировании файла ${file.src}:`, err.message);
      }
    });
    
    // 3. Проверяем наличие конфигурации
    console.log('Проверка конфигурации...');
    if (!fs.existsSync(CONFIG.configPath)) {
      console.error('  Ошибка: файл app-config.json не найден!');
      process.exit(1);
    }
    
    // 4. Создаем config.xml для Cordova
    console.log('Создание config.xml для Cordova...');
    const appConfig = JSON.parse(fs.readFileSync(CONFIG.configPath, 'utf8'));
    
    const configXml = `<?xml version='1.0' encoding='utf-8'?>
<widget id="${appConfig.app.package}" version="${appConfig.app.versionName}" 
        xmlns="http://www.w3.org/ns/widgets" 
        xmlns:cdv="http://cordova.apache.org/ns/1.0">
    <name>${appConfig.app.name}</name>
    <description>
        Приложение для быстрого поиска и сравнения займов от МФО
    </description>
    <author email="info@zaymyonline.ru" href="https://zaymyonline.ru">
        Займы онлайн Team
    </author>
    <content src="index.html" />
    <allow-intent href="http://*/*" />
    <allow-intent href="https://*/*" />
    <allow-intent href="tel:*" />
    <allow-intent href="sms:*" />
    <allow-intent href="mailto:*" />
    <allow-intent href="geo:*" />
    
    <preference name="ScrollEnabled" value="false" />
    <preference name="BackupWebStorage" value="none" />
    <preference name="SplashMaintainAspectRatio" value="true" />
    <preference name="FadeSplashScreenDuration" value="300" />
    <preference name="SplashShowOnlyFirstTime" value="false" />
    <preference name="SplashScreen" value="screen" />
    <preference name="SplashScreenDelay" value="3000" />
    <preference name="AllowInlineMediaPlayback" value="true" />
    
    <platform name="android">
        <preference name="AndroidXEnabled" value="true" />
        <preference name="android-minSdkVersion" value="${appConfig.buildSettings.android.minSdkVersion}" />
        <preference name="android-targetSdkVersion" value="${appConfig.buildSettings.android.targetSdkVersion}" />
        
        <!-- Permissions -->
        ${appConfig.android.permissions.map(permission => 
            `<config-file parent="/manifest" target="AndroidManifest.xml">
                <uses-permission android:name="${permission}" />
            </config-file>`
        ).join('\n        ')}
        
        <!-- OneSignal notification settings -->
        <config-file parent="/manifest/application" target="AndroidManifest.xml">
            <meta-data android:name="com.onesignal.NotificationServiceExtension"
                android:value="ru.zaymyonline.app.NotificationServiceExtension" />
        </config-file>
    </platform>
    
    <platform name="ios">
        <preference name="deployment-target" value="${appConfig.buildSettings.ios.deploymentTarget}" />
        <preference name="AllowInlineMediaPlayback" value="true" />
        
        <!-- iOS capabilities -->
        <config-file parent="UIBackgroundModes" target="*-Info.plist">
            <array>
                <string>remote-notification</string>
            </array>
        </config-file>
        
        <!-- OneSignal settings -->
        <config-file parent="OneSignal_app_groups_key" target="*-Info.plist">
            <string>group.${appConfig.ios.bundleIdentifier}.onesignal</string>
        </config-file>
    </platform>
    
    <plugin name="cordova-plugin-whitelist" spec="^1.3.4" />
    <plugin name="cordova-plugin-statusbar" spec="^2.4.3" />
    <plugin name="cordova-plugin-device" spec="^2.0.3" />
    <plugin name="cordova-plugin-splashscreen" spec="^5.0.4" />
    <plugin name="cordova-plugin-ionic-keyboard" spec="^2.2.0" />
    <plugin name="onesignal-cordova-plugin" />
</widget>`;
    
    fs.writeFileSync(path.join(__dirname, 'cordova-app/config.xml'), configXml);
    console.log('  Создан файл config.xml для Cordova');
    
    // 5. Создаем пустой файл для OneSignal notification service extension
    console.log('Создание класса NotificationServiceExtension для Android...');
    const notificationServiceExtension = `package ru.zaymyonline.app;

import com.onesignal.OSNotificationReceivedEvent;
import com.onesignal.OneSignal.OSRemoteNotificationReceivedHandler;

public class NotificationServiceExtension implements OSRemoteNotificationReceivedHandler {
    @Override
    public void remoteNotificationReceived(Context context, OSNotificationReceivedEvent notificationReceivedEvent) {
        // Здесь можно модифицировать уведомления перед показом
        // Например, добавить данные или изменить звук
        
        // Не забудьте вызвать complete() для показа уведомления
        notificationReceivedEvent.complete(notificationReceivedEvent.getNotification());
    }
}`;
    
    // 6. Вывод информации о завершении
    console.log('\nПодготовка завершена успешно!');
    console.log('\nДля сборки APK:');
    console.log('1. Установите Cordova CLI: npm install -g cordova');
    console.log('2. Перейдите в директорию cordova-app');
    console.log('3. Выполните: cordova platform add android');
    console.log('4. Соберите приложение: cordova build android');
    console.log('\nПеред сборкой не забудьте:');
    console.log('1. Заменить google-services.json валидным файлом из Firebase');
    console.log('2. Обновить OneSignal APP_ID и REST_API_KEY в .env файле');
    
  } catch (error) {
    console.error('Ошибка при подготовке проекта:', error);
    process.exit(1);
  }
}

// Запуск скрипта
prepareForApk();