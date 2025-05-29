/**
 * Принудительное добавление POST_NOTIFICATIONS во время сборки APK
 * Этот скрипт запускается прямо перед gradle build
 */

const fs = require('fs');
const path = require('path');

function forceAddPermissions() {
  console.log('🚨 ПРИНУДИТЕЛЬНОЕ ДОБАВЛЕНИЕ POST_NOTIFICATIONS');
  
  const manifestPath = path.join(__dirname, 'capacitor-app', 'android', 'app', 'src', 'main', 'AndroidManifest.xml');
  
  if (!fs.existsSync(manifestPath)) {
    console.error('❌ КРИТИЧЕСКАЯ ОШИБКА: AndroidManifest.xml не найден');
    process.exit(1);
  }
  
  let manifest = fs.readFileSync(manifestPath, 'utf8');
  console.log(`📄 Размер манифеста: ${manifest.length} символов`);
  
  // Удаляем все существующие POST_NOTIFICATIONS если есть
  manifest = manifest.replace(/\s*<uses-permission[^>]*POST_NOTIFICATIONS[^>]*\/>\s*/g, '');
  
  // Принудительно добавляем POST_NOTIFICATIONS в самый конец
  const permissions = [
    'android.permission.POST_NOTIFICATIONS',
    'android.permission.WAKE_LOCK', 
    'android.permission.VIBRATE',
    'android.permission.RECEIVE_BOOT_COMPLETED',
    'com.google.android.c2dm.permission.RECEIVE',
    'android.permission.ACCESS_NETWORK_STATE'
  ];
  
  permissions.forEach(permission => {
    // Удаляем если уже есть, чтобы избежать дублирования
    const regex = new RegExp(`\\s*<uses-permission[^>]*${permission.replace(/\./g, '\\.')}[^>]*\\/>\\s*`, 'g');
    manifest = manifest.replace(regex, '');
    
    // Добавляем перед </manifest>
    manifest = manifest.replace(
      '</manifest>',
      `    <uses-permission android:name="${permission}" />\n</manifest>`
    );
    console.log(`✅ Принудительно добавлен: ${permission}`);
  });
  
  // Записываем обратно
  fs.writeFileSync(manifestPath, manifest);
  
  // Финальная проверка
  const finalManifest = fs.readFileSync(manifestPath, 'utf8');
  if (finalManifest.includes('POST_NOTIFICATIONS')) {
    console.log('✅ POST_NOTIFICATIONS ГАРАНТИРОВАННО ДОБАВЛЕН');
    console.log(`📏 Финальный размер: ${finalManifest.length} символов`);
  } else {
    console.error('❌ КРИТИЧЕСКАЯ ОШИБКА: POST_NOTIFICATIONS НЕ ДОБАВЛЕН');
    process.exit(1);
  }
}

if (require.main === module) {
  forceAddPermissions();
}

module.exports = forceAddPermissions;