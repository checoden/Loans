// env.js - Файл для определения окружения и базового URL
(function() {
  // Определение базового URL для API и приложения
  function getBaseUrl() {
    // Обнаруживаем режим работы
    const isProd = window.location.hostname.includes('.replit.app') || 
                   window.location.hostname.includes('.repl.co');
    
    // В production используем полный URL
    if (isProd) {
      return window.location.origin;
    }
    
    // В режиме разработки используем относительные пути
    return '';
  }
  
  // Определяем url replit для capacitor
  function getReplitUrl() {
    // Если мы уже на домене Replit, используем текущий домен
    if (window.location.hostname.includes('.replit.app') || 
        window.location.hostname.includes('.repl.co')) {
      return window.location.origin;
    }
    
    // В режиме разработки пытаемся определить Replit домен (можно обновить)
    return 'https://mikro-loan-app.replit.app';
  }
  
  // Экспортируем функцию и базовый URL
  window.APP_ENV = {
    getBaseUrl: getBaseUrl,
    baseUrl: getBaseUrl(),
    replitUrl: getReplitUrl(),
    isProd: window.location.hostname.includes('.replit.app') || 
            window.location.hostname.includes('.repl.co')
  };
})();