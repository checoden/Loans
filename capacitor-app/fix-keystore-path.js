const fs = require('fs');
const path = require('path');

/**
 * Скрипт для исправления пути к keystore в app/build.gradle
 */
function fixKeystorePath() {
  const appBuildGradlePath = path.join(__dirname, 'android', 'app', 'build.gradle');
  
  if (!fs.existsSync(appBuildGradlePath)) {
    console.error('❌ Файл app/build.gradle не найден по пути', appBuildGradlePath);
    return;
  }
  
  console.log('Исправляем путь к keystore в app/build.gradle...');
  
  let buildGradleContent = fs.readFileSync(appBuildGradlePath, 'utf8');
  
  // Проверяем, есть ли уже настройки signingConfigs
  if (buildGradleContent.includes('signingConfigs {')) {
    console.log('Настройки signingConfigs уже существуют, обновляем путь к keystore');
    
    // Обновляем путь к keystore на абсолютный
    const projectRootDir = path.resolve(__dirname, '..');
    const keystorePath = path.join(projectRootDir, 'keystore.jks');
    console.log('Используем абсолютный путь к keystore:', keystorePath);
    
    // Заменяем существующую строку storeFile на абсолютный путь
    buildGradleContent = buildGradleContent.replace(
      /storeFile\s+file\(['"](.*?)['"]\)/,
      `storeFile file("${keystorePath.replace(/\\/g, '\\\\')}")`
    );
    
    fs.writeFileSync(appBuildGradlePath, buildGradleContent);
    console.log('✅ Путь к keystore обновлен в app/build.gradle');
  } else {
    console.log('Настройки signingConfigs не найдены, создаем их');
    
    // Определяем путь к корневому keystore
    const projectRootDir = path.resolve(__dirname, '..');
    const keystorePath = path.join(projectRootDir, 'keystore.jks');
    console.log('Используем абсолютный путь к keystore:', keystorePath);
    
    // Ищем блок android
    const androidBlockRegex = /android\s*\{/;
    const match = androidBlockRegex.exec(buildGradleContent);
    if (!match) {
      console.error('❌ Не удалось найти блок android в app/build.gradle');
      return;
    }
    
    // Создаем блок signingConfigs
    const signingConfigBlock = `
    signingConfigs {
        release {
            storeFile file("${keystorePath.replace(/\\/g, '\\\\')}")
            storePassword System.getenv("KEYSTORE_PASSWORD") ?: "password"
            keyAlias System.getenv("KEY_ALIAS") ?: "key0"
            keyPassword System.getenv("KEY_PASSWORD") ?: "password"
            v1SigningEnabled true
            v2SigningEnabled true
        }
    }`;
    
    // Вставляем блок после android {
    const insertPosition = match.index + match[0].length;
    buildGradleContent = 
      buildGradleContent.substring(0, insertPosition) + 
      signingConfigBlock + 
      buildGradleContent.substring(insertPosition);
    
    // Ищем buildTypes и добавляем signingConfig, если еще не добавлен
    if (!buildGradleContent.includes('signingConfig signingConfigs.release')) {
      buildGradleContent = buildGradleContent.replace(
        /buildTypes\s*\{\s*release\s*\{/,
        'buildTypes {\n        release {\n            signingConfig signingConfigs.release'
      );
    }
    
    fs.writeFileSync(appBuildGradlePath, buildGradleContent);
    console.log('✅ Настройки подписи добавлены в app/build.gradle');
  }
}

try {
  fixKeystorePath();
} catch (error) {
  console.error('❌ Ошибка при исправлении пути к keystore:', error);
}