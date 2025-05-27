const fs = require('fs');
const path = require('path');

/**
 * Скрипт для обновления настроек подписи в build.gradle
 */
function updateGradleSigning() {
  const buildGradlePath = path.join(__dirname, 'android', 'app', 'build.gradle');
  
  if (!fs.existsSync(buildGradlePath)) {
    console.error('❌ Файл build.gradle не найден по пути', buildGradlePath);
    return;
  }
  
  console.log('Обновляем настройки подписи в build.gradle...');
  
  let buildGradleContent = fs.readFileSync(buildGradlePath, 'utf8');
  
  // Проверяем, есть ли уже настройки signingConfigs
  if (buildGradleContent.includes('signingConfigs {')) {
    console.log('Настройки signingConfigs уже существуют');
  } else {
    // Добавляем настройки signingConfigs перед buildTypes
    const buildTypesIndex = buildGradleContent.indexOf('buildTypes {');
    
    if (buildTypesIndex === -1) {
      console.error('❌ Не удалось найти секцию buildTypes в build.gradle');
      return;
    }
    
    const signingConfigsBlock = `
    signingConfigs {
        release {
            storeFile file("app/android-keystore.keystore")
            storePassword System.getenv("KEYSTORE_PASSWORD") ?: "password"
            keyAlias System.getenv("KEY_ALIAS") ?: "key0"
            keyPassword System.getenv("KEY_PASSWORD") ?: "password"
            v1SigningEnabled true
            v2SigningEnabled true
        }
    }
    `;
    
    buildGradleContent = buildGradleContent.slice(0, buildTypesIndex) + 
                         signingConfigsBlock + 
                         buildGradleContent.slice(buildTypesIndex);
  }
  
  // Теперь убедимся, что buildType release использует signingConfig release
  if (!buildGradleContent.includes('signingConfig signingConfigs.release')) {
    buildGradleContent = buildGradleContent.replace(
      /buildTypes\s*\{\s*release\s*\{/g,
      'buildTypes {\n        release {\n            signingConfig signingConfigs.release'
    );
  }
  
  // Добавляем директивы безопасности
  if (!buildGradleContent.includes('android.bundle.enableUncompressedNativeLibs')) {
    const androidBlock = buildGradleContent.indexOf('android {');
    if (androidBlock !== -1) {
      const appendAfterAndroid = `
    // Улучшения безопасности и производительности
    bundle {
        language {
            enableSplit = true
        }
        density {
            enableSplit = true
        }
        abi {
            enableSplit = true
        }
    }
    buildFeatures {
        buildConfig = true
    }
    `;
      buildGradleContent = buildGradleContent.slice(0, androidBlock + 10) + 
                          appendAfterAndroid + 
                          buildGradleContent.slice(androidBlock + 10);
    }
  }
  
  fs.writeFileSync(buildGradlePath, buildGradleContent);
  console.log('✅ Настройки подписи успешно обновлены в build.gradle');
}

try {
  updateGradleSigning();
} catch (error) {
  console.error('❌ Ошибка при обновлении настроек подписи:', error);
}