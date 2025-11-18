// Mobile menu toggle functionality
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const navMenu = document.querySelector('.nav-menu');

if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', function() {
        navMenu.classList.toggle('active');
        // Toggle hamburger to X icon
        this.textContent = navMenu.classList.contains('active') ? '✕' : '☰';
    });
}

// Close mobile menu when clicking outside
document.addEventListener('click', function(event) {
    if (navMenu && navMenu.classList.contains('active')) {
        if (!event.target.closest('.nav-container')) {
            navMenu.classList.remove('active');
            if (mobileMenuToggle) {
                mobileMenuToggle.textContent = '☰';
            }
        }
    }
});

// Mobile dropdown toggle
const dropdowns = document.querySelectorAll('.dropdown');
dropdowns.forEach(dropdown => {
    const dropdownLink = dropdown.querySelector('a');
    
    dropdownLink.addEventListener('click', function(e) {
        // Only prevent default and toggle on mobile (screen width <= 768px)
        if (window.innerWidth <= 768) {
            e.preventDefault();
            dropdown.classList.toggle('active');
            
            // Close other dropdowns
            dropdowns.forEach(otherDropdown => {
                if (otherDropdown !== dropdown) {
                    otherDropdown.classList.remove('active');
                }
            });
        }
    });
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Contact form submission - Using Formspree
document.addEventListener('DOMContentLoaded', function() {
    // Handle form on index.html (id="contact-form")
    const contactFormById = document.querySelector('#contact-form');
    if (contactFormById) {
        // Check if form uses Formspree
        const isFormspree = contactFormById.action && contactFormById.action.includes('formspree.io');
        
        contactFormById.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitButton = this.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            submitButton.textContent = 'Sending...';
            submitButton.disabled = true;
            
            // Show loading message
            let messageDiv = document.getElementById('form-message');
            if (!messageDiv) {
                messageDiv = document.createElement('div');
                messageDiv.id = 'form-message';
                messageDiv.style.cssText = 'margin-top: 1rem; padding: 1rem; border-radius: 8px; text-align: center;';
                this.appendChild(messageDiv);
            }
            messageDiv.innerHTML = '<p style="color: #6366f1;">Sending your message...</p>';
            messageDiv.style.display = 'block';
            
            try {
                if (isFormspree) {
                    // Submit to Formspree via AJAX
                    const formData = new FormData(this);
                    
                    const response = await fetch(this.action, {
                        method: 'POST',
                        body: formData,
                        headers: {
                            'Accept': 'application/json'
                        }
                    });
                    
                    if (response.ok) {
                        // Show success message
                        const formContainer = this.closest('.contact-form') || this.parentElement;
                        formContainer.innerHTML = `
                            <div style="text-align: center; padding: 2rem;">
                                <div style="font-size: 3rem; color: #10b981; margin-bottom: 1rem;">✓</div>
                                <h2>Thank You!</h2>
                                <p>Your message has been sent successfully.</p>
                                <p style="color: #64748b; margin-top: 1rem;">We'll get back to you within 24 hours.</p>
                                <button onclick="location.reload()" class="btn btn-primary" style="margin-top: 1rem;">Send Another Message</button>
                            </div>
                        `;
                    } else {
                        const data = await response.json();
                        throw new Error(data.error || `Server error: ${response.status}`);
                    }
                } else {
                    // Fallback to backend API (if configured)
                    const formData = new FormData(this);
                    const formDataObj = {};
                    formData.forEach((value, key) => {
                        if (value && value.trim()) {
                            formDataObj[key] = value.trim();
                        }
                    });
                    
                    // Validate required fields
                    if (!formDataObj.name || (!formDataObj.email && !formDataObj._replyto) || !formDataObj.message) {
                        throw new Error('Please fill in all required fields (Name, Email, and Message)');
                    }
                    
                    // Get API URL from config
                    const API_BASE_URL = window.APP_CONFIG ? window.APP_CONFIG.getApiUrl() : 'http://localhost:5000/api';
                    
                    const response = await fetch(`${API_BASE_URL}/contact`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },
                        body: JSON.stringify(formDataObj)
                    });
                    
                    if (!response.ok) {
                        throw new Error(`Server error: ${response.status}`);
                    }
                    
                    const result = await response.json();
                    
                    if (result.success) {
                        // Show success message
                        const formContainer = this.closest('.contact-form') || this.parentElement;
                        formContainer.innerHTML = `
                            <div style="text-align: center; padding: 2rem;">
                                <div style="font-size: 3rem; color: #10b981; margin-bottom: 1rem;">✓</div>
                                <h2>Thank You!</h2>
                                <p>${result.message || 'Your message has been sent successfully.'}</p>
                                <p style="color: #64748b; margin-top: 1rem;">We'll get back to you within 24 hours.</p>
                                <button onclick="location.reload()" class="btn btn-primary" style="margin-top: 1rem;">Send Another Message</button>
                            </div>
                        `;
                    } else {
                        throw new Error(result.message || 'Form submission failed');
                    }
                }
            } catch (error) {
                console.error('Error submitting form:', error);
                
                // Show error message
                if (messageDiv) {
                    messageDiv.innerHTML = `
                        <div style="background: #fee2e2; color: #991b1b; padding: 1rem; border-radius: 8px;">
                            <strong>⚠️ Error:</strong> ${error.message || 'There was an error sending your message.'}
                            <p style="margin-top: 0.5rem; font-size: 0.9rem;">
                                Please try again or email us directly at <a href="mailto:hr@sevendyne.com" style="color: #6366f1;">hr@sevendyne.com</a>
                            </p>
                        </div>
                    `;
                    messageDiv.style.display = 'block';
                }
                
                submitButton.textContent = originalText;
                submitButton.disabled = false;
            }
        });
    }
    
    // Handle form on contact.html (class="contact-form form")
    const contactFormByClass = document.querySelector('.contact-form form');
    if (contactFormByClass && !contactFormByClass.id) {
        // This form uses Formspree, so let it handle submission naturally
        // Formspree will redirect to a thank you page after submission
        contactFormByClass.addEventListener('submit', function(e) {
            const submitButton = this.querySelector('button[type="submit"]');
            submitButton.textContent = 'Sending...';
            submitButton.disabled = true;
        });
    }
});

// Prefill contact form when a template is referenced
const urlParams = new URLSearchParams(window.location.search);
const templateReference = urlParams.get('template');
if (templateReference) {
    const serviceSelect = document.querySelector('#service');
    if (serviceSelect && serviceSelect.querySelector('option[value="app-solutions"]')) {
        serviceSelect.value = 'app-solutions';
    }

    const projectField = document.querySelector('#project_type');
    if (projectField) {
        projectField.value = `Template interest: ${templateReference}`;
    }

    const messageField = document.querySelector('#message');
    if (messageField && messageField.value.trim().length === 0) {
        messageField.value = `Hello Sevendyne team,\n\nWe would like a guided walkthrough of the "${templateReference}" template.\nPlease share pricing, customization scope, and launch timeline.\n\nRegards,\n`;
    }

    const formHeading = document.querySelector('.contact-form-container h2');
    if (formHeading && !document.querySelector('.template-context-banner')) {
        const banner = document.createElement('div');
        banner.className = 'template-context-banner';
        banner.innerHTML = `🚀 Template <strong>${templateReference}</strong> is pre-selected. Share your use case and we'll tailor the launch plan.`;
        formHeading.insertAdjacentElement('afterend', banner);
    }
}

// Header scroll effect
window.addEventListener('scroll', function() {
    const header = document.querySelector('.header');
    if (window.scrollY > 50) {
        header.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
    } else {
        header.style.boxShadow = '0 2px 10px rgba(0,0,0,0.05)';
    }
});

// Animate on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
const animatedSelectors = '.service-card, .story-card, .pricing-card, .apps-template-card, .apps-launch-card, .marketing-card, .apps-highlight-card';
document.querySelectorAll(animatedSelectors).forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

window.addEventListener('appsTemplatesRendered', () => {
    document.querySelectorAll('.apps-template-card').forEach((el) => {
        if (!el.style.transition) {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        }
        observer.observe(el);
    });
});

// Counter animation for stats
function animateCounter(element, target) {
    let current = 0;
    const increment = target / 100;
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 20);
}

// Animate counters when visible
const statsObserver = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
            entry.target.classList.add('counted');
            const target = parseInt(entry.target.textContent.replace(/\D/g, ''));
            animateCounter(entry.target, target);
        }
    });
}, observerOptions);

document.querySelectorAll('.stat-item h3, .hero-stat strong').forEach(stat => {
    statsObserver.observe(stat);
});

// Multi-Step Form Modal
let currentStep = 1;
const totalSteps = 3;

// Define functions first
function showStep(step) {
    const steps = document.querySelectorAll('.form-step');
    steps.forEach((s, index) => {
        if (index + 1 === step) {
            s.classList.add('active');
        } else {
            s.classList.remove('active');
        }
    });
}

function updateProgress() {
    const progressSteps = document.querySelectorAll('.progress-step');
    progressSteps.forEach((step, index) => {
        const stepNum = index + 1;
        step.classList.remove('active', 'completed');
        
        if (stepNum < currentStep) {
            step.classList.add('completed');
        } else if (stepNum === currentStep) {
            step.classList.add('active');
        }
    });
}

function closeModal() {
    const modal = document.getElementById('getStartedModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        
        // Reset form after a delay
        setTimeout(() => {
            currentStep = 1;
            showStep(1);
            updateProgress();
            const form = document.getElementById('getStartedForm');
            if (form) form.reset();
            const formMessage = document.getElementById('formMessage');
            if (formMessage) {
                formMessage.style.display = 'none';
                formMessage.textContent = '';
            }
        }, 300);
    }
}

// Open modal when Get Started buttons are clicked
function initModal() {
    try {
        const getStartedButtons = document.querySelectorAll('.get-started-btn');
        const modal = document.getElementById('getStartedModal');
        const modalClose = document.querySelector('.modal-close');
        const modalPlanName = document.getElementById('modalPlanName');
        const formPlan = document.getElementById('formPlan');
        const formPrice = document.getElementById('formPrice');
        const getStartedForm = document.getElementById('getStartedForm');
        
        console.log('Found buttons:', getStartedButtons.length);
        console.log('Modal found:', !!modal);
        
        // Check if modal exists
        if (!modal) {
            console.error('Modal element not found');
            return;
        }
        
        if (getStartedButtons.length === 0) {
            console.error('No Get Started buttons found');
            return;
        }
        
        // Open modal
        getStartedButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                console.log('Button clicked');
                
                const plan = this.getAttribute('data-plan');
                const price = this.getAttribute('data-price');
                const priceINR = this.getAttribute('data-price-inr');
                
                // Get current currency
                const currencySelector = document.getElementById('currencySelector');
                const currentCurrency = currencySelector ? currencySelector.value : 'INR';
                
                // Use current price (already converted) or convert from INR
                let displayPrice = price;
                if (priceINR && currentCurrency !== 'INR') {
                    const inrValue = parseFloat(priceINR);
                    const converted = convertCurrency(inrValue, currentCurrency);
                    const period = price.includes('/month') ? '/month' : '/hour';
                    displayPrice = formatPrice(converted, currentCurrency) + period;
                }
                
                if (modalPlanName) modalPlanName.textContent = plan;
                if (formPlan) formPlan.value = plan;
                if (formPrice) formPrice.value = displayPrice;
                
                // Reset form to step 1
                currentStep = 1;
                showStep(1);
                updateProgress();
                
                modal.classList.add('active');
                document.body.style.overflow = 'hidden';
                
                console.log('Modal opened');
            });
        });
        
        // Close modal
        if (modalClose) {
            modalClose.addEventListener('click', function() {
                closeModal();
            });
        }
        
        // Close modal when clicking outside
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal();
            }
        });
        
        // Close modal on Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                closeModal();
            }
        });
        
        // Form submission
        if (getStartedForm) {
            getStartedForm.addEventListener('submit', function(e) {
                e.preventDefault();
                submitForm();
            });
        }
    } catch (error) {
        console.error('Error initializing modal:', error);
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initModal);
} else {
    // DOM is already ready
    initModal();
}


function nextStep() {
    const currentStepElement = document.querySelector(`.form-step[data-step="${currentStep}"]`);
    const requiredFields = currentStepElement.querySelectorAll('[required]');
    let isValid = true;
    
    // Validate required fields in current step
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            isValid = false;
            field.style.borderColor = '#ef4444';
            field.addEventListener('input', function() {
                this.style.borderColor = '#e5e7eb';
            }, { once: true });
        }
    });
    
    if (!isValid) {
        return;
    }
    
    if (currentStep < totalSteps) {
        currentStep++;
        showStep(currentStep);
        updateProgress();
    }
}

function prevStep() {
    if (currentStep > 1) {
        currentStep--;
        showStep(currentStep);
        updateProgress();
    }
}

function submitForm() {
    const form = document.getElementById('getStartedForm');
    const formMessage = document.getElementById('formMessage');
    const submitButton = form.querySelector('.btn-submit');
    
    // Validate final step
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            isValid = false;
            field.style.borderColor = '#ef4444';
            field.addEventListener('input', function() {
                this.style.borderColor = '#e5e7eb';
            }, { once: true });
        }
    });
    
    if (!isValid) {
        // Go to step with first invalid field
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                const stepElement = field.closest('.form-step');
                if (stepElement) {
                    const stepNum = parseInt(stepElement.getAttribute('data-step'));
                    currentStep = stepNum;
                    showStep(currentStep);
                    updateProgress();
                }
                field.scrollIntoView({ behavior: 'smooth', block: 'center' });
                return;
            }
        });
        return;
    }
    
    // Disable submit button
    submitButton.disabled = true;
    submitButton.textContent = 'Submitting...';
    
    // Submit to Formspree via AJAX
    const formData = new FormData(form);
    
    fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: {
            'Accept': 'application/json'
        }
    })
    .then(response => {
        if (response.ok) {
            formMessage.style.display = 'block';
            formMessage.className = 'form-message success';
            formMessage.textContent = '✓ Message sent successfully! We will revert within 24-48 hours.';
            form.reset();
            
            // Close modal after 3 seconds
            setTimeout(() => {
                closeModal();
            }, 3000);
        } else {
            throw new Error('Form submission failed');
        }
    })
    .catch(error => {
        formMessage.style.display = 'block';
        formMessage.className = 'form-message error';
        formMessage.textContent = '✗ There was an error submitting your form. Please try again or email us directly at hr@sevendyne.com';
        submitButton.disabled = false;
        submitButton.textContent = 'Submit Inquiry';
    });
}

// Make functions globally available for onclick handlers
window.nextStep = nextStep;
window.prevStep = prevStep;

// Currency Conversion System
const exchangeRates = {
    'INR': 1,           // Base currency
    'USD': 0.012,       // 1 INR = 0.012 USD (approx)
    'GBP': 0.0095,      // 1 INR = 0.0095 GBP (approx)
    'EUR': 0.011,       // 1 INR = 0.011 EUR (approx)
    'CNY': 0.087,       // 1 INR = 0.087 CNY (approx)
    'RUB': 1.1,         // 1 INR = 1.1 RUB (approx)
    'AED': 0.044,       // 1 INR = 0.044 AED (approx)
    'MYR': 0.056,       // 1 INR = 0.056 MYR (approx)
    'SGD': 0.016        // 1 INR = 0.016 SGD (approx)
};

const currencySymbols = {
    'INR': '₹',
    'USD': '$',
    'GBP': '£',
    'EUR': '€',
    'CNY': '¥',
    'RUB': '₽',
    'AED': 'د.إ',
    'MYR': 'RM',
    'SGD': 'S$'
};

const currencyFormats = {
    'INR': (val) => formatIndianCurrency(val),
    'USD': (val) => formatUSCurrency(val),
    'GBP': (val) => formatUSCurrency(val),
    'EUR': (val) => formatEuros(val),
    'CNY': (val) => formatUSCurrency(val),
    'RUB': (val) => formatUSCurrency(val),
    'AED': (val) => formatUSCurrency(val),
    'MYR': (val) => formatUSCurrency(val),
    'SGD': (val) => formatUSCurrency(val)
};

function formatIndianCurrency(value) {
    if (value >= 100000) {
        return '₹' + (value / 100000).toFixed(1) + 'L';
    } else if (value >= 1000) {
        return '₹' + (value / 1000).toFixed(0) + 'K';
    }
    return '₹' + value.toLocaleString('en-IN');
}

function formatUSCurrency(value) {
    if (value >= 1000) {
        return value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    }
    return value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

function formatEuros(value) {
    if (value >= 1000) {
        return value.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    }
    return value.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

function convertCurrency(amountINR, targetCurrency) {
    if (targetCurrency === 'EUR-FR') targetCurrency = 'EUR';
    const rate = exchangeRates[targetCurrency] || 1;
    return amountINR * rate;
}

function formatPrice(value, currency) {
    if (currency === 'EUR-FR') currency = 'EUR';
    const symbol = currencySymbols[currency] || '₹';
    const formatter = currencyFormats[currency] || formatIndianCurrency;
    const formatted = formatter(value);
    // Check if formatter already includes symbol
    if (formatted.includes('₹') || formatted.includes('$') || formatted.includes('£') || formatted.includes('€') || formatted.includes('¥') || formatted.includes('₽') || formatted.includes('د.إ') || formatted.includes('RM') || formatted.includes('S$')) {
        return formatted;
    }
    return symbol + formatted;
}

function updateAllPrices(currency) {
    // Update all price amounts
    document.querySelectorAll('.price-amount[data-inr]').forEach(element => {
        const inrValue = parseFloat(element.getAttribute('data-inr'));
        const converted = convertCurrency(inrValue, currency);
        element.textContent = formatPrice(converted, currency);
    });
    
    // Update discount text
    document.querySelectorAll('.discount-text[data-inr]').forEach(element => {
        const inrValue = parseFloat(element.getAttribute('data-inr'));
        const converted = convertCurrency(inrValue, currency);
        const period = element.textContent.includes('/month') ? '/month' : '';
        element.textContent = element.textContent.split(' - ')[0] + ' - ' + formatPrice(converted, currency) + period;
    });
    
    // Update example prices
    document.querySelectorAll('.example-price[data-inr]').forEach(element => {
        const inrValue = parseFloat(element.getAttribute('data-inr'));
        const converted = convertCurrency(inrValue, currency);
        const originalText = element.textContent;
        if (originalText.includes('L')) {
            // Format as L (Lakhs) equivalent
            if (converted >= 100000) {
                element.textContent = formatPrice(converted / 100000, currency) + 'L';
            } else if (converted >= 1000) {
                element.textContent = formatPrice(converted / 1000, currency) + 'K';
            } else {
                element.textContent = formatPrice(converted, currency);
            }
        } else if (originalText.includes('K')) {
            // Format as K (Thousands) equivalent
            if (converted >= 1000) {
                element.textContent = formatPrice(converted / 1000, currency) + 'K';
            } else {
                element.textContent = formatPrice(converted, currency);
            }
        } else {
            element.textContent = formatPrice(converted, currency);
        }
    });
    
    // Update budget dropdown options
    const budgetSelect = document.getElementById('budget');
    if (budgetSelect) {
        Array.from(budgetSelect.options).forEach(option => {
            if (option.value && option.value !== '' && option.value !== 'project-based') {
                const inrMin = option.getAttribute('data-inr-min');
                const inrMax = option.getAttribute('data-inr-max');
                const inr = option.getAttribute('data-inr');
                
                if (inr) {
                    const converted = convertCurrency(parseFloat(inr), currency);
                    option.textContent = 'Under ' + formatPrice(converted, currency) + '/month';
                } else if (inrMin && inrMax) {
                    const convertedMin = convertCurrency(parseFloat(inrMin), currency);
                    const convertedMax = convertCurrency(parseFloat(inrMax), currency);
                    option.textContent = formatPrice(convertedMin, currency) + ' - ' + formatPrice(convertedMax, currency) + '/month';
                }
            }
        });
    }
    
    // Update button data-price attributes
    document.querySelectorAll('.get-started-btn[data-price-inr]').forEach(button => {
        const inrValue = parseFloat(button.getAttribute('data-price-inr'));
        const converted = convertCurrency(inrValue, currency);
        const period = button.getAttribute('data-price').includes('/month') ? '/month' : '/hour';
        button.setAttribute('data-price', formatPrice(converted, currency) + period);
    });
}

// Initialize currency selector
function initCurrencySelector() {
    const selector = document.getElementById('currencySelector');
    if (!selector) return;
    
    // Load saved currency from localStorage
    const savedCurrency = localStorage.getItem('selectedCurrency') || 'INR';
    selector.value = savedCurrency;
    updateAllPrices(savedCurrency);
    
    // Handle currency change
    selector.addEventListener('change', function() {
        const selectedCurrency = this.value;
        localStorage.setItem('selectedCurrency', selectedCurrency);
        updateAllPrices(selectedCurrency);
    });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCurrencySelector);
} else {
    initCurrencySelector();
}

