/**
 * Скрипт для обновления Gradle Wrapper до версии 8.3, совместимой с Java 17
 * 
 * Этот скрипт должен запускаться после выполнения npx cap add android
 * Он изменяет файл gradle-wrapper.properties для использования Gradle 8.3
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ES модули не имеют __dirname, поэтому создаем его
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Путь к директории проекта Capacitor
const CAPACITOR_DIR = 'capacitor-app';
const GRADLE_WRAPPER_PATH = path.join(CAPACITOR_DIR, 'android/gradle/wrapper/gradle-wrapper.properties');

// Обновляем версию Gradle до 8.3, которая поддерживает Java 17
function updateGradleVersion() {
  console.log('🔍 Обновление версии Gradle для Android...');
  
  try {
    // Проверяем существование директории
    const wrapperDir = path.dirname(GRADLE_WRAPPER_PATH);
    if (!fs.existsSync(wrapperDir)) {
      console.log(`📂 Создаем директорию: ${wrapperDir}`);
      fs.mkdirSync(wrapperDir, { recursive: true });
    }
    
    // Создаем/заменяем файл свойств градла
    const gradleWrapperContent = `distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\\://services.gradle.org/distributions/gradle-8.3-bin.zip
networkTimeout=10000
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
`;
    
    fs.writeFileSync(GRADLE_WRAPPER_PATH, gradleWrapperContent);
    console.log('✅ Gradle Wrapper обновлен до версии 8.3 (совместимой с Java 17)');
    
    // Также обновляем build.gradle, если он уже существует, чтобы указать поддержку Java 17
    const buildGradlePath = path.join(CAPACITOR_DIR, 'android/build.gradle');
    if (fs.existsSync(buildGradlePath)) {
      let buildGradle = fs.readFileSync(buildGradlePath, 'utf8');
      
      // Заменяем версию Gradle, если она указана
      if (buildGradle.includes('com.android.tools.build:gradle:')) {
        buildGradle = buildGradle.replace(
          /com\.android\.tools\.build:gradle:[0-9.]+/,
          'com.android.tools.build:gradle:8.1.0'
        );
      }
      
      // Добавляем явное указание использовать Java 17, если еще не добавлено
      if (!buildGradle.includes('JavaVersion.VERSION_17')) {
        const compileOptions = `
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_17
        targetCompatibility JavaVersion.VERSION_17
    }
    kotlin {
        jvmToolchain(17)
    }`;
        
        // Ищем, где добавить опции компиляции
        const allProjectsIndex = buildGradle.indexOf('allprojects {');
        if (allProjectsIndex !== -1) {
          // Добавляем после блока allprojects
          const closingBracket = buildGradle.indexOf('}', allProjectsIndex);
          if (closingBracket !== -1) {
            buildGradle = 
              buildGradle.slice(0, closingBracket + 1) + 
              compileOptions + 
              buildGradle.slice(closingBracket + 1);
          }
        }
      }
      
      fs.writeFileSync(buildGradlePath, buildGradle);
      console.log('✅ Build Gradle обновлен для поддержки Java 17');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Ошибка при обновлении Gradle:', error);
    return false;
  }
}

// Запускаем обновление
updateGradleVersion();