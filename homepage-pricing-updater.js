/**
 * Homepage Pricing Updater
 * Updates pricing section and banner when currency changes
 */

// Update homepage pricing when currency changes
function updateHomepagePricing() {
    // Check if currency converter is available
    if (!window.convertPrice || !window.getCurrentCurrencyInfo) {
        console.log('Currency converter not ready yet, retrying...');
        setTimeout(updateHomepagePricing, 200);
        return;
    }
    
    const currency = window.getCurrentCurrency ? window.getCurrentCurrency() : 'INR';
    const currencyInfo = window.getCurrentCurrencyInfo();
    const symbol = currencyInfo ? currencyInfo.symbol : '₹';
    
    console.log('💱 Updating homepage prices to:', currency);
    
    // Update banner price range
    const bannerPriceRange = document.getElementById('banner-price-range');
    if (bannerPriceRange) {
        const managedFrom = window.convertPrice(65000, currency);
        bannerPriceRange.textContent = `${symbol}${formatShortPrice(managedFrom)}+`;
    }
    
    // Update pricing section
    // Hourly rate (₹650/hour average)
    const hourlyRate = document.querySelector('[data-price-inr="650"]');
    if (hourlyRate) {
        const converted = window.convertPrice(650, currency);
        hourlyRate.textContent = `${symbol}${Math.round(converted)}`;
    }
    
    // Fixed project range
    const fixedProjectPrice = document.getElementById('fixed-project-price');
    if (fixedProjectPrice) {
        const minPrice = window.convertPrice(25000, currency);
        const maxPrice = window.convertPrice(1000000, currency);
        fixedProjectPrice.innerHTML = `${symbol}${formatShortPrice(minPrice)}-${symbol}${formatShortPrice(maxPrice)}`;
    }
    
    // Monthly dedicated range
    const monthlyPrice = document.getElementById('monthly-dedicated-price');
    if (monthlyPrice) {
        const minPrice = window.convertPrice(30000, currency);
        const maxPrice = window.convertPrice(80000, currency);
        monthlyPrice.innerHTML = `${symbol}${formatShortPrice(minPrice)}-${symbol}${formatShortPrice(maxPrice)}`;
    }
    
    console.log('✅ Homepage prices updated');
}

/**
 * Format large numbers as K/L notation
 */
function formatShortPrice(amount) {
    if (amount >= 1000000) {
        return (amount / 1000000).toFixed(1).replace('.0', '') + 'M';
    } else if (amount >= 100000) {
        return (amount / 100000).toFixed(1).replace('.0', '') + 'L';
    } else if (amount >= 1000) {
        return (amount / 1000).toFixed(0) + 'K';
    }
    return amount.toString();
}

// Override the global changeCurrency to update homepage prices
const originalChangeCurrency = window.changeCurrency;
window.changeCurrency = function(newCurrency) {
    if (originalChangeCurrency) {
        originalChangeCurrency(newCurrency);
    }
    updateHomepagePricing();
};

// Update prices when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Wait for currency converter to initialize (give it more time for API call)
    setTimeout(updateHomepagePricing, 1000);
});

// Also update when window loads (backup)
window.addEventListener('load', function() {
    setTimeout(updateHomepagePricing, 500);
});

// Export for use
window.updateHomepagePricing = updateHomepagePricing;
