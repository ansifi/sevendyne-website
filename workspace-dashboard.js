document.addEventListener('DOMContentLoaded', () => {
    const data = getCachedProvision();
    if (!data) {
        showFallback();
        return;
    }

    fillWorkspaceDetails(data);
    registerCopyButtons();
});

function getCachedProvision() {
    try {
        const raw = localStorage.getItem('SevendyneLastProvision');
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!parsed.workspace) return null;
        return parsed;
    } catch (error) {
        console.warn('Unable to read cached provision data:', error);
        return null;
    }
}

function showFallback() {
    const nameEl = document.getElementById('workspace-name');
    if (nameEl) {
        nameEl.textContent = 'No workspace found';
    }
    const stepsEl = document.getElementById('workspace-next-steps');
    if (stepsEl) {
        stepsEl.innerHTML = '<li>Please return to the Create Account page and provision a workspace first.</li>';
    }
}

function fillWorkspaceDetails(data) {
    const { workspace, next_steps: nextSteps, notes } = data;
    const templateName = data.template_name || (data.template_id ? formatTemplateName(data.template_id) : '');
    setText('workspace-name', templateName ? `${templateName} Workspace` : workspace.slug ? `${workspace.slug} Workspace` : 'Workspace');
    setText('workspace-slug', workspace.slug || '—');
    setText('workspace-subdomain', workspace.subdomain || '—');
    setText('workspace-api-key', workspace.api_key || '—');
    setText('workspace-uuid', workspace.workspace_uuid || '—');
    const domainSuffix = window.WORKSPACE_DOMAIN_SUFFIX || 'Sevendyne.com';
    const domain = workspace.slug ? `${workspace.slug}.${domainSuffix}` : `your-workspace.${domainSuffix}`;
    setText('workspace-domain', domain);

    const loginLink = document.getElementById('workspace-login-action');
    if (loginLink) {
        let loginUrl = (data.login_url || '').trim();
        if (!loginUrl) {
            const baseCandidate = (data.backend_base || '').trim();
            const backendBase = baseCandidate ? baseCandidate.replace(/\/$/, '') : 'http://127.0.0.1:8200';
            loginUrl = workspace.slug
                ? `${backendBase}/app/login/?workspace=${encodeURIComponent(workspace.slug)}`
                : `${backendBase}/app/login/`;
        }
        loginLink.href = loginUrl;
        loginLink.textContent = workspace.slug
            ? `Open Workspace Login (${workspace.slug})`
            : 'Open Workspace Login';
        loginLink.style.display = 'inline-flex';
    }

    const stepsContainer = document.getElementById('workspace-next-steps');
    if (stepsContainer) {
        stepsContainer.innerHTML = '';
        const items = Array.isArray(nextSteps) && nextSteps.length
            ? nextSteps
            : buildDefaultSteps(templateName);
        items.forEach((step) => {
            const li = document.createElement('li');
            li.textContent = step;
            stepsContainer.appendChild(li);
        });

        if (notes && notes.length) {
            notes.forEach((note) => {
                const li = document.createElement('li');
                li.textContent = note;
                li.classList.add('workspace-note');
                stepsContainer.appendChild(li);
            });
        }
    }

    const credentialUsername = data.owner_credentials ? data.owner_credentials.username : null;
    const credentialPassword = data.owner_credentials ? data.owner_credentials.password : null;
    setText('workspace-owner-username', credentialUsername || '—');
    setText('workspace-owner-password', credentialPassword || '—');
}

function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}

function registerCopyButtons() {
    document.querySelectorAll('.copy-btn').forEach((button) => {
        button.addEventListener('click', async () => {
            const targetId = button.getAttribute('data-target');
            const el = document.getElementById(targetId);
            if (!el) return;
            try {
                await navigator.clipboard.writeText(el.textContent.trim());
                button.textContent = 'Copied!';
                setTimeout(() => {
                    button.textContent = 'Copy';
                }, 2000);
            } catch (error) {
                console.warn('Clipboard error:', error);
            }
        });
    });
}

function buildDefaultSteps(templateName) {
    const baseSteps = [
        'Add your team members and share the API key securely.',
        'Schedule a rollout call to configure integrations.',
        'Map a custom domain once branding is finalised.',
    ];
    if (templateName) {
        baseSteps.unshift(`Review the ${templateName} module checklist and confirm the required features.`);
    }
    return baseSteps;
}

function formatTemplateName(templateId) {
    return templateId
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
}

