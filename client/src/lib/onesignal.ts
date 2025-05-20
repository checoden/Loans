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
    // Для Android-приложения не инициализируем веб-версию OneSignal
    // чтобы избежать ошибок "This app ID does not have any web platforms enabled"
    if (window.location.href.includes('android-app://') || 
        window.location.href.includes('capacitor://') ||
        (typeof navigator !== 'undefined' && /android/i.test(navigator.userAgent))) {
      console.log("Запущено в Android-приложении, пропускаем инициализацию Web OneSignal");
      return;
    }
    
    window.OneSignal = window.OneSignal || [];
    
    console.log("Initializing Web OneSignal with app ID:", import.meta.env.VITE_ONESIGNAL_APP_ID);
    
    try {
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
    } catch (error) {
      console.error("Ошибка при инициализации OneSignal для Web:", error);
    }
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
    
    // Запрашиваем разрешение на показ уведомлений (важно для Android 13+)
    // Новый метод в OneSignal 5.0+
    if (window.plugins.OneSignal.Notifications && typeof window.plugins.OneSignal.Notifications.requestPermission === 'function') {
      console.log("Requesting notification permission with new API (OneSignal 5.0+)");
      window.plugins.OneSignal.Notifications.requestPermission(true)
        .then((accepted: boolean) => {
          console.log("User accepted notifications (new API):", accepted);
        })
        .catch((error: any) => {
          console.error("Error requesting notification permission:", error);
        });
    } else {
      // Старый метод запроса разрешений для OneSignal 3.x
      console.log("Requesting notification permission with legacy API (OneSignal 3.x)");
      if (platform === 'ios') {
        window.plugins.OneSignal.promptForPushNotificationsWithUserResponse((accepted: boolean) => {
          console.log("User accepted notifications (legacy API):", accepted);
        });
      } else {
        // Для Android < 13 разрешения не требовались, но теперь нужно явно запрашивать
        console.log("Android platform detected, attempting to request permissions");
        try {
          // Пробуем вызвать API, который может быть доступен
          if (typeof window.plugins.OneSignal.promptForPushNotificationsWithUserResponse === 'function') {
            window.plugins.OneSignal.promptForPushNotificationsWithUserResponse((accepted: boolean) => {
              console.log("Android user accepted notifications:", accepted);
            });
          }
        } catch (e) {
          console.warn("Could not request notification permission on Android:", e);
        }
      }
    }
    
    // Устанавливаем обработчик открытия уведомлений
    window.plugins.OneSignal.setNotificationOpenedHandler((jsonData: any) => {
      console.log('Notification opened:', jsonData);
      // Here handle notification open event (e.g. navigate to specific screens)
    });
    
    // Не требуем согласия на обработку данных для работы уведомлений
    window.plugins.OneSignal.setRequiresUserPrivacyConsent(false);
    
    // ВАЖНО: Дополнительно гарантируем запрос разрешений для Android 13+
    // Делаем запрос с небольшой задержкой после полной инициализации OneSignal
    setTimeout(() => {
      try {
        if (platform === 'android' && window.plugins && window.plugins.OneSignal && window.plugins.OneSignal.Notifications) {
          console.log("⚠️ ЯВНО вызываем requestPermission для гарантии показа диалога разрешений на Android 13+");
          window.plugins.OneSignal.Notifications.requestPermission(true)
            .then((accepted: boolean) => {
              console.log("✅ Запрос разрешения на показ уведомлений выполнен. Пользователь принял:", accepted);
            })
            .catch((error: any) => {
              console.error("❌ Ошибка при запросе разрешения:", error);
            });
        }
      } catch (e) {
        console.warn("❌ Не удалось выполнить дополнительный запрос разрешений:", e);
      }
    }, 2000); // Задержка 2 секунды для стабильности
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

    // Создаем базовый payload для отправки уведомлений
    const payload = {
      app_id: import.meta.env.VITE_ONESIGNAL_APP_ID,
      // Пробуем отправить на все устройства 
      included_segments: ['Active Users'],
      // Для охвата даже не зарегистрированных в Firebase устройств
      isAnyWeb: true,
      // Включаем все возможные каналы доставки
      channel_for_external_user_ids: "push",
      contents: {
        en: message,
        ru: message
      },
      headings: {
        en: title,
        ru: title
      },
      // For web, set the URL - всегда используем полный HTTPS URL в любой среде
      url: url || (typeof window !== 'undefined' 
        ? window.location.origin.includes('replit') ? window.location.origin : 'https://onlineloans.replit.app'
        : 'https://onlineloans.replit.app'),
      // Добавляем кнопки действий
      buttons: [
        {
          id: "open",
          text: "Открыть",
          url: url || (typeof window !== 'undefined' 
            ? window.location.origin.includes('replit') ? window.location.origin : 'https://onlineloans.replit.app'
            : 'https://onlineloans.replit.app')
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
    
    // Сначала пробуем стандартный метод отправки
    let response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${import.meta.env.VITE_ONESIGNAL_REST_API_KEY}`
      },
      body: JSON.stringify(payload)
    });
    
    let data = await response.json();
    console.log("Ответ от OneSignal API (стандартный метод):", data);
    
    // Если не удалось отправить через сегменты, пробуем отправить всем устройствам
    if (data.errors && (Array.isArray(data.errors) ? data.errors.includes("All included players are not subscribed") : String(data.errors).includes("All included players are not subscribed"))) {
      console.log("Пробуем альтернативный метод отправки...");
      
      // Создаем модифицированный payload для всех устройств
      const altPayload = {
        ...payload,
        // Очищаем все методы адресации и используем только "All"
        included_segments: ["All"],
        include_player_ids: [], 
        include_external_user_ids: [],
        // Отправляем всем, независимо от подписки
        isAnyWeb: true,
        // Дополнительные настройки для отображения даже без FCM
        priority: 10,
        ttl: 259200 // 3 дня
      };
      
      response = await fetch('https://onesignal.com/api/v1/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${import.meta.env.VITE_ONESIGNAL_REST_API_KEY}`
        },
        body: JSON.stringify(altPayload)
      });
      
      data = await response.json();
      console.log("Ответ от OneSignal API (альтернативный метод):", data);
    }
    
    // Проверка наличия устройств для теста
    if (data.errors && (
        (Array.isArray(data.errors) && data.errors.includes("All included players are not subscribed")) || 
        (typeof data.errors === 'string' && data.errors.includes("All included players are not subscribed")) ||
        (typeof data.errors === 'object' && data.errors.players && 
         (Array.isArray(data.errors.players) 
           ? data.errors.players.includes("All included players are not subscribed")
           : String(data.errors.players).includes("All included players are not subscribed")))
    )) {
      
      console.log("Нет зарегистрированных устройств. Проверяем состояние OneSignal...");
      
      // Запрашиваем статус приложения в OneSignal
      const statusResponse = await fetch(`https://onesignal.com/api/v1/apps/${import.meta.env.VITE_ONESIGNAL_APP_ID}`, {
        headers: {
          'Authorization': `Basic ${import.meta.env.VITE_ONESIGNAL_REST_API_KEY}`
        }
      });
      
      if (statusResponse.ok) {
        const appStatus = await statusResponse.json();
        console.log("Статус приложения в OneSignal:", appStatus);
        
        // Добавляем информацию о статусе в ответ
        data.app_status = appStatus;
      }
    }
    
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
