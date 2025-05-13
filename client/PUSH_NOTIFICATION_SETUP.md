# Настройка Push-уведомлений в мобильном приложении

В этой документации описано, как настроить push-уведомления в мобильном приложении "Займы онлайн" с использованием OneSignal и Capacitor.

## Содержание

1. [Подготовка проекта](#подготовка-проекта)
2. [Настройка OneSignal](#настройка-onesignal)
3. [Интеграция с Firebase для Android](#интеграция-с-firebase-для-android)
4. [Настройка iOS](#настройка-ios)
5. [Компиляция приложения](#компиляция-приложения)
6. [Решение проблем](#решение-проблем)

## Подготовка проекта

### 1. Установка зависимостей

```bash
# Установка Capacitor
npm install @capacitor/core @capacitor/android @capacitor/cli

# Установка OneSignal плагина
npm install onesignal-cordova-plugin
```

### 2. Инициализация Capacitor

Если вы еще не инициализировали Capacitor в проекте:

```bash
npx cap init microloans ru.yourcompany.microloans --web-dir=public
```

### 3. Добавление Android платформы

```bash
npx cap add android
```

### 4. Подготовка проекта для APK

Запустите скрипт подготовки проекта:

```bash
node prepare-for-apk.js
```

## Настройка OneSignal

### 1. Создание проекта в OneSignal

1. Зарегистрируйтесь на [onesignal.com](https://onesignal.com) и создайте новый проект
2. Запишите `App ID` и `REST API Key` из настроек проекта

### 2. Настройка переменных окружения

Добавьте следующие переменные окружения в ваш проект:

```
VITE_ONESIGNAL_APP_ID=<ваш_app_id>
VITE_ONESIGNAL_REST_API_KEY=<ваш_rest_api_key>
```

### 3. Конфигурация в коде

В `capacitor.config.ts` добавьте:

```typescript
plugins: {
  OneSignal: {
    appId: process.env.VITE_ONESIGNAL_APP_ID
  }
}
```

## Интеграция с Firebase для Android

### 1. Создание проекта в Firebase

1. Перейдите на [console.firebase.google.com](https://console.firebase.google.com)
2. Создайте новый проект
3. Добавьте приложение Android, используя пакет `ru.yourcompany.microloans`
4. Скачайте файл `google-services.json`

### 2. Настройка FCM в OneSignal

1. В Firebase Console перейдите в "Project settings" -> "Cloud Messaging"
2. Скопируйте "Server key"
3. В OneSignal Dashboard перейдите в настройки приложения -> "Android" 
4. Вставьте FCM Server Key в соответствующее поле

### 3. Добавление google-services.json

1. Скопируйте файл `google-services.json` в директорию `android/app/`
2. Синхронизируйте проект:

```bash
npx cap sync android
```

## Настройка iOS

### 1. Настройка APN в OneSignal

1. Создайте Apple Push Notification certificate
2. Загрузите сертификат в OneSignal Dashboard

### 2. Добавление iOS платформы (при необходимости)

```bash
npx cap add ios
npx cap sync ios
```

## Компиляция приложения

### Для Android

1. Откройте проект в Android Studio:

```bash
npx cap open android
```

2. В Android Studio:
   - Выберите "Build" -> "Build Bundle(s) / APK(s)" -> "Build APK(s)"
   - После сборки вы найдете APK файл в `android/app/build/outputs/apk/debug/app-debug.apk`

### Для iOS

1. Откройте проект в Xcode:

```bash
npx cap open ios
```

2. В Xcode:
   - Выберите целевое устройство
   - Нажмите кнопку "Build and run"

## Решение проблем

### Проблемы с Firebase

**Ошибка**: "Google Services plugin not applied"
**Решение**: Убедитесь, что файл `google-services.json` находится в правильной директории и соответствует пакету приложения.

### Проблемы с OneSignal

**Ошибка**: "OneSignal not initialized"
**Решение**: 
1. Проверьте, что App ID правильно указан в коде инициализации
2. Убедитесь, что OneSignal плагин правильно установлен:
```
npx cap sync android
```

### Проблемы с компиляцией APK

**Ошибка**: "Failed to compile resources"
**Решение**: 
1. Проверьте, что все необходимые SDK установлены в Android Studio
2. Обновите Gradle до последней версии

### Если push-уведомления не приходят

1. Проверьте Firebase Console на наличие ошибок
2. Убедитесь, что устройство подключено к интернету
3. Проверьте, что приложение имеет разрешение на отправку уведомлений
4. В OneSignal Dashboard проверьте статус устройства в разделе "Audience"