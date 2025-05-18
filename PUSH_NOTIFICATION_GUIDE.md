# Руководство по настройке Push-уведомлений

Это пошаговое руководство поможет настроить push-уведомления для Android приложения «Займы онлайн».

## Необходимые компоненты

1. **OneSignal** - сервис для отправки push-уведомлений
2. **Firebase Cloud Messaging (FCM)** - сервис Google для доставки уведомлений на устройства Android
3. **Capacitor** - для конвертации веб-приложения в нативное мобильное приложение

## 1. Настройка Firebase

### Создание проекта в Firebase

1. Перейдите на [Firebase Console](https://console.firebase.google.com/)
2. Нажмите "Add project" (Создать проект)
3. Введите имя проекта (например, "Loans Online")
4. Следуйте инструкциям мастера настройки
5. По завершении нажмите "Continue"

### Добавление Android приложения

1. В консоли Firebase, откройте созданный проект
2. Нажмите на иконку Android (🤖), чтобы добавить Android приложение
3. Введите Package name (ID пакета) вашего приложения: `ru.checoden.onlineloans`
4. (Опционально) Введите имя приложения "Займы онлайн"
5. Нажмите "Register app"
6. Скачайте файл `google-services.json`
7. Поместите файл `google-services.json` в директорию `capacitor-app/`

## 2. Настройка OneSignal

### Создание проекта в OneSignal

1. Перейдите на [OneSignal Dashboard](https://app.onesignal.com/)
2. Создайте новое приложение или используйте существующее
3. Выберите Android для настройки платформы
4. В разделе "Firebase Android (FCM)", введите:
   - Имя пакета приложения: `ru.checoden.onlineloans`
   - Ключ сервера FCM: скопируйте из Firebase Console (Project settings > Cloud Messaging)
   - Ключ веб-API FCM: скопируйте из Firebase Console

### Настройка окружения в проекте

1. Убедитесь, что в переменных окружения Replit (или GitHub Secrets) добавлены:
   - `VITE_ONESIGNAL_APP_ID` - ID вашего OneSignal приложения
   - `VITE_ONESIGNAL_REST_API_KEY` - REST API ключ OneSignal

## 3. Подготовка проекта

### Подготовка проекта для сборки APK

```bash
# Запустите скрипт для подготовки проекта
node prepare-for-apk.js

# Настройте канал уведомлений в Android
node setup-android-notification-channel.js
```

### Проверка настроек Gradle

Файл `capacitor-app/android/gradle/wrapper/gradle-wrapper.properties` должен содержать:

```
distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\://services.gradle.org/distributions/gradle-8.6-bin.zip
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
```

## 4. Сборка APK

### Локальная сборка (опционально)

```bash
cd capacitor-app/android
./gradlew assembleRelease
```

### Сборка через GitHub Actions

1. Создайте новый тег с версией:
```bash
git tag v1.x.x
git push --tags
```

2. GitHub Actions автоматически запустит сборку APK
3. После завершения, скачайте артефакт сборки (APK) из раздела Actions

## 5. Тестирование уведомлений

### Запуск сервера тестирования уведомлений

```bash
# Запустите сервер для тестирования отправки уведомлений
node run-push-server.js
```

### Проверка уведомлений

1. Установите собранный APK на устройство Android
2. Запустите приложение и разрешите отправку уведомлений
3. Отправьте тестовое уведомление через панель администратора или сервер тестирования
4. На устройстве должно появиться push-уведомление

## Устранение неполадок

### Логирование в устройстве Android

Если уведомления не приходят, проверьте логи устройства:

```bash
adb logcat | grep -e "OneSignal" -e "FCM"
```

В успешном случае вы увидите сообщения:
- "OneSignal Init succeeded"
- "FCM registration id received"

### Проблемы с совместимостью версий

Если сборка APK не удается из-за проблем с Gradle/Java:
1. Убедитесь, что используется Gradle 8.6
2. Используйте Java 21 для сборки

### Проблемы с идентификатором пакета

Если приложение устанавливается, но уведомления не работают:
1. Убедитесь, что идентификаторы пакета совпадают во всех местах:
   - В Firebase Console
   - В OneSignal Dashboard
   - В файле `capacitor.config.ts`
   - В файле `build.gradle` (applicationId)
   - В файле `AndroidManifest.xml` (package)