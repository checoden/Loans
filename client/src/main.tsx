import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initializeOneSignal } from "./lib/onesignal";

// Принудительная инициализация OneSignal при запуске приложения
// Особенно важно для мобильных устройств Android 15+
console.log("🚀 Запуск приложения - инициализируем OneSignal");

// Инициализация для веб-браузера
if (typeof window !== 'undefined') {
  // Сразу инициализируем OneSignal
  initializeOneSignal();
  
  // Дополнительная инициализация для мобильных устройств
  document.addEventListener('DOMContentLoaded', () => {
    console.log("📱 DOMContentLoaded - повторная инициализация OneSignal");
    setTimeout(() => {
      initializeOneSignal();
    }, 500);
  });
  
  // Для Cordova/Capacitor устройств
  document.addEventListener('deviceready', () => {
    console.log("📱 deviceready - инициализация OneSignal для мобильного устройства");
    setTimeout(() => {
      initializeOneSignal();
    }, 1000);
  });
  
  // Fallback через setTimeout для мобильных устройств
  setTimeout(() => {
    console.log("⏰ Fallback инициализация OneSignal через 3 секунды");
    initializeOneSignal();
  }, 3000);
}

createRoot(document.getElementById("root")!).render(<App />);
