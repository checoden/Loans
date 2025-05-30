/**
 * Принудительное добавление POST_NOTIFICATIONS во время сборки APK
 * Этот скрипт запускается прямо перед gradle build
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function forceAddPermissions() {
  console.log('🚨 ПРИНУДИТЕЛЬНАЯ ЗАМЕНА МАНИФЕСТА');
  
  // В CI скрипт запускается из корня проекта после cd ../..
  const manifestPath = path.join(__dirname, 'capacitor-app', 'android', 'app', 'src', 'main', 'AndroidManifest.xml');
  const templatePath = path.join(__dirname, 'capacitor-app', 'android', 'app', 'src', 'main', 'AndroidManifest-template.xml');
  
  // Если файлы не найдены в относительном пути, ищем в текущей директории
  let finalManifestPath = manifestPath;
  let finalTemplatePath = templatePath;
  
  if (!fs.existsSync(templatePath)) {
    // Альтернативный путь для CI окружения
    finalManifestPath = path.join(process.cwd(), 'capacitor-app', 'android', 'app', 'src', 'main', 'AndroidManifest.xml');
    finalTemplatePath = path.join(process.cwd(), 'capacitor-app', 'android', 'app', 'src', 'main', 'AndroidManifest-template.xml');
  }
  
  console.log('📁 Используемые пути:');
  console.log('  Manifest:', finalManifestPath);
  console.log('  Template:', finalTemplatePath);
  
  // Если шаблон не найден, создаем его с нужными разрешениями
  let templateManifest;
  
  if (!fs.existsSync(finalTemplatePath)) {
    console.log('📝 Шаблон не найден, создаем с POST_NOTIFICATIONS разрешениями');
    
    templateManifest = `<?xml version='1.0' encoding='utf-8'?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools"
    package="ru.checoden.onlineloans">

    <!-- ============ КРИТИЧЕСКИЕ РАЗРЕШЕНИЯ ДЛЯ PUSH-УВЕДОМЛЕНИЙ ============ -->
    <!-- Android 13+ требует объявление POST_NOTIFICATIONS -->
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" tools:targetApi="33" />
    
    <!-- Базовые разрешения для OneSignal -->
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    <uses-permission android:name="android.permission.VIBRATE" />
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
    
    <!-- Google Play Services для push -->
    <uses-permission android:name="com.google.android.c2dm.permission.RECEIVE" />
    
    <!-- Сетевые разрешения -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    
    <!-- Capacitor базовые разрешения -->
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
    <!-- ===================================================================== -->

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/AppTheme"
        android:usesCleartextTraffic="true">

        <activity
            android:exported="true"
            android:launchMode="singleTask"
            android:name="ru.checoden.onlineloans.MainActivity"
            android:theme="@style/AppTheme.NoActionBarLaunch">

            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>

        </activity>

        <provider
            android:name="androidx.core.content.FileProvider"
            android:authorities="\${applicationId}.fileprovider"
            android:exported="false"
            android:grantUriPermissions="true">
            <meta-data
                android:name="android.support.FILE_PROVIDER_PATHS"
                android:resource="@xml/file_paths"></meta-data>
        </provider>
    </application>

    <!-- Permissions -->
    <uses-permission android:name="android.permission.INTERNET" />
</manifest>`;
    
    // Сохраняем шаблон для будущего использования
    const templateDir = path.dirname(finalTemplatePath);
    if (!fs.existsSync(templateDir)) {
      fs.mkdirSync(templateDir, { recursive: true });
    }
    fs.writeFileSync(finalTemplatePath, templateManifest);
    console.log('✅ Шаблон манифеста создан');
  } else {
    // Читаем существующий шаблон
    templateManifest = fs.readFileSync(finalTemplatePath, 'utf8');
    console.log('📄 Используем существующий шаблон');
  }
  console.log(`📄 Размер шаблона: ${templateManifest.length} символов`);
  
  // Полностью заменяем манифест на наш шаблон
  fs.writeFileSync(finalManifestPath, templateManifest);
  console.log('✅ AndroidManifest.xml полностью заменен на шаблон с POST_NOTIFICATIONS');
  
  // Финальная проверка
  const finalManifest = fs.readFileSync(finalManifestPath, 'utf8');
  if (finalManifest.includes('POST_NOTIFICATIONS')) {
    console.log('✅ POST_NOTIFICATIONS ГАРАНТИРОВАННО ПРИСУТСТВУЕТ');
    console.log(`📏 Финальный размер: ${finalManifest.length} символов`);
  } else {
    console.error('❌ КРИТИЧЕСКАЯ ОШИБКА: POST_NOTIFICATIONS НЕ НАЙДЕН');
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  forceAddPermissions();
}