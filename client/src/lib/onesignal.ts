// Add type declaration for OneSignal and Cordova
declare global {
  interface Window {
    OneSignal: any;
    plugins?: {
      OneSignal?: any;
    };
    device?: {
      platform: string;
    };
    cordova?: any;
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
    
    // Initialize the OneSignal plugin with app ID
    window.plugins.OneSignal.setAppId(import.meta.env.VITE_ONESIGNAL_APP_ID);
    
    // Configure channel for Android
    if (platform === 'android') {
      try {
        // Setup Android notification channel if available
        if (typeof window.plugins.OneSignal.setNotificationChannel === 'function') {
          window.plugins.OneSignal.setNotificationChannel({
            id: "займы-онлайн-уведомления",
            name: "Займы онлайн уведомления",
            description: "Уведомления о новых займах и предложениях",
            importance: 4, // HIGH
            enableVibrate: true,
            enableSound: true,
            showBadge: true
          });
        }
        
        // ПРИНУДИТЕЛЬНЫЙ ЗАПРОС РАЗРЕШЕНИЙ ДЛЯ ANDROID 15+
        console.log("🚀 Принудительный запрос push-разрешений для Android 15+");
        
        // Метод 1: Через нативный Android API
        setTimeout(() => {
          try {
            if (window.cordova?.exec) {
              window.cordova.exec(
                (success: any) => {
                  console.log("✅ Разрешения запрошены через cordova.exec:", success);
                },
                (error: any) => {
                  console.warn("⚠️ Ошибка запроса через cordova.exec:", error);
                },
                'OneSignal',
                'requestPermission',
                []
              );
            }
          } catch (e) {
            console.warn("Cordova.exec недоступен:", e);
          }
        }, 1000);
        
        // Метод 2: Правильный API для OneSignal SDK v5.2.13
        setTimeout(() => {
          try {
            // SDK v5+ использует Notifications.requestPermission
            if (window.plugins?.OneSignal?.Notifications?.requestPermission) {
              window.plugins.OneSignal.Notifications.requestPermission(true).then((result: boolean) => {
                console.log("✅ OneSignal v5 requestPermission результат:", result);
              }).catch((error: any) => {
                console.warn("⚠️ Ошибка OneSignal v5 requestPermission:", error);
              });
            }
            // Fallback для старых версий
            else if (window.plugins?.OneSignal?.requestPermission) {
              window.plugins.OneSignal.requestPermission((success: boolean) => {
                console.log("✅ Legacy requestPermission результат:", success);
              });
            }
          } catch (e) {
            console.warn("OneSignal.requestPermission недоступен:", e);
          }
        }, 2000);
        
        // Метод 3: Через Permissions API если доступен
        setTimeout(() => {
          try {
            if (window.cordova?.plugins?.permissions) {
              window.cordova.plugins.permissions.requestPermission(
                'android.permission.POST_NOTIFICATIONS',
                (status: any) => {
                  console.log("✅ POST_NOTIFICATIONS статус:", status);
                },
                (error: any) => {
                  console.warn("⚠️ Ошибка POST_NOTIFICATIONS:", error);
                }
              );
            }
          } catch (e) {
            console.warn("Permissions plugin недоступен:", e);
          }
        }, 3000);
        
      } catch (e) {
        console.warn("Error configuring notification channel:", e);
      }
    }
    
    // Modern API (OneSignal SDK v5+)
    if (window.plugins.OneSignal.Notifications) {
      console.log("Initializing using OneSignal SDK v5+ API");
      
      // Check permissions first
      const checkAndRequestPermissions = async () => {
        try {
          // Check current permission status
          const permStatus = window.plugins?.OneSignal?.Notifications?.permissionNative ?
            await window.plugins.OneSignal.Notifications.permissionNative() : false;
          console.log("Current notification permission status:", permStatus);
          
          if (permStatus !== true) {
            console.log("Requesting notification permissions for Android 13+");
            // This works for Android 13+ and iOS
            if (window.plugins?.OneSignal?.Notifications?.requestPermission) {
              const result = await window.plugins.OneSignal.Notifications.requestPermission(true);
              console.log("Permission request result:", result);
            }
          } else {
            console.log("Notification permissions already granted");
          }
          
          // Opt in to push notifications after permission granted
          if (window.plugins?.OneSignal?.User?.pushSubscription?.optIn) {
            await window.plugins.OneSignal.User.pushSubscription.optIn();
          }
          console.log("Successfully opted in to push notifications");
          
        } catch (error) {
          console.error("Error during permission handling:", error);
        }
      };
      
      // Execute permission check and request
      checkAndRequestPermissions();
      
      // Setup notification opened handler
      window.plugins.OneSignal.Notifications.addEventListener('click', (event: any) => {
        console.log('Notification clicked:', event);
        // Handle notification click event
      });
      
    } else {
      // Legacy API (OneSignal SDK v3.x)
      console.log("Initializing using OneSignal SDK v3.x API");
      
      // For Android 13+ (API level 33+), we need to explicitly request POST_NOTIFICATIONS permission
      if (platform === 'android') {
        try {
          // Check permissions and request if needed
          if (typeof window.plugins.OneSignal.checkPermissionAndRequestPermission === 'function') {
            window.plugins.OneSignal.checkPermissionAndRequestPermission((state: any) => {
              console.log("Permission status:", state);
            });
          } else {
            // Fallback to standard request method
            window.plugins.OneSignal.promptForPushNotificationsWithUserResponse((accepted: boolean) => {
              console.log("User accepted notifications:", accepted);
            });
          }
        } catch (e) {
          console.warn("Error requesting notification permissions:", e);
          
          // Last resort - try to handle notification permission completely manually
          try {
            if (window.cordova && 
                window.cordova.plugins && 
                window.cordova.plugins.permissions) {
              window.cordova.plugins.permissions.requestPermission('POST_NOTIFICATIONS', 
                (status: any) => {
                  console.log("Manual permission request status:", status);
                }, 
                (error: any) => {
                  console.error("Error requesting permission manually:", error);
                }
              );
            }
          } catch (manualError) {
            console.error("Could not request permissions manually:", manualError);
          }
        }
      } else if (platform === 'ios') {
        // iOS permissions
        window.plugins.OneSignal.promptForPushNotificationsWithUserResponse((accepted: boolean) => {
          console.log("iOS user accepted notifications:", accepted);
        });
      }
    }
    
    // Устанавливаем обработчик открытия уведомлений
    window.plugins.OneSignal.setNotificationOpenedHandler((jsonData: any) => {
      console.log('Notification opened:', jsonData);
      // Here handle notification open event (e.g. navigate to specific screens)
    });
    
    // Не требуем согласия на обработку данных для работы уведомлений
    window.plugins.OneSignal.setRequiresUserPrivacyConsent(false);
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
