import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 3000;

// ES Modules не имеют __dirname, создаём его эквивалент
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware для обработки JSON
app.use(express.json());

// Статические файлы из директории public
app.use(express.static('public'));

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
app.post('/api/notifications', (req, res) => {
  const { title, message, url } = req.body;
  
  if (!title || !message) {
    return res.status(400).json({ error: 'Требуются заголовок и сообщение' });
  }
  
  console.log(`Push-уведомление отправлено: ${title} - ${message}`);
  
  // Здесь в реальном приложении будет вызов API OneSignal
  // Но для упрощенной версии мы просто имитируем успешную отправку
  
  return res.json({ 
    success: true, 
    message: 'Уведомление отправлено успешно',
    notification: { title, message, url, sentAt: new Date().toISOString() }
  });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
  console.log(`Откройте http://localhost:${PORT} в браузере`);
});