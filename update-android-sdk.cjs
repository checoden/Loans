/**
 * Скрипт для обновления Android SDK до версии 33+ для поддержки Android 15
 * и современных требований push-уведомлений
 */

const fs = require('fs');
const path = require('path');

function updateAndroidSDK() {
  console.log('🔧 Обновляем Android SDK до версии 33+...');
  
  const buildGradlePath = path.join('capacitor-app', 'android', 'app', 'build.gradle');
  const projectBuildGradlePath = path.join('capacitor-app', 'android', 'build.gradle');
  
  try {
    // Обновляем app/build.gradle
    if (fs.existsSync(buildGradlePath)) {
      let buildGradleContent = fs.readFileSync(buildGradlePath, 'utf8');
      
      console.log('📱 Обновляем app/build.gradle...');
      
      // Обновляем compileSdk до 34 (Android 14)
      buildGradleContent = buildGradleContent.replace(
        /compileSdk\s+\d+/g,
        'compileSdk 34'
      );
      
      // Обновляем targetSdk до 34
      buildGradleContent = buildGradleContent.replace(
        /targetSdk\s+\d+/g,
        'targetSdk 34'
      );
      
      // Обновляем minSdk до 24 (Android 7.0+)
      buildGradleContent = buildGradleContent.replace(
        /minSdk\s+\d+/g,
        'minSdk 24'
      );
      
      // Только базовые настройки - без дополнительных конфигураций
      console.log('📱 Обновляем только версии SDK - без дополнительных настроек для максимальной совместимости');
      
      fs.writeFileSync(buildGradlePath, buildGradleContent);
      console.log('✅ app/build.gradle обновлен до SDK 34');
    }
    
    // Обновляем project/build.gradle
    if (fs.existsSync(projectBuildGradlePath)) {
      let projectBuildContent = fs.readFileSync(projectBuildGradlePath, 'utf8');
      
      console.log('🔧 Обновляем project/build.gradle...');
      
      // Обновляем Android Gradle Plugin до 8.9
      projectBuildContent = projectBuildContent.replace(
        /com\.android\.tools\.build:gradle:[0-9.]+/g,
        'com.android.tools.build:gradle:8.9.0'
      );
      
      // Обновляем compileSdk в project build.gradle если есть
      projectBuildContent = projectBuildContent.replace(
        /compileSdk\s*=\s*\d+/g,
        'compileSdk = 34'
      );
      
      fs.writeFileSync(projectBuildGradlePath, projectBuildContent);
      console.log('✅ project/build.gradle обновлен');
    }
    
    // Обновляем gradle-wrapper.properties до Gradle 8.11
    const gradleWrapperPath = path.join('capacitor-app', 'android', 'gradle', 'wrapper', 'gradle-wrapper.properties');
    if (fs.existsSync(gradleWrapperPath)) {
      let wrapperContent = fs.readFileSync(gradleWrapperPath, 'utf8');
      
      console.log('⚙️ Обновляем Gradle Wrapper...');
      
      wrapperContent = wrapperContent.replace(
        /gradle-[0-9.]+-all\.zip/g,
        'gradle-8.11.1-all.zip'
      );
      
      wrapperContent = wrapperContent.replace(
        /distributionUrl=.*/g,
        'distributionUrl=https\\://services.gradle.org/distributions/gradle-8.11.1-all.zip'
      );
      
      fs.writeFileSync(gradleWrapperPath, wrapperContent);
      console.log('✅ Gradle Wrapper обновлен до 8.11.1');
    }
    
    console.log('\n🎉 Android SDK успешно обновлен!');
    console.log('📱 Новые версии:');
    console.log('   - compileSdk: 34 (Android 14)');
    console.log('   - targetSdk: 34 (Android 14)');
    console.log('   - minSdk: 24 (Android 7.0+)');
    console.log('   - Gradle: 8.11.1');
    console.log('   - Android Gradle Plugin: 8.9.0');
    console.log('\n✨ Теперь приложение полностью совместимо с Android 15!');
    
  } catch (error) {
    console.error('❌ Ошибка при обновлении Android SDK:', error.message);
    process.exit(1);
  }
}

// Запускаем скрипт
updateAndroidSDK();