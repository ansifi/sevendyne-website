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


