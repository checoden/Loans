/**
 * Capacitor hooks script - выполняется автоматически после cap sync
 * Гарантированно добавляет POST_NOTIFICATIONS разрешение
 */

const fs = require('fs');
const path = require('path');

module.exports = function(config) {
  return {
    'capacitor:sync:after': async () => {
      console.log('🔧 Capacitor Hook: Добавляем POST_NOTIFICATIONS после sync...');
      
      const manifestPath = path.join(__dirname, 'capacitor-app', 'android', 'app', 'src', 'main', 'AndroidManifest.xml');
      
      if (!fs.existsSync(manifestPath)) {
        console.error('❌ Hook: AndroidManifest.xml не найден:', manifestPath);
        return;
      }
      
      let manifest = fs.readFileSync(manifestPath, 'utf8');
      console.log('📄 Hook: Читаем манифест, размер:', manifest.length);
      
      // Добавляем все необходимые разрешения для push-уведомлений
      const pushPermissions = [
        'android.permission.POST_NOTIFICATIONS',
        'android.permission.WAKE_LOCK',
        'android.permission.VIBRATE',
        'android.permission.RECEIVE_BOOT_COMPLETED',
        'com.google.android.c2dm.permission.RECEIVE',
        'android.permission.ACCESS_NETWORK_STATE'
      ];
      
      let modified = false;
      
      pushPermissions.forEach(permission => {
        if (!manifest.includes(permission)) {
          console.log(`📱 Hook: Добавляем ${permission}`);
          manifest = manifest.replace(
            '</manifest>',
            `    <uses-permission android:name="${permission}" />\n</manifest>`
          );
          modified = true;
        } else {
          console.log(`✅ Hook: ${permission} уже есть`);
        }
      });
      
      if (modified) {
        fs.writeFileSync(manifestPath, manifest);
        console.log('✅ Hook: Манифест обновлен с push-разрешениями');
        
        // Проверяем результат
        const updatedManifest = fs.readFileSync(manifestPath, 'utf8');
        if (updatedManifest.includes('POST_NOTIFICATIONS')) {
          console.log('✅ Hook: POST_NOTIFICATIONS успешно добавлен');
        } else {
          console.error('❌ Hook: POST_NOTIFICATIONS не найден после добавления');
        }
      } else {
        console.log('✅ Hook: Все разрешения уже присутствуют');
      }
    }
  };
};