
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'ru.yourcompany.microloans',
  appName: 'Займы онлайн',
  webDir: 'www',
  bundledWebRuntime: false,
  plugins: {
    // Добавьте здесь настройки плагинов
  },
  android: {
    buildOptions: {
      keystorePath: 'keystore.jks',
      keystoreAlias: 'key0',
      keystorePassword: 'microloans',
      keystoreAliasPassword: 'microloans'
    }
  }
};

export default config;
