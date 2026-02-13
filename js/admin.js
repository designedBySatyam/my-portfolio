/**
 * ============================================
 * ADMIN PANEL JAVASCRIPT
 * ============================================
 */

// Authentication Manager
class AuthManager {
    constructor() {
        this.loginScreen = document.getElementById('loginScreen');
        this.adminDashboard = document.getElementById('adminDashboard');
        this.loginForm = document.getElementById('loginForm');
        this.logoutBtn = document.getElementById('logoutBtn');
        this.authError = document.getElementById('authError');
        
        this.init();
    }

    init() {
        // Check authentication state
        auth.onAuthStateChanged((user) => {
            if (user) {
                this.showDashboard();
            } else {
                this.showLogin();
            }
        });

        // Login form handler
        this.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        
        // Logout handler
        this.logoutBtn.addEventListener('click', () => this.handleLogout());
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            await auth.signInWithEmailAndPassword(email, password);
            this.authError.textContent = '';
        } catch (error) {
            this.showError(this.getErrorMessage(error.code));
        }
    }

    async handleLogout() {
        try {
            await auth.signOut();
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    showLogin() {
        this.loginScreen.style.display = 'flex';
        this.adminDashboard.style.display = 'none';
    }

    showDashboard() {
        this.loginScreen.style.display = 'none';
        this.adminDashboard.style.display = 'block';
    }

    showError(message) {
        this.authError.textContent = message;
        this.authError.style.display = 'block';
    }

    getErrorMessage(code) {
        const messages = {
            'auth/invalid-email': 'Invalid email address',
            'auth/user-disabled': 'This account has been disabled',
            'auth/user-not-found': 'No account found with this email',
            'auth/wrong-password': 'Incorrect password',
            'auth/invalid-credential': 'Invalid email or password'
        };
        return messages[code] || 'Authentication failed. Please try again.';
    }
}

// Projects Manager
class ProjectsManager {
    constructor() {
        this.projectsList = document.getElementById('projectsList');
        this.addBtn = document.getElementById('addProjectBtn');
        this.modal = document.getElementById('projectModal');
        this.deleteModal = document.getElementById('deleteModal');
        this.form = document.getElementById('projectForm');
        this.currentProjectId = null;
        this.projectToDelete = null;
        
        this.init();
    }

    init() {
        // Load projects
        this.loadProjects();

        // Event listeners
        this.addBtn.addEventListener('click', () => this.openAddModal());
        document.getElementById('closeModal').addEventListener('click', () => this.closeModal());
        document.getElementById('cancelBtn').addEventListener('click', () => this.closeModal());
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));

        // Delete modal listeners
        document.getElementById('cancelDelete').addEventListener('click', () => this.closeDeleteModal());
        document.getElementById('confirmDelete').addEventListener('click', () => this.deleteProject());

        // Close modal on outside click
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.closeModal();
        });
        this.deleteModal.addEventListener('click', (e) => {
            if (e.target === this.deleteModal) this.closeDeleteModal();
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
                this.showError('Failed to load projects');
            });
    }

    renderProjects(projects) {
        if (projects.length === 0) {
            this.projectsList.innerHTML = `
                <div class="empty-state">
                    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2"/>
                        <line x1="12" y1="8" x2="12" y2="16"/>
                        <line x1="8" y1="12" x2="16" y2="12"/>
                    </svg>
                    <h3>No Projects Yet</h3>
                    <p>Click "Add Project" to create your first project</p>
                </div>
            `;
            return;
        }

        this.projectsList.innerHTML = projects.map(project => `
            <div class="project-item" data-id="${project.id}">
                <div class="project-info">
                    <div class="project-header">
                        <h3>${this.escapeHtml(project.title)}</h3>
                        <span class="project-order">#${project.order}</span>
                    </div>
                    <p class="project-desc">${this.escapeHtml(project.description)}</p>
                    <div class="project-meta">
                        <span class="meta-badge category">${project.category}</span>
                        <span class="meta-badge status status-${project.status.toLowerCase()}">${project.status}</span>
                        <div class="project-tech">
                            ${project.technologies.slice(0, 3).map(tech => 
                                `<span class="tech-tag">${this.escapeHtml(tech)}</span>`
                            ).join('')}
                            ${project.technologies.length > 3 ? 
                                `<span class="tech-more">+${project.technologies.length - 3}</span>` : 
                                ''}
                        </div>
                    </div>
                </div>
                <div class="project-actions">
                    <button class="action-btn edit-btn" onclick="projectsManager.openEditModal('${project.id}')">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                        Edit
                    </button>
                    <button class="action-btn delete-btn" onclick="projectsManager.openDeleteModal('${project.id}')">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            <line x1="10" y1="11" x2="10" y2="17"/>
                            <line x1="14" y1="11" x2="14" y2="17"/>
                        </svg>
                        Delete
                    </button>
                </div>
            </div>
        `).join('');
    }

    openAddModal() {
        this.currentProjectId = null;
        document.getElementById('modalTitle').textContent = 'ADD NEW PROJECT';
        this.form.reset();
        this.modal.style.display = 'flex';
    }

    async openEditModal(projectId) {
        try {
            const doc = await db.collection(COLLECTIONS.PROJECTS).doc(projectId).get();
            if (!doc.exists) {
                this.showMessage('Project not found', 'error');
                return;
            }

            const project = doc.data();
            this.currentProjectId = projectId;

            document.getElementById('modalTitle').textContent = 'EDIT PROJECT';
            document.getElementById('projectTitle').value = project.title;
            document.getElementById('projectDescription').value = project.description;
            document.getElementById('projectCategory').value = project.category;
            document.getElementById('projectIcon').value = project.icon || 'default';
            document.getElementById('projectTech').value = project.technologies.join(', ');
            document.getElementById('projectStatus').value = project.status;
            document.getElementById('projectLink').value = project.link || '';
            document.getElementById('projectOrder').value = project.order;

            this.modal.style.display = 'flex';
        } catch (error) {
            console.error('Error loading project:', error);
            this.showMessage('Failed to load project', 'error');
        }
    }

    closeModal() {
        this.modal.style.display = 'none';
        this.form.reset();
        this.currentProjectId = null;
        this.hideMessage();
    }

    async handleSubmit(e) {
        e.preventDefault();

        const projectData = {
            title: document.getElementById('projectTitle').value.trim(),
            description: document.getElementById('projectDescription').value.trim(),
            category: document.getElementById('projectCategory').value,
            icon: document.getElementById('projectIcon').value,
            technologies: document.getElementById('projectTech').value
                .split(',')
                .map(tech => tech.trim())
                .filter(tech => tech !== ''),
            status: document.getElementById('projectStatus').value,
            link: document.getElementById('projectLink').value.trim() || null,
            order: parseInt(document.getElementById('projectOrder').value),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        try {
            const saveBtn = document.getElementById('saveBtn');
            saveBtn.disabled = true;
            saveBtn.querySelector('span').textContent = 'SAVING...';

            if (this.currentProjectId) {
                // Update existing project
                await db.collection(COLLECTIONS.PROJECTS)
                    .doc(this.currentProjectId)
                    .update(projectData);
                this.showMessage('Project updated successfully!', 'success');
            } else {
                // Create new project
                projectData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
                await db.collection(COLLECTIONS.PROJECTS).add(projectData);
                this.showMessage('Project added successfully!', 'success');
            }

            setTimeout(() => {
                this.closeModal();
            }, 1500);
        } catch (error) {
            console.error('Error saving project:', error);
            this.showMessage('Failed to save project. Please try again.', 'error');
        } finally {
            const saveBtn = document.getElementById('saveBtn');
            saveBtn.disabled = false;
            saveBtn.querySelector('span').textContent = 'SAVE PROJECT';
        }
    }

    openDeleteModal(projectId) {
        this.projectToDelete = projectId;
        this.deleteModal.style.display = 'flex';
    }

    closeDeleteModal() {
        this.deleteModal.style.display = 'none';
        this.projectToDelete = null;
    }

    async deleteProject() {
        if (!this.projectToDelete) return;

        try {
            await db.collection(COLLECTIONS.PROJECTS).doc(this.projectToDelete).delete();
            this.closeDeleteModal();
            this.showMessage('Project deleted successfully!', 'success');
        } catch (error) {
            console.error('Error deleting project:', error);
            this.showMessage('Failed to delete project', 'error');
        }
    }

    showMessage(message, type) {
        const messageDiv = document.getElementById('formMessage');
        messageDiv.textContent = message;
        messageDiv.className = `form-message ${type}`;
        messageDiv.style.display = 'block';
    }

    hideMessage() {
        const messageDiv = document.getElementById('formMessage');
        messageDiv.style.display = 'none';
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize on DOM load
let authManager, projectsManager;

document.addEventListener('DOMContentLoaded', () => {
    // Wait for Firebase to initialize
    setTimeout(() => {
        if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
            authManager = new AuthManager();
            projectsManager = new ProjectsManager();
        } else {
            alert('Firebase is not properly configured. Please check firebase-config.js');
        }
    }, 500);
});
