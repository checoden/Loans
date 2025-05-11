// Add type declaration for OneSignal
declare global {
  interface Window {
    OneSignal: any;
    plugins?: {
      OneSignal?: any;
    };
    device?: {
      platform: string;
    };
  }
}

// Detect environment type (web, Android, iOS)
function detectEnvironment(): 'web' | 'android' | 'ios' {
  if (typeof window === 'undefined') return 'web';
  
  // Check if running as Cordova/Capacitor app
  if (window.device?.platform) {
    return window.device.platform.toLowerCase() === 'ios' ? 'ios' : 'android';
  }
  
  // Default to web if can't detect
  return 'web';
}

// Initialize OneSignal for push notifications
export function initializeOneSignal() {
  const environment = detectEnvironment();
  console.log(`Initializing OneSignal for platform: ${environment}`);
  
  // Wait for device ready if in mobile environment
  const onDeviceReady = () => {
    if (environment === 'web') {
      initializeWebOneSignal();
    } else {
      initializeMobileOneSignal(environment);
    }
  };

  // For Cordova/Capacitor wait for deviceready event
  if (environment !== 'web' && typeof document !== 'undefined') {
    document.addEventListener('deviceready', onDeviceReady, false);
  } else {
    // For web, initialize immediately
    onDeviceReady();
  }
}

// Web implementation
function initializeWebOneSignal() {
  if (typeof window !== 'undefined') {
    window.OneSignal = window.OneSignal || [];
    
    console.log("Initializing Web OneSignal with app ID:", import.meta.env.VITE_ONESIGNAL_APP_ID);
    
    window.OneSignal.push(function() {
      window.OneSignal.init({
        appId: import.meta.env.VITE_ONESIGNAL_APP_ID,
        allowLocalhostAsSecureOrigin: true,
        notifyButton: {
          enable: true,
          size: 'medium',
          position: 'bottom-right',
          showCredit: false,
          text: {
            'tip.state.unsubscribed': 'Получать уведомления',
            'tip.state.subscribed': 'Вы подписаны на уведомления',
            'tip.state.blocked': 'Уведомления заблокированы',
            'message.prenotify': 'Нажмите, чтобы подписаться на уведомления',
            'message.action.subscribed': 'Спасибо за подписку!',
            'message.action.resubscribed': 'Вы подписаны на уведомления',
            'message.action.unsubscribed': 'Вы больше не будете получать уведомления',
            'dialog.main.title': 'Управление уведомлениями',
            'dialog.main.button.subscribe': 'ПОДПИСАТЬСЯ',
            'dialog.main.button.unsubscribe': 'ОТПИСАТЬСЯ',
            'dialog.blocked.title': 'Разблокировать уведомления',
            'dialog.blocked.message': 'Следуйте этим инструкциям, чтобы разрешить уведомления:'
          }
        },
        promptOptions: {
          slidedown: {
            prompts: [
              {
                type: "push",
                autoPrompt: true,
                text: {
                  actionMessage: "Получайте уведомления о новых займах и специальных предложениях",
                  acceptButton: "Разрешить",
                  cancelButton: "Отклонить"
                },
                delay: {
                  pageViews: 1,
                  timeDelay: 5
                }
              }
            ]
          }
        }
      });
    });
  }
}

// Mobile implementation (Android/iOS)
function initializeMobileOneSignal(platform: 'android' | 'ios') {
  if (typeof window !== 'undefined' && window.plugins?.OneSignal) {
    console.log(`Initializing ${platform} OneSignal with app ID:`, import.meta.env.VITE_ONESIGNAL_APP_ID);
    
    // Common settings for both platforms
    const settings = {
      appId: import.meta.env.VITE_ONESIGNAL_APP_ID,
      // Disable automatic prompting
      promptForPushNotificationsWithUserResponse: false,
      // Set notification channel for Android
      ...(platform === 'android' && {
        android: {
          // For Android set a default notification channel
          channelId: "займы-онлайн-уведомления",
          // Use small icon from resources
          smallIcon: "ic_stat_onesignal_default",
          // Accent color for notifications (orange color)
          accentColor: "FF9829",
          // Make notifications visible on lock screen
          lockScreenVisibility: 1
        }
      }),
      // Set specific iOS settings
      ...(platform === 'ios' && {
        ios: {
          // Request permission automatically at startup
          kOSSettingsKeyAutoPrompt: true,
          // Always display in-app alerts
          kOSSettingsKeyInAppAlerts: true,
          // Include default categories like "Accept" and "Decline"
          kOSSettingsKeyInFocusDisplayOption: 2
        }
      })
    };

    // Initialize the OneSignal plugin with appropriate settings
    window.plugins.OneSignal.setAppId(import.meta.env.VITE_ONESIGNAL_APP_ID);
    window.plugins.OneSignal.setNotificationOpenedHandler((jsonData: any) => {
      console.log('Notification opened:', jsonData);
      // Here handle notification open event (e.g. navigate to specific screens)
    });
    
    // Request permission based on platform
    if (platform === 'ios') {
      window.plugins.OneSignal.promptForPushNotificationsWithUserResponse((accepted: boolean) => {
        console.log("User accepted notifications:", accepted);
      });
    } else {
      // On Android permissions are granted by default in most cases
      window.plugins.OneSignal.setRequiresUserPrivacyConsent(false);
    }
  } else {
    console.error("OneSignal plugin not available in mobile environment");
  }
}

// Send push notification (for admin use)
export async function sendPushNotification(title: string, message: string, url?: string) {
  try {
    console.log("Отправка уведомления:", { title, message, url });
    console.log("Используемый APP_ID:", import.meta.env.VITE_ONESIGNAL_APP_ID);
    console.log("Ключ API:", import.meta.env.VITE_ONESIGNAL_REST_API_KEY ? "Установлен" : "Не установлен");
    
    const environment = detectEnvironment();
    console.log(`Sending notification in ${environment} environment`);

    // For both platforms (web and mobile), we'll use the REST API
    // This ensures consistent behavior regardless of platform
    const payload = {
      app_id: import.meta.env.VITE_ONESIGNAL_APP_ID,
      included_segments: ['Subscribed Users'],
      contents: {
        en: message,
        ru: message
      },
      headings: {
        en: title,
        ru: title
      },
      // For web, set the URL
      url: url || (typeof window !== 'undefined' ? window.location.origin : ''),
      // Добавляем кнопки действий
      buttons: [
        {
          id: "open",
          text: "Открыть",
          url: url || (typeof window !== 'undefined' ? window.location.origin : '')
        }
      ],
      // Настройки для Android
      android_accent_color: "FF9829",
      android_channel_id: "займы-онлайн-уведомления",
      android_group: "loans_group",
      android_group_message: {"ru": "{{посмотреть_новые}} новых уведомлений", "en": "{{посмотреть_новые}} new notifications"},
      small_icon: "ic_stat_onesignal_default",
      large_icon: "https://img.freepik.com/free-vector/money-bag-cash-in-flat-style_53562-11815.jpg?w=128",
      android_visibility: 1,
      
      // Настройки для iOS
      ios_badgeType: "Increase",
      ios_badgeCount: 1,
      ios_sound: "default",
      ios_category: "LOAN_CATEGORY"
    };
    
    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${import.meta.env.VITE_ONESIGNAL_REST_API_KEY}`
      },
      body: JSON.stringify(payload)
    });
    
    const data = await response.json();
    console.log("Ответ от OneSignal API:", data);
    
    // Provide detailed feedback for APK debugging
    if (data.errors) {
      if (data.errors.android_channel_id) {
        console.warn("Android channel ID error. Для APK версии необходимо создать канал уведомлений в Firebase:", data.errors.android_channel_id);
      }
      if (data.errors.ios_category) {
        console.warn("iOS category error. Для APK версии необходимо настроить категории уведомлений в Apple Developer:", data.errors.ios_category);
      }
    }
    
    // Handle common success responses
    if (data.recipients) {
      console.log(`Уведомление отправлено ${data.recipients} получателям`);
    }
    
    return data;
  } catch (error) {
    console.error('Error sending push notification:', error);
    throw error;
  }
}
