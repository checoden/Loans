/**
 * Скрипт для запуска сервера push-уведомлений, 
 * который пишет логи в файл вместо stdout
 */
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

// ES Modules не имеют __dirname, создаём его эквивалент
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Путь к файлу логов
const logFile = path.join(__dirname, 'push-server.log');

// Открываем файл для записи логов
const logStream = fs.createWriteStream(logFile, { flags: 'a' });

// Функция для записи в лог
function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  logStream.write(logMessage);
  console.log(logMessage.trim());
}

// Путь к скрипту сервера
const serverScript = path.join(__dirname, 'push-server.js');

// Функция для запуска сервера
function startServer() {
  log('Запуск сервера push-уведомлений...');
  
  // Проверяем существование файла сервера
  if (!fs.existsSync(serverScript)) {
    log(`Ошибка: Файл ${serverScript} не найден`);
    process.exit(1);
  }
  
  // Запускаем сервер как дочерний процесс
  const server = spawn('node', [serverScript], {
    stdio: ['ignore', logStream, logStream],
    detached: true
  });
  
  // Не ждем завершения дочернего процесса
  server.unref();
  
  log(`Сервер запущен с PID ${server.pid}`);
  log(`Запись логов в файл: ${logFile}`);
  log('Сервер для push-уведомлений запущен на порту 3000');
  log('Откройте http://localhost:3000 в браузере');
  
  // Завершаем родительский процесс через 2 секунды
  setTimeout(() => {
    log('Родительский процесс завершает работу, сервер продолжает работать в фоне');
    process.exit(0);
  }, 2000);
}

// Запускаем сервер
startServer();