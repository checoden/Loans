/**
 * Скрипт для запуска сервера push-уведомлений с автоматическим перезапуском
 */
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

// ES Modules не имеют __dirname, создаём его эквивалент
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Путь к скрипту сервера
const serverScript = path.join(__dirname, 'push-server.js');

// Функция для запуска сервера
function startServer() {
  console.log('Запуск сервера push-уведомлений...');
  
  // Проверяем существование файла сервера
  if (!fs.existsSync(serverScript)) {
    console.error(`Ошибка: Файл ${serverScript} не найден`);
    process.exit(1);
  }
  
  // Запускаем сервер как дочерний процесс
  const server = spawn('node', [serverScript], {
    stdio: 'inherit',
    detached: false
  });
  
  // Обработка выхода сервера
  server.on('close', (code) => {
    console.log(`Сервер завершил работу с кодом ${code}`);
    
    if (code !== 0) {
      console.log('Перезапуск сервера через 3 секунды...');
      setTimeout(startServer, 3000);
    }
  });
  
  // Обработка ошибок
  server.on('error', (err) => {
    console.error('Ошибка при запуске сервера:', err);
    console.log('Перезапуск сервера через 3 секунды...');
    setTimeout(startServer, 3000);
  });
  
  // Обработка сигналов завершения для корректного завершения дочерних процессов
  process.on('SIGINT', () => {
    console.log('Получен сигнал SIGINT, завершение работы...');
    server.kill('SIGINT');
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    console.log('Получен сигнал SIGTERM, завершение работы...');
    server.kill('SIGTERM');
    process.exit(0);
  });
}

// Запускаем сервер
startServer();