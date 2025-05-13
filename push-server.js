import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';
import session from 'express-session';
import MemoryStore from 'memorystore';

// ES Modules не имеют __dirname, создаём его эквивалент
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const MemStore = MemoryStore(session);

// Настройка сессий
app.use(session({
  secret: 'push-notification-app-secret',
  resave: false,
  saveUninitialized: false,
  store: new MemStore({
    checkPeriod: 86400000 // Очистка устаревших сессий раз в день
  })
}));

// Настройка middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Настройка статических файлов
app.use(express.static(path.join(__dirname, 'push-public')));

// Простая защита для админ-маршрутов
const isAdmin = (req, res, next) => {
  if (req.session.adminIsAuthenticated) {
    next();
  } else {
    res.status(401).json({ message: "Необходима авторизация" });
  }
};

// Админ авторизация
app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body;
  
  // Простая авторизация
  if (username === "admin" && password === "admin123") {
    // Сохраняем данные в сессии
    req.session.adminIsAuthenticated = true;
    res.json({
      id: 1,
      username: "admin",
      isAdmin: true
    });
  } else {
    res.status(401).json({ message: "Неверные учетные данные" });
  }
});

// Проверка статуса авторизации
app.get("/api/admin/user", (req, res) => {
  if (req.session.adminIsAuthenticated) {
    res.json({
      id: 1,
      username: "admin",
      isAdmin: true
    });
  } else {
    res.status(401).json({ message: "Не авторизован" });
  }
});

// Выход из системы
app.post("/api/admin/logout", (req, res) => {
  req.session.adminIsAuthenticated = false;
  res.sendStatus(200);
});

// Получение конфигурации OneSignal
app.get("/api/push-notification/config", (req, res) => {
  res.json({
    appId: process.env.VITE_ONESIGNAL_APP_ID || '',
    hasApiKey: !!process.env.VITE_ONESIGNAL_REST_API_KEY,
  });
});

// Отправка push-уведомления
app.post("/api/push-notification", isAdmin, async (req, res) => {
  try {
    const { title, message, url } = req.body;
    
    if (!title || !message) {
      return res.status(400).json({ message: "Заголовок и текст обязательны" });
    }
    
    // Проверка наличия ключей API
    if (!process.env.VITE_ONESIGNAL_APP_ID || !process.env.VITE_ONESIGNAL_REST_API_KEY) {
      return res.status(400).json({ 
        message: "Отсутствуют ключи OneSignal",
        errors: { 
          api_keys: "Не настроены переменные окружения VITE_ONESIGNAL_APP_ID и/или VITE_ONESIGNAL_REST_API_KEY"
        }
      });
    }

    // Формируем запрос к OneSignal API
    const payload = {
      app_id: process.env.VITE_ONESIGNAL_APP_ID,
      included_segments: ['Subscribed Users'],
      contents: {
        en: message,
        ru: message
      },
      headings: {
        en: title,
        ru: title
      },
      url: url || '',
      buttons: url ? [
        {
          id: "open",
          text: "Открыть",
          url: url
        }
      ] : undefined,
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
    
    // Отправляем запрос к OneSignal API
    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${process.env.VITE_ONESIGNAL_REST_API_KEY}`
      },
      body: JSON.stringify(payload)
    });
    
    const data = await response.json();
    
    if (data.errors) {
      return res.status(400).json({ 
        message: "Ошибка отправки уведомления", 
        errors: data.errors 
      });
    }
    
    res.json({ 
      success: true, 
      data
    });
  } catch (err) {
    console.error("Ошибка отправки push-уведомления:", err);
    res.status(500).json({ message: "Внутренняя ошибка сервера" });
  }
});

// Обработка всех остальных маршрутов - отдаём HTML
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'push-public', 'index.html'));
});

// Запуск сервера
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Сервер для push-уведомлений запущен на порту ${PORT}`);
  console.log(`Откройте http://localhost:${PORT} в браузере`);
});