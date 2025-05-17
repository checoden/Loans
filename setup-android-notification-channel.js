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
      'import android.os.Bundle;\nimport android.app.NotificationChannel;\nimport android.app.NotificationManager;\nimport android.content.Context;'
    );
  }
  
  // Добавляем код создания канала уведомлений в метод onCreate
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
    }`
  );
  
  try {
    // Записываем изменения обратно в файл
    fs.writeFileSync(mainActivityPath, javaCode);
    console.log('✅ Код для канала уведомлений успешно добавлен в MainActivity.java');
    return true;
  } catch (error) {
    console.error('❌ Ошибка при записи в файл MainActivity.java:', error);
    return false;
  }
}

// Запускаем настройку канала уведомлений
console.log('🔔 Начинаю настройку канала уведомлений для Android...');
if (setupNotificationChannel()) {
  console.log('✅ Канал уведомлений успешно настроен!');
  console.log('\n📱 Теперь вы можете продолжить сборку APK:');
  console.log('1. Откройте Android Studio: npx cap open android');
  console.log('2. Выполните сборку приложения (Build > Build Bundle(s) / APK(s) > Build APK(s))');
} else {
  console.log('❌ Не удалось настроить канал уведомлений');
  console.log('Проверьте, что вы выполнили все предварительные шаги:');
  console.log('1. node prepare-for-apk.js');
  console.log('2. cd capacitor-app && npm install');
  console.log('3. npx cap add android');
  console.log('4. npx cap sync android');
}