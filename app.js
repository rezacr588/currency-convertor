// Currency Converter Application
// Real-time Finance Dashboard with All Currencies

const API_BASE = 'https://api.frankfurter.app';

// Comprehensive Currency Information
const CURRENCY_INFO = {
    // Major Currencies
    USD: { flag: '🇺🇸', name: 'US Dollar', symbol: '$', priority: 1 },
    EUR: { flag: '🇪🇺', name: 'Euro', symbol: '€', priority: 1 },
    GBP: { flag: '🇬🇧', name: 'British Pound', symbol: '£', priority: 1 },
    TRY: { flag: '🇹🇷', name: 'Turkish Lira', symbol: '₺', priority: 1 },
    JPY: { flag: '🇯🇵', name: 'Japanese Yen', symbol: '¥', priority: 1 },
    CHF: { flag: '🇨🇭', name: 'Swiss Franc', symbol: 'Fr', priority: 1 },
    CNY: { flag: '🇨🇳', name: 'Chinese Yuan', symbol: '¥', priority: 1 },
    // Secondary Currencies
    AUD: { flag: '🇦🇺', name: 'Australian Dollar', symbol: 'A$', priority: 2 },
    CAD: { flag: '🇨🇦', name: 'Canadian Dollar', symbol: 'C$', priority: 2 },
    INR: { flag: '🇮🇳', name: 'Indian Rupee', symbol: '₹', priority: 2 },
    KRW: { flag: '🇰🇷', name: 'South Korean Won', symbol: '₩', priority: 2 },
    SGD: { flag: '🇸🇬', name: 'Singapore Dollar', symbol: 'S$', priority: 2 },
    HKD: { flag: '🇭🇰', name: 'Hong Kong Dollar', symbol: 'HK$', priority: 2 },
    NZD: { flag: '🇳🇿', name: 'New Zealand Dollar', symbol: 'NZ$', priority: 2 },
    SEK: { flag: '🇸🇪', name: 'Swedish Krona', symbol: 'kr', priority: 2 },
    NOK: { flag: '🇳🇴', name: 'Norwegian Krone', symbol: 'kr', priority: 2 },
    DKK: { flag: '🇩🇰', name: 'Danish Krone', symbol: 'kr', priority: 2 },
    // Emerging Markets
    MXN: { flag: '🇲🇽', name: 'Mexican Peso', symbol: '$', priority: 3 },
    ZAR: { flag: '🇿🇦', name: 'South African Rand', symbol: 'R', priority: 3 },
    BRL: { flag: '🇧🇷', name: 'Brazilian Real', symbol: 'R$', priority: 3 },
    RUB: { flag: '🇷🇺', name: 'Russian Ruble', symbol: '₽', priority: 3 },
    PLN: { flag: '🇵🇱', name: 'Polish Zloty', symbol: 'zł', priority: 3 },
    THB: { flag: '🇹🇭', name: 'Thai Baht', symbol: '฿', priority: 3 },
    IDR: { flag: '🇮🇩', name: 'Indonesian Rupiah', symbol: 'Rp', priority: 3 },
    MYR: { flag: '🇲🇾', name: 'Malaysian Ringgit', symbol: 'RM', priority: 3 },
    PHP: { flag: '🇵🇭', name: 'Philippine Peso', symbol: '₱', priority: 3 },
    CZK: { flag: '🇨🇿', name: 'Czech Koruna', symbol: 'Kč', priority: 3 },
    HUF: { flag: '🇭🇺', name: 'Hungarian Forint', symbol: 'Ft', priority: 3 },
    ILS: { flag: '🇮🇱', name: 'Israeli Shekel', symbol: '₪', priority: 3 },
    RON: { flag: '🇷🇴', name: 'Romanian Leu', symbol: 'lei', priority: 3 },
    BGN: { flag: '🇧🇬', name: 'Bulgarian Lev', symbol: 'лв', priority: 3 },
    ISK: { flag: '🇮🇸', name: 'Icelandic Krona', symbol: 'kr', priority: 3 },
    HRK: { flag: '🇭🇷', name: 'Croatian Kuna', symbol: 'kn', priority: 3 }
};

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
    return CURRENCY_INFO[code] || { flag: '💰', name: code, symbol: '', priority: 9 };
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
            <span class="select-flag">${info.flag}</span>
            <span class="select-code">${this.selectedValue}</span>
            <span class="select-name">${info.name}</span>
            <span class="select-arrow">▼</span>
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
                            <span class="option-flag">${info.flag}</span>
                            <span class="option-code">${code}</span>
                            <span class="option-name">${info.name}</span>
                            ${isSelected ? '<span class="option-check">✓</span>' : ''}
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
        const changeIcon = change >= 0 ? '↑' : '↓';

        return `
            <div class="rate-card" style="animation-delay: ${index * 0.05}s" onclick="quickSetPair('${state.baseCurrency}', '${code}')">
                <div class="rate-card-header">
                    <div class="currency-code">
                        <span class="flag">${info.flag}</span>
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
        elements.lastUpdated.textContent = `Last updated: ${formatTime(state.lastUpdate)}`;
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
                    <span class="pair-from">${fromInfo.flag} ${pair.from}</span>
                    <span class="arrow">⇄</span>
                    <span class="pair-to">${toInfo.flag} ${pair.to}</span>
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
            const icon = change >= 0 ? '▲' : '▼';
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
                    <span class="pair-flags">${fromInfo.flag}${toInfo.flag}</span>
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
        elements.resultAmount.textContent = `${getCurrencyInfo(to).flag} 0.00`;
        elements.rateInfo.textContent = `1 ${from} = -- ${to}`;
        return;
    }

    try {
        const result = await fetchConversion(from, to, amount);
        const fromInfo = getCurrencyInfo(from);
        const toInfo = getCurrencyInfo(to);

        elements.resultAmount.innerHTML = `
            <span class="result-flag">${toInfo.flag}</span>
            <span class="result-value">${toInfo.symbol}${formatNumber(result.amount)}</span>
            <span class="result-code">${to}</span>
        `;
        elements.rateInfo.innerHTML = `
            <span class="rate-from">1 ${from}</span>
            <span class="rate-equals">=</span>
            <span class="rate-to">${formatNumber(result.rate, 6)} ${to}</span>
        `;
        elements.lastUpdated.textContent = `Last updated: ${formatTime(new Date())}`;
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
