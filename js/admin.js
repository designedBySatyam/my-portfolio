/**
 * ============================================
 * ADMIN MANAGER
 * Supports:
 * 1) Embedded admin modal (projects-certificates page)
 * 2) Standalone admin page (pages/admin.html)
 * ============================================
 */

'use strict';

const AdminUI = {
    notify(type, message) {
        if (!message) return;
        this.ensureToastStyles();
        let container = document.getElementById('adminToastContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'adminToastContainer';
            container.className = 'admin-toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `admin-toast ${type === 'error' ? 'error' : 'success'}`;
        toast.textContent = message;
        container.appendChild(toast);

        window.setTimeout(() => {
            toast.classList.add('hide');
            window.setTimeout(() => toast.remove(), 250);
        }, 2600);
    },

    ensureToastStyles() {
        if (document.getElementById('adminToastStyles')) return;
        const style = document.createElement('style');
        style.id = 'adminToastStyles';
        style.textContent = `
            .admin-toast-container {
                position: fixed;
                top: 18px;
                right: 18px;
                display: flex;
                flex-direction: column;
                gap: 8px;
                z-index: 9999;
                pointer-events: none;
            }
            .admin-toast {
                padding: 10px 12px;
                border-radius: 8px;
                font-family: var(--font-mono, monospace);
                font-size: 0.72rem;
                letter-spacing: 0.06em;
                border: 1px solid transparent;
                backdrop-filter: blur(8px);
                transition: opacity 0.2s ease, transform 0.2s ease;
                opacity: 1;
                transform: translateY(0);
            }
            .admin-toast.success {
                color: #98ffe0;
                background: rgba(17, 74, 66, 0.84);
                border-color: rgba(85, 219, 197, 0.4);
            }
            .admin-toast.error {
                color: #ffd2df;
                background: rgba(110, 27, 50, 0.84);
                border-color: rgba(255, 102, 153, 0.45);
            }
            .admin-toast.hide {
                opacity: 0;
                transform: translateY(-4px);
            }
        `;
        document.head.appendChild(style);
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = String(text ?? '');
        return div.innerHTML;
    },

    isValidHttpUrl(url) {
        if (!url) return true;
        try {
            const parsed = new URL(url);
            return parsed.protocol === 'http:' || parsed.protocol === 'https:';
        } catch (error) {
            return false;
        }
    },

    normalizeProjectStatus(raw) {
        const value = String(raw || 'Completed').trim().toLowerCase();
        const map = {
            completed: 'Completed',
            active: 'Active',
            research: 'Research',
            planning: 'Planning'
        };
        return map[value] || 'Completed';
    },

    toTechArray(raw) {
        return String(raw || '')
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean);
    }
};

class AdminAuth {
    constructor() {
        this.adminModal = document.getElementById('adminModal');
        this.loginScreen = document.getElementById('loginScreen');
        this.adminDashboard = document.getElementById('adminDashboard');
        this.embeddedMode = Boolean(this.adminModal);
        this.standaloneMode = Boolean(this.loginScreen && this.adminDashboard);

        this.openBtn = document.getElementById('adminLoginBtn');
        this.closeBtn = document.getElementById('closeAdminModal');
        this.loginBlock = document.getElementById('adminLoginForm') || this.loginScreen;
        this.panelBlock = document.getElementById('adminPanel') || this.adminDashboard;
        this.loginForm = document.getElementById('loginForm');
        this.emailInput = document.getElementById('adminEmail') || document.getElementById('email');
        this.passwordInput = document.getElementById('adminPassword') || document.getElementById('password');
        this.errorBox = document.getElementById('adminError') || document.getElementById('authError');
        this.userEmail = document.getElementById('adminUserEmail');
        this.logoutBtn = document.getElementById('adminLogoutBtn') || document.getElementById('logoutBtn');
        this.backBtn = document.getElementById('backToSiteBtn');
        this.submitBtn = this.loginForm?.querySelector('button[type="submit"]');
        this.submitLabel = this.submitBtn?.querySelector('span');
        this.defaultSubmitLabel = this.submitLabel?.textContent || 'LOGIN';
    }

    init() {
        // Bind modal open/close first so the button always responds.
        if (this.openBtn && this.embeddedMode) {
            this.openBtn.addEventListener('click', () => {
                this.adminModal.style.display = 'flex';
            });
        }

        if (this.closeBtn && this.embeddedMode) {
            this.closeBtn.addEventListener('click', () => this.hideModal());
        }

        if (this.adminModal) {
            this.adminModal.addEventListener('click', (event) => {
                if (event.target === this.adminModal) this.hideModal();
            });
        }

        if (!this.loginForm || !this.emailInput || !this.passwordInput) return;

        if (!auth || typeof auth.onAuthStateChanged !== 'function') {
            this.resolveLoader();
            this.showLogin();
            this.showError('Admin auth is unavailable. Check Firebase Auth setup.');
            return;
        }

        // Fallback: if Firebase doesn't fire within 6s, show login
        const authTimeout = window.setTimeout(() => {
            this.resolveLoader();
            this.showLogin();
        }, 6000);

        auth.onAuthStateChanged((user) => {
            window.clearTimeout(authTimeout);
            this.resolveLoader();
            if (user) {
                this.showPanel(user);
            } else {
                this.showLogin();
            }
        });

        this.loginForm.addEventListener('submit', (event) => this.handleLogin(event));
        this.logoutBtn?.addEventListener('click', () => this.handleLogout());
        this.backBtn?.addEventListener('click', () => this.handleBackNavigation());
    }

    resolveLoader() {
        // Reveal body and hide the auth loader overlay
        document.body.style.visibility = 'visible';
        const loader = document.getElementById('authLoader');
        if (loader) loader.classList.add('resolved');
    }

    setSubmitting(isSubmitting) {
        if (!this.submitBtn) return;
        this.submitBtn.disabled = isSubmitting;
        if (this.submitLabel) {
            this.submitLabel.textContent = isSubmitting ? 'AUTHENTICATING...' : this.defaultSubmitLabel;
        }
    }

    showError(message) {
        if (!this.errorBox) return;
        this.errorBox.textContent = message || '';
        this.errorBox.style.display = message ? 'block' : 'none';
    }

    getAuthError(code) {
        const map = {
            'auth/invalid-email': 'Invalid email address.',
            'auth/user-disabled': 'This account is disabled.',
            'auth/user-not-found': 'No account found for this email.',
            'auth/wrong-password': 'Incorrect password.',
            'auth/invalid-credential': 'Invalid email or password.',
            'auth/too-many-requests': 'Too many attempts. Try again later.'
        };
        return map[code] || 'Authentication failed. Please try again.';
    }

    async handleLogin(event) {
        event.preventDefault();
        const email = this.emailInput.value.trim();
        const password = this.passwordInput.value.trim();

        if (!email || !password) {
            this.showError('Email and password are required.');
            return;
        }

        this.setSubmitting(true);
        this.showError('');

        try {
            await auth.signInWithEmailAndPassword(email, password);
            AdminUI.notify('success', 'Signed in successfully.');
        } catch (error) {
            console.error('Admin login failed:', error);
            this.showError(this.getAuthError(error.code));
        } finally {
            this.setSubmitting(false);
        }
    }

    async handleLogout() {
        try {
            await auth.signOut();
            AdminUI.notify('success', 'Logged out.');
            this.hideModal();
        } catch (error) {
            console.error('Admin logout failed:', error);
            AdminUI.notify('error', 'Logout failed. Try again.');
        }
    }

    showLogin() {
        if (this.loginBlock) this.loginBlock.style.display = this.standaloneMode ? 'flex' : 'block';
        if (this.panelBlock) this.panelBlock.style.display = 'none';
        if (this.standaloneMode && this.loginScreen) this.loginScreen.style.display = 'flex';
        if (this.standaloneMode && this.adminDashboard) this.adminDashboard.style.display = 'none';
        // Focus email input for keyboard users
        window.setTimeout(() => this.emailInput?.focus(), 50);
    }

    showPanel(user) {
        if (this.loginBlock) this.loginBlock.style.display = 'none';
        if (this.panelBlock) this.panelBlock.style.display = 'block';
        if (this.userEmail) this.userEmail.textContent = user.email || '';
        if (this.standaloneMode && this.loginScreen) this.loginScreen.style.display = 'none';
        if (this.standaloneMode && this.adminDashboard) this.adminDashboard.style.display = 'block';

        this.emailInput.value = '';
        this.passwordInput.value = '';
        this.showError('');
    }

    hideModal() {
        if (this.embeddedMode && this.adminModal) {
            this.adminModal.style.display = 'none';
        }
    }

    handleBackNavigation() {
        const sameOriginReferrer = (() => {
            try {
                return !!document.referrer && new URL(document.referrer).origin === window.location.origin;
            } catch (_) {
                return false;
            }
        })();

        if (window.history.length > 1 && sameOriginReferrer) {
            window.history.back();
            return;
        }

        window.location.href = '../index.html';
    }
}

class AdminTabs {
    constructor() {
        this.tabs = document.querySelectorAll('.admin-tab, .tab-btn');
        this.contents = document.querySelectorAll('.admin-tab-content, .tab-content');
        this.tabNames = Array.from(this.tabs)
            .map((tab) => tab.dataset.tab)
            .filter(Boolean);
    }

    init() {
        if (!this.tabs.length || !this.contents.length) return;

        this.tabs.forEach((tab) => {
            tab.addEventListener('click', () => this.switchTab(tab.dataset.tab || 'projects'));
        });

        const fromUrl = this.getTabFromUrl();
        const fromActive =
            Array.from(this.tabs).find((tab) => tab.classList.contains('active'))?.dataset.tab
            || this.tabs[0]?.dataset.tab
            || 'projects';
        this.switchTab(fromUrl || fromActive, false);
    }

    isValidTab(name) {
        return !!name && this.tabNames.includes(name);
    }

    getTabFromUrl() {
        try {
            const raw = new URL(window.location.href).searchParams.get('tab');
            return this.isValidTab(raw) ? raw : '';
        } catch (_) {
            return '';
        }
    }

    syncTabToUrl(name) {
        try {
            const url = new URL(window.location.href);
            if (url.searchParams.get('tab') === name) return;
            url.searchParams.set('tab', name);
            window.history.replaceState(window.history.state, '', url.toString());
        } catch (_) {
            // Ignore URL sync failures.
        }
    }

    switchTab(name, persist = true) {
        const target = this.isValidTab(name) ? name : (this.tabNames[0] || 'projects');
        this.tabs.forEach((tab) => tab.classList.toggle('active', tab.dataset.tab === target));
        this.contents.forEach((content) => content.classList.toggle('active', content.id === `${target}Tab`));
        if (persist) this.syncTabToUrl(target);
    }
}

class ProjectsAdmin {
    constructor() {
        this.projectsList = document.querySelector('#projectsTab .admin-list') || document.getElementById('projectsList');
        this.projectsCount = document.getElementById('projectsCount');
        this.addBtn = document.getElementById('addProjectBtn');
        this.modal = document.getElementById('editProjectModal') || document.getElementById('projectModal');
        this.form = document.getElementById('projectForm');
        this.modalTitle = document.getElementById('projectModalTitle');
        this.closeBtn = document.getElementById('closeProjectModal');
        this.cancelBtn = document.getElementById('cancelProjectBtn');
        this.formMessage = document.getElementById('projectFormMessage');
        this.saveBtn = this.form?.querySelector('button[type="submit"]');
        this.saveLabel = this.saveBtn?.querySelector('span');
        this.defaultSaveLabel = this.saveLabel?.textContent || this.saveBtn?.textContent || 'Save Project';
        this.currentProjectId = null;
    }

    init() {
        if (!this.projectsList || !this.addBtn || !this.modal || !this.form) return;

        this.loadProjects();
        this.addBtn.addEventListener('click', () => this.openAddModal());
        this.closeBtn?.addEventListener('click', () => this.closeModal());
        this.cancelBtn?.addEventListener('click', () => this.closeModal());
        this.form.addEventListener('submit', (event) => this.handleSubmit(event));
        this.modal.addEventListener('click', (event) => {
            if (event.target === this.modal) this.closeModal();
        });

        this.projectsList.addEventListener('click', (event) => {
            const button = event.target.closest('[data-action]');
            if (!button) return;

            const action = button.dataset.action;
            const projectId = button.dataset.id;
            if (!projectId) return;

            if (action === 'edit') {
                this.openEditModal(projectId);
            } else if (action === 'delete') {
                const title = button.dataset.title || 'this project';
                this.deleteProject(projectId, title);
            }
        });
    }

    getField(...ids) {
        for (const id of ids) {
            const element = document.getElementById(id);
            if (element) return element;
        }
        return null;
    }

    setField(value, ...ids) {
        const field = this.getField(...ids);
        if (field) field.value = value ?? '';
    }

    setSaving(isSaving) {
        if (!this.saveBtn) return;
        this.saveBtn.disabled = isSaving;
        if (this.saveLabel) {
            this.saveLabel.textContent = isSaving ? 'SAVING...' : this.defaultSaveLabel;
        }
    }

    showFormMessage(type, message) {
        if (this.formMessage) {
            this.formMessage.className = `form-message ${type}`;
            this.formMessage.textContent = message;
            this.formMessage.style.display = 'block';
            return;
        }
        AdminUI.notify(type, message);
    }

    clearFormMessage() {
        if (!this.formMessage) return;
        this.formMessage.className = 'form-message';
        this.formMessage.textContent = '';
        this.formMessage.style.display = 'none';
    }

    openModal() {
        this.modal.style.display = 'flex';
        this.modal.classList.add('open', 'active');
    }

    closeModal() {
        this.modal.style.display = 'none';
        this.modal.classList.remove('open', 'active');
        this.form.reset();
        this.currentProjectId = null;
        this.clearFormMessage();
    }

    loadProjects() {
        db.collection(COLLECTIONS.PROJECTS)
            .orderBy('order', 'asc')
            .onSnapshot((snapshot) => {
                const projects = [];
                snapshot.forEach((doc) => projects.push({ id: doc.id, ...doc.data() }));
                this.renderProjects(projects);
            }, (error) => {
                console.error('Failed loading projects:', error);
                if (this.projectsCount) this.projectsCount.textContent = '-';
                this.projectsList.innerHTML = `
                    <div class="admin-error-state">
                        <p>Failed to load projects.</p>
                    </div>
                `;
            });
    }

    renderProjects(projects) {
        if (this.projectsCount) this.projectsCount.textContent = String(projects.length);

        if (!projects.length) {
            this.projectsList.innerHTML = `
                <div class="admin-empty-state">
                    <p>No projects yet. Add your first project.</p>
                </div>
            `;
            return;
        }

        this.projectsList.innerHTML = projects.map((project) => {
            const title = AdminUI.escapeHtml(project.title || 'Untitled Project');
            const description = AdminUI.escapeHtml(project.description || '');
            const status = AdminUI.escapeHtml(AdminUI.normalizeProjectStatus(project.status));
            const technologies = Array.isArray(project.technologies) ? project.technologies.slice(0, 3) : [];

            return `
                <div class="admin-list-item admin-item" data-project-id="${project.id}">
                    <div class="admin-item-info">
                        <div class="admin-item-name">${title}</div>
                        <p>${description}</p>
                        <div class="admin-item-meta">
                            <span class="meta-tag">${status}</span>
                            ${technologies.map((tech) => `<span class="meta-tag">${AdminUI.escapeHtml(tech)}</span>`).join('')}
                        </div>
                    </div>
                    <div class="admin-item-actions">
                        <button class="admin-edit-btn" data-action="edit" data-id="${project.id}" type="button">Edit</button>
                        <button class="admin-del-btn admin-delete-btn" data-action="delete" data-id="${project.id}" data-title="${title}" type="button">Delete</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    openAddModal() {
        this.currentProjectId = null;
        if (this.modalTitle) this.modalTitle.textContent = 'Add New Project';
        this.form.reset();
        this.clearFormMessage();
        this.openModal();
    }

    async openEditModal(projectId) {
        try {
            const doc = await db.collection(COLLECTIONS.PROJECTS).doc(projectId).get();
            if (!doc.exists) {
                AdminUI.notify('error', 'Project not found.');
                return;
            }

            const project = doc.data();
            this.currentProjectId = projectId;

            if (this.modalTitle) this.modalTitle.textContent = 'Edit Project';
            this.setField(project.title, 'projectTitle');
            this.setField(project.description, 'projectDescription');
            const statusField = this.getField('projectStatus');
            if (statusField) {
                const normalizedStatus = AdminUI.normalizeProjectStatus(project.status);
                const statusOption = [...statusField.options].find((opt) => {
                    return (
                        opt.value.toLowerCase() === normalizedStatus.toLowerCase() ||
                        opt.text.toLowerCase() === normalizedStatus.toLowerCase()
                    );
                });
                statusField.value = statusOption ? statusOption.value : normalizedStatus;
            }
            this.setField(
                Array.isArray(project.technologies) ? project.technologies.join(', ') : '',
                'projectTechnologies',
                'projectTech'
            );
            this.setField(project.link || '', 'projectLink');
            this.setField(project.icon || 'default', 'projectIcon');
            this.setField(project.category || 'general', 'projectCategory');
            if (typeof project.order === 'number') this.setField(project.order, 'projectOrder');

            this.clearFormMessage();
            this.openModal();
        } catch (error) {
            console.error('Failed loading project:', error);
            AdminUI.notify('error', 'Failed to load project.');
        }
    }

    async handleSubmit(event) {
        event.preventDefault();
        this.clearFormMessage();

        const title = (this.getField('projectTitle')?.value || '').trim();
        const description = (this.getField('projectDescription')?.value || '').trim();
        const statusRaw = (this.getField('projectStatus')?.value || '').trim();
        const technologiesRaw = (this.getField('projectTechnologies', 'projectTech')?.value || '').trim();
        const link = (this.getField('projectLink')?.value || '').trim();
        const icon = (this.getField('projectIcon')?.value || 'default').trim();
        const category = (this.getField('projectCategory')?.value || 'general').trim();
        const explicitOrder = Number(this.getField('projectOrder')?.value || '');

        if (!title || !description) {
            this.showFormMessage('error', 'Title and description are required.');
            return;
        }

        const technologies = AdminUI.toTechArray(technologiesRaw);
        if (!technologies.length) {
            this.showFormMessage('error', 'Please provide at least one technology.');
            return;
        }

        if (link && !AdminUI.isValidHttpUrl(link)) {
            this.showFormMessage('error', 'Project link must be a valid http/https URL.');
            return;
        }

        this.setSaving(true);

        const projectData = {
            title,
            description,
            status: AdminUI.normalizeProjectStatus(statusRaw),
            technologies,
            link: link || null,
            icon: icon || 'default',
            category: category || 'general',
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        try {
            if (this.currentProjectId) {
                if (Number.isFinite(explicitOrder) && explicitOrder > 0) {
                    projectData.order = explicitOrder;
                }
                await db.collection(COLLECTIONS.PROJECTS).doc(this.currentProjectId).update(projectData);
                this.showFormMessage('success', 'Project updated successfully.');
                AdminUI.notify('success', 'Project updated.');
            } else {
                if (Number.isFinite(explicitOrder) && explicitOrder > 0) {
                    projectData.order = explicitOrder;
                } else {
                    const snapshot = await db.collection(COLLECTIONS.PROJECTS).get();
                    projectData.order = snapshot.size + 1;
                }
                projectData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
                await db.collection(COLLECTIONS.PROJECTS).add(projectData);
                this.showFormMessage('success', 'Project added successfully.');
                AdminUI.notify('success', 'Project created.');
            }

            window.setTimeout(() => this.closeModal(), 250);
        } catch (error) {
            console.error('Failed saving project:', error);
            this.showFormMessage('error', 'Failed to save project. Please try again.');
        } finally {
            this.setSaving(false);
        }
    }

    async deleteProject(projectId, projectTitle) {
        const confirmed = window.confirm(`Delete "${projectTitle}"? This action cannot be undone.`);
        if (!confirmed) return;

        try {
            await db.collection(COLLECTIONS.PROJECTS).doc(projectId).delete();
            AdminUI.notify('success', 'Project deleted.');
        } catch (error) {
            console.error('Failed deleting project:', error);
            AdminUI.notify('error', 'Failed to delete project.');
        }
    }
}

class CertificatesAdmin {
    constructor() {
        this.certsList = document.querySelector('#certificatesTab .admin-list') || document.getElementById('certificatesList');
        this.certsCount = document.getElementById('certificatesCount');
        this.addBtn = document.getElementById('addCertificateBtn') || document.getElementById('addCertBtn');
        this.modal = document.getElementById('editCertificateModal') || document.getElementById('certModal');
        this.form = document.getElementById('certificateForm') || document.getElementById('certForm');
        this.modalTitle = document.getElementById('certificateModalTitle') || document.getElementById('certModalTitle');
        this.closeBtn = document.getElementById('closeCertificateModal') || document.getElementById('closeCertModal');
        this.cancelBtn = document.getElementById('cancelCertificateBtn') || document.getElementById('cancelCertBtn');
        this.formMessage = document.getElementById('certFormMessage');
        this.saveBtn = this.form?.querySelector('button[type="submit"]');
        this.saveLabel = this.saveBtn?.querySelector('span');
        this.defaultSaveLabel = this.saveLabel?.textContent || this.saveBtn?.textContent || 'Save Certificate';
        this.currentCertId = null;
        this.previewBox = document.getElementById('certPreviewBox');
        this.previewImage = document.getElementById('certImagePreview');
        this.previewHint = document.getElementById('certPreviewHint');
    }

    init() {
        if (!this.certsList || !this.addBtn || !this.modal || !this.form) return;

        this.loadCertificates();
        this.addBtn.addEventListener('click', () => this.openAddModal());
        this.closeBtn?.addEventListener('click', () => this.closeModal());
        this.cancelBtn?.addEventListener('click', () => this.closeModal());
        this.form.addEventListener('submit', (event) => this.handleSubmit(event));
        this.getField('certificateImageUrl', 'certImage')?.addEventListener('input', (event) => {
            this.updateImagePreview(event.target.value);
        });
        this.modal.addEventListener('click', (event) => {
            if (event.target === this.modal) this.closeModal();
        });

        this.certsList.addEventListener('click', (event) => {
            const button = event.target.closest('[data-action]');
            if (!button) return;
            const certId = button.dataset.id;
            if (!certId) return;
            if (button.dataset.action === 'edit') {
                this.openEditModal(certId);
            } else if (button.dataset.action === 'delete') {
                const title = button.dataset.title || 'this certificate';
                this.deleteCertificate(certId, title);
            }
        });
    }

    getField(...ids) {
        for (const id of ids) {
            const element = document.getElementById(id);
            if (element) return element;
        }
        return null;
    }

    setField(value, ...ids) {
        const field = this.getField(...ids);
        if (field) field.value = value ?? '';
    }

    setSaving(isSaving) {
        if (!this.saveBtn) return;
        this.saveBtn.disabled = isSaving;
        if (this.saveLabel) {
            this.saveLabel.textContent = isSaving ? 'SAVING...' : this.defaultSaveLabel;
        }
    }

    showFormMessage(type, message) {
        if (this.formMessage) {
            this.formMessage.className = `form-message ${type}`;
            this.formMessage.textContent = message;
            this.formMessage.style.display = 'block';
            return;
        }
        AdminUI.notify(type, message);
    }

    clearFormMessage() {
        if (!this.formMessage) return;
        this.formMessage.className = 'form-message';
        this.formMessage.textContent = '';
        this.formMessage.style.display = 'none';
    }

    openModal() {
        this.modal.style.display = 'flex';
        this.modal.classList.add('open', 'active');
    }

    closeModal() {
        this.modal.style.display = 'none';
        this.modal.classList.remove('open', 'active');
        this.form.reset();
        this.currentCertId = null;
        this.clearFormMessage();
        this.resetImagePreview();
    }

    normalizeCertificateImagePath(imagePath) {
        if (window.PortfolioUtils?.normalizeCertificateImagePath) {
            return window.PortfolioUtils.normalizeCertificateImagePath(imagePath);
        }
        return String(imagePath || '').trim();
    }

    resetImagePreview() {
        if (this.previewBox) this.previewBox.classList.remove('has-image');
        if (this.previewImage) {
            this.previewImage.removeAttribute('src');
        }
        if (this.previewHint) {
            this.previewHint.textContent = 'Enter a valid image path or URL to preview.';
        }
    }

    updateImagePreview(rawPath) {
        if (!this.previewBox || !this.previewImage || !this.previewHint) return;

        const normalizedPath = this.normalizeCertificateImagePath(rawPath);
        if (!normalizedPath) {
            this.resetImagePreview();
            return;
        }

        this.previewImage.onload = () => {
            this.previewBox.classList.add('has-image');
        };

        this.previewImage.onerror = () => {
            this.previewBox.classList.remove('has-image');
            this.previewImage.removeAttribute('src');
            this.previewHint.textContent = 'Unable to load preview for this path.';
        };

        this.previewImage.src = normalizedPath;
    }

    loadCertificates() {
        db.collection(COLLECTIONS.CERTIFICATES)
            .orderBy('order', 'asc')
            .onSnapshot((snapshot) => {
                const certs = [];
                snapshot.forEach((doc) => certs.push({ id: doc.id, ...doc.data() }));
                this.renderCertificates(certs);
            }, (error) => {
                console.error('Failed loading certificates:', error);
                if (this.certsCount) this.certsCount.textContent = '-';
                this.certsList.innerHTML = `
                    <div class="admin-error-state">
                        <p>Failed to load certificates.</p>
                    </div>
                `;
            });
    }

    renderCertificates(certs) {
        if (this.certsCount) this.certsCount.textContent = String(certs.length);

        if (!certs.length) {
            this.certsList.innerHTML = `
                <div class="admin-empty-state">
                    <p>No certificates yet. Add your first certificate.</p>
                </div>
            `;
            return;
        }

        this.certsList.innerHTML = certs.map((cert) => {
            const title = AdminUI.escapeHtml(cert.title || 'Untitled Certificate');
            const issuer = AdminUI.escapeHtml(cert.issuer || 'Unknown Issuer');
            const date = AdminUI.escapeHtml(cert.date || cert.issueDate || '');

            return `
                <div class="admin-list-item admin-item" data-cert-id="${cert.id}">
                    <div class="admin-item-info">
                        <div class="admin-item-name">${title}</div>
                        <p>${issuer}</p>
                        ${date ? `<p>${date}</p>` : ''}
                    </div>
                    <div class="admin-item-actions">
                        <button class="admin-edit-btn" data-action="edit" data-id="${cert.id}" type="button">Edit</button>
                        <button class="admin-del-btn admin-delete-btn" data-action="delete" data-id="${cert.id}" data-title="${title}" type="button">Delete</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    openAddModal() {
        this.currentCertId = null;
        if (this.modalTitle) this.modalTitle.textContent = 'Add New Certificate';
        this.form.reset();
        this.clearFormMessage();
        this.resetImagePreview();
        this.openModal();
    }

    async openEditModal(certId) {
        try {
            const doc = await db.collection(COLLECTIONS.CERTIFICATES).doc(certId).get();
            if (!doc.exists) {
                AdminUI.notify('error', 'Certificate not found.');
                return;
            }

            const cert = doc.data();
            this.currentCertId = certId;
            if (this.modalTitle) this.modalTitle.textContent = 'Edit Certificate';

            this.setField(cert.title, 'certificateTitle', 'certTitle');
            this.setField(cert.issuer, 'certificateIssuer', 'certIssuer');
            this.setField(cert.date || cert.issueDate || '', 'certificateDate', 'certDate');
            this.setField(cert.imageUrl, 'certificateImageUrl', 'certImage');
            if (typeof cert.order === 'number') this.setField(cert.order, 'certOrder');
            this.updateImagePreview(cert.imageUrl || '');

            this.clearFormMessage();
            this.openModal();
        } catch (error) {
            console.error('Failed loading certificate:', error);
            AdminUI.notify('error', 'Failed to load certificate.');
        }
    }

    async handleSubmit(event) {
        event.preventDefault();
        this.clearFormMessage();

        const title = (this.getField('certificateTitle', 'certTitle')?.value || '').trim();
        const issuer = (this.getField('certificateIssuer', 'certIssuer')?.value || '').trim();
        const date = (this.getField('certificateDate', 'certDate')?.value || '').trim();
        const imageRaw = (this.getField('certificateImageUrl', 'certImage')?.value || '').trim();
        const orderValue = Number(this.getField('certOrder')?.value || '');
        const imageUrl = this.normalizeCertificateImagePath(imageRaw);

        if (!title || !issuer || !imageUrl) {
            this.showFormMessage('error', 'Title, issuer, and image path are required.');
            return;
        }

        this.setSaving(true);

        const certData = {
            title,
            issuer,
            date: date || null,
            issueDate: date || null,
            imageUrl,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        try {
            if (this.currentCertId) {
                if (Number.isFinite(orderValue) && orderValue > 0) {
                    certData.order = orderValue;
                }
                await db.collection(COLLECTIONS.CERTIFICATES).doc(this.currentCertId).update(certData);
                this.showFormMessage('success', 'Certificate updated successfully.');
                AdminUI.notify('success', 'Certificate updated.');
            } else {
                if (Number.isFinite(orderValue) && orderValue > 0) {
                    certData.order = orderValue;
                } else {
                    const snapshot = await db.collection(COLLECTIONS.CERTIFICATES).get();
                    certData.order = snapshot.size + 1;
                }
                certData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
                await db.collection(COLLECTIONS.CERTIFICATES).add(certData);
                this.showFormMessage('success', 'Certificate added successfully.');
                AdminUI.notify('success', 'Certificate created.');
            }

            window.setTimeout(() => this.closeModal(), 250);
        } catch (error) {
            console.error('Failed saving certificate:', error);
            this.showFormMessage('error', 'Failed to save certificate. Please try again.');
        } finally {
            this.setSaving(false);
        }
    }

    async deleteCertificate(certId, certTitle) {
        const confirmed = window.confirm(`Delete "${certTitle}"? This action cannot be undone.`);
        if (!confirmed) return;

        try {
            await db.collection(COLLECTIONS.CERTIFICATES).doc(certId).delete();
            AdminUI.notify('success', 'Certificate deleted.');
        } catch (error) {
            console.error('Failed deleting certificate:', error);
            AdminUI.notify('error', 'Failed to delete certificate.');
        }
    }
}

function bootstrapAdmin() {
    if (typeof firebase === 'undefined' || typeof db === 'undefined' || typeof COLLECTIONS === 'undefined') {
        window.setTimeout(bootstrapAdmin, 250);
        return;
    }

    const authManager = new AdminAuth();
    authManager.init();

    const tabs = new AdminTabs();
    tabs.init();

    const projectsAdmin = new ProjectsAdmin();
    projectsAdmin.init();

    const certificatesAdmin = new CertificatesAdmin();
    certificatesAdmin.init();

    const siteConfig = new SiteConfigManager();
    siteConfig.init();

    const analytics = new AnalyticsManager();
    analytics.init();
}

document.addEventListener('DOMContentLoaded', () => {
    bootstrapAdmin();
});
/* ══════════════════════════════════════════════════
   SITE CONFIG MANAGER
══════════════════════════════════════════════════ */
class SiteConfigManager {
    constructor() {
        // Open to Work
        this.otwToggle   = document.getElementById('otwToggle');
        this.otwStatusSelect = document.getElementById('otwStatusSelect');
        this.otwMessage  = document.getElementById('otwMessage');
        this.saveOtwBtn  = document.getElementById('saveOtwBtn');
        this.otwStatus   = document.getElementById('otwStatus');

        // Hero Metrics
        this.metricInputs = [
            { valueEl: document.getElementById('metric1Value'), labelEl: document.getElementById('metric1Label') }
        ];
        this.saveMetricsBtn = document.getElementById('saveMetricsBtn');
        this.metricsStatus  = document.getElementById('metricsStatus');
        this.metricDefaults = [
            { value: '4th', label: 'Semester' }
        ];

        // Visitor stats
        this.totalVisitors    = document.getElementById('totalVisitors');
        this.resetVisitorsBtn = document.getElementById('resetVisitorsBtn');
    }

    getCacheKey(docId) {
        return `sp-config-${docId}`;
    }

    normalizeAvailabilityStatus(rawStatus, enabled = true) {
        const value = String(rawStatus || '').trim().toLowerCase();
        if (value === 'open') {
            return 'available';
        }
        if (value === 'available' || value === 'working' || value === 'closed') {
            return value;
        }
        return enabled ? 'available' : 'closed';
    }

    readCache(docId) {
        try {
            const raw = localStorage.getItem(this.getCacheKey(docId));
            return raw ? JSON.parse(raw) : null;
        } catch (_) {
            return null;
        }
    }

    writeCache(docId, data) {
        try {
            localStorage.setItem(this.getCacheKey(docId), JSON.stringify(data || {}));
        } catch (_) {
            // Ignore storage failures.
        }
    }

    normalizeHeroMetrics(rawMetrics) {
        const source = Array.isArray(rawMetrics) ? rawMetrics : [];
        return this.metricDefaults.map((fallback, index) => {
            const entry = source[index] || {};
            const value = String(entry.value ?? '').trim();
            const label = String(entry.label ?? '').trim();
            return {
                value: value || fallback.value || '',
                label: label || fallback.label || ''
            };
        });
    }

    applyHeroMetricsToInputs(rawMetrics) {
        if (!this.metricInputs?.length) return;
        const normalized = this.normalizeHeroMetrics(rawMetrics);
        normalized.forEach((metric, index) => {
            const input = this.metricInputs[index];
            if (!input) return;
            if (input.valueEl && !input.valueEl.disabled) {
                input.valueEl.value = metric.value;
            }
            if (input.labelEl) {
                input.labelEl.value = metric.label;
            }
        });
    }

    collectHeroMetricsFromInputs() {
        if (!this.metricInputs?.length) return this.normalizeHeroMetrics([]);
        return this.metricInputs.map((input, index) => {
            const fallback = this.metricDefaults[index] || { value: '', label: '' };
            const value = input.valueEl && !input.valueEl.disabled
                ? String(input.valueEl.value || '').trim()
                : '';
            const label = input.labelEl ? String(input.labelEl.value || '').trim() : '';
            return {
                value: value || fallback.value || '',
                label: label || fallback.label || ''
            };
        });
    }

    init() {
        if (!this.otwToggle) return;
        // Bind new WIB fields
        this.wibActive  = document.getElementById('wibActive');
        this.wibTitle   = document.getElementById('wibTitle');
        this.wibDesc    = document.getElementById('wibDesc');
        this.wibLink    = document.getElementById('wibLink');
        this.saveWibBtn = document.getElementById('saveWibBtn');
        this.wibStatus  = document.getElementById('wibStatus');

        this.loadSiteConfig();
        this.loadCurrentlyBuilding();
        this.loadVisitorStats();

        this.saveOtwBtn?.addEventListener('click', () => this.saveAvailability());
        this.saveMetricsBtn?.addEventListener('click', () => this.saveHeroMetrics());
        this.saveWibBtn?.addEventListener('click', () => this.saveCurrentlyBuilding());
        this.resetVisitorsBtn?.addEventListener('click', () => this.resetVisitors());
    }

    async loadSiteConfig() {
        const cached = this.readCache('siteConfig');
        this.applyHeroMetricsToInputs(cached?.heroMetrics);
        if (cached) {
            const enabled = !!cached.openToWork;
            if (this.otwToggle) this.otwToggle.checked = enabled;
            if (this.otwStatusSelect) {
                this.otwStatusSelect.value = this.normalizeAvailabilityStatus(cached.availabilityStatus, enabled);
            }
            if (this.otwMessage) this.otwMessage.value = cached.otwMessage || '';
        }
        try {
            const doc = await db.collection(COLLECTIONS.CONFIG).doc('siteConfig').get();
            const data = doc.exists ? doc.data() : {};
            const enabled = !!data.openToWork;
            if (this.otwToggle) this.otwToggle.checked = enabled;
            if (this.otwStatusSelect) {
                this.otwStatusSelect.value = this.normalizeAvailabilityStatus(data.availabilityStatus, enabled);
            }
            if (this.otwMessage) this.otwMessage.value = data.otwMessage || '';
            const heroMetrics = Array.isArray(data.heroMetrics)
                ? data.heroMetrics
                : (cached?.heroMetrics || []);
            this.applyHeroMetricsToInputs(heroMetrics);
            this.writeCache('siteConfig', {
                openToWork: enabled,
                availabilityStatus: this.normalizeAvailabilityStatus(data.availabilityStatus, enabled),
                otwMessage: data.otwMessage || '',
                heroMetrics: this.normalizeHeroMetrics(heroMetrics)
            });
        } catch (e) { console.error('loadSiteConfig:', e); }
    }

    loadVisitorStats() {
        db.collection(COLLECTIONS.CONFIG).doc('siteStats')
            .onSnapshot((doc) => {
                const count = doc.exists ? (doc.data()?.visitors || 0) : 0;
                if (this.totalVisitors) this.totalVisitors.textContent = count.toLocaleString();
            });
    }

    async saveAvailability() {
        if (!this.saveOtwBtn) return;
        this.saveOtwBtn.disabled = true;
        this.saveOtwBtn.textContent = 'SAVING...';
        try {
            const enabled = !!this.otwToggle?.checked;
            const availabilityStatus = this.normalizeAvailabilityStatus(this.otwStatusSelect?.value, enabled);
            const clientData = {
                openToWork: enabled,
                availabilityStatus,
                otwMessage: this.otwMessage?.value?.trim() || ''
            };
            const existing = this.readCache('siteConfig') || {};
            await db.collection(COLLECTIONS.CONFIG).doc('siteConfig').set({
                ...clientData,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
            this.writeCache('siteConfig', { ...existing, ...clientData });
            this.setStatus(this.otwStatus, 'success', 'Saved!');
        } catch (e) {
            this.setStatus(this.otwStatus, 'error', 'Save failed.');
        } finally {
            this.saveOtwBtn.disabled = false;
            this.saveOtwBtn.textContent = 'SAVE AVAILABILITY';
        }
    }

    async saveHeroMetrics() {
        if (!this.saveMetricsBtn) return;
        this.saveMetricsBtn.disabled = true;
        this.saveMetricsBtn.textContent = 'SAVING...';
        const heroMetrics = this.collectHeroMetricsFromInputs();
        const clientData = { heroMetrics };
        const existing = this.readCache('siteConfig') || {};

        // Optimistic UI: cache + re-enable immediately for snappy feel.
        this.writeCache('siteConfig', { ...existing, ...clientData });
        this.setStatus(this.metricsStatus, 'success', 'Saved locally. Syncing...');
        this.saveMetricsBtn.disabled = false;
        this.saveMetricsBtn.textContent = 'SAVE METRIC';

        try {
            await db.collection(COLLECTIONS.CONFIG).doc('siteConfig').set({
                ...clientData,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
            this.setStatus(this.metricsStatus, 'success', 'Saved!');
        } catch (e) {
            this.setStatus(this.metricsStatus, 'error', 'Sync failed. Try again.');
        }
    }

    async resetVisitors() {
        if (!confirm('Reset visitor counter to 0?')) return;
        try {
            await db.collection(COLLECTIONS.CONFIG).doc('siteStats').set(
                { visitors: 0 }, { merge: true }
            );
        } catch (e) { console.error('resetVisitors:', e); }
    }

    async loadCurrentlyBuilding() {
        const cached = this.readCache('currentlyBuilding');
        if (cached) {
            if (this.wibActive) this.wibActive.checked = !!cached.active;
            if (this.wibTitle) this.wibTitle.value = cached.title || '';
            if (this.wibDesc) this.wibDesc.value = cached.desc || '';
            if (this.wibLink) this.wibLink.value = cached.link || '';
        }
        try {
            const doc = await db.collection(COLLECTIONS.CONFIG).doc('currentlyBuilding').get();
            const data = doc.exists ? doc.data() : {};
            if (this.wibActive) this.wibActive.checked = !!data.active;
            if (this.wibTitle)  this.wibTitle.value    = data.title || '';
            if (this.wibDesc)   this.wibDesc.value     = data.desc  || '';
            if (this.wibLink)   this.wibLink.value     = data.link  || '';
            this.writeCache('currentlyBuilding', {
                active: !!data.active,
                title: data.title || '',
                desc: data.desc || '',
                link: data.link || ''
            });
        } catch (e) { console.error('loadCurrentlyBuilding:', e); }
    }

    async saveCurrentlyBuilding() {
        if (!this.saveWibBtn) return;
        this.saveWibBtn.disabled = true;
        this.saveWibBtn.textContent = 'SAVING...';
        try {
            const clientData = {
                active: !!this.wibActive?.checked,
                title:  this.wibTitle?.value?.trim()  || '',
                desc:   this.wibDesc?.value?.trim()   || '',
                link:   this.wibLink?.value?.trim()   || ''
            };
            await db.collection(COLLECTIONS.CONFIG).doc('currentlyBuilding').set({
                ...clientData,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            this.writeCache('currentlyBuilding', clientData);
            this.setStatus(this.wibStatus, 'success', 'Saved!');
        } catch (e) {
            this.setStatus(this.wibStatus, 'error', 'Save failed.');
        } finally {
            this.saveWibBtn.disabled = false;
            this.saveWibBtn.textContent = 'SAVE STATUS';
        }
    }

    setStatus(el, type, msg) {
        if (!el) return;
        el.textContent = msg;
        el.style.color = type === 'success' ? '#4ff7a0' : '#f74f8e';
        setTimeout(() => { el.textContent = ''; }, 3000);
    }
}

/* ══════════════════════════════════════════════════
   PAGE ANALYTICS MANAGER
══════════════════════════════════════════════════ */
class AnalyticsManager {
    constructor() {
        this.grid        = document.getElementById('analyticsGrid');
        this.totalEl     = document.getElementById('analyticsTotalViews');
        this.refreshBtn  = document.getElementById('refreshAnalyticsBtn');
        this.pageIcons   = {
            index:    '🏠', resume:  '📄',
            work:     '💼', contact: '✉️'
        };
        this.pageColors  = {
            index:    '#4f8ef7', resume:  '#a78bfa',
            work:     '#00f5ff', contact: '#f74f8e'
        };
    }

    init() {
        if (!this.grid) return;
        this.load();
        this.refreshBtn?.addEventListener('click', () => this.load());
    }

    load() {
        if (this.grid) {
            this.grid.innerHTML = '<div class="analytics-loading"><div class="loading-spinner"></div><p>Loading...</p></div>';
        }

        db.collection(COLLECTIONS.CONFIG).doc('pageAnalytics')
            .get()
            .then((doc) => {
                const data = doc.exists ? doc.data() : {};
                this.render(data);
            })
            .catch(() => {
                if (this.grid) this.grid.innerHTML = '<p class="analytics-error">Failed to load analytics.</p>';
            });
    }

    render(data) {
        const workViews = Number(data.work || 0) + Number(data.projects || 0);
        const counts  = [
            { key: 'index', name: 'Home', count: Number(data.index || 0) },
            { key: 'resume', name: 'Resume', count: Number(data.resume || 0) },
            { key: 'work', name: 'Work', count: workViews },
            { key: 'contact', name: 'Contact', count: Number(data.contact || 0) }
        ];
        const maxView = Math.max(...counts.map(p => p.count), 1);
        const total   = counts.reduce((a, c) => a + c.count, 0);

        if (this.totalEl) {
            this.totalEl.textContent = total.toLocaleString();
        }

        this.grid.innerHTML = counts.map(({ key, name, count }) => {
            const pct   = Math.round((count / maxView) * 100);
            const color = this.pageColors[key] || '#4f8ef7';
            const icon  = this.pageIcons[key]  || '📄';
            const share = total > 0 ? Math.round((count / total) * 100) : 0;

            return `
                <div class="analytics-card">
                    <div class="analytics-card-header">
                        <span class="analytics-page-icon">${icon}</span>
                        <span class="analytics-page-name">${name}</span>
                        <span class="analytics-share">${share}%</span>
                    </div>
                    <div class="analytics-count">${count.toLocaleString()}</div>
                    <div class="analytics-bar-wrap">
                        <div class="analytics-bar" style="--bar-w:${pct}%;--bar-color:${color}"></div>
                    </div>
                    <span class="analytics-views-label">views</span>
                </div>
            `;
        }).join('');

        // Animate bars
        requestAnimationFrame(() => {
            this.grid.querySelectorAll('.analytics-bar').forEach((el, i) => {
                setTimeout(() => el.classList.add('analytics-bar-animate'), i * 100);
            });
        });
    }
}
