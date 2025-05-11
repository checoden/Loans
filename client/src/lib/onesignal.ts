// Add type declaration for OneSignal
declare global {
  interface Window {
    OneSignal: any;
  }
}

// Initialize OneSignal for push notifications
export function initializeOneSignal() {
  if (typeof window !== 'undefined') {
    window.OneSignal = window.OneSignal || [];
    
    console.log("Initializing OneSignal with app ID:", import.meta.env.VITE_ONESIGNAL_APP_ID);
    
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

// Send push notification (for admin use)
export async function sendPushNotification(title: string, message: string, url?: string) {
  try {
    console.log("Отправка уведомления:", { title, message, url });
    console.log("Используемый APP_ID:", import.meta.env.VITE_ONESIGNAL_APP_ID);
    console.log("Ключ API:", import.meta.env.VITE_ONESIGNAL_REST_API_KEY ? "Установлен" : "Не установлен");
    
    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${import.meta.env.VITE_ONESIGNAL_REST_API_KEY}`
      },
      body: JSON.stringify({
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
        url: url || window.location.origin,
        // Добавляем кнопки действий
        buttons: [
          {
            id: "open",
            text: "Открыть",
            url: url || window.location.origin
          }
        ],
        // Настройки отображения на Android
        android_accent_color: "FF9829",
        android_channel_id: "займы-онлайн-уведомления",
        // Установка маленького значка для Android
        small_icon: "ic_stat_onesignal_default",
        // Делаем уведомления видимыми даже при блокировке экрана
        android_visibility: 1
      })
    });
    
    const data = await response.json();
    console.log("Ответ от OneSignal API:", data);
    return data;
  } catch (error) {
    console.error('Error sending push notification:', error);
    throw error;
  }
}
