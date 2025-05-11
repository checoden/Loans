# Настройка PUSH-уведомлений для APK-версии приложения "Займы онлайн"

Данная инструкция описывает шаги для настройки PUSH-уведомлений в мобильной версии приложения при сборке его в APK.

## Предварительные требования

1. Аккаунт OneSignal (бесплатный план подходит для начала)
2. Аккаунт Firebase (для Android уведомлений)
3. Аккаунт Apple Developer (для iOS уведомлений)
4. Установленные инструменты для сборки мобильных приложений (Cordova/Capacitor и их зависимости)

## Настройка для Android

### 1. Создание проекта Firebase

1. Перейдите на [console.firebase.google.com](https://console.firebase.google.com/)
2. Создайте новый проект "Займы онлайн"
3. Добавьте приложение Android с Package name: `ru.zaymyonline.app`
4. Скачайте файл `google-services.json` и замените им файл `client/google-services.json.template`

### 2. Настройка Firebase Cloud Messaging

1. В консоли Firebase перейдите в раздел "Cloud Messaging"
2. Скопируйте Server Key (он потребуется для OneSignal)
3. В разделе "Project settings" > "Cloud Messaging" убедитесь, что опция "Firebase Cloud Messaging API (V1)" включена

### 3. Создание канала уведомлений

При первом запуске приложения нужно создать канал уведомлений для Android 8.0+. Этот код уже встроен в `onesignal.ts` в функции `initializeMobileOneSignal`, но убедитесь, что ID канала соответствует значению из `android_channel_id` в функции отправки уведомлений.

```
// ID канала уведомлений в Android
android_channel_id: "займы-онлайн-уведомления"
```

## Настройка для iOS

### 1. Настройка Apple Push Notification Service (APNs)

1. Войдите в [Apple Developer Account](https://developer.apple.com/)
2. Перейдите в "Certificates, Identifiers & Profiles"
3. Создайте App ID для вашего приложения (Bundle ID: `ru.zaymyonline.app`)
4. Включите опцию "Push Notifications"
5. Создайте сертификат APNs для разработки и продакшена
6. Скачайте сертификаты и экспортируйте их в формате .p12

### 2. Категории уведомлений для iOS

iOS использует категории для определения действий с уведомлениями. В нашем приложении определена категория `LOAN_CATEGORY` - ее нужно зарегистрировать при инициализации OneSignal на iOS.

## Интеграция с OneSignal

### 1. Настройка приложения в OneSignal

1. Войдите в аккаунт [OneSignal](https://onesignal.com/)
2. Создайте новое приложение "Займы онлайн"
3. Выберите платформу "Native iOS & Android" при настройке
4. Укажите информацию для Android:
   - Firebase Server Key (из шага "Настройка Firebase Cloud Messaging")
   - Firebase Sender ID (от Firebase)
   - Имя пакета Android: `ru.zaymyonline.app`
5. Укажите информацию для iOS:
   - Загрузите p12-сертификат (из шага "Настройка Apple Push Notification Service")
   - Введите пароль сертификата, если есть
   - Укажите Bundle ID: `ru.zaymyonline.app`

### 2. Обновление параметров в проекте

После настройки OneSignal, обновите следующие параметры:

1. В файле `.env`:
   ```
   VITE_ONESIGNAL_APP_ID=ваш_onesignal_app_id
   VITE_ONESIGNAL_REST_API_KEY=ваш_onesignal_rest_api_key
   ```

2. В файле `app-config.json`:
   ```json
   "onesignal": {
     "appId": "ваш_onesignal_app_id",
     "googleProjectNumber": "номер_проекта_firebase"
   }
   ```

## Сборка APK

При сборке APK с помощью Cordova или Capacitor, убедитесь, что установлены следующие плагины:

1. OneSignal плагин для Cordova: 
   ```
   cordova plugin add onesignal-cordova-plugin
   ```

2. Для Capacitor:
   ```
   npm install onesignal-cordova-plugin
   npx cap sync
   ```

## Тестирование уведомлений

1. Для тестирования уведомлений используйте панель администратора в приложении (страница `/admin`)
2. Убедитесь, что устройство зарегистрировано в OneSignal (проверьте через консоль OneSignal > Audience)
3. Отправьте тестовое уведомление и проверьте его получение

## Отладка проблем с уведомлениями

### Android
- Проверьте, что устройство подключено к интернету
- Убедитесь, что Firebase Cloud Messaging работает (логи в Firebase Console)
- Проверьте, что канал уведомлений создан и не отключен пользователем

### iOS
- Убедитесь, что пользователь разрешил уведомления
- Проверьте, что сертификат APNs действителен и правильно настроен
- Для отладки используйте Xcode и логи консоли

## Дополнительные ресурсы

- [Документация OneSignal](https://documentation.onesignal.com/docs)
- [Настройка Firebase для уведомлений](https://firebase.google.com/docs/cloud-messaging)
- [Документация по уведомлениям Apple](https://developer.apple.com/documentation/usernotifications/)