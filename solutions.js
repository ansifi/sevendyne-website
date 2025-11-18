// Solutions Page JavaScript
// Handles template loading, filtering, and display

let templatesData = null;
let currentFilters = {
    industry: 'all',
    category: 'all',
    budget: 'all'
};

// Load templates on page load
document.addEventListener('DOMContentLoaded', async function() {
    console.log('📝 Loading templates page...');
    
    try {
        await loadTemplates();
        populateFilters();
        displayTemplates();
        setupFilterListeners();
        
        console.log('✅ Templates page loaded successfully');
        
        // Update prices when currency converter is ready (non-blocking)
        setTimeout(() => {
            if (window.getCurrentCurrency) {
                displayTemplates();  // Re-render with currency
                console.log('💱 Prices updated with currency:', window.getCurrentCurrency());
            }
        }, 1500);
    } catch (error) {
        console.error('❌ Error loading templates:', error);
        showError();
    }
});

// Load templates from JSON file
async function loadTemplates() {
    try {
        const response = await fetch('templates.json?v=' + Date.now());
        templatesData = await response.json();
        console.log('Templates loaded:', templatesData.templates.length);
    } catch (error) {
        console.error('Error loading templates:', error);
        showError();
    }
}

// Populate filter dropdowns
function populateFilters() {
    if (!templatesData) return;
    
    // Populate industries
    const industryFilter = document.getElementById('industry-filter');
    templatesData.industries.forEach(industry => {
        const option = document.createElement('option');
        option.value = industry;
        option.textContent = industry;
        industryFilter.appendChild(option);
    });
    
    // Category filter removed - not needed
    // const categoryFilter = document.getElementById('category-filter');
    // templatesData.categories.forEach(category => {
    //     const option = document.createElement('option');
    //     option.value = category;
    //     option.textContent = category;
    //     categoryFilter.appendChild(option);
    // });
}

// Setup filter event listeners
function setupFilterListeners() {
    document.getElementById('industry-filter').addEventListener('change', function(e) {
        currentFilters.industry = e.target.value;
        displayTemplates();
    });
    
    // Category filter removed - not needed
    // document.getElementById('category-filter').addEventListener('change', function(e) {
    //     currentFilters.category = e.target.value;
    //     displayTemplates();
    // });
    
    // Budget filter removed - pricing not displayed
    // document.getElementById('budget-filter').addEventListener('change', function(e) {
    //     currentFilters.budget = e.target.value;
    //     displayTemplates();
    // });
}

// Display templates based on current filters
function displayTemplates() {
    if (!templatesData) return;
    
    const grid = document.getElementById('templates-grid');
    const noResults = document.getElementById('no-results');
    
    // Filter templates
    const filteredTemplates = templatesData.templates.filter(template => {
        // Industry filter
        if (currentFilters.industry !== 'all' && template.industry !== currentFilters.industry) {
            return false;
        }
        
        // Category filter removed - not needed
        // if (currentFilters.category !== 'all' && template.category !== currentFilters.category) {
        //     return false;
        // }
        
        // Budget filter - removed as pricing is not displayed
        // if (currentFilters.budget !== 'all') {
        //     const [min, max] = currentFilters.budget.split('-').map(Number);
        //     if (template.baseCost < min || (max && template.baseCost > max)) {
        //         return false;
        //     }
        // }
        
        return true;
    });
    
    // Show/hide no results message
    if (filteredTemplates.length === 0) {
        grid.style.display = 'none';
        noResults.style.display = 'block';
        return;
    } else {
        grid.style.display = 'grid';
        noResults.style.display = 'none';
    }
    
    // Clear grid
    grid.innerHTML = '';
    
    // Add template cards
    filteredTemplates.forEach(template => {
        const card = createTemplateCard(template);
        grid.appendChild(card);
    });
}

// Create template card HTML
function createTemplateCard(template) {
    const card = document.createElement('div');
    card.className = 'template-card';
    card.innerHTML = `
        <div class="template-image">
            <img src="${template.previewScreens && template.previewScreens[0] ? template.previewScreens[0] + '?v=' + Date.now() : 'images/placeholder-template.svg'}" 
                 alt="${template.name}" 
                 onerror="console.error('Image failed to load:', this.src); this.src='images/placeholder-template.svg'">
            <div class="template-badge">${template.industry}</div>
        </div>
        <div class="template-content">
            <h3>${template.name}</h3>
            <p class="template-tagline">${template.tagline}</p>
            <div class="template-features">
                ${template.features.slice(0, 4).map(f => `<span class="feature-tag">✓ ${f}</span>`).join('')}
                ${template.features.length > 4 ? `<span class="feature-more">+${template.features.length - 4} more</span>` : ''}
            </div>
            <div class="template-actions">
                ${template.liveAppUrl ? `<a href="${template.liveAppUrl}" class="btn-primary" target="_blank" rel="noopener" style="background: #10b981;">🚀 Launch Demo</a>` : ''}
                <a href="template-detail.html?id=${template.id}" class="btn-secondary">View Details</a>
                <!-- TODO: Uncomment when ready to enable workspace creation
                <a href="create-account.html?template=${template.id}" class="btn btn-accent">Create & Launch Workspace</a>
                -->
            </div>
            ${template.demoUrl ? `<div class="template-subactions"><a href="${template.demoUrl}" class="link-inline" target="_blank" rel="noopener">Module Overview ↗</a></div>` : ''}
        </div>
    `;
    return card;
}

// Format price with currency conversion (local function)
function formatTemplatePrice(priceINR) {
    // Use global currency converter if available
    if (window.convertPrice && window.getCurrentCurrencyInfo) {
        try {
            const currency = window.getCurrentCurrency ? window.getCurrentCurrency() : 'INR';
            const converted = window.convertPrice(priceINR, currency);
            const currencyInfo = window.getCurrentCurrencyInfo();
            return currencyInfo.symbol + Math.round(converted).toLocaleString('en-US') + '+';
        } catch (e) {
            console.error('Currency conversion error:', e);
        }
    }
    // Fallback to INR
    return '₹' + priceINR.toLocaleString('en-IN') + '+';
}

// Export for global use
window.formatTemplatePrice = formatTemplatePrice;

// Reset all filters
function resetFilters() {
    currentFilters = {
        industry: 'all',
        category: 'all',
        budget: 'all'
    };
    
    document.getElementById('industry-filter').value = 'all';
    // Category filter removed - not needed
    // document.getElementById('category-filter').value = 'all';
    // Budget filter removed - pricing not displayed
    // document.getElementById('budget-filter').value = 'all';
    
    displayTemplates();
}

// Start with template - navigate to contact form with pre-filled data
function startWithTemplate(templateId) {
    // Store template ID in localStorage for the contact form to pick up
    localStorage.setItem('selectedTemplate', templateId);
    
    // Navigate to contact form
    window.location.href = 'contact.html?template=' + templateId;
}

// Show error message
function showError() {
    const grid = document.getElementById('templates-grid');
    grid.innerHTML = `
        <div class="error-message">
            <h3>Unable to load templates</h3>
            <p>Please try refreshing the page or <a href="contact.html">contact us</a> for assistance.</p>
        </div>
    `;
}

// Export for use in other scripts
window.templatesData = templatesData;
window.startWithTemplate = startWithTemplate;

