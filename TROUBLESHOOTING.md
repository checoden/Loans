# Решение проблем при сборке APK

Этот документ содержит решения для распространенных проблем, которые могут возникнуть при подготовке и сборке APK из веб-приложения.

## Общие проблемы

### Ошибка: "Error: Cannot find module '@capacitor/android'"

**Решение:**
```bash
cd capacitor-app
npm install @capacitor/android
npx cap sync
```

### Ошибка: "Error: Android SDK not found"

**Решение:**
1. Установите Android SDK через Android Studio
2. Добавьте переменную окружения ANDROID_SDK_ROOT
   - В Windows: `set ANDROID_SDK_ROOT=C:\Users\username\AppData\Local\Android\Sdk`
   - В macOS/Linux: `export ANDROID_SDK_ROOT=~/Library/Android/sdk`

### Ошибка при добавлении платформы Android

**Решение:**
```bash
# Очистить кэш npm
npm cache clean --force

# Удалить node_modules и установить заново
rm -rf node_modules
npm install

# Попробовать добавить платформу снова
npx cap add android
```

## Проблемы с OneSignal

### Уведомления не работают в APK

**Проверьте:**
1. Правильно ли указан OneSignal App ID в `capacitor.config.json`
2. Установлен ли плагин OneSignal:
   ```bash
   npm install onesignal-cordova-plugin
   npx cap sync
   ```
3. Добавлен ли FCM ключ в настройках OneSignal (для Android)

### Ошибка: "Firebase FCM Sender ID is invalid"

**Решение:**
1. Откройте консоль Firebase
2. Перейдите в Project Settings > Cloud Messaging
3. Скопируйте Server Key и Sender ID
4. Добавьте эти данные в настройках вашего приложения в OneSignal

## Проблемы при сборке в Android Studio

### Ошибка: "Failed to find Build Tools revision XX.X.X"

**Решение:**
1. Откройте SDK Manager в Android Studio
2. Перейдите в SDK Tools
3. Установите требуемую версию Build Tools

### Ошибка: "Execution failed for task ':app:processDebugManifest'"

**Решение:**
Обычно это происходит из-за несоответствия версий компонентов Android. Попробуйте:

1. В Android Studio, откройте build.gradle (Module: app)
2. Проверьте и обновите:
   ```gradle
   compileSdkVersion 33
   buildToolsVersion "33.0.0"
   
   defaultConfig {
       minSdkVersion 21
       targetSdkVersion 33
       ...
   }
   ```

### Ошибка подписи APK

**Решение:**
1. Создайте keystore файл:
   ```bash
   keytool -genkey -v -keystore my-release-key.keystore -alias alias_name -keyalg RSA -keysize 2048 -validity 10000
   ```
2. В Android Studio откройте Build > Generate Signed Bundle/APK
3. Используйте созданный keystore файл

## Проблемы с иконками и ресурсами

### Отсутствуют иконки/сплэш-экран в APK

**Решение:**
1. Проверьте, что в директории `capacitor-app/resources` есть все необходимые иконки
2. Запустите:
   ```bash
   npx cordova-res android --skip-config --copy
   npx cap sync android
   ```

### Ошибка: "resource not found"

**Решение:**
1. Проверьте, что все ресурсы имеют правильные имена (только строчные буквы, цифры и подчеркивания)
2. Проверьте, что пути к ресурсам указаны правильно
3. Синхронизируйте проект:
   ```bash
   npx cap sync
   ```

## Общие советы по отладке

1. Проверьте логи в Android Studio (Logcat)
2. При тестировании на устройстве включите USB debugging и смотрите логи в реальном времени
3. Используйте Chrome Remote Debugging для отладки WebView: chrome://inspect/#devices
4. Для проблем с Capacitor, проверьте папку `capacitor.config.json`, убедитесь что все пути указаны корректно

## Дополнительные ресурсы

- [Официальная документация Capacitor](https://capacitorjs.com/docs)
- [Документация OneSignal](https://documentation.onesignal.com/docs)
- [Android Studio Troubleshooting](https://developer.android.com/studio/troubleshoot)