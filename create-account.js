const PROVISION_API_BASE = window.CREATE_ACCOUNT_API_BASE || 'http://127.0.0.1:8200/api';
const BACKEND_BASE = deriveBackendBase(PROVISION_API_BASE);

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const subdomainField = document.getElementById('workspace_subdomain');
    const loginLink = document.getElementById('workspace-login-link');
    const form = document.getElementById('create-account-form');
    const messageBox = document.getElementById('provision-status');
    const templateInfoEl = document.getElementById('selected-template-info');

    const templateId = params.get('template');
    window.__selectedTemplateId = templateId || '';
    const templateName = templateId ? formatTemplateName(templateId) : null;
    if (templateInfoEl) {
        templateInfoEl.textContent = templateName
            ? `Provisioning workspace for ${templateName}`
            : 'Provisioning workspace for your selected module.';
    }

    if (subdomainField) {
        if (!subdomainField.value) {
            subdomainField.value = generateWorkspaceSlug();
        }
        updateLoginLink(subdomainField.value, loginLink);
        subdomainField.addEventListener('input', () => updateLoginLink(subdomainField.value, loginLink));
    } else {
        updateLoginLink('', loginLink);
    }

    if (form) {
        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }

            toggleSubmitting(form, true);
            setMessage(messageBox, 'Provisioning workspace…', 'info');

            try {
                const payload = buildPayload(form);
                const response = await fetch(`${PROVISION_API_BASE}/workspaces/provision/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                });

                const data = await response.json();
                if (!response.ok || !data.success) {
                    throw new Error(data.error || 'Provisioning failed. Please try again.');
                }

                if (window.APP_CONFIG && typeof window.APP_CONFIG.setTenantKey === 'function') {
                    window.APP_CONFIG.setTenantKey(data.workspace.slug);
                }
                cacheProvisionResult(data);
                window.location.href = 'workspace-dashboard.html';
            } catch (error) {
                console.error(error);
                setMessage(messageBox, `❌ ${error.message}`, 'error');
            } finally {
                toggleSubmitting(form, false);
            }
        });
    }
});

function generateWorkspaceSlug() {
    const adjectives = ['swift', 'nova', 'alpha', 'prime', 'stellar', 'vector', 'zenith', 'lumen'];
    const nouns = ['workspace', 'portal', 'suite', 'orbit', 'launch', 'nexus', 'hub', 'core'];
    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    const randomNumber = Math.floor(Math.random() * 900 + 100); // 100-999
    return `${randomAdjective}-${randomNoun}-${randomNumber}`;
}

function buildPayload(form) {
    const toValue = (id) => (form.querySelector(`#${id}`)?.value || '').trim();
    return {
        owner_name: toValue('contact_name'),
        owner_email: toValue('contact_email'),
        owner_phone: toValue('contact_phone'),
        workspace_name: toValue('brand_name'),
        template_id: (window.__selectedTemplateId || '').trim(),
        preferred_subdomain: toValue('workspace_subdomain'),
        preferred_slug: toValue('workspace_subdomain') || toValue('brand_name').toLowerCase().replace(/\s+/g, '-'),
        custom_domain: toValue('custom_domain'),
        subscription_plan: toValue('subscription_plan'),
        details: toValue('workspace_details'),
    };
}

function setMessage(element, message, type = 'info') {
    if (!element) return;
    element.textContent = message;
    element.className = `form-status form-status--${type}`;
    element.style.display = 'block';
}

function toggleSubmitting(form, isSubmitting) {
    const button = form.querySelector('button[type="submit"]');
    if (button) {
        button.disabled = isSubmitting;
        button.textContent = isSubmitting ? 'Submitting…' : 'Submit & Provision Workspace';
    }
}

function cacheProvisionResult(data) {
    if (!data || !data.workspace) return;
    const payload = {
        timestamp: Date.now(),
        workspace: data.workspace,
        template_id: window.__selectedTemplateId || '',
        template_name: data.template_name || (window.__selectedTemplateId ? formatTemplateName(window.__selectedTemplateId) : ''),
        next_steps: data.next_steps || [],
        notes: data.notes || [],
        owner_credentials: data.owner_credentials || null,
        backend_base: BACKEND_BASE,
        login_url: buildLoginUrl(data.workspace.slug || ''),
        provision_api_base: PROVISION_API_BASE,
    };
    try {
        localStorage.setItem('SevendyneLastProvision', JSON.stringify(payload));
    } catch (error) {
        console.warn('Unable to cache provisioning result:', error);
    }
}

function deriveBackendBase(apiBase) {
    try {
        const url = new URL(apiBase, window.location.origin);
        const cleanedPath = url.pathname.replace(/\/+$/, '').replace(/\/api$/, '');
        const path = cleanedPath === '' ? '' : cleanedPath;
        return `${url.origin}${path}`;
    } catch (error) {
        return 'http://127.0.0.1:8200';
    }
}

function buildLoginUrl(slug) {
    const base = BACKEND_BASE.replace(/\/$/, '');
    return slug
        ? `${base}/app/login/?workspace=${encodeURIComponent(slug)}`
        : `${base}/app/login/`;
}

function updateLoginLink(slug, linkEl) {
    if (!linkEl) return;
    const url = buildLoginUrl(slug);
    linkEl.href = url;
    linkEl.textContent = slug ? `Open Workspace Login (${slug})` : 'Open Workspace Login';
}

function formatTemplateName(templateId) {
    return templateId
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
}

