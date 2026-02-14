/**
 * ============================================
 * ADMIN PANEL FOR PROJECTS-CERTIFICATES PAGE
 * Matches projects-certificates.html structure
 * ============================================
 */

// Admin Authentication Manager
class AdminAuth {
    constructor() {
        // Elements from projects-certificates.html
        this.adminModal = document.getElementById('adminModal');
        this.adminLoginBtn = document.getElementById('adminLoginBtn');
        this.closeAdminModal = document.getElementById('closeAdminModal');
        this.adminLoginForm = document.getElementById('adminLoginForm');
        this.adminPanel = document.getElementById('adminPanel');
        this.loginForm = document.getElementById('loginForm');
        this.adminEmail = document.getElementById('adminEmail');
        this.adminPassword = document.getElementById('adminPassword');
        this.adminError = document.getElementById('adminError');
        this.adminUserEmail = document.getElementById('adminUserEmail');
        this.adminLogoutBtn = document.getElementById('adminLogoutBtn');
        
        if (!this.adminLoginBtn || !this.adminModal || !this.loginForm) {
            console.error('❌ Admin: Required elements not found');
            return;
        }
        
        this.init();
    }

    init() {
        // Auth state listener
        auth.onAuthStateChanged((user) => {
            if (user) {
                this.showAdminPanel(user);
            } else {
                this.showLoginForm();
            }
        });

        // Open admin modal
        this.adminLoginBtn.addEventListener('click', () => {
            this.adminModal.style.display = 'flex';
        });

        // Close admin modal
        if (this.closeAdminModal) {
            this.closeAdminModal.addEventListener('click', () => {
                this.adminModal.style.display = 'none';
            });
        }

        // Close modal when clicking outside
        this.adminModal.addEventListener('click', (e) => {
            if (e.target === this.adminModal) {
                this.adminModal.style.display = 'none';
            }
        });

        // Login form submission
        this.loginForm.addEventListener('submit', (e) => this.handleLogin(e));

        // Logout button
        if (this.adminLogoutBtn) {
            this.adminLogoutBtn.addEventListener('click', () => this.handleLogout());
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        
        if (!this.adminEmail || !this.adminPassword) return;
        
        const email = this.adminEmail.value.trim();
        const password = this.adminPassword.value.trim();

        try {
            this.showError('');
            await auth.signInWithEmailAndPassword(email, password);
        } catch (error) {
            console.error('Login error:', error);
            this.showError(this.getErrorMessage(error.code));
        }
    }

    async handleLogout() {
        try {
            await auth.signOut();
            this.adminModal.style.display = 'none';
        } catch (error) {
            console.error('Logout error:', error);
            alert('Failed to logout. Please try again.');
        }
    }

    showLoginForm() {
        if (this.adminLoginForm) this.adminLoginForm.style.display = 'block';
        if (this.adminPanel) this.adminPanel.style.display = 'none';
    }

    showAdminPanel(user) {
        if (this.adminLoginForm) this.adminLoginForm.style.display = 'none';
        if (this.adminPanel) this.adminPanel.style.display = 'block';
        if (this.adminUserEmail) this.adminUserEmail.textContent = user.email;
        
        // Clear login form
        if (this.adminEmail) this.adminEmail.value = '';
        if (this.adminPassword) this.adminPassword.value = '';
        this.showError('');
    }

    showError(message) {
        if (this.adminError) {
            this.adminError.textContent = message;
            this.adminError.style.display = message ? 'block' : 'none';
            if (message) {
                this.adminError.classList.add('active');
            } else {
                this.adminError.classList.remove('active');
            }
        }
    }

    getErrorMessage(code) {
        const messages = {
            'auth/invalid-email': 'Invalid email address',
            'auth/user-disabled': 'This account has been disabled',
            'auth/user-not-found': 'No account found with this email',
            'auth/wrong-password': 'Incorrect password',
            'auth/invalid-credential': 'Invalid email or password',
            'auth/too-many-requests': 'Too many failed attempts. Please try again later.'
        };
        return messages[code] || 'Authentication failed. Please try again.';
    }
}

// Admin Tab Manager
class AdminTabs {
    constructor() {
        this.tabs = document.querySelectorAll('.admin-tab');
        this.tabContents = document.querySelectorAll('.admin-tab-content');
        this.init();
    }

    init() {
        this.tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetTab = tab.dataset.tab;
                this.switchTab(targetTab);
            });
        });
    }

    switchTab(tabName) {
        // Update tab buttons
        this.tabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });

        // Update tab content
        this.tabContents.forEach(content => {
            content.classList.toggle('active', content.id === `${tabName}Tab`);
        });
    }
}

// Projects Admin Manager
class ProjectsAdmin {
    constructor() {
        // Using the admin-list inside projectsTab
        this.projectsList = document.querySelector('#projectsTab .admin-list');
        this.addBtn = document.getElementById('addProjectBtn');
        this.modal = document.getElementById('editProjectModal');
        this.form = document.getElementById('projectForm');
        this.closeBtn = document.getElementById('closeProjectModal');
        this.cancelBtn = document.getElementById('cancelProjectBtn');
        this.modalTitle = document.getElementById('projectModalTitle');
        this.currentProjectId = null;
        
        if (!this.projectsList || !this.addBtn || !this.modal || !this.form) {
            console.error('❌ Projects Admin: Required elements not found');
            console.log('projectsList:', this.projectsList);
            console.log('addBtn:', this.addBtn);
            console.log('modal:', this.modal);
            console.log('form:', this.form);
            return;
        }
        
        this.init();
    }

    init() {
        this.loadProjects();
        
        this.addBtn.addEventListener('click', () => this.openAddModal());
        
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.closeModal());
        }
        
        if (this.cancelBtn) {
            this.cancelBtn.addEventListener('click', () => this.closeModal());
        }
        
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.closeModal();
        });
    }

    loadProjects() {
        db.collection(COLLECTIONS.PROJECTS)
            .orderBy('order', 'asc')
            .onSnapshot((snapshot) => {
                const projects = [];
                snapshot.forEach((doc) => {
                    projects.push({ id: doc.id, ...doc.data() });
                });
                this.renderProjects(projects);
            }, (error) => {
                console.error('Error loading projects:', error);
                this.showError();
            });
    }

    renderProjects(projects) {
        if (!this.projectsList) return;
        
        if (projects.length === 0) {
            this.projectsList.innerHTML = `
                <div class="admin-empty-state">
                    <p>No projects yet. Click "Add Project" to create one.</p>
                </div>
            `;
            return;
        }

        this.projectsList.innerHTML = projects.map(project => `
            <div class="admin-item" data-project-id="${project.id}">
                <div class="admin-item-info">
                    <h4>${this.escapeHtml(project.title)}</h4>
                    <p>${this.escapeHtml(project.description)}</p>
                    <div class="admin-item-meta">
                        <span class="meta-tag">${project.status}</span>
                        <span class="meta-tag">${project.technologies.slice(0, 2).join(', ')}</span>
                    </div>
                </div>
                <div class="admin-item-actions">
                    <button class="edit-item-btn" data-action="edit" data-id="${project.id}">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                    </button>
                    <button class="delete-item-btn" data-action="delete" data-id="${project.id}" data-title="${this.escapeHtml(project.title)}">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                    </button>
                </div>
            </div>
        `).join('');
        
        // Add event listeners
        this.attachButtonListeners();
    }

    attachButtonListeners() {
        // Edit buttons
        document.querySelectorAll('#projectsTab .edit-item-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const projectId = btn.dataset.id;
                this.openEditModal(projectId);
            });
        });

        // Delete buttons
        document.querySelectorAll('#projectsTab .delete-item-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const projectId = btn.dataset.id;
                const projectTitle = btn.dataset.title;
                this.deleteProject(projectId, projectTitle);
            });
        });
    }

    openAddModal() {
        this.currentProjectId = null;
        if (this.modalTitle) this.modalTitle.textContent = 'Add New Project';
        this.form.reset();
        this.modal.style.display = 'flex';
        this.modal.classList.add('active');
    }

    async openEditModal(projectId) {
        try {
            const doc = await db.collection(COLLECTIONS.PROJECTS).doc(projectId).get();
            if (!doc.exists) {
                alert('Project not found');
                return;
            }

            const project = doc.data();
            this.currentProjectId = projectId;

            if (this.modalTitle) this.modalTitle.textContent = 'Edit Project';
            
            // Set form values - using IDs from projects-certificates.html
            const setVal = (id, val) => {
                const el = document.getElementById(id);
                if (el) el.value = val || '';
            };
            
            setVal('projectTitle', project.title);
            setVal('projectDescription', project.description);
            setVal('projectStatus', project.status);
            setVal('projectTechnologies', project.technologies.join(', '));
            setVal('projectLink', project.link);
            setVal('projectIcon', project.icon);

            this.modal.style.display = 'flex';
            this.modal.classList.add('active');
        } catch (error) {
            console.error('Error loading project:', error);
            alert('Failed to load project');
        }
    }

    closeModal() {
        this.modal.style.display = 'none';
        this.modal.classList.remove('active');
        this.form.reset();
        this.currentProjectId = null;
    }

    async handleSubmit(e) {
        e.preventDefault();

        const getVal = (id) => {
            const el = document.getElementById(id);
            return el ? el.value.trim() : '';
        };

        const projectData = {
            title: getVal('projectTitle'),
            description: getVal('projectDescription'),
            status: getVal('projectStatus'),
            technologies: getVal('projectTechnologies')
                .split(',')
                .map(tech => tech.trim())
                .filter(tech => tech.length > 0),
            link: getVal('projectLink') || null,
            icon: getVal('projectIcon') || 'default',
            category: 'general',
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        // Set order for new projects only
        if (!this.currentProjectId) {
            const snapshot = await db.collection(COLLECTIONS.PROJECTS).get();
            projectData.order = snapshot.size + 1;
        }

        try {
            if (this.currentProjectId) {
                await db.collection(COLLECTIONS.PROJECTS).doc(this.currentProjectId).update(projectData);
                console.log('✅ Project updated');
            } else {
                projectData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
                await db.collection(COLLECTIONS.PROJECTS).add(projectData);
                console.log('✅ Project added');
            }

            this.closeModal();
        } catch (error) {
            console.error('Error saving project:', error);
            alert('Failed to save project. Please try again.');
        }
    }

    async deleteProject(projectId, projectTitle) {
        if (!confirm(`Are you sure you want to delete "${projectTitle}"?\n\nThis action cannot be undone.`)) {
            return;
        }

        try {
            await db.collection(COLLECTIONS.PROJECTS).doc(projectId).delete();
            console.log('✅ Project deleted');
        } catch (error) {
            console.error('Error deleting project:', error);
            alert('Failed to delete project');
        }
    }

    showError() {
        if (this.projectsList) {
            this.projectsList.innerHTML = `
                <div class="admin-error-state">
                    <p>Failed to load projects. Please refresh the page.</p>
                </div>
            `;
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Certificates Admin Manager
class CertificatesAdmin {
    constructor() {
        this.certsList = document.querySelector('#certificatesTab .admin-list');
        this.addBtn = document.getElementById('addCertificateBtn');
        this.modal = document.getElementById('editCertificateModal');
        this.form = document.getElementById('certificateForm');
        this.closeBtn = document.getElementById('closeCertificateModal');
        this.cancelBtn = document.getElementById('cancelCertificateBtn');
        this.modalTitle = document.getElementById('certificateModalTitle');
        this.currentCertId = null;
        
        if (!this.certsList || !this.addBtn || !this.modal || !this.form) {
            console.error('❌ Certificates Admin: Required elements not found');
            console.log('certsList:', this.certsList);
            console.log('addBtn:', this.addBtn);
            console.log('modal:', this.modal);
            console.log('form:', this.form);
            return;
        }
        
        this.init();
    }

    init() {
        this.loadCertificates();
        
        this.addBtn.addEventListener('click', () => this.openAddModal());
        
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.closeModal());
        }
        
        if (this.cancelBtn) {
            this.cancelBtn.addEventListener('click', () => this.closeModal());
        }
        
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.closeModal();
        });
    }

    loadCertificates() {
        db.collection(COLLECTIONS.CERTIFICATES)
            .orderBy('order', 'asc')
            .onSnapshot((snapshot) => {
                const certs = [];
                snapshot.forEach((doc) => {
                    certs.push({ id: doc.id, ...doc.data() });
                });
                this.renderCertificates(certs);
            }, (error) => {
                console.error('Error loading certificates:', error);
                this.showError();
            });
    }

    renderCertificates(certs) {
        if (!this.certsList) return;
        
        if (certs.length === 0) {
            this.certsList.innerHTML = `
                <div class="admin-empty-state">
                    <p>No certificates yet. Click "Add Certificate" to create one.</p>
                </div>
            `;
            return;
        }

        this.certsList.innerHTML = certs.map(cert => `
            <div class="admin-item" data-cert-id="${cert.id}">
                <div class="admin-item-info">
                    <h4 class="admin-item-title">${this.escapeHtml(cert.title)}</h4>
                    <p class="admin-item-meta">${this.escapeHtml(cert.issuer)}</p>
                    ${cert.date ? `<p class="admin-item-meta">${this.escapeHtml(cert.date)}</p>` : ''}
                </div>
                <div class="admin-item-actions">
                    <button class="edit-item-btn" data-action="edit" data-id="${cert.id}">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                    </button>
                    <button class="delete-item-btn" data-action="delete" data-id="${cert.id}" data-title="${this.escapeHtml(cert.title)}">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                    </button>
                </div>
            </div>
        `).join('');
        
        // Add event listeners
        this.attachButtonListeners();
    }

    attachButtonListeners() {
        // Edit buttons
        document.querySelectorAll('#certificatesTab .edit-item-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const certId = btn.dataset.id;
                this.openEditModal(certId);
            });
        });

        // Delete buttons
        document.querySelectorAll('#certificatesTab .delete-item-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const certId = btn.dataset.id;
                const certTitle = btn.dataset.title;
                this.deleteCertificate(certId, certTitle);
            });
        });
    }

    openAddModal() {
        this.currentCertId = null;
        if (this.modalTitle) this.modalTitle.textContent = 'Add New Certificate';
        this.form.reset();
        this.modal.style.display = 'flex';
        this.modal.classList.add('active');
    }

    async openEditModal(certId) {
        try {
            const doc = await db.collection(COLLECTIONS.CERTIFICATES).doc(certId).get();
            if (!doc.exists) {
                alert('Certificate not found');
                return;
            }

            const cert = doc.data();
            this.currentCertId = certId;

            if (this.modalTitle) this.modalTitle.textContent = 'Edit Certificate';
            
            const setVal = (id, val) => {
                const el = document.getElementById(id);
                if (el) el.value = val || '';
            };
            
            setVal('certificateTitle', cert.title);
            setVal('certificateIssuer', cert.issuer);
            setVal('certificateDate', cert.date);
            setVal('certificateImageUrl', cert.imageUrl);

            this.modal.style.display = 'flex';
            this.modal.classList.add('active');
        } catch (error) {
            console.error('Error loading certificate:', error);
            alert('Failed to load certificate');
        }
    }

    closeModal() {
        this.modal.style.display = 'none';
        this.modal.classList.remove('active');
        this.form.reset();
        this.currentCertId = null;
    }

    async handleSubmit(e) {
        e.preventDefault();

        const getVal = (id) => {
            const el = document.getElementById(id);
            return el ? el.value.trim() : '';
        };

        const certData = {
            title: getVal('certificateTitle'),
            issuer: getVal('certificateIssuer'),
            date: getVal('certificateDate') || null,
            imageUrl: getVal('certificateImageUrl'),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        // Set order for new certificates only
        if (!this.currentCertId) {
            const snapshot = await db.collection(COLLECTIONS.CERTIFICATES).get();
            certData.order = snapshot.size + 1;
        }

        try {
            if (this.currentCertId) {
                await db.collection(COLLECTIONS.CERTIFICATES).doc(this.currentCertId).update(certData);
                console.log('✅ Certificate updated');
            } else {
                certData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
                await db.collection(COLLECTIONS.CERTIFICATES).add(certData);
                console.log('✅ Certificate added');
            }

            this.closeModal();
        } catch (error) {
            console.error('Error saving certificate:', error);
            alert('Failed to save certificate. Please try again.');
        }
    }

    async deleteCertificate(certId, certTitle) {
        if (!confirm(`Are you sure you want to delete "${certTitle}"?\n\nThis action cannot be undone.`)) {
            return;
        }

        try {
            await db.collection(COLLECTIONS.CERTIFICATES).doc(certId).delete();
            console.log('✅ Certificate deleted');
        } catch (error) {
            console.error('Error deleting certificate:', error);
            alert('Failed to delete certificate');
        }
    }

    showError() {
        if (this.certsList) {
            this.certsList.innerHTML = `
                <div class="admin-error-state">
                    <p>Failed to load certificates. Please refresh the page.</p>
                </div>
            `;
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize admin functionality
let adminAuth, adminTabs, projectsAdmin, certificatesAdmin;

// Wait for Firebase to be ready
setTimeout(() => {
    if (typeof firebase === 'undefined' || firebase.apps.length === 0) {
        console.error('❌ Firebase not initialized');
        return;
    }
    
    if (typeof auth === 'undefined' || typeof db === 'undefined' || typeof COLLECTIONS === 'undefined') {
        console.error('❌ Firebase services not initialized');
        return;
    }
    
    console.log('✅ Initializing admin functionality...');
    
    try {
        adminAuth = new AdminAuth();
        adminTabs = new AdminTabs();
        projectsAdmin = new ProjectsAdmin();
        certificatesAdmin = new CertificatesAdmin();
        
        console.log('✅ Admin functionality initialized');
    } catch (error) {
        console.error('❌ Error initializing admin:', error);
    }
}, 1000);