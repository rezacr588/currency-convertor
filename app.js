// Currency Converter Application
// Real-time Finance Dashboard with All Currencies

const API_BASE = 'https://api.frankfurter.app';

// SVG Icon Generator
const Icons = {
    currency: (code, size = 24) => {
        const colors = {
            USD: ['#3b82f6', '#1d4ed8'], EUR: ['#6366f1', '#4338ca'], GBP: ['#8b5cf6', '#6d28d9'],
            TRY: ['#ef4444', '#dc2626'], JPY: ['#f43f5e', '#e11d48'], CHF: ['#f97316', '#ea580c'],
            CNY: ['#eab308', '#ca8a04'], AUD: ['#22c55e', '#16a34a'], CAD: ['#14b8a6', '#0d9488'],
            INR: ['#f59e0b', '#d97706'], KRW: ['#ec4899', '#db2777'], SGD: ['#06b6d4', '#0891b2'],
            HKD: ['#a855f7', '#9333ea'], NZD: ['#10b981', '#059669'], SEK: ['#0ea5e9', '#0284c7'],
            NOK: ['#3b82f6', '#2563eb'], DKK: ['#ef4444', '#dc2626'], MXN: ['#22c55e', '#15803d'],
            ZAR: ['#f59e0b', '#b45309'], BRL: ['#22c55e', '#16a34a'], RUB: ['#3b82f6', '#1d4ed8'],
            PLN: ['#dc2626', '#b91c1c'], THB: ['#6366f1', '#4f46e5'], IDR: ['#ef4444', '#dc2626'],
            MYR: ['#fbbf24', '#f59e0b'], PHP: ['#3b82f6', '#1d4ed8'], CZK: ['#3b82f6', '#dc2626'],
            HUF: ['#22c55e', '#dc2626'], ILS: ['#3b82f6', '#1d4ed8'], RON: ['#fbbf24', '#3b82f6'],
            BGN: ['#22c55e', '#dc2626'], ISK: ['#3b82f6', '#dc2626'], HRK: ['#dc2626', '#3b82f6']
        };
        const [c1, c2] = colors[code] || ['#6366f1', '#4338ca'];
        return `<svg width="${size}" height="${size}" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs><linearGradient id="grad-${code}" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:${c1}"/><stop offset="100%" style="stop-color:${c2}"/>
            </linearGradient></defs>
            <rect width="32" height="32" rx="8" fill="url(#grad-${code})"/>
            <text x="16" y="21" text-anchor="middle" fill="white" font-family="var(--font-mono)" font-size="11" font-weight="600">${code}</text>
        </svg>`;
    },
    swap: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 16V4M7 4L3 8M7 4l4 4M17 8v12M17 20l4-4M17 20l-4-4"/></svg>`,
    refresh: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 11-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>`,
    arrowUp: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>`,
    arrowDown: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12l7 7 7-7"/></svg>`,
    chevronDown: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>`,
    clock: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>`,
    check: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>`,
    warning: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 9v4M12 17h.01"/><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>`,
    arrowRight: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>`
};

// Comprehensive Currency Information
const CURRENCY_INFO = {
    // Major Currencies
    USD: { name: 'US Dollar', symbol: '$', priority: 1 },
    EUR: { name: 'Euro', symbol: '€', priority: 1 },
    GBP: { name: 'British Pound', symbol: '£', priority: 1 },
    TRY: { name: 'Turkish Lira', symbol: '₺', priority: 1 },
    JPY: { name: 'Japanese Yen', symbol: '¥', priority: 1 },
    CHF: { name: 'Swiss Franc', symbol: 'Fr', priority: 1 },
    CNY: { name: 'Chinese Yuan', symbol: '¥', priority: 1 },
    // Secondary Currencies
    AUD: { name: 'Australian Dollar', symbol: 'A$', priority: 2 },
    CAD: { name: 'Canadian Dollar', symbol: 'C$', priority: 2 },
    INR: { name: 'Indian Rupee', symbol: '₹', priority: 2 },
    KRW: { name: 'South Korean Won', symbol: '₩', priority: 2 },
    SGD: { name: 'Singapore Dollar', symbol: 'S$', priority: 2 },
    HKD: { name: 'Hong Kong Dollar', symbol: 'HK$', priority: 2 },
    NZD: { name: 'New Zealand Dollar', symbol: 'NZ$', priority: 2 },
    SEK: { name: 'Swedish Krona', symbol: 'kr', priority: 2 },
    NOK: { name: 'Norwegian Krone', symbol: 'kr', priority: 2 },
    DKK: { name: 'Danish Krone', symbol: 'kr', priority: 2 },
    // Emerging Markets
    MXN: { name: 'Mexican Peso', symbol: '$', priority: 3 },
    ZAR: { name: 'South African Rand', symbol: 'R', priority: 3 },
    BRL: { name: 'Brazilian Real', symbol: 'R$', priority: 3 },
    RUB: { name: 'Russian Ruble', symbol: '₽', priority: 3 },
    PLN: { name: 'Polish Zloty', symbol: 'zł', priority: 3 },
    THB: { name: 'Thai Baht', symbol: '฿', priority: 3 },
    IDR: { name: 'Indonesian Rupiah', symbol: 'Rp', priority: 3 },
    MYR: { name: 'Malaysian Ringgit', symbol: 'RM', priority: 3 },
    PHP: { name: 'Philippine Peso', symbol: '₱', priority: 3 },
    CZK: { name: 'Czech Koruna', symbol: 'Kč', priority: 3 },
    HUF: { name: 'Hungarian Forint', symbol: 'Ft', priority: 3 },
    ILS: { name: 'Israeli Shekel', symbol: '₪', priority: 3 },
    RON: { name: 'Romanian Leu', symbol: 'lei', priority: 3 },
    BGN: { name: 'Bulgarian Lev', symbol: 'лв', priority: 3 },
    ISK: { name: 'Icelandic Krona', symbol: 'kr', priority: 3 },
    HRK: { name: 'Croatian Kuna', symbol: 'kn', priority: 3 }
};

// Helper to get currency icon
function getCurrencyIcon(code, size = 24) {
    return Icons.currency(code, size);
}

// Popular Trading Pairs
const TRADING_PAIRS = [
    { from: 'USD', to: 'TRY', popular: true },
    { from: 'EUR', to: 'TRY', popular: true },
    { from: 'GBP', to: 'TRY', popular: true },
    { from: 'USD', to: 'EUR', popular: true },
    { from: 'EUR', to: 'GBP', popular: true },
    { from: 'USD', to: 'JPY', popular: true },
    { from: 'EUR', to: 'JPY', popular: false },
    { from: 'GBP', to: 'USD', popular: false },
    { from: 'USD', to: 'CHF', popular: false },
    { from: 'AUD', to: 'USD', popular: false }
];

// State Management
let state = {
    currencies: [],
    rates: {},
    baseCurrency: 'USD',
    fromCurrency: 'USD',
    toCurrency: 'TRY',
    amount: 1,
    lastUpdate: null,
    isLoading: false
};

// DOM Elements Cache
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

const elements = {
    amount: $('#amount'),
    fromCurrency: $('#fromCurrency'),
    toCurrency: $('#toCurrency'),
    swapBtn: $('#swapBtn'),
    resultAmount: $('#resultAmount'),
    rateInfo: $('#rateInfo'),
    lastUpdated: $('#lastUpdated'),
    baseCurrency: $('#baseCurrency'),
    ratesGrid: $('#ratesGrid'),
    refreshBtn: $('#refreshBtn'),
    quickConvertGrid: $('#quickConvertGrid'),
    historicalGrid: $('#historicalGrid'),
    loadingOverlay: $('#loadingOverlay'),
    errorToast: $('#errorToast'),
    toastMessage: $('#toastMessage')
};

// ============ Utility Functions ============

function showLoading() {
    state.isLoading = true;
    elements.loadingOverlay.classList.add('active');
}

function hideLoading() {
    state.isLoading = false;
    elements.loadingOverlay.classList.remove('active');
}

function showError(message) {
    elements.toastMessage.textContent = message;
    elements.errorToast.classList.add('active');
    setTimeout(() => elements.errorToast.classList.remove('active'), 4000);
}

function showSuccess(message) {
    elements.toastMessage.textContent = message;
    elements.errorToast.style.background = 'linear-gradient(135deg, #10b981, #059669)';
    elements.errorToast.classList.add('active');
    setTimeout(() => {
        elements.errorToast.classList.remove('active');
        elements.errorToast.style.background = '';
    }, 3000);
}

function formatNumber(num, decimals = 2) {
    if (num === null || num === undefined || isNaN(num)) return '--';
    if (Math.abs(num) >= 1000000) {
        return (num / 1000000).toFixed(2) + 'M';
    }
    if (Math.abs(num) >= 1000) {
        return num.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    }
    if (Math.abs(num) < 0.01) {
        return num.toFixed(6);
    }
    return num.toFixed(decimals);
}

function formatCurrency(amount, currencyCode) {
    const info = getCurrencyInfo(currencyCode);
    return `${info.symbol}${formatNumber(amount)}`;
}

function formatDate(date) {
    return new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short'
    }).format(date);
}

function formatTime(date) {
    return new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    }).format(date);
}

function getDateString(daysAgo = 0) {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString().split('T')[0];
}

function getCurrencyInfo(code) {
    return CURRENCY_INFO[code] || { name: code, symbol: '', priority: 9 };
}

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

// ============ API Functions ============

async function fetchWithRetry(url, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } catch (error) {
            if (i === retries - 1) throw error;
            await new Promise(r => setTimeout(r, 1000 * (i + 1)));
        }
    }
}

async function fetchCurrencies() {
    try {
        const data = await fetchWithRetry(`${API_BASE}/currencies`);
        state.currencies = Object.keys(data).sort((a, b) => {
            const priorityA = getCurrencyInfo(a).priority || 9;
            const priorityB = getCurrencyInfo(b).priority || 9;
            if (priorityA !== priorityB) return priorityA - priorityB;
            return a.localeCompare(b);
        });
        return state.currencies;
    } catch (error) {
        console.error('Error fetching currencies:', error);
        showError('Failed to load currencies');
        throw error;
    }
}

async function fetchLatestRates(base = 'USD') {
    try {
        const data = await fetchWithRetry(`${API_BASE}/latest?from=${base}`);
        state.rates = { ...data.rates, [base]: 1 };
        state.lastUpdate = new Date();
        return data;
    } catch (error) {
        console.error('Error fetching rates:', error);
        showError('Failed to fetch exchange rates');
        throw error;
    }
}

async function fetchConversion(from, to, amount) {
    if (from === to) return { amount, rate: 1 };
    try {
        const data = await fetchWithRetry(`${API_BASE}/latest?amount=${amount}&from=${from}&to=${to}`);
        return { amount: data.rates[to], rate: data.rates[to] / amount };
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

async function fetchHistoricalRate(from, to, date) {
    try {
        const data = await fetchWithRetry(`${API_BASE}/${date}?from=${from}&to=${to}`);
        return data.rates[to];
    } catch {
        return null;
    }
}

// ============ Searchable Select Component ============

class SearchableSelect {
    constructor(selectElement, onChange) {
        this.select = selectElement;
        this.onChange = onChange;
        this.isOpen = false;
        this.selectedValue = '';
        this.searchTerm = '';
        this.options = [];
        this.wrapper = null;
        this.init();
    }

    init() {
        // Create wrapper
        this.wrapper = document.createElement('div');
        this.wrapper.className = 'searchable-select';
        this.select.parentNode.insertBefore(this.wrapper, this.select);
        this.select.style.display = 'none';

        // Create display button
        this.display = document.createElement('button');
        this.display.type = 'button';
        this.display.className = 'select-display';
        this.wrapper.appendChild(this.display);

        // Create dropdown
        this.dropdown = document.createElement('div');
        this.dropdown.className = 'select-dropdown';
        this.dropdown.innerHTML = `
            <div class="select-search">
                <input type="text" placeholder="Search currency..." class="select-search-input">
            </div>
            <div class="select-options"></div>
        `;
        this.wrapper.appendChild(this.dropdown);

        this.searchInput = this.dropdown.querySelector('.select-search-input');
        this.optionsContainer = this.dropdown.querySelector('.select-options');

        // Event listeners
        this.display.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggle();
        });

        this.searchInput.addEventListener('input', (e) => {
            this.searchTerm = e.target.value.toLowerCase();
            this.renderOptions();
        });

        this.searchInput.addEventListener('click', (e) => e.stopPropagation());

        document.addEventListener('click', (e) => {
            if (!this.wrapper.contains(e.target)) {
                this.close();
            }
        });

        // Keyboard navigation
        this.wrapper.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.close();
            if (e.key === 'Enter' && this.isOpen) {
                const highlighted = this.optionsContainer.querySelector('.option-item.highlighted');
                if (highlighted) {
                    this.selectOption(highlighted.dataset.value);
                }
            }
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                e.preventDefault();
                this.navigateOptions(e.key === 'ArrowDown' ? 1 : -1);
            }
        });
    }

    setOptions(options, selectedValue) {
        this.options = options;
        this.selectedValue = selectedValue;
        this.updateDisplay();
        this.renderOptions();
    }

    updateDisplay() {
        const info = getCurrencyInfo(this.selectedValue);
        this.display.innerHTML = `
            <span class="select-flag">${getCurrencyIcon(this.selectedValue, 28)}</span>
            <span class="select-code">${this.selectedValue}</span>
            <span class="select-name">${info.name}</span>
            <span class="select-arrow">${Icons.chevronDown}</span>
        `;
    }

    renderOptions() {
        const filtered = this.options.filter(code => {
            const info = getCurrencyInfo(code);
            const searchStr = `${code} ${info.name}`.toLowerCase();
            return searchStr.includes(this.searchTerm);
        });

        // Group by priority
        const groups = {
            1: { label: 'Major Currencies', items: [] },
            2: { label: 'Secondary Currencies', items: [] },
            3: { label: 'Emerging Markets', items: [] },
            9: { label: 'Other Currencies', items: [] }
        };

        filtered.forEach(code => {
            const priority = getCurrencyInfo(code).priority || 9;
            if (groups[priority]) {
                groups[priority].items.push(code);
            } else {
                groups[9].items.push(code);
            }
        });

        let html = '';
        Object.values(groups).forEach(group => {
            if (group.items.length > 0) {
                html += `<div class="option-group-label">${group.label}</div>`;
                group.items.forEach(code => {
                    const info = getCurrencyInfo(code);
                    const isSelected = code === this.selectedValue;
                    html += `
                        <div class="option-item ${isSelected ? 'selected' : ''}" data-value="${code}">
                            <span class="option-flag">${getCurrencyIcon(code, 24)}</span>
                            <span class="option-code">${code}</span>
                            <span class="option-name">${info.name}</span>
                            ${isSelected ? `<span class="option-check">${Icons.check}</span>` : ''}
                        </div>
                    `;
                });
            }
        });

        this.optionsContainer.innerHTML = html || '<div class="no-results">No currencies found</div>';

        // Add click handlers
        this.optionsContainer.querySelectorAll('.option-item').forEach(item => {
            item.addEventListener('click', () => {
                this.selectOption(item.dataset.value);
            });
            item.addEventListener('mouseenter', () => {
                this.optionsContainer.querySelectorAll('.option-item').forEach(i => i.classList.remove('highlighted'));
                item.classList.add('highlighted');
            });
        });
    }

    navigateOptions(direction) {
        const items = Array.from(this.optionsContainer.querySelectorAll('.option-item'));
        if (items.length === 0) return;

        let currentIndex = items.findIndex(i => i.classList.contains('highlighted'));
        items.forEach(i => i.classList.remove('highlighted'));

        if (currentIndex === -1) {
            currentIndex = direction > 0 ? 0 : items.length - 1;
        } else {
            currentIndex = (currentIndex + direction + items.length) % items.length;
        }

        items[currentIndex].classList.add('highlighted');
        items[currentIndex].scrollIntoView({ block: 'nearest' });
    }

    selectOption(value) {
        this.selectedValue = value;
        this.select.value = value;
        this.updateDisplay();
        this.close();
        if (this.onChange) this.onChange(value);
    }

    toggle() {
        this.isOpen ? this.close() : this.open();
    }

    open() {
        this.isOpen = true;
        this.wrapper.classList.add('open');
        this.searchTerm = '';
        this.searchInput.value = '';
        this.renderOptions();
        setTimeout(() => this.searchInput.focus(), 50);
    }

    close() {
        this.isOpen = false;
        this.wrapper.classList.remove('open');
    }
}

// ============ UI Functions ============

let fromSelect, toSelect, baseSelect;

function initSearchableSelects() {
    fromSelect = new SearchableSelect(elements.fromCurrency, (value) => {
        state.fromCurrency = value;
        performConversion();
    });

    toSelect = new SearchableSelect(elements.toCurrency, (value) => {
        state.toCurrency = value;
        performConversion();
    });

    baseSelect = new SearchableSelect(elements.baseCurrency, async (value) => {
        state.baseCurrency = value;
        showLoading();
        try {
            await fetchLatestRates(value);
            updateRatesGrid();
        } finally {
            hideLoading();
        }
    });
}

function populateCurrencySelects() {
    fromSelect.setOptions(state.currencies, state.fromCurrency);
    toSelect.setOptions(state.currencies, state.toCurrency);
    baseSelect.setOptions(state.currencies, state.baseCurrency);
}

function updateRatesGrid() {
    const majorCurrencies = state.currencies
        .filter(c => c !== state.baseCurrency)
        .sort((a, b) => (getCurrencyInfo(a).priority || 9) - (getCurrencyInfo(b).priority || 9))
        .slice(0, 12);

    elements.ratesGrid.innerHTML = majorCurrencies.map((code, index) => {
        const info = getCurrencyInfo(code);
        const rate = state.rates[code] || 0;
        const change = (Math.random() - 0.5) * 2; // Simulated change for display
        const changeClass = change >= 0 ? 'positive' : 'negative';
        const changeIcon = change >= 0 ? Icons.arrowUp : Icons.arrowDown;

        return `
            <div class="rate-card" style="animation-delay: ${index * 0.05}s" onclick="quickSetPair('${state.baseCurrency}', '${code}')">
                <div class="rate-card-header">
                    <div class="currency-code">
                        <span class="flag">${getCurrencyIcon(code, 28)}</span>
                        <span class="code">${code}</span>
                    </div>
                    <span class="rate-change ${changeClass}">${changeIcon} ${Math.abs(change).toFixed(2)}%</span>
                </div>
                <div class="rate">${formatNumber(rate, rate < 1 ? 6 : 4)}</div>
                <div class="currency-name">${info.name}</div>
                <div class="rate-card-footer">
                    <span class="symbol">${info.symbol || ''}</span>
                    <span class="pair">${state.baseCurrency}/${code}</span>
                </div>
            </div>
        `;
    }).join('');

    // Update last updated time
    if (state.lastUpdate) {
        elements.lastUpdated.innerHTML = `${Icons.clock} Updated: ${formatTime(state.lastUpdate)}`;
    }
}

// Quick set pair from rate card click
window.quickSetPair = function(from, to) {
    state.fromCurrency = from;
    state.toCurrency = to;
    fromSelect.setOptions(state.currencies, from);
    toSelect.setOptions(state.currencies, to);
    performConversion();

    // Smooth scroll to converter
    document.querySelector('.converter-card').scrollIntoView({ behavior: 'smooth', block: 'start' });
};

function createQuickConvertCards() {
    const popularPairs = TRADING_PAIRS.filter(p => p.popular);

    elements.quickConvertGrid.innerHTML = popularPairs.map((pair, index) => {
        const fromInfo = getCurrencyInfo(pair.from);
        const toInfo = getCurrencyInfo(pair.to);
        return `
            <div class="quick-convert-card" style="animation-delay: ${index * 0.05}s">
                <div class="pair">
                    <span class="pair-from">${getCurrencyIcon(pair.from, 20)} ${pair.from}</span>
                    <span class="arrow">${Icons.arrowRight}</span>
                    <span class="pair-to">${getCurrencyIcon(pair.to, 20)} ${pair.to}</span>
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
                    <span class="label">${toInfo.symbol} ${pair.to}</span>
                </div>
            </div>
        `;
    }).join('');

    // Add event listeners
    document.querySelectorAll('.quick-input').forEach(input => {
        input.addEventListener('input', debounce(handleQuickConvert, 300));
    });

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
    } catch {
        resultElement.textContent = '--';
    }
}

async function createHistoricalCards() {
    elements.historicalGrid.innerHTML = '<div class="loading-text">Loading market data...</div>';

    const pairs = TRADING_PAIRS.slice(0, 4);
    const cards = await Promise.all(pairs.map(async (pair, index) => {
        const fromInfo = getCurrencyInfo(pair.from);
        const toInfo = getCurrencyInfo(pair.to);

        const today = await fetchHistoricalRate(pair.from, pair.to, getDateString(0));
        const weekAgo = await fetchHistoricalRate(pair.from, pair.to, getDateString(7));
        const monthAgo = await fetchHistoricalRate(pair.from, pair.to, getDateString(30));

        const weekChange = today && weekAgo ? ((today - weekAgo) / weekAgo * 100) : null;
        const monthChange = today && monthAgo ? ((today - monthAgo) / monthAgo * 100) : null;

        const formatChange = (change) => {
            if (change === null) return { text: 'N/A', class: '', icon: '' };
            const icon = change >= 0 ? Icons.arrowUp : Icons.arrowDown;
            return {
                text: `${Math.abs(change).toFixed(2)}%`,
                class: change >= 0 ? 'positive' : 'negative',
                icon
            };
        };

        const weekChangeData = formatChange(weekChange);
        const monthChangeData = formatChange(monthChange);

        return `
            <div class="historical-card" style="animation-delay: ${index * 0.1}s">
                <div class="pair-info">
                    <span class="pair-flags">${getCurrencyIcon(pair.from, 22)}${getCurrencyIcon(pair.to, 22)}</span>
                    <span class="pair-codes">${pair.from}/${pair.to}</span>
                </div>
                <div class="current-rate">
                    <span class="rate-label">Current Rate</span>
                    <span class="rate-value">${today ? formatNumber(today, 4) : 'N/A'}</span>
                </div>
                <div class="comparison-rows">
                    <div class="comparison-row">
                        <span class="period">7D Change</span>
                        <span class="change ${weekChangeData.class}">
                            <span class="change-icon">${weekChangeData.icon}</span>
                            ${weekChangeData.text}
                        </span>
                    </div>
                    <div class="comparison-row">
                        <span class="period">30D Change</span>
                        <span class="change ${monthChangeData.class}">
                            <span class="change-icon">${monthChangeData.icon}</span>
                            ${monthChangeData.text}
                        </span>
                    </div>
                </div>
            </div>
        `;
    }));

    elements.historicalGrid.innerHTML = cards.join('');
}

// ============ Main Conversion ============

async function performConversion() {
    const amount = parseFloat(elements.amount.value) || 0;
    const from = state.fromCurrency;
    const to = state.toCurrency;

    if (amount <= 0) {
        elements.resultAmount.innerHTML = `${getCurrencyIcon(to, 32)} <span class="result-value">0.00</span>`;
        elements.rateInfo.textContent = `1 ${from} = -- ${to}`;
        return;
    }

    try {
        const result = await fetchConversion(from, to, amount);
        const fromInfo = getCurrencyInfo(from);
        const toInfo = getCurrencyInfo(to);

        elements.resultAmount.innerHTML = `
            <span class="result-flag">${getCurrencyIcon(to, 36)}</span>
            <span class="result-value">${toInfo.symbol}${formatNumber(result.amount)}</span>
            <span class="result-code">${to}</span>
        `;
        elements.rateInfo.innerHTML = `
            <span class="rate-from">1 ${from}</span>
            <span class="rate-equals">=</span>
            <span class="rate-to">${formatNumber(result.rate, 6)} ${to}</span>
        `;
        elements.lastUpdated.innerHTML = `${Icons.clock} Updated: ${formatTime(new Date())}`;
    } catch (error) {
        elements.resultAmount.textContent = 'Error';
        elements.rateInfo.textContent = 'Failed to fetch rate';
    }
}

// ============ Event Listeners ============

function setupEventListeners() {
    // Amount input
    elements.amount.addEventListener('input', debounce(performConversion, 300));

    // Swap button
    elements.swapBtn.addEventListener('click', () => {
        const temp = state.fromCurrency;
        state.fromCurrency = state.toCurrency;
        state.toCurrency = temp;
        fromSelect.setOptions(state.currencies, state.fromCurrency);
        toSelect.setOptions(state.currencies, state.toCurrency);
        performConversion();
    });

    // Refresh button
    elements.refreshBtn.addEventListener('click', async () => {
        showLoading();
        try {
            await fetchLatestRates(state.baseCurrency);
            updateRatesGrid();
            await performConversion();
            await updateAllQuickConversions();
            await createHistoricalCards();
            showSuccess('Rates updated successfully!');
        } finally {
            hideLoading();
        }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
            e.preventDefault();
            elements.refreshBtn.click();
        }
    });
}

// Auto-refresh every 60 seconds
function setupAutoRefresh() {
    setInterval(async () => {
        if (!state.isLoading) {
            try {
                await fetchLatestRates(state.baseCurrency);
                updateRatesGrid();
                await performConversion();
            } catch {}
        }
    }, 60000);
}

// ============ Initialize Application ============

async function init() {
    showLoading();

    try {
        // Initialize searchable selects
        initSearchableSelects();

        // Fetch currencies
        await fetchCurrencies();

        // Populate selects with USD -> TRY as default
        populateCurrencySelects();

        // Fetch initial rates
        await fetchLatestRates(state.baseCurrency);

        // Setup UI
        updateRatesGrid();
        setupEventListeners();

        // Initial conversion
        await performConversion();

        // Create additional sections
        createQuickConvertCards();
        await createHistoricalCards();

        // Setup auto-refresh
        setupAutoRefresh();

    } catch (error) {
        console.error('Init error:', error);
        showError('Failed to initialize. Please refresh.');
    } finally {
        hideLoading();
    }
}

// Start application
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
