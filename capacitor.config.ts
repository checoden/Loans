import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'ru.yourcompany.microloans',
  appName: 'Займы онлайн',
  webDir: 'public',
  server: {
    hostname: 'localhost',
    androidScheme: 'https'
  },
  plugins: {
    // Конфигурация других плагинов может быть добавлена здесь
  },
  android: {
    buildOptions: {
      keystorePath: 'android/app/keystore.jks',
      keystoreAlias: 'key0',
      keystorePassword: 'microloans',
      keystoreAliasPassword: 'microloans'
    }
  }
};

export default config;
