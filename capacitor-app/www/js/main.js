document.addEventListener('DOMContentLoaded', function() {
  // Инициализация переменных и состояния приложения
  let loans = [];
  let filteredLoans = [];
  let isFiltersVisible = false;
  let selectedAmount = 15000;
  let selectedTerm = 7;
  
  // Получение ссылок на DOM элементы интерфейса
  const filters = {
    amount: document.getElementById('amount'),
    amountValue: document.getElementById('amountValue'),
    term: document.getElementById('term'),
    termValue: document.getElementById('termValue'),
    activeAmount: document.getElementById('activeAmount'),
    activeTerm: document.getElementById('activeTerm'),
    toggleBtn: document.getElementById('toggleFilters'),
    applyBtn: document.getElementById('applyFilters'),
    content: document.getElementById('filterContent'),
    activeFilters: document.getElementById('activeFilters')
  };
  
  const loansUI = {
    container: document.getElementById('loansContainer'),
    count: document.getElementById('loansCountValue')
  };
  
  const calculator = {
    modal: document.getElementById('calculator'),
    openBtn: document.getElementById('calculatorBtn'),
    closeBtn: document.getElementById('closeCalculator'),
    amount: document.getElementById('calcAmount'),
    amountValue: document.getElementById('calcAmountValue'),
    term: document.getElementById('calcTerm'),
    termValue: document.getElementById('calcTermValue'),
    rate: document.getElementById('calcRate'),
    totalToRepay: document.getElementById('totalToRepay'),
    overPayment: document.getElementById('overPayment'),
    dailyPayment: document.getElementById('dailyPayment'),
    effectiveRate: document.getElementById('effectiveRate')
  };
  
  const webview = {
    modal: document.getElementById('webview'),
    title: document.getElementById('webviewTitle'),
    frame: document.getElementById('webviewFrame'),
    closeBtn: document.getElementById('closeWebview')
  };
  
  // Функция для форматирования чисел в формате валюты
  function formatCurrency(value) {
    return new Intl.NumberFormat('ru-RU').format(value) + ' ₽';
  }
  
  // Функция для форматирования дней с правильными окончаниями
  function formatDays(days) {
    const lastDigit = days % 10;
    const lastTwoDigits = days % 100;
    
    if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
      return days + ' дней';
    }
    
    if (lastDigit === 1) {
      return days + ' день';
    }
    
    if (lastDigit >= 2 && lastDigit <= 4) {
      return days + ' дня';
    }
    
    return days + ' дней';
  }
  
  // Функция для загрузки займов с API
  async function loadLoans(amount, term) {
    try {
      let url = '/api/offers';
      const params = [];
      
      if (amount) params.push(`amount=${amount}`);
      if (term) params.push(`term=${term}`);
      
      if (params.length > 0) {
        url += '?' + params.join('&');
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      loans = data;
      filteredLoans = data;
      
      return data;
    } catch (error) {
      console.error('Ошибка при загрузке займов:', error);
      return [];
    }
  }
  
  // Функция для создания HTML-карточки займа
  function createLoanCard(loan) {
    const card = document.createElement('div');
    card.className = 'bg-white rounded-lg shadow overflow-hidden';
    
    const firstLoanBadge = loan.firstLoanFree 
      ? `<span class="absolute top-3 right-3 bg-green-100 text-green-800 text-xs font-semibold px-2 py-0.5 rounded">0% первый займ</span>`
      : '';
    
    card.innerHTML = `
      <div class="relative p-4">
        ${firstLoanBadge}
        <div class="flex flex-col sm:flex-row sm:items-center">
          <div class="flex-shrink-0 mb-4 sm:mb-0 sm:mr-4">
            <img src="${loan.logo}" alt="${loan.name}" class="h-12 sm:h-16 w-auto object-contain">
          </div>
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-gray-900">${loan.name}</h3>
            <div class="grid grid-cols-2 gap-x-4 gap-y-2 mt-2">
              <div>
                <p class="text-xs text-gray-500">Сумма</p>
                <p class="text-sm font-medium">${formatCurrency(loan.minAmount)} - ${formatCurrency(loan.maxAmount)}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500">Срок</p>
                <p class="text-sm font-medium">${loan.minTerm} - ${loan.maxTerm} дн.</p>
              </div>
              <div>
                <p class="text-xs text-gray-500">Ставка</p>
                <p class="text-sm font-medium">${loan.rate}% в день</p>
              </div>
              <div>
                <p class="text-xs text-gray-500">Возраст</p>
                <p class="text-sm font-medium">${loan.age}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="border-t border-gray-100 p-4 bg-gray-50">
        <button class="get-loan-btn w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors" data-id="${loan.id}">
          Получить займ
        </button>
      </div>
    `;
    
    // Добавляем обработчик для кнопки получения займа
    const getLoanBtn = card.querySelector('.get-loan-btn');
    getLoanBtn.addEventListener('click', () => openWebView(loan));
    
    return card;
  }
  
  // Функция для отрисовки займов в интерфейсе
  function renderLoans(loans) {
    loansUI.container.innerHTML = '';
    loansUI.count.textContent = loans.length;
    
    if (loans.length === 0) {
      const noLoans = document.createElement('div');
      noLoans.className = 'bg-blue-50 border border-blue-200 text-blue-700 p-5 rounded-lg';
      noLoans.innerHTML = '<p>Нет предложений, соответствующих выбранным параметрам. Попробуйте изменить сумму или срок займа.</p>';
      loansUI.container.appendChild(noLoans);
      return;
    }
    
    loans.forEach(loan => {
      const card = createLoanCard(loan);
      loansUI.container.appendChild(card);
    });
  }
  
  // Функция для обновления отображения выбранных фильтров
  function updateActiveFilters() {
    filters.activeAmount.textContent = selectedAmount;
    filters.activeTerm.textContent = selectedTerm;
    filters.activeFilters.classList.remove('hidden');
  }
  
  // Функция для переключения видимости фильтров
  function toggleFilters() {
    isFiltersVisible = !isFiltersVisible;
    
    if (isFiltersVisible) {
      filters.content.classList.remove('hidden');
      filters.toggleBtn.querySelector('span').textContent = 'Скрыть фильтры';
    } else {
      filters.content.classList.add('hidden');
      filters.toggleBtn.querySelector('span').textContent = 'Показать фильтры';
      
      // Если есть активные фильтры, показываем их
      if (selectedAmount > 0 || selectedTerm > 0) {
        updateActiveFilters();
      }
    }
  }
  
  // Функция для обновления займов на основе выбранных фильтров
  async function applyFilters() {
    selectedAmount = parseInt(filters.amount.value);
    selectedTerm = parseInt(filters.term.value);
    
    // Сохраняем выбранные значения фильтров
    updateActiveFilters();
    
    // Загружаем займы с учетом фильтров
    const filteredLoans = await loadLoans(selectedAmount, selectedTerm);
    
    // Отрисовываем займы
    renderLoans(filteredLoans);
    
    // Закрываем фильтры
    if (isFiltersVisible) {
      toggleFilters();
    }
  }
  
  // Функция для расчета параметров займа в калькуляторе
  function calculateLoan() {
    const amount = parseInt(calculator.amount.value);
    const term = parseInt(calculator.term.value);
    const rate = parseFloat(calculator.rate.value);
    
    const dailyInterest = rate / 100;
    const totalInterest = amount * dailyInterest * term;
    const totalRepay = amount + totalInterest;
    const dailyPay = totalRepay / term;
    const effectiveR = dailyInterest * 365 * 100;
    
    calculator.totalToRepay.textContent = formatCurrency(Math.round(totalRepay));
    calculator.overPayment.textContent = formatCurrency(Math.round(totalInterest));
    calculator.dailyPayment.textContent = formatCurrency(Math.round(dailyPay));
    calculator.effectiveRate.textContent = Math.round(effectiveR) + '%';
  }
  
  // Функция для открытия модального окна с калькулятором
  function openCalculator() {
    calculator.modal.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
    
    // Устанавливаем начальные значения из фильтров
    calculator.amount.value = selectedAmount;
    calculator.term.value = selectedTerm;
    
    // Обновляем отображаемые значения
    calculator.amountValue.textContent = formatCurrency(selectedAmount);
    calculator.termValue.textContent = formatDays(selectedTerm);
    
    // Рассчитываем займ
    calculateLoan();
  }
  
  // Функция для закрытия модального окна с калькулятором
  function closeCalculator() {
    calculator.modal.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
  }
  
  // Функция для открытия WebView с партнерской ссылкой
  function openWebView(loan) {
    webview.modal.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
    
    webview.title.textContent = loan.name;
    webview.frame.src = loan.partnerUrl;
  }
  
  // Функция для закрытия WebView
  function closeWebView() {
    webview.modal.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
    webview.frame.src = 'about:blank';
  }
  
  // Инициализация обработчиков событий
  function initEventListeners() {
    // Обработчики для фильтров
    filters.toggleBtn.addEventListener('click', toggleFilters);
    filters.applyBtn.addEventListener('click', applyFilters);
    
    // Обновление отображаемых значений при изменении ползунков фильтров
    filters.amount.addEventListener('input', function() {
      filters.amountValue.textContent = formatCurrency(this.value);
    });
    
    filters.term.addEventListener('input', function() {
      filters.termValue.textContent = formatDays(this.value);
    });
    
    // Обработчики для калькулятора
    calculator.openBtn.addEventListener('click', openCalculator);
    calculator.closeBtn.addEventListener('click', closeCalculator);
    
    // Обновление отображаемых значений при изменении ползунков калькулятора
    calculator.amount.addEventListener('input', function() {
      calculator.amountValue.textContent = formatCurrency(this.value);
      calculateLoan();
    });
    
    calculator.term.addEventListener('input', function() {
      calculator.termValue.textContent = formatDays(this.value);
      calculateLoan();
    });
    
    calculator.rate.addEventListener('input', calculateLoan);
    
    // Обработчики для WebView
    webview.closeBtn.addEventListener('click', closeWebView);
    
    // Закрытие модальных окон при клике на затемненный фон
    calculator.modal.addEventListener('click', function(e) {
      if (e.target === this) closeCalculator();
    });
    
    webview.modal.addEventListener('click', function(e) {
      if (e.target === this) closeWebView();
    });
  }
  
  // Инициализация приложения
  async function initApp() {
    // Инициализируем обработчики событий
    initEventListeners();
    
    // Загружаем займы
    const loans = await loadLoans();
    
    // Отрисовываем займы
    renderLoans(loans);
    
    // Устанавливаем активные фильтры
    updateActiveFilters();
  }
  
  // Запуск приложения
  initApp();
});