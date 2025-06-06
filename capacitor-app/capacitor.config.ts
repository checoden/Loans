
import { CapacitorConfig } from '@capacitor/cli';

// Получаем Replit домен для production
const replitDomain = process.env.REPLIT_DOMAIN || 'onlineloans.replit.app';

const config: CapacitorConfig = {
  appId: 'ru.checoden.onlineloans',
  appName: 'Займы онлайн',
  webDir: 'www',
  bundledWebRuntime: false,
  // Настраиваем сервер для корректной работы https и коммуникации с Replit
  server: {
    // Всегда используем полный URL Replit для мобильного приложения
    url: `https://${replitDomain}`,
    cleartext: true, // Разрешить незашифрованный трафик для отладки
    androidScheme: 'https', // Схема для Android всегда должна быть https
    // Важно: отключаем проверку сертификатов для самоподписанных сертификатов Replit
    allowNavigation: ["*"],
    errorPath: "/error.html" 
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
      keystorePath: 'keystore.jks',
      keystoreAlias: 'key0',
      keystorePassword: 'microloans',
      keystoreAliasPassword: 'microloans'
    },
    // Дополнительные настройки безопасности и отладки
    allowMixedContent: true, // Временно разрешаем смешанный контент для отладки
    captureInput: true,      // Разрешить захват ввода для WebView
    webContentsDebuggingEnabled: true // Включаем отладку WebView для диагностики проблем
  }
};

export default config;
