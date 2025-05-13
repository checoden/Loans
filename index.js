import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 5000;

// ES Modules не имеют __dirname, создаём его эквивалент
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware для обработки JSON
app.use(express.json());

// Статические файлы из директории public
app.use(express.static('public'));

// Маршрут для получения конфигурации OneSignal
app.get('/api/push-notification/config', (req, res) => {
  res.json({
    appId: process.env.VITE_ONESIGNAL_APP_ID || '',
    hasApiKey: !!process.env.VITE_ONESIGNAL_REST_API_KEY,
  });
});

// API маршрут для получения предложений МФО
app.get('/api/offers', (req, res) => {
  try {
    // Проверяем, существует ли файл
    const dbPath = path.join(__dirname, 'db', 'offers.json');
    
    if (fs.existsSync(dbPath)) {
      const offersData = fs.readFileSync(dbPath, 'utf8');
      const offers = JSON.parse(offersData);
      
      // Фильтрация по параметрам, если они указаны
      let filteredOffers = [...offers];
      
      if (req.query.amount) {
        const amount = parseInt(req.query.amount);
        filteredOffers = filteredOffers.filter(
          offer => offer.minAmount <= amount && offer.maxAmount >= amount
        );
      }
      
      if (req.query.term) {
        const term = parseInt(req.query.term);
        filteredOffers = filteredOffers.filter(
          offer => offer.minTerm <= term && offer.maxTerm >= term
        );
      }
      
      return res.json(filteredOffers);
    } else {
      // Если файл не существует, создаем его с демо-данными
      const demoOffers = [
        {
          id: 1,
          name: "Займер",
          logo: "/images/zaymer.svg",
          minAmount: 2000,
          maxAmount: 30000,
          minTerm: 7,
          maxTerm: 30,
          rate: 0.99,
          firstLoanFree: true,
          approvalPercent: 92,
          approval: "Мгновенно",
          age: "18-65",
          partnerUrl: "https://example.com/zaymer"
        },
        {
          id: 2,
          name: "МигКредит",
          logo: "/images/migcredit.svg",
          minAmount: 3000,
          maxAmount: 100000,
          minTerm: 5,
          maxTerm: 24,
          rate: 1.2,
          firstLoanFree: false,
          approvalPercent: 89,
          approval: "За 15 минут",
          age: "21-65",
          partnerUrl: "https://example.com/migcredit"
        },
        {
          id: 3,
          name: "MoneyMan",
          logo: "/images/moneyman.svg",
          minAmount: 5000,
          maxAmount: 80000,
          minTerm: 5,
          maxTerm: 18,
          rate: 1.1,
          firstLoanFree: true,
          approvalPercent: 95,
          approval: "За 10 минут",
          age: "18-70",
          partnerUrl: "https://example.com/moneyman"
        }
      ];
      
      fs.mkdirSync(path.dirname(dbPath), { recursive: true });
      fs.writeFileSync(dbPath, JSON.stringify(demoOffers, null, 2));
      
      return res.json(demoOffers);
    }
  } catch (error) {
    console.error('Ошибка при получении предложений:', error);
    return res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Маршрут для отправки push-уведомлений (для админки)
app.post('/api/notifications', async (req, res) => {
  const { title, message, url } = req.body;
  
  if (!title || !message) {
    return res.status(400).json({ error: 'Требуются заголовок и сообщение' });
  }
  
  console.log(`Подготовка к отправке push-уведомления: ${title} - ${message}`);
  
  // Проверка наличия ключей OneSignal
  const ONESIGNAL_APP_ID = process.env.VITE_ONESIGNAL_APP_ID;
  const ONESIGNAL_REST_API_KEY = process.env.VITE_ONESIGNAL_REST_API_KEY;
  
  if (!ONESIGNAL_APP_ID || !ONESIGNAL_REST_API_KEY) {
    console.log('Отсутствуют необходимые ключи OneSignal');
    // В режиме разработки - имитируем отправку
    return res.json({ 
      success: true, 
      message: 'Имитация отправки уведомления (отсутствуют ключи OneSignal)',
      note: 'Для настоящей отправки укажите переменные окружения VITE_ONESIGNAL_APP_ID и VITE_ONESIGNAL_REST_API_KEY',
      notification: { title, message, url, sentAt: new Date().toISOString() }
    });
  }
  
  try {
    // Подготовка данных для OneSignal API
    const payload = {
      app_id: ONESIGNAL_APP_ID,
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
    
    console.log('Отправка запроса к OneSignal API...');
    
    // Отправка запроса к OneSignal API
    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${ONESIGNAL_REST_API_KEY}`
      },
      body: JSON.stringify(payload)
    });
    
    const responseData = await response.json();
    
    if (responseData.errors) {
      console.error('Ошибка от OneSignal API:', responseData.errors);
      return res.status(400).json({ 
        success: false, 
        message: 'Ошибка отправки уведомления',
        errors: responseData.errors
      });
    }
    
    console.log('Push-уведомление успешно отправлено через OneSignal');
    return res.json({ 
      success: true, 
      message: 'Уведомление отправлено успешно',
      data: responseData
    });
  } catch (error) {
    console.error('Ошибка при отправке push-уведомления:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Ошибка сервера при отправке уведомления',
      error: error.message
    });
  }
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
  console.log(`Откройте http://localhost:${PORT} в браузере`);
});