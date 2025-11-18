// Contact Form Template Integration
// Handles pre-populating the contact form when user selects a template

document.addEventListener('DOMContentLoaded', function() {
    // Check if user came from a template
    const urlParams = new URLSearchParams(window.location.search);
    const templateId = urlParams.get('template') || localStorage.getItem('selectedTemplate');
    
    if (templateId) {
        loadTemplateData(templateId);
    }
});

async function loadTemplateData(templateId) {
    try {
        const response = await fetch('templates.json?v=' + Date.now());
        const data = await response.json();
        const template = data.templates.find(t => t.id === templateId);
        
        if (template) {
            populateFormWithTemplate(template);
            localStorage.removeItem('selectedTemplate'); // Clear after using
        }
    } catch (error) {
        console.error('Error loading template:', error);
    }
}

function populateFormWithTemplate(template) {
    // Update form title
    const formTitle = document.getElementById('form-title');
    if (formTitle) {
        formTitle.textContent = `Inquiry about: ${template.name}`;
    }
    
    // Show template info
    const infoDiv = document.getElementById('template-selected-info');
    if (infoDiv) {
        infoDiv.style.display = 'block';
        infoDiv.innerHTML = `
            <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                <strong>Selected Template:</strong> ${template.name}<br>
                <small>Base Price: ₹${template.baseCost.toLocaleString('en-IN')} | Delivery: ${template.baseDurationDays} days</small>
            </div>
        `;
    }
    
    // Set hidden fields
    document.getElementById('template_id').value = template.id;
    document.getElementById('template_name').value = template.name;
    
    // Pre-fill project type
    const projectType = document.getElementById('project_type');
    if (projectType) {
        projectType.value = `${template.name} - Customization`;
    }
    
    // Pre-fill message with template features
    const message = document.getElementById('project_message');
    if (message) {
        const featuresList = template.features.slice(0, 5).join('\n- ');
        message.value = `I'm interested in the ${template.name} template.\n\nIncluded features:\n- ${featuresList}\n\nAdditional requirements:\n[Please describe your customization needs here]`;
    }
    
    // Scroll to contact form
    setTimeout(() => {
        const contactSection = document.getElementById('contact');
        if (contactSection) {
            contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, 500);
}

// Export for use in other scripts
window.loadTemplateData = loadTemplateData;
