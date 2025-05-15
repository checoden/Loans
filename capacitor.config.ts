import type { CapacitorConfig } from '@capacitor/cli';

// Получаем Replit домен из переменных окружения или используем значение по умолчанию для тестов
const replitDomain = process.env.REPLIT_DOMAIN || 'your-app.replit.app';

const config: CapacitorConfig = {
  appId: 'ru.yourcompany.microloans',
  appName: 'Займы онлайн',
  webDir: 'public',
  // Настраиваем сервер для корректной работы https и коммуникации с Replit
  server: {
    // В production используем полный URL Replit, в dev - localhost
    url: process.env.NODE_ENV === 'production' 
      ? `https://${replitDomain}`
      : 'http://localhost:5000',
    cleartext: true, // Разрешить незашифрованный трафик для отладки
    androidScheme: 'https' // Схема для Android всегда должна быть https
  },
  plugins: {
    // Конфигурация OneSignal
    OneSignal: {
      appId: process.env.VITE_ONESIGNAL_APP_ID,
      // Используем полную HTTPS-ссылку для уведомлений 
      notificationURLOpenDeeplink: true
    }
  },
  android: {
    buildOptions: {
      keystorePath: 'android/app/keystore.jks',
      keystoreAlias: 'key0',
      keystorePassword: 'microloans',
      keystoreAliasPassword: 'microloans'
    },
    // Дополнительные настройки безопасности
    allowMixedContent: false, // Запретить смешанный контент (http в https)
    captureInput: true,  // Разрешить захват ввода для WebView 
    webContentsDebuggingEnabled: false // Отключить отладку в prod
  },
  // Настройки безопасности для iOS
  ios: {
    contentInset: 'always',
    allowsLinkPreview: false,
    scrollEnabled: true
  }
};

export default config;
