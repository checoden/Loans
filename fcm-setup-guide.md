# Инструкция по настройке Push-уведомлений через Firebase для Android APK

## Шаг 1: Создание проекта в Firebase

1. Перейдите на [Firebase Console](https://console.firebase.google.com/)
2. Нажмите "Добавить проект"
3. Введите имя проекта, например "Займы Онлайн"
4. Следуйте инструкциям по настройке проекта

## Шаг 2: Добавление Android приложения

1. В консоли Firebase выберите только что созданный проект
2. Нажмите на иконку Android, чтобы добавить Android приложение
3. Введите имя пакета: `ru.checoden.onlineloans` (это должно точно соответствовать appId в capacitor.config.ts)
4. Введите имя приложения: "Займы онлайн"
5. Скачайте файл google-services.json

## Шаг 3: Интеграция с OneSignal

1. Перейдите в [консоль OneSignal](https://app.onesignal.com/)
2. Выберите ваше приложение
3. Перейдите в Settings > Platforms > Google Android (FCM)
4. В Firebase Console перейдите: Project Settings > Cloud Messaging > Serverless key
5. Скопируйте Server key и вставьте его в поле FCM Server Key в OneSignal

## Шаг 4: Настройка проекта

1. Поместите скачанный файл google-services.json в папку capacitor-app
2. Запустите скрипт подготовки APK:
   ```
   node prepare-for-apk.js
   ```
3. Перейдите в capacitor-app и выполните:
   ```
   cd capacitor-app
   npm install
   npx cap add android
   npx cap sync android
   ```

## Шаг 5: Настройка каналов уведомлений (для Android 8.0+)

Откройте файл `capacitor-app/android/app/src/main/java/ru/checoden/onlineloans/MainActivity.java` и добавьте следующий код в метод onCreate:

```java
@Override
public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    
    // Регистрируем канал уведомлений для OneSignal
    if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
        NotificationChannel channel = new NotificationChannel(
            "займы-онлайн-уведомления",
            "Уведомления о займах",
            NotificationManager.IMPORTANCE_DEFAULT
        );
        channel.setDescription("Получайте уведомления о новых предложениях займов");
        
        NotificationManager notificationManager = getSystemService(NotificationManager.class);
        notificationManager.createNotificationChannel(channel);
    }
}
```

## Шаг 6: Сборка APK

1. Запустите Android Studio:
   ```
   npx cap open android
   ```

2. В Android Studio выберите Build > Build Bundle(s) / APK(s) > Build APK(s)
3. После сборки APK вы можете найти его в папке `capacitor-app/android/app/build/outputs/apk/debug/`

## Важные замечания

- Убедитесь, что переменные окружения VITE_ONESIGNAL_APP_ID и VITE_ONESIGNAL_REST_API_KEY настроены правильно
- При тестировании на устройстве убедитесь, что у приложения есть разрешение на отправку уведомлений
- Для отладки уведомлений используйте вкладку "Send test notification" в консоли OneSignal