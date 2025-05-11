// Add type declaration for OneSignal
declare global {
  interface Window {
    OneSignal: any[];
  }
}

// Initialize OneSignal for push notifications
export function initializeOneSignal() {
  if (typeof window !== 'undefined') {
    window.OneSignal = window.OneSignal || [];
    
    const OneSignal = window.OneSignal;
    
    OneSignal.push(function() {
      OneSignal.init({
        appId: import.meta.env.VITE_ONESIGNAL_APP_ID || "",
        allowLocalhostAsSecureOrigin: true,
        notifyButton: {
          enable: true,
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
                  timeDelay: 20
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
    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${import.meta.env.VITE_ONESIGNAL_REST_API_KEY || ""}`
      },
      body: JSON.stringify({
        app_id: import.meta.env.VITE_ONESIGNAL_APP_ID || "",
        included_segments: ['All'],
        contents: {
          en: message,
          ru: message
        },
        headings: {
          en: title,
          ru: title
        },
        url: url
      })
    });
    
    return await response.json();
  } catch (error) {
    console.error('Error sending push notification:', error);
    throw error;
  }
}
