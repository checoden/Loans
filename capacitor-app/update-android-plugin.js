const fs = require('fs');
const path = require('path');

/**
 * Скрипт для обновления версии Android Gradle Plugin до 8.9
 */
function updateAndroidGradlePlugin() {
  const buildGradlePath = path.join(__dirname, 'android', 'build.gradle');
  
  if (!fs.existsSync(buildGradlePath)) {
    console.error('❌ Файл build.gradle не найден по пути', buildGradlePath);
    return;
  }
  
  console.log('Обновляем версию Android Gradle Plugin до 8.9...');
  
  let buildGradleContent = fs.readFileSync(buildGradlePath, 'utf8');
  
  // Обновляем версию Android Gradle Plugin
  buildGradleContent = buildGradleContent.replace(
    /classpath ['"]com\.android\.tools\.build:gradle:(\d+\.\d+\.\d+)['"]/, 
    'classpath \'com.android.tools.build:gradle:8.9.0\''
  );
  
  // Обновляем версию плагина Google Services, если она есть
  buildGradleContent = buildGradleContent.replace(
    /classpath ['"]com\.google\.gms:google-services:(\d+\.\d+\.\d+)['"]/, 
    'classpath \'com.google.gms:google-services:4.4.1\''
  );
  
  fs.writeFileSync(buildGradlePath, buildGradleContent);
  console.log('✅ Версия Android Gradle Plugin обновлена до 8.9');
  
  // Обновляем файл gradle.properties
  const gradlePropsPath = path.join(__dirname, 'android', 'gradle.properties');
  
  let gradlePropsContent = '';
  if (fs.existsSync(gradlePropsPath)) {
    gradlePropsContent = fs.readFileSync(gradlePropsPath, 'utf8');
  }
  
  // Добавляем настройки для Android Studio Hedgehog и AGP 8.9
  if (!gradlePropsContent.includes('android.useAndroidX=true')) {
    gradlePropsContent += '\n# Настройки для AGP 8.9\n';
    gradlePropsContent += 'android.useAndroidX=true\n';
    gradlePropsContent += 'android.enableJetifier=true\n';
    gradlePropsContent += 'org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8\n';
    gradlePropsContent += 'android.defaults.buildfeatures.buildconfig=true\n';
    gradlePropsContent += 'android.nonTransitiveRClass=false\n';
    gradlePropsContent += 'android.nonFinalResIds=false\n';
  }
  
  fs.writeFileSync(gradlePropsPath, gradlePropsContent);
  console.log('✅ Файл gradle.properties обновлен для поддержки AGP 8.9');
  
  // Обновляем настройки в app/build.gradle
  const appBuildGradlePath = path.join(__dirname, 'android', 'app', 'build.gradle');
  
  if (fs.existsSync(appBuildGradlePath)) {
    let appBuildGradleContent = fs.readFileSync(appBuildGradlePath, 'utf8');
    
    // Обновляем compileSdkVersion и targetSdkVersion
    appBuildGradleContent = appBuildGradleContent.replace(
      /compileSdkVersion\s+\d+/, 
      'compileSdkVersion 34'
    );
    
    appBuildGradleContent = appBuildGradleContent.replace(
      /targetSdkVersion\s+\d+/, 
      'targetSdkVersion 34'
    );
    
    // Обновляем настройки для AGP 8.9
    if (!appBuildGradleContent.includes('namespace')) {
      // Добавляем namespace если его нет
      const androidBlock = appBuildGradleContent.indexOf('android {');
      if (androidBlock !== -1) {
        const insertPosition = androidBlock + 'android {'.length;
        const packageName = appBuildGradleContent.match(/applicationId ['"]([\w\.]+)['"]/);
        if (packageName && packageName[1]) {
          appBuildGradleContent = 
            appBuildGradleContent.slice(0, insertPosition) + 
            `\n    namespace "${packageName[1]}"` + 
            appBuildGradleContent.slice(insertPosition);
        }
      }
    }
    
    fs.writeFileSync(appBuildGradlePath, appBuildGradleContent);
    console.log('✅ Файл app/build.gradle обновлен для поддержки AGP 8.9');
  }
}

try {
  updateAndroidGradlePlugin();
} catch (error) {
  console.error('❌ Ошибка при обновлении Android Gradle Plugin:', error);
}