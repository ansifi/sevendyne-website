/**
 * Currency Converter for International Clients
 * Auto-detects location and converts INR to local currency
 */

// Exchange rates (Will be fetched from API in real-time)
let EXCHANGE_RATES = {
    'INR': { rate: 1, symbol: '₹', name: 'Indian Rupee' },
    'USD': { rate: 0.012, symbol: '$', name: 'US Dollar' },
    'GBP': { rate: 0.0095, symbol: '£', name: 'British Pound' },
    'EUR': { rate: 0.011, symbol: '€', name: 'Euro' },
    'SGD': { rate: 0.016, symbol: 'S$', name: 'Singapore Dollar' },
    'MYR': { rate: 0.053, symbol: 'RM', name: 'Malaysian Ringgit' },
    'AUD': { rate: 0.018, symbol: 'A$', name: 'Australian Dollar' },
    'CAD': { rate: 0.017, symbol: 'C$', name: 'Canadian Dollar' }
};

// Last update timestamp
let ratesLastUpdated = null;

// Country to currency mapping
const COUNTRY_CURRENCY_MAP = {
    'US': 'USD', 'United States': 'USD',
    'GB': 'GBP', 'United Kingdom': 'GBP', 'UK': 'GBP',
    'DE': 'EUR', 'Germany': 'EUR', 'FR': 'EUR', 'France': 'EUR',
    'IT': 'EUR', 'Italy': 'EUR', 'ES': 'EUR', 'Spain': 'EUR',
    'SG': 'SGD', 'Singapore': 'SGD',
    'MY': 'MYR', 'Malaysia': 'MYR',
    'AU': 'AUD', 'Australia': 'AUD',
    'CA': 'CAD', 'Canada': 'CAD',
    'IN': 'INR', 'India': 'INR'
};

// Current selected currency
let currentCurrency = 'INR';
let detectedCountry = null;

/**
 * Fetch real-time exchange rates from API
 */
async function fetchLiveExchangeRates() {
    try {
        console.log('📡 Fetching live exchange rates...');
        
        // Using exchangerate-api.com (free, no API key needed, 1500 requests/month)
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/INR');
        
        if (!response.ok) {
            throw new Error('Failed to fetch rates');
        }
        
        const data = await response.json();
        const rates = data.rates;
        
        // Update rates
        EXCHANGE_RATES['USD'].rate = rates.USD;
        EXCHANGE_RATES['GBP'].rate = rates.GBP;
        EXCHANGE_RATES['EUR'].rate = rates.EUR;
        EXCHANGE_RATES['SGD'].rate = rates.SGD;
        EXCHANGE_RATES['MYR'].rate = rates.MYR;
        EXCHANGE_RATES['AUD'].rate = rates.AUD;
        EXCHANGE_RATES['CAD'].rate = rates.CAD;
        
        ratesLastUpdated = new Date();
        
        // Save to localStorage for caching (valid for 24 hours)
        const cacheData = {
            rates: EXCHANGE_RATES,
            timestamp: ratesLastUpdated.getTime()
        };
        localStorage.setItem('exchangeRatesCache', JSON.stringify(cacheData));
        
        console.log('✅ Exchange rates updated successfully');
        console.log(`   1 INR = ${rates.USD.toFixed(4)} USD`);
        console.log(`   1 INR = ${rates.GBP.toFixed(4)} GBP`);
        console.log(`   1 INR = ${rates.EUR.toFixed(4)} EUR`);
        
        return true;
        
    } catch (error) {
        console.error('❌ Could not fetch live exchange rates:', error);
        console.log('ℹ️  Using cached/default rates');
        return false;
    }
}

/**
 * Load cached rates if less than 24 hours old
 */
function loadCachedRates() {
    try {
        const cached = localStorage.getItem('exchangeRatesCache');
        if (!cached) return false;
        
        const cacheData = JSON.parse(cached);
        const cacheAge = Date.now() - cacheData.timestamp;
        
        // Use cache if less than 24 hours old
        if (cacheAge < 24 * 60 * 60 * 1000) {
            EXCHANGE_RATES = cacheData.rates;
            ratesLastUpdated = new Date(cacheData.timestamp);
            console.log('✅ Using cached exchange rates from:', ratesLastUpdated.toLocaleString());
            return true;
        }
        
        return false;
    } catch (error) {
        console.error('Error loading cached rates:', error);
        return false;
    }
}

/**
 * Initialize currency system on page load
 */
async function initCurrencyConverter() {
    // Try to load cached rates first
    const hasCachedRates = loadCachedRates();
    
    // If no cache or cache expired, fetch live rates
    if (!hasCachedRates) {
        await fetchLiveExchangeRates();
    }
    
    // Check if user has manually selected currency
    const savedCurrency = localStorage.getItem('selectedCurrency');
    
    if (savedCurrency && EXCHANGE_RATES[savedCurrency]) {
        currentCurrency = savedCurrency;
        updateAllPrices();
        updateCurrencySelector();
    } else {
        // Auto-detect location
        await detectLocationAndCurrency();
    }
    
    // Add currency selector to page if not exists
    addCurrencySelector();
    
    // Show last updated info
    if (ratesLastUpdated) {
        console.log(`💱 Exchange rates last updated: ${ratesLastUpdated.toLocaleString()}`);
    }
}

/**
 * Detect user location via IP geolocation
 */
async function detectLocationAndCurrency() {
    try {
        // Option 1: Use ipapi.co (free, no API key needed)
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        
        detectedCountry = data.country_name;
        const countryCode = data.country_code;
        
        // Map country to currency
        const detectedCurrency = COUNTRY_CURRENCY_MAP[countryCode] || COUNTRY_CURRENCY_MAP[detectedCountry] || 'INR';
        
        console.log(`📍 Location detected: ${detectedCountry} → Currency: ${detectedCurrency}`);
        
        // Update currency if different from INR
        if (detectedCurrency !== 'INR') {
            currentCurrency = detectedCurrency;
            updateAllPrices();
            updateCurrencySelector();
            
            // Show notification
            showCurrencyNotification(detectedCountry, detectedCurrency);
        }
        
    } catch (error) {
        console.log('Could not detect location, using INR');
        currentCurrency = 'INR';
    }
}

/**
 * Convert INR amount to selected currency
 */
function convertPrice(amountINR, targetCurrency = currentCurrency) {
    const rate = EXCHANGE_RATES[targetCurrency].rate;
    const converted = amountINR * rate;
    
    // Smart rounding based on amount size
    if (targetCurrency === 'INR') {
        return Math.round(converted);
    }
    
    // For small amounts (hourly rates, etc) - round to nearest 1 or 5
    if (converted < 50) {
        return Math.round(converted);  // Round to nearest dollar
    }
    // For medium amounts (< 1000) - round to nearest 10
    else if (converted < 1000) {
        return Math.round(converted / 10) * 10;
    }
    // For large amounts (projects) - round to nearest 100
    else if (converted < 10000) {
        return Math.round(converted / 100) * 100;
    }
    // For very large amounts - round to nearest 1000
    else {
        return Math.round(converted / 1000) * 1000;
    }
}

/**
 * Format price with currency symbol
 */
function formatPrice(amountINR, targetCurrency = currentCurrency, showOriginal = false) {
    const converted = convertPrice(amountINR, targetCurrency);
    const currencyInfo = EXCHANGE_RATES[targetCurrency];
    const symbol = currencyInfo.symbol;
    
    let formatted = `${symbol}${converted.toLocaleString('en-US')}`;
    
    // Show original INR price for reference (for non-INR)
    if (showOriginal && targetCurrency !== 'INR') {
        formatted += ` <small style="color: #94a3b8;">(₹${amountINR.toLocaleString('en-IN')})</small>`;
    }
    
    return formatted;
}

/**
 * Update all prices on the page
 */
function updateAllPrices() {
    // Update template cards (if on solutions page)
    document.querySelectorAll('.template-card').forEach(card => {
        // This will be handled by solutions.js when it regenerates cards
    });
    
    // Update any price elements with data-inr attribute
    document.querySelectorAll('[data-price-inr]').forEach(element => {
        const priceINR = parseInt(element.getAttribute('data-price-inr'));
        element.innerHTML = formatPrice(priceINR, currentCurrency, true);
    });
    
    // Trigger re-render if on solutions page
    if (typeof displayTemplates === 'function') {
        displayTemplates();
    }
}

/**
 * Add currency selector to page
 */
function addCurrencySelector() {
    // Currency selector hidden - pricing not displayed
    return;
    
    // Check if already added
    if (document.getElementById('currency-selector-container')) {
        return;
    }
    
    const header = document.querySelector('.header');
    if (!header) return;
    
    const updateTimeText = ratesLastUpdated ? 
        `Updated: ${ratesLastUpdated.toLocaleDateString()}` : 
        'Live rates';
    
    const selectorHTML = `
        <div id="currency-selector-container" style="
            position: fixed;
            top: 80px;
            right: 20px;
            background: white;
            padding: 0.75rem 1rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 999;
            font-size: 0.875rem;
        ">
            <div style="display: flex; align-items: center; gap: 0.75rem;">
                <label for="currency-select" style="font-weight: 600; color: #64748b;">
                    💱 Currency:
                </label>
                <select id="currency-select" onchange="changeCurrency(this.value)" style="
                    padding: 0.5rem 0.75rem;
                    border: 1px solid #e2e8f0;
                    border-radius: 6px;
                    font-size: 0.875rem;
                    cursor: pointer;
                    background: white;
                ">
                    <option value="INR">₹ INR (India)</option>
                    <option value="USD">$ USD (US)</option>
                    <option value="GBP">£ GBP (UK)</option>
                    <option value="EUR">€ EUR (Europe)</option>
                    <option value="SGD">S$ SGD (Singapore)</option>
                    <option value="MYR">RM MYR (Malaysia)</option>
                    <option value="AUD">A$ AUD (Australia)</option>
                    <option value="CAD">C$ CAD (Canada)</option>
                </select>
                <button onclick="refreshExchangeRates()" title="Refresh exchange rates" style="
                    padding: 0.5rem;
                    background: #6366f1;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 0.875rem;
                ">🔄</button>
            </div>
            <div id="rates-update-info" style="font-size: 0.75rem; color: #94a3b8; margin-top: 0.5rem; text-align: center;">
                ${updateTimeText}
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('afterbegin', selectorHTML);
}

/**
 * Update currency selector dropdown
 */
function updateCurrencySelector() {
    const selector = document.getElementById('currency-select');
    if (selector) {
        selector.value = currentCurrency;
    }
}

/**
 * Handle manual currency change
 */
function changeCurrency(newCurrency) {
    if (!EXCHANGE_RATES[newCurrency]) {
        console.error('Invalid currency:', newCurrency);
        return;
    }
    
    currentCurrency = newCurrency;
    localStorage.setItem('selectedCurrency', newCurrency);
    
    updateAllPrices();
    
    console.log(`Currency changed to: ${newCurrency}`);
}

/**
 * Manually refresh exchange rates
 */
async function refreshExchangeRates() {
    const updateInfo = document.getElementById('rates-update-info');
    if (updateInfo) {
        updateInfo.textContent = 'Updating...';
    }
    
    const success = await fetchLiveExchangeRates();
    
    if (success) {
        // Update all prices with new rates
        updateAllPrices();
        
        // Update the info text
        if (updateInfo) {
            updateInfo.textContent = `Updated: ${new Date().toLocaleDateString()} ✓`;
        }
        
        // Show success notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #10b981;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 10001;
        `;
        notification.textContent = '✅ Exchange rates updated successfully!';
        document.body.appendChild(notification);
        
        setTimeout(() => notification.remove(), 3000);
    } else {
        if (updateInfo) {
            const lastUpdate = ratesLastUpdated ? ratesLastUpdated.toLocaleDateString() : 'N/A';
            updateInfo.textContent = `Last updated: ${lastUpdate}`;
        }
    }
}

/**
 * Show currency auto-detection notification
 */
function showCurrencyNotification(country, currency) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #10b981, #059669);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    notification.innerHTML = `
        <strong>📍 Location Detected: ${country}</strong><br>
        <small>Prices shown in ${EXCHANGE_RATES[currency].name} (${EXCHANGE_RATES[currency].symbol})</small>
        <button onclick="this.parentElement.remove()" style="
            position: absolute;
            top: 0.5rem;
            right: 0.5rem;
            background: transparent;
            border: none;
            color: white;
            font-size: 1.25rem;
            cursor: pointer;
            padding: 0.25rem;
        ">×</button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

/**
 * Get current currency info
 */
function getCurrentCurrencyInfo() {
    return EXCHANGE_RATES[currentCurrency];
}

/**
 * Get current currency code
 */
function getCurrentCurrency() {
    return currentCurrency;
}

// Export functions for global use
window.initCurrencyConverter = initCurrencyConverter;
window.convertPrice = convertPrice;
window.formatPrice = formatPrice;
window.changeCurrency = changeCurrency;
window.refreshExchangeRates = refreshExchangeRates;
window.getCurrentCurrencyInfo = getCurrentCurrencyInfo;
window.getCurrentCurrency = getCurrentCurrency;

// Make currentCurrency accessible (will update dynamically)
Object.defineProperty(window, 'currentCurrency', {
    get: function() { return currentCurrency; },
    set: function(val) { currentCurrency = val; }
});

// Auto-initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initCurrencyConverter();
});

