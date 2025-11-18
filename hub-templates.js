const TEMPLATE_RENDER_EVENT = 'appsTemplatesRendered';

const templatesState = {
    raw: [],
    filters: {
        industry: 'all',
        category: 'all',
        budget: 'all',
    },
};

document.addEventListener('DOMContentLoaded', () => {
    const industrySelect = document.getElementById('apps-industry-filter');
    const categorySelect = document.getElementById('apps-category-filter');
    const budgetSelect = document.getElementById('apps-budget-filter');
    const resetButton = document.getElementById('apps-reset-filters');

    if (!industrySelect || !categorySelect || !budgetSelect) {
        return;
    }

    loadTemplates()
        .then(() => {
            populateFilters();
            renderTemplates();
        })
        .catch((error) => {
            console.error('Unable to load templates:', error);
            showTemplateError();
        });

    industrySelect.addEventListener('change', (event) => {
        templatesState.filters.industry = event.target.value;
        renderTemplates();
    });

    categorySelect.addEventListener('change', (event) => {
        templatesState.filters.category = event.target.value;
        renderTemplates();
    });

    budgetSelect.addEventListener('change', (event) => {
        templatesState.filters.budget = event.target.value;
        renderTemplates();
    });

    if (resetButton) {
        resetButton.addEventListener('click', () => {
            templatesState.filters = { industry: 'all', category: 'all', budget: 'all' };
            industrySelect.value = 'all';
            categorySelect.value = 'all';
            budgetSelect.value = 'all';
            renderTemplates();
        });
    }
});

async function loadTemplates() {
    const response = await fetch('apps/templates.json', { cache: 'no-store' });
    if (!response.ok) {
        throw new Error(`Failed to fetch templates: ${response.status}`);
    }
    const payload = await response.json();
    templatesState.raw = payload.templates || [];
}

function populateFilters() {
    const industries = new Set();
    const categories = new Set();

    templatesState.raw.forEach((template) => {
        if (template.industry) industries.add(template.industry);
        if (template.category) categories.add(template.category);
    });

    populateSelect('apps-industry-filter', Array.from(industries).sort());
    populateSelect('apps-category-filter', Array.from(categories).sort());
}

function populateSelect(elementId, values) {
    const select = document.getElementById(elementId);
    if (!select) return;
    values.forEach((value) => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        select.appendChild(option);
    });
}

function renderTemplates() {
    const grid = document.getElementById('apps-templates-grid');
    const emptyState = document.getElementById('apps-no-results');

    if (!grid || !emptyState) return;

    const filtered = templatesState.raw.filter((template) => {
        const { industry, category, budget } = templatesState.filters;

        if (industry !== 'all' && template.industry !== industry) return false;
        if (category !== 'all' && template.category !== category) return false;
        if (budget !== 'all') {
            const [min, max] = budget.split('-').map(Number);
            const withinMin = template.baseCost >= min;
            const withinMax = max ? template.baseCost <= max : true;
            if (!withinMin || !withinMax) return false;
        }
        return true;
    });

    grid.innerHTML = '';

    if (filtered.length === 0) {
        grid.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    grid.style.display = 'grid';
    emptyState.style.display = 'none';

    filtered.slice(0, 9).forEach((template) => {
        grid.appendChild(createTemplateCard(template));
    });

    window.dispatchEvent(new CustomEvent(TEMPLATE_RENDER_EVENT));
}

function createTemplateCard(template) {
    const card = document.createElement('article');
    card.className = 'apps-template-card';
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';

    const imageSource = deriveImageSource(template.previewScreens?.[0]);
    const startingPrice = formatINR(template.baseCost);
    const deliveryWindow = template.baseDurationDays ? `${template.baseDurationDays} days` : 'Custom';

    card.innerHTML = `
        <div class="apps-template-media">
            <span class="apps-template-badge">${template.industry || 'Multi-Industry'}</span>
            <img src="${imageSource}" alt="${template.name}" loading="lazy">
        </div>
        <div class="apps-template-body">
            <h3>${template.name}</h3>
            <p class="apps-template-tagline">${template.tagline || ''}</p>
            <div class="apps-template-features">
                ${template.features.slice(0, 4).map((feature) => `<span class="apps-feature-chip">✓ ${feature}</span>`).join('')}
            </div>
            <div class="apps-template-meta">
                <div>
                    <strong>${startingPrice}</strong>
                    <span>Starting price</span>
                </div>
                <div>
                    <strong>${deliveryWindow}</strong>
                    <span>Delivery time</span>
                </div>
            </div>
            <div class="apps-template-actions">
                <a class="apps-btn apps-btn-primary" href="apps/template-detail.html?id=${encodeURIComponent(template.id)}" target="_blank" rel="noopener">View Details</a>
                <a class="apps-btn apps-btn-secondary" href="contact.html?template=${encodeURIComponent(template.id)}">Request Demo</a>
            </div>
            <div class="apps-template-subactions">
                <a class="apps-link" href="apps/index.html#contact" target="_blank" rel="noopener">Talk to a product specialist →</a>
            </div>
        </div>
    `;

    return card;
}

function deriveImageSource(path) {
    if (!path) {
        return 'apps/images/placeholder-template.svg';
    }

    if (path.startsWith('http')) {
        return path;
    }

    if (path.startsWith('/')) {
        return `apps${path}`;
    }

    return `apps/${path}`;
}

function formatINR(value) {
    if (typeof value !== 'number') return '₹—';
    return '₹' + value.toLocaleString('en-IN');
}

function showTemplateError() {
    const grid = document.getElementById('apps-templates-grid');
    if (!grid) return;
    grid.innerHTML = `
        <div class="apps-no-results">
            <h3>Templates are temporarily unavailable</h3>
            <p>Please refresh the page or <a href="contact.html">contact us</a> for a curated walkthrough.</p>
        </div>
    `;
}

