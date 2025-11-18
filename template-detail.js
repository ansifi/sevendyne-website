// Template Detail Page JavaScript
// Loads and displays individual template details

let currentTemplate = null;

// Load template details on page load
document.addEventListener('DOMContentLoaded', async function() {
    // Wait for currency converter to initialize
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const templateId = getTemplateIdFromURL();
    
    if (!templateId) {
        showError('No template specified');
        return;
    }
    
    await loadTemplateDetail(templateId);
});

// Get template ID from URL parameter
function getTemplateIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

// Load template data
async function loadTemplateDetail(templateId) {
    try {
        const response = await fetch('templates.json?v=' + Date.now());
        const data = await response.json();
        
        currentTemplate = data.templates.find(t => t.id === templateId);
        
        if (!currentTemplate) {
            showError('Template not found');
            return;
        }
        
        displayTemplateDetail();
    } catch (error) {
        console.error('Error loading template:', error);
        showError('Unable to load template details');
    }
}

// Display template detail
function displayTemplateDetail() {
    if (!currentTemplate) return;
    
    // Debug: Log template data
    console.log('Displaying template:', currentTemplate.id);
    console.log('Preview screens:', currentTemplate.previewScreens);
    console.log('Number of images:', currentTemplate.previewScreens ? currentTemplate.previewScreens.length : 0);
    console.log('First image path:', currentTemplate.previewScreens && currentTemplate.previewScreens[0] ? currentTemplate.previewScreens[0] : 'NONE');
    
    // Update page title
    document.getElementById('page-title').textContent = `${currentTemplate.name} - Sevendyne`;
    
    // Get content container
    const container = document.getElementById('template-detail-content');
    
    // Build HTML
    container.innerHTML = `
        <!-- Breadcrumb -->
        <section class="breadcrumb-section">
            <div class="container">
                <div class="breadcrumb">
                    <a href="index.html">Home</a> 
                    <span>›</span> 
                    <a href="solutions.html">Pre-Built Solutions</a> 
                    <span>›</span> 
                    <span>${currentTemplate.name}</span>
                </div>
            </div>
        </section>

        <!-- Template Header -->
        <section class="template-header-section">
            <div class="container">
                <div class="template-header-content">
                    <div class="template-header-text">
                        <span class="template-industry-badge">${currentTemplate.industry}</span>
                        <h1>${currentTemplate.name}</h1>
                        <p class="template-tagline-large">${currentTemplate.tagline}</p>
                        <p class="template-description">${currentTemplate.description}</p>
                        
                        <div class="template-cta-buttons">
                            ${currentTemplate.liveAppUrl ? `
                            <a href="${currentTemplate.liveAppUrl}" class="btn-primary-large" target="_blank">
                                🚀 Launch Live Demo
                            </a>
                            ` : ''}
                            <button onclick="startWithTemplate('${currentTemplate.id}')" class="btn-secondary-large">
                                Discuss Customisation
                            </button>
                            <!-- TODO: Uncomment when ready to enable workspace creation
                            <a href="create-account.html?template=${currentTemplate.id}" class="btn-primary-large btn-accent">
                                Create & Launch Workspace
                            </a>
                            -->
                        </div>
                        ${currentTemplate.demoUrl ? `
                        <div class="template-cta-subtext">
                            <a href="${currentTemplate.demoUrl}" target="_blank" class="link-inline">View Module Overview ↗</a>
                        </div>
                        ` : ''}
                    </div>
                    
                    <div class="template-header-image">
                        <img src="${(currentTemplate.previewScreens && currentTemplate.previewScreens[0]) ? currentTemplate.previewScreens[0] + '?v=' + Date.now() : 'images/placeholder-template.svg'}" 
                             alt="${currentTemplate.name}" 
                             onerror="console.error('Image failed to load:', this.src); this.src='images/placeholder-template.svg'">
                    </div>
                </div>
            </div>
        </section>

        <!-- Features Section -->
        <section class="template-features-section">
            <div class="container">
                <h2>Features Included</h2>
                <div class="features-grid">
                    ${currentTemplate.features.map(feature => `
                        <div class="feature-item">
                            <span class="feature-check">✓</span>
                            <span>${feature}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        </section>

        <!-- Technology Options -->
        <section class="template-tech-section">
            <div class="container">
                <h2>Technology Options</h2>
                <p class="section-subtitle">Choose the technology stack that best fits your needs</p>
                <div class="tech-options-grid">
                    ${currentTemplate.techOptions.map(tech => `
                        <div class="tech-option-card">
                            <h4>${tech}</h4>
                            <p>Available for this template</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        </section>

        <!-- Screenshots Gallery -->
        <section class="template-screenshots-section">
            <div class="container">
                <h2>Template Preview</h2>
                <p class="section-subtitle">Visual representation of the template</p>
                <div class="screenshots-grid">
                    ${(currentTemplate.previewScreens && currentTemplate.previewScreens.length > 0 
                        ? currentTemplate.previewScreens.slice(0, 3).map((img, index) => `
                        <div class="screenshot-item">
                            <img src="${img}?v=${Date.now()}" 
                                 alt="${currentTemplate.name} Preview ${index + 1}"
                                 onerror="this.src='images/placeholder-template.svg'; console.error('Image failed to load: ${img}');">
                        </div>
                    `).join('')
                        : '<div class="screenshot-item"><p>No preview images available</p></div>')}
                </div>
                <p style="text-align: center; margin-top: 1.5rem; color: #64748b;">
                    <em>Full screenshots and live demo available upon request</em>
                </p>
            </div>
        </section>

        <!-- Customization Note -->
        <section class="template-customization-section">
            <div class="container">
                <div class="customization-box">
                    <h3>🎨 Fully Customizable</h3>
                    <p>This template serves as a starting point. We'll customize it to match your:</p>
                    <ul>
                        <li>Brand colors and logo</li>
                        <li>Specific business requirements</li>
                        <li>Additional features you need</li>
                        <li>Integration with your existing systems</li>
                    </ul>
                    <p><strong>This template serves as a starting point. We'll work with you to customize it to your exact requirements and provide a tailored implementation plan.</strong></p>
                    <p style="margin-top: 0.5rem; color: #475569;">Need multiple client instances? Create a new workspace per customer and keep core architecture consistent across your portfolio.</p>
                </div>
            </div>
        </section>

        <!-- CTA Section -->
        <section class="cta-section">
            <div class="container">
                <h2>Ready to Get Started?</h2>
                <p>Let's discuss how we can customize this template for your business.</p>
                <div class="cta-buttons">
                    <button onclick="startWithTemplate('${currentTemplate.id}')" class="btn-primary-white">
                        Start With This Template
                    </button>
                    <a href="contact.html" class="btn-secondary-white">Contact Us</a>
                </div>
            </div>
        </section>

        <!-- Related Templates -->
        <section class="related-templates-section">
            <div class="container">
                <h2>Related Solutions</h2>
                <p class="section-subtitle">Other templates in the ${currentTemplate.category} category</p>
                <div id="related-templates-grid" class="templates-grid-small">
                    <!-- Will be populated by JavaScript -->
                </div>
            </div>
        </section>
    `;
    
    // Load related templates
    loadRelatedTemplates();
}

// Load related templates
async function loadRelatedTemplates() {
    try {
        const response = await fetch('templates.json?v=' + Date.now());
        const data = await response.json();
        
        // Find templates in same category, excluding current
        const relatedTemplates = data.templates
            .filter(t => t.category === currentTemplate.category && t.id !== currentTemplate.id)
            .slice(0, 3);
        
        const grid = document.getElementById('related-templates-grid');
        
        if (relatedTemplates.length === 0) {
            grid.innerHTML = '<p>No related templates found.</p>';
            return;
        }
        
                grid.innerHTML = relatedTemplates.map(template => `
            <div class="template-card-small">
                <img src="${template.previewScreens[0] || 'images/placeholder-template.svg'}?v=${Date.now()}" 
                     alt="${template.name}"
                     onerror="this.src='images/placeholder-template.svg'">
                <h4>${template.name}</h4>
                <p>${template.tagline}</p>
                <a href="template-detail.html?id=${template.id}" class="btn-secondary-small">View Details</a>
                <!-- TODO: Uncomment when ready to enable workspace creation
                <a href="create-account.html?template=${template.id}" class="btn-secondary-small btn-accent">Create & Launch</a>
                -->
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading related templates:', error);
    }
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

// Alias for compatibility
window.formatTemplatePrice = formatTemplatePrice;

// Start with template
function startWithTemplate(templateId) {
    localStorage.setItem('selectedTemplate', templateId);
    window.location.href = 'contact.html?template=' + templateId;
}

// Handle demo click (show message since demos are stubs)
function handleDemoClick(event) {
    const url = event.currentTarget.getAttribute('href');

    if (!url || url === '#' || url.trim() === '') {
        event.preventDefault();
        alert('Live demos are handled on request. Please contact us to schedule a walkthrough.');
        return;
    }

    event.preventDefault();
    window.open(url, '_blank', 'noopener');
}

// Show error
function showError(message) {
    const container = document.getElementById('template-detail-content');
    container.innerHTML = `
        <section class="error-section">
            <div class="container">
                <div class="error-box">
                    <h2>⚠️ ${message}</h2>
                    <p><a href="solutions.html">← Back to Solutions</a></p>
                </div>
            </div>
        </section>
    `;
}

// Export for use in other scripts
window.startWithTemplate = startWithTemplate;

