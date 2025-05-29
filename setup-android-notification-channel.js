/**
 * Скрипт для настройки канала уведомлений Android для push-уведомлений
 * 
 * Этот скрипт нужно запустить после выполнения команд:
 * 1. npx cap add android
 * 2. npx cap sync android
 * 
 * Он добавит код создания канала уведомлений в файл MainActivity.java
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ES модули не имеют __dirname, поэтому создаем его
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Путь к директории проекта Capacitor
const CAPACITOR_DIR = 'capacitor-app';

/**
 * Проверяет и корректирует идентификатор пакета в build.gradle и AndroidManifest.xml
 */
function checkAndFixPackageId() {
  const expectedPackageId = 'ru.checoden.onlineloans';
  
  // Проверяем и обновляем build.gradle
  const buildGradlePath = path.join(CAPACITOR_DIR, 'android/app/build.gradle');
  if (fs.existsSync(buildGradlePath)) {
    let buildGradle = fs.readFileSync(buildGradlePath, 'utf8');
    
    // Ищем строку с applicationId
    const applicationIdRegex = /applicationId "(.*?)"/;
    const match = buildGradle.match(applicationIdRegex);
    
    if (match && match[1] !== expectedPackageId) {
      console.log(`⚠️ В build.gradle обнаружен неправильный applicationId: ${match[1]}`);
      buildGradle = buildGradle.replace(
        applicationIdRegex,
        `applicationId "${expectedPackageId}"`
      );
      fs.writeFileSync(buildGradlePath, buildGradle);
      console.log(`✅ applicationId в build.gradle обновлен на "${expectedPackageId}"`);
    } else if (match) {
      console.log(`✅ applicationId в build.gradle уже установлен правильно: ${match[1]}`);
    } else {
      console.warn('⚠️ Не удалось найти applicationId в build.gradle');
    }
  } else {
    console.error('❌ Файл build.gradle не найден! Убедитесь, что вы выполнили npx cap add android');
  }
  
  // Проверяем и обновляем AndroidManifest.xml
  const manifestPath = path.join(CAPACITOR_DIR, 'android/app/src/main/AndroidManifest.xml');
  if (fs.existsSync(manifestPath)) {
    let manifest = fs.readFileSync(manifestPath, 'utf8');
    
    // Ищем строку с package
    const packageRegex = /package="(.*?)"/;
    const match = manifest.match(packageRegex);
    
    // Добавляем push-разрешения если их нет
    if (!manifest.includes('android.permission.POST_NOTIFICATIONS')) {
      console.log('⚙️ Добавляем push-разрешения в AndroidManifest.xml');
      const pushPermissions = `
    <!-- Push notification permissions -->
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    <uses-permission android:name="android.permission.VIBRATE" />
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
    <uses-permission android:name="com.google.android.c2dm.permission.RECEIVE" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />`;
      
      manifest = manifest.replace('</manifest>', pushPermissions + '\n</manifest>');
      fs.writeFileSync(manifestPath, manifest);
      console.log('✅ Push-разрешения добавлены в AndroidManifest.xml');
    } else {
      console.log('✅ Push-разрешения уже есть в AndroidManifest.xml');
    }
    
    if (match && match[1] !== expectedPackageId) {
      console.log(`⚠️ В AndroidManifest.xml обнаружен неправильный package: ${match[1]}`);
      manifest = manifest.replace(
        packageRegex,
        `package="${expectedPackageId}"`
      );
      fs.writeFileSync(manifestPath, manifest);
      console.log(`✅ package в AndroidManifest.xml обновлен на "${expectedPackageId}"`);
    } else if (match) {
      console.log(`✅ package в AndroidManifest.xml уже установлен правильно: ${match[1]}`);
    } else {
      console.warn('⚠️ Не удалось найти package в AndroidManifest.xml');
    }
  } else {
    console.error('❌ Файл AndroidManifest.xml не найден! Убедитесь, что вы выполнили npx cap add android');
  }
}

/**
 * Настраивает канал уведомлений для Android
 */
function setupNotificationChannel() {
  // Путь к MainActivity.java после создания Android проекта
  const javaPackagePath = path.join(CAPACITOR_DIR, 'android/app/src/main/java/ru/checoden/onlineloans');
  const mainActivityPath = path.join(javaPackagePath, 'MainActivity.java');
  
  // Проверяем существование директории и файла
  if (!fs.existsSync(javaPackagePath)) {
    console.error('❌ Директория для Android кода не найдена!');
    console.error(`Сначала выполните: npx cap add android`);
    return false;
  }
  
  if (!fs.existsSync(mainActivityPath)) {
    console.error('❌ Файл MainActivity.java не найден!');
    console.error(`Убедитесь, что выполнили npx cap add android`);
    return false;
  }
  
  // Читаем содержимое MainActivity.java
  let javaCode = fs.readFileSync(mainActivityPath, 'utf8');
  
  // Проверяем, добавлен ли уже код для канала уведомлений
  if (javaCode.includes('NotificationChannel channel')) {
    console.log('✅ Код для канала уведомлений уже добавлен в MainActivity.java');
    return true;
  }
  
  console.log('📝 Модифицирую файл MainActivity.java...');
  
  // Добавляем необходимые импорты, если их еще нет
  if (!javaCode.includes('import android.app.NotificationChannel;')) {
    javaCode = javaCode.replace(
      'import android.os.Bundle;', 
      'import android.os.Bundle;\nimport android.app.NotificationChannel;\nimport android.app.NotificationManager;\nimport android.content.Context;\nimport android.Manifest;\nimport android.content.pm.PackageManager;\nimport androidx.core.content.ContextCompat;\nimport androidx.core.app.ActivityCompat;'
    );
  }
  
  // Добавляем код создания канала уведомлений и запрос POST_NOTIFICATIONS в метод onCreate
  javaCode = javaCode.replace(
    'public void onCreate(Bundle savedInstanceState) {\n    super.onCreate(savedInstanceState);',
    `public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    
    // Регистрируем канал уведомлений для OneSignal
    if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
        NotificationChannel channel = new NotificationChannel(
            "займы-онлайн-уведомления",
            "Уведомления о займах",
            NotificationManager.IMPORTANCE_DEFAULT
        );
        channel.setDescription("Получайте уведомления о новых предложениях займов");
        
        NotificationManager notificationManager = 
            (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        notificationManager.createNotificationChannel(channel);
        
        System.out.println("Канал уведомлений 'займы-онлайн-уведомления' создан");
    }
    
    // Запрашиваем разрешение POST_NOTIFICATIONS для Android 13+
    if (android.os.Build.VERSION.SDK_INT >= 33) {
        System.out.println("🔍 Android версия: " + android.os.Build.VERSION.SDK_INT + " (требуется 33+)");
        int permissionCheck = ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS);
        System.out.println("🔍 Статус разрешения POST_NOTIFICATIONS: " + permissionCheck + " (0=предоставлено, -1=отклонено)");
        
        if (permissionCheck != PackageManager.PERMISSION_GRANTED) {
            System.out.println("🚀 ЗАПРАШИВАЕМ разрешение POST_NOTIFICATIONS для Android 13+");
            ActivityCompat.requestPermissions(this, new String[]{Manifest.permission.POST_NOTIFICATIONS}, 1001);
        } else {
            System.out.println("✅ Разрешение POST_NOTIFICATIONS уже предоставлено");
        }
    } else {
        System.out.println("ℹ️ Android версия " + android.os.Build.VERSION.SDK_INT + " - POST_NOTIFICATIONS не требуется");
    }
    
    // Запрашиваем разрешения на показ уведомлений для Android 13+ (API 33+)
    if (android.os.Build.VERSION.SDK_INT >= 33) {
        if (checkSelfPermission(android.Manifest.permission.POST_NOTIFICATIONS) != android.content.pm.PackageManager.PERMISSION_GRANTED) {
            System.out.println("Запрашиваем разрешение POST_NOTIFICATIONS для Android 13+");
            requestPermissions(new String[] { android.Manifest.permission.POST_NOTIFICATIONS }, 100);
        } else {
            System.out.println("Разрешение POST_NOTIFICATIONS уже получено");
        }
    }
    
    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        System.out.println("📋 Результат запроса разрешений - код: " + requestCode);
        
        if (requestCode == 1001) {
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                System.out.println("✅ Пользователь РАЗРЕШИЛ POST_NOTIFICATIONS");
            } else {
                System.out.println("❌ Пользователь ОТКЛОНИЛ POST_NOTIFICATIONS");
            }
        }
    }`
  );
  
  try {
    // Записываем изменения обратно в файл
    fs.writeFileSync(mainActivityPath, javaCode);
    console.log('✅ Код для канала уведомлений и запрос POST_NOTIFICATIONS успешно добавлен в MainActivity.java');
    return true;
  } catch (error) {
    console.error('❌ Ошибка при записи в файл MainActivity.java:', error);
    return false;
  }
}

// Запускаем проверки и настройку
console.log('🔍 Проверяю и корректирую идентификатор пакета...');
checkAndFixPackageId();

console.log('\n🔔 Начинаю настройку канала уведомлений для Android...');
if (setupNotificationChannel()) {
  console.log('\n✅ Канал уведомлений успешно настроен!');
  console.log('\n📱 Теперь вы можете продолжить сборку APK:');
  console.log('1. Откройте Android Studio: npx cap open android');
  console.log('2. Выполните сборку приложения (Build > Build Bundle(s) / APK(s) > Build APK(s))');
  
  console.log('\n🔔 Важно! Для работы push-уведомлений:');
  console.log('1. Убедитесь, что google-services.json в папке capacitor-app содержит правильный package_name: ru.checoden.onlineloans');
  console.log('2. Убедитесь, что файл создан для ЭТОГО проекта в Firebase Console и содержит правильные API-ключи');
} else {
  console.log('❌ Не удалось настроить канал уведомлений');
  console.log('Проверьте, что вы выполнили все предварительные шаги:');
  console.log('1. node prepare-for-apk.js');
  console.log('2. cd capacitor-app && npm install');
  console.log('3. npx cap add android');
  console.log('4. npx cap sync android');
}