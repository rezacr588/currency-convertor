// Currency Converter Application
// Uses Frankfurter API for real-time exchange rates

// API Base URL
const API_BASE = 'https://api.frankfurter.app';

// Currency Information with flags and names
const CURRENCY_INFO = {
    USD: { flag: '🇺🇸', name: 'US Dollar' },
    EUR: { flag: '🇪🇺', name: 'Euro' },
    GBP: { flag: '🇬🇧', name: 'British Pound' },
    TRY: { flag: '🇹🇷', name: 'Turkish Lira' },
    JPY: { flag: '🇯🇵', name: 'Japanese Yen' },
    CHF: { flag: '🇨🇭', name: 'Swiss Franc' },
    AUD: { flag: '🇦🇺', name: 'Australian Dollar' },
    CAD: { flag: '🇨🇦', name: 'Canadian Dollar' },
    CNY: { flag: '🇨🇳', name: 'Chinese Yuan' },
    INR: { flag: '🇮🇳', name: 'Indian Rupee' },
    MXN: { flag: '🇲🇽', name: 'Mexican Peso' },
    SGD: { flag: '🇸🇬', name: 'Singapore Dollar' },
    HKD: { flag: '🇭🇰', name: 'Hong Kong Dollar' },
    NOK: { flag: '🇳🇴', name: 'Norwegian Krone' },
    SEK: { flag: '🇸🇪', name: 'Swedish Krona' },
    DKK: { flag: '🇩🇰', name: 'Danish Krone' },
    NZD: { flag: '🇳🇿', name: 'New Zealand Dollar' },
    ZAR: { flag: '🇿🇦', name: 'South African Rand' },
    RUB: { flag: '🇷🇺', name: 'Russian Ruble' },
    BRL: { flag: '🇧🇷', name: 'Brazilian Real' },
    KRW: { flag: '🇰🇷', name: 'South Korean Won' },
    PLN: { flag: '🇵🇱', name: 'Polish Zloty' },
    THB: { flag: '🇹🇭', name: 'Thai Baht' },
    IDR: { flag: '🇮🇩', name: 'Indonesian Rupiah' },
    HUF: { flag: '🇭🇺', name: 'Hungarian Forint' },
    CZK: { flag: '🇨🇿', name: 'Czech Koruna' },
    ILS: { flag: '🇮🇱', name: 'Israeli Shekel' },
    PHP: { flag: '🇵🇭', name: 'Philippine Peso' },
    MYR: { flag: '🇲🇾', name: 'Malaysian Ringgit' },
    RON: { flag: '🇷🇴', name: 'Romanian Leu' },
    BGN: { flag: '🇧🇬', name: 'Bulgarian Lev' },
    ISK: { flag: '🇮🇸', name: 'Icelandic Krona' }
};

// Quick conversion pairs
const QUICK_PAIRS = [
    { from: 'USD', to: 'EUR' },
    { from: 'USD', to: 'GBP' },
    { from: 'EUR', to: 'TRY' },
    { from: 'USD', to: 'TRY' },
    { from: 'GBP', to: 'EUR' },
    { from: 'EUR', to: 'JPY' }
];

// Historical comparison pairs
const HISTORICAL_PAIRS = [
    { from: 'USD', to: 'EUR' },
    { from: 'USD', to: 'GBP' },
    { from: 'EUR', to: 'TRY' },
    { from: 'USD', to: 'JPY' }
];

// State
let availableCurrencies = [];
let currentRates = {};
let baseCurrency = 'USD';

// DOM Elements
const elements = {
    amount: document.getElementById('amount'),
    fromCurrency: document.getElementById('fromCurrency'),
    toCurrency: document.getElementById('toCurrency'),
    swapBtn: document.getElementById('swapBtn'),
    resultAmount: document.getElementById('resultAmount'),
    rateInfo: document.getElementById('rateInfo'),
    lastUpdated: document.getElementById('lastUpdated'),
    baseCurrency: document.getElementById('baseCurrency'),
    ratesGrid: document.getElementById('ratesGrid'),
    refreshBtn: document.getElementById('refreshBtn'),
    quickConvertGrid: document.getElementById('quickConvertGrid'),
    historicalGrid: document.getElementById('historicalGrid'),
    loadingOverlay: document.getElementById('loadingOverlay'),
    errorToast: document.getElementById('errorToast'),
    toastMessage: document.getElementById('toastMessage')
};

// Utility Functions
function showLoading() {
    elements.loadingOverlay.classList.add('active');
}

function hideLoading() {
    elements.loadingOverlay.classList.remove('active');
}

function showError(message) {
    elements.toastMessage.textContent = message;
    elements.errorToast.classList.add('active');
    setTimeout(() => {
        elements.errorToast.classList.remove('active');
    }, 4000);
}

function formatNumber(num, decimals = 2) {
    if (num >= 1000) {
        return num.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    }
    return num.toFixed(decimals);
}

function formatDate(date) {
    return new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short'
    }).format(date);
}

function getDateString(daysAgo = 0) {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString().split('T')[0];
}

function getCurrencyInfo(code) {
    return CURRENCY_INFO[code] || { flag: '💰', name: code };
}

// API Functions
async function fetchWithRetry(url, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            if (i === retries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
    }
}

async function fetchCurrencies() {
    try {
        const data = await fetchWithRetry(`${API_BASE}/currencies`);
        availableCurrencies = Object.keys(data);
        return availableCurrencies;
    } catch (error) {
        console.error('Error fetching currencies:', error);
        showError('Failed to load currencies. Please refresh the page.');
        throw error;
    }
}

async function fetchLatestRates(base = 'USD') {
    try {
        const data = await fetchWithRetry(`${API_BASE}/latest?from=${base}`);
        currentRates = data.rates;
        currentRates[base] = 1; // Add base currency with rate 1
        return data;
    } catch (error) {
        console.error('Error fetching rates:', error);
        showError('Failed to fetch exchange rates.');
        throw error;
    }
}

async function fetchConversion(from, to, amount) {
    try {
        if (from === to) {
            return { amount, rate: 1 };
        }
        const data = await fetchWithRetry(`${API_BASE}/latest?amount=${amount}&from=${from}&to=${to}`);
        const rate = data.rates[to] / amount;
        return { amount: data.rates[to], rate };
    } catch (error) {
        console.error('Error fetching conversion:', error);
        showError('Failed to convert currency.');
        throw error;
    }
}

async function fetchHistoricalRate(from, to, date) {
    try {
        const data = await fetchWithRetry(`${API_BASE}/${date}?from=${from}&to=${to}`);
        return data.rates[to];
    } catch (error) {
        console.error('Error fetching historical rate:', error);
        return null;
    }
}

// UI Population Functions
function populateCurrencySelects() {
    const createOptions = (selectedValue) => {
        return availableCurrencies.map(code => {
            const info = getCurrencyInfo(code);
            const selected = code === selectedValue ? 'selected' : '';
            return `<option value="${code}" ${selected}>${info.flag} ${code} - ${info.name}</option>`;
        }).join('');
    };

    elements.fromCurrency.innerHTML = createOptions('USD');
    elements.toCurrency.innerHTML = createOptions('EUR');
    elements.baseCurrency.innerHTML = createOptions('USD');
}

function updateRatesGrid() {
    const displayCurrencies = availableCurrencies.filter(c => c !== baseCurrency).slice(0, 12);

    elements.ratesGrid.innerHTML = displayCurrencies.map((code, index) => {
        const info = getCurrencyInfo(code);
        const rate = currentRates[code] || 0;
        return `
            <div class="rate-card" style="animation-delay: ${index * 0.05}s">
                <div class="currency-code">
                    <span class="flag">${info.flag}</span>
                    <span class="code">${code}</span>
                </div>
                <div class="rate">${formatNumber(rate, rate < 1 ? 4 : 2)}</div>
                <div class="currency-name">${info.name}</div>
            </div>
        `;
    }).join('');
}

function createQuickConvertCards() {
    elements.quickConvertGrid.innerHTML = QUICK_PAIRS.map((pair, index) => {
        const fromInfo = getCurrencyInfo(pair.from);
        const toInfo = getCurrencyInfo(pair.to);
        return `
            <div class="quick-convert-card" style="animation-delay: ${index * 0.05}s">
                <div class="pair">
                    <span>${fromInfo.flag} ${pair.from}</span>
                    <span class="arrow">→</span>
                    <span>${toInfo.flag} ${pair.to}</span>
                </div>
                <input
                    type="number"
                    value="100"
                    min="0"
                    step="0.01"
                    data-from="${pair.from}"
                    data-to="${pair.to}"
                    class="quick-input"
                    placeholder="Enter amount"
                >
                <div class="quick-result">
                    <span class="value" id="quick-${pair.from}-${pair.to}">--</span>
                    <span class="label">${pair.to}</span>
                </div>
            </div>
        `;
    }).join('');

    // Add event listeners to quick inputs
    document.querySelectorAll('.quick-input').forEach(input => {
        input.addEventListener('input', debounce(handleQuickConvert, 300));
    });

    // Initial conversion
    updateAllQuickConversions();
}

async function updateAllQuickConversions() {
    const inputs = document.querySelectorAll('.quick-input');
    for (const input of inputs) {
        await handleQuickConvert({ target: input });
    }
}

async function handleQuickConvert(event) {
    const input = event.target;
    const from = input.dataset.from;
    const to = input.dataset.to;
    const amount = parseFloat(input.value) || 0;
    const resultElement = document.getElementById(`quick-${from}-${to}`);

    if (amount <= 0) {
        resultElement.textContent = '0.00';
        return;
    }

    try {
        const result = await fetchConversion(from, to, amount);
        resultElement.textContent = formatNumber(result.amount);
    } catch (error) {
        resultElement.textContent = '--';
    }
}

async function createHistoricalCards() {
    elements.historicalGrid.innerHTML = '<div class="loading-text">Loading historical data...</div>';

    const cards = await Promise.all(HISTORICAL_PAIRS.map(async (pair, index) => {
        const fromInfo = getCurrencyInfo(pair.from);
        const toInfo = getCurrencyInfo(pair.to);

        // Fetch rates for different periods
        const today = await fetchHistoricalRate(pair.from, pair.to, getDateString(0));
        const weekAgo = await fetchHistoricalRate(pair.from, pair.to, getDateString(7));
        const monthAgo = await fetchHistoricalRate(pair.from, pair.to, getDateString(30));

        const weekChange = today && weekAgo ? ((today - weekAgo) / weekAgo * 100) : null;
        const monthChange = today && monthAgo ? ((today - monthAgo) / monthAgo * 100) : null;

        const formatChange = (change) => {
            if (change === null) return { text: 'N/A', class: '' };
            const sign = change >= 0 ? '+' : '';
            return {
                text: `${sign}${change.toFixed(2)}%`,
                class: change >= 0 ? 'positive' : 'negative'
            };
        };

        const weekChangeFormatted = formatChange(weekChange);
        const monthChangeFormatted = formatChange(monthChange);

        return `
            <div class="historical-card" style="animation-delay: ${index * 0.1}s">
                <div class="pair-info">
                    ${fromInfo.flag} ${pair.from} → ${toInfo.flag} ${pair.to}
                </div>
                <div class="comparison-row">
                    <span class="period">Today</span>
                    <span class="rate-value">${today ? formatNumber(today, 4) : 'N/A'}</span>
                </div>
                <div class="comparison-row">
                    <span class="period">7 days ago</span>
                    <span class="rate-value">${weekAgo ? formatNumber(weekAgo, 4) : 'N/A'}</span>
                    <span class="change ${weekChangeFormatted.class}">${weekChangeFormatted.text}</span>
                </div>
                <div class="comparison-row">
                    <span class="period">30 days ago</span>
                    <span class="rate-value">${monthAgo ? formatNumber(monthAgo, 4) : 'N/A'}</span>
                    <span class="change ${monthChangeFormatted.class}">${monthChangeFormatted.text}</span>
                </div>
            </div>
        `;
    }));

    elements.historicalGrid.innerHTML = cards.join('');
}

// Main Conversion Function
async function performConversion() {
    const amount = parseFloat(elements.amount.value) || 0;
    const from = elements.fromCurrency.value;
    const to = elements.toCurrency.value;

    if (amount <= 0) {
        elements.resultAmount.textContent = '0.00';
        elements.rateInfo.textContent = `1 ${from} = -- ${to}`;
        return;
    }

    try {
        const result = await fetchConversion(from, to, amount);
        const fromInfo = getCurrencyInfo(from);
        const toInfo = getCurrencyInfo(to);

        elements.resultAmount.textContent = `${toInfo.flag} ${formatNumber(result.amount)}`;
        elements.rateInfo.textContent = `1 ${from} = ${formatNumber(result.rate, 4)} ${to}`;
        elements.lastUpdated.textContent = `Last updated: ${formatDate(new Date())}`;
    } catch (error) {
        elements.resultAmount.textContent = 'Error';
        elements.rateInfo.textContent = 'Failed to fetch rate';
    }
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Event Handlers
function setupEventListeners() {
    // Main converter events
    elements.amount.addEventListener('input', debounce(performConversion, 300));
    elements.fromCurrency.addEventListener('change', performConversion);
    elements.toCurrency.addEventListener('change', performConversion);

    // Swap button
    elements.swapBtn.addEventListener('click', () => {
        const temp = elements.fromCurrency.value;
        elements.fromCurrency.value = elements.toCurrency.value;
        elements.toCurrency.value = temp;
        performConversion();
    });

    // Base currency for rates dashboard
    elements.baseCurrency.addEventListener('change', async () => {
        baseCurrency = elements.baseCurrency.value;
        showLoading();
        try {
            await fetchLatestRates(baseCurrency);
            updateRatesGrid();
        } finally {
            hideLoading();
        }
    });

    // Refresh button
    elements.refreshBtn.addEventListener('click', async () => {
        showLoading();
        try {
            await fetchLatestRates(baseCurrency);
            updateRatesGrid();
            await performConversion();
            await updateAllQuickConversions();
            await createHistoricalCards();
        } finally {
            hideLoading();
        }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + R to refresh (prevent default and use our refresh)
        if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
            e.preventDefault();
            elements.refreshBtn.click();
        }
    });
}

// Auto-refresh rates every 5 minutes
function setupAutoRefresh() {
    setInterval(async () => {
        try {
            await fetchLatestRates(baseCurrency);
            updateRatesGrid();
            await performConversion();
        } catch (error) {
            console.log('Auto-refresh failed, will retry later');
        }
    }, 5 * 60 * 1000); // 5 minutes
}

// Initialize Application
async function init() {
    showLoading();

    try {
        // Fetch available currencies
        await fetchCurrencies();

        // Populate currency selects
        populateCurrencySelects();

        // Fetch initial rates
        await fetchLatestRates(baseCurrency);

        // Update UI
        updateRatesGrid();

        // Setup event listeners
        setupEventListeners();

        // Perform initial conversion
        await performConversion();

        // Create quick convert cards
        createQuickConvertCards();

        // Create historical comparison cards
        await createHistoricalCards();

        // Setup auto-refresh
        setupAutoRefresh();

    } catch (error) {
        console.error('Initialization error:', error);
        showError('Failed to initialize the application. Please refresh the page.');
    } finally {
        hideLoading();
    }
}

// Start the application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
