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
  
  if (!fs.existsSync(finalTemplatePath)) {
    console.error('❌ КРИТИЧЕСКАЯ ОШИБКА: AndroidManifest-template.xml не найден');
    console.error('Проверьте пути:');
    console.error('  Основной:', templatePath);  
    console.error('  Альтернативный:', finalTemplatePath);
    process.exit(1);
  }
  
  // Читаем корректный шаблон
  const templateManifest = fs.readFileSync(finalTemplatePath, 'utf8');
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