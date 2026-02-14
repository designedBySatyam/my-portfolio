/**
 * ============================================
 * PROJECTS & CERTIFICATES COMBINED PAGE SCRIPT
 * ============================================
 */

// Toggle View Management
class ViewToggle {
    constructor() {
        this.projectsToggle = document.getElementById('projectsToggle');
        this.certificatesToggle = document.getElementById('certificatesToggle');
        this.toggleIndicator = document.getElementById('toggleIndicator');
        this.projectsSection = document.getElementById('projectsSection');
        this.certificatesSection = document.getElementById('certificatesSection');
        this.pageTitle = document.getElementById('titleText');
        this.pageSubtitle = document.getElementById('pageSubtitle');
        this.currentView = 'projects';
        this.init();
    }

    init() {
        this.projectsToggle.addEventListener('click', () => this.switchView('projects'));
        this.certificatesToggle.addEventListener('click', () => this.switchView('certificates'));
    }

    switchView(view) {
        if (this.currentView === view) return;

        this.currentView = view;

        // Update toggle buttons
        this.projectsToggle.classList.toggle('active', view === 'projects');
        this.certificatesToggle.classList.toggle('active', view === 'certificates');

        // Move indicator
        this.toggleIndicator.classList.toggle('certificates', view === 'certificates');

        // Switch sections
        this.projectsSection.classList.toggle('active', view === 'projects');
        this.certificatesSection.classList.toggle('active', view === 'certificates');

        // Update title and subtitle
        if (view === 'projects') {
            this.pageTitle.textContent = 'PROJECTS';
            this.pageSubtitle.textContent = 'Innovative solutions at the intersection of technology and creativity';
        } else {
            this.pageTitle.textContent = 'CERTIFICATES';
            this.pageSubtitle.textContent = 'Professional achievements and continuous learning journey';
        }
    }
}

// Firebase Projects Loader
class FirebaseProjects {
    constructor() {
        this.projectsContainer = document.getElementById('projectsGrid');
        this.loading = true;
        this.init();
    }

    init() {
        if (!db) {
            console.error('Firebase not initialized');
            this.showError();
            return;
        }

        this.showLoading();
        this.loadProjects();
    }

    showLoading() {
        if (this.projectsContainer) {
            this.projectsContainer.innerHTML = `
                <div class="loading-state">
                    <div class="loading-spinner"></div>
                    <p>Loading projects...</p>
                </div>
            `;
        }
    }

    showError() {
        if (this.projectsContainer) {
            this.projectsContainer.innerHTML = `
                <div class="error-state">
                    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    <p>Failed to load projects. Please check Firebase configuration.</p>
                </div>
            `;
        }
    }

    loadProjects() {
        db.collection(COLLECTIONS.PROJECTS)
            .orderBy('order', 'asc')
            .onSnapshot((snapshot) => {
                const projects = [];
                snapshot.forEach((doc) => {
                    projects.push({ id: doc.id, ...doc.data() });
                });

                if (projects.length === 0) {
                    this.showEmptyState();
                } else {
                    this.renderProjects(projects);
                }
                this.loading = false;
            }, (error) => {
                console.error('Error loading projects:', error);
                this.showError();
            });
    }

    showEmptyState() {
        if (this.projectsContainer) {
            this.projectsContainer.innerHTML = `
                <div class="empty-state">
                    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2"/>
                        <line x1="9" y1="9" x2="15" y2="15"/>
                        <line x1="15" y1="9" x2="9" y2="15"/>
                    </svg>
                    <h3>No Projects Yet</h3>
                    <p>Projects will appear here once added through the admin panel.</p>
                </div>
            `;
        }
    }

    renderProjects(projects) {
        if (!this.projectsContainer) return;

        this.projectsContainer.innerHTML = projects.map((project, index) => `
            <article class="project-card" data-category="${project.category || 'general'}" style="animation-delay: ${index * 0.1}s">
                <div class="card-corner corner-tl"></div>
                <div class="card-corner corner-tr"></div>
                <div class="card-corner corner-bl"></div>
                <div class="card-corner corner-br"></div>
                
                <div class="card-glow"></div>
                
                <div class="card-header">
                    <div class="icon-container">
                        ${this.getIconSVG(project.icon || 'default')}
                    </div>
                    <span class="card-number">${String(index + 1).padStart(2, '0')}</span>
                </div>

                <div class="card-content">
                    <h3 class="project-title">${this.escapeHtml(project.title)}</h3>
                    <p class="project-description">
                        ${this.escapeHtml(project.description)}
                    </p>
                    
                    <div class="tech-tags">
                        ${project.technologies.map(tech => `
                            <span class="tag">${this.escapeHtml(tech)}</span>
                        `).join('')}
                    </div>

                    ${project.link ? `
                        <a href="${project.link}" target="_blank" rel="noopener" class="project-link">
                            <span>View Project</span>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="7" y1="17" x2="17" y2="7"/>
                                <polyline points="7 7 17 7 17 17"/>
                            </svg>
                        </a>
                    ` : ''}
                </div>

                <div class="card-footer">
                    <span class="status-indicator ${project.status.toLowerCase()}">
                        <span class="status-dot"></span>
                        ${this.escapeHtml(project.status)}
                    </span>
                </div>
            </article>
        `).join('');

        // Observe cards for animation
        this.observeCards();
    }

    observeCards() {
        const cards = document.querySelectorAll('.project-card');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                }
            });
        }, {
            threshold: 0.2
        });

        cards.forEach(card => observer.observe(card));
    }

    getIconSVG(iconType) {
        const icons = {
            database: `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <ellipse cx="12" cy="5" rx="9" ry="3"/>
                <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
                <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
            </svg>`,
            hardware: `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="4" y="4" width="16" height="16" rx="2"/>
                <rect x="9" y="9" width="6" height="6"/>
                <line x1="9" y1="1" x2="9" y2="4"/>
                <line x1="15" y1="1" x2="15" y2="4"/>
                <line x1="9" y1="20" x2="9" y2="23"/>
                <line x1="15" y1="20" x2="15" y2="23"/>
                <line x1="20" y1="9" x2="23" y2="9"/>
                <line x1="20" y1="14" x2="23" y2="14"/>
                <line x1="1" y1="9" x2="4" y2="9"/>
                <line x1="1" y1="14" x2="4" y2="14"/>
            </svg>`,
            mobile: `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="5" y="2" width="14" height="20" rx="2"/>
                <line x1="12" y1="18" x2="12.01" y2="18"/>
            </svg>`,
            web: `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="16 18 22 12 16 6"/>
                <polyline points="8 6 2 12 8 18"/>
            </svg>`,
            default: `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <line x1="9" y1="9" x2="15" y2="9"/>
                <line x1="9" y1="15" x2="15" y2="15"/>
            </svg>`
        };
        return icons[iconType] || icons.default;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Firebase Certificates Loader
class FirebaseCertificates {
    constructor() {
        this.certList = document.getElementById('certificatesList');
        this.certViewer = document.getElementById('certViewer');
        this.certPlaceholder = document.getElementById('certPlaceholder');
        this.certDetails = document.getElementById('certDetails');
        this.certIssuer = document.getElementById('certIssuer');
        this.certDate = document.getElementById('certDate');
        this.viewerTitle = document.getElementById('viewerTitle');
        this.closeViewer = document.getElementById('closeViewer');
        this.loading = true;
        this.currentCertId = null;
        this.init();
    }

    init() {
        if (!db) {
            console.error('Firebase not initialized');
            this.showError();
            return;
        }

        this.showLoading();
        this.loadCertificates();
        this.setupEventListeners();
    }

    setupEventListeners() {
        if (this.closeViewer) {
            this.closeViewer.addEventListener('click', () => {
                this.closeCurrentCertificate();
            });
        }
    }

    showLoading() {
        if (this.certList) {
            this.certList.innerHTML = `
                <div class="loading-state">
                    <div class="loading-spinner"></div>
                    <p>Loading certificates...</p>
                </div>
            `;
        }
    }

    showError() {
        if (this.certList) {
            this.certList.innerHTML = `
                <div class="error-state">
                    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    <p>Failed to load certificates. Please check Firebase configuration.</p>
                </div>
            `;
        }
    }

    loadCertificates() {
        db.collection(COLLECTIONS.CERTIFICATES)
            .orderBy('order', 'asc')
            .onSnapshot((snapshot) => {
                const certificates = [];
                snapshot.forEach((doc) => {
                    certificates.push({ id: doc.id, ...doc.data() });
                });

                if (certificates.length === 0) {
                    this.showEmptyState();
                } else {
                    this.renderCertificates(certificates);
                }
                this.loading = false;
            }, (error) => {
                console.error('Error loading certificates:', error);
                this.showError();
            });
    }

    showEmptyState() {
        if (this.certList) {
            this.certList.innerHTML = `
                <div class="empty-state">
                    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <circle cx="12" cy="8" r="7"/>
                        <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
                    </svg>
                    <h3>No Certificates Yet</h3>
                    <p>Certificates will appear here once added through the admin panel.</p>
                </div>
            `;
        }
    }

    renderCertificates(certificates) {
        if (!this.certList) return;

        this.certList.innerHTML = certificates.map((cert, index) => `
            <div class="cert-item" data-cert-id="${cert.id}" style="animation-delay: ${index * 0.1}s">
                <div class="cert-icon">
                    ${this.getIconSVG(cert.issuer || 'default')}
                </div>
                <div class="cert-info">
                    <h4>${this.escapeHtml(cert.title)}</h4>
                    <p>${this.escapeHtml(cert.issuer)}</p>
                </div>
                <button class="cert-view-btn" data-cert='${JSON.stringify(cert).replace(/'/g, '&apos;')}'>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                    </svg>
                </button>
            </div>
        `).join('');

        // Add click event listeners
        document.querySelectorAll('.cert-view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const certData = JSON.parse(btn.getAttribute('data-cert'));
                this.viewCertificate(certData);
            });
        });

        document.querySelectorAll('.cert-item').forEach(item => {
            item.addEventListener('click', () => {
                const viewBtn = item.querySelector('.cert-view-btn');
                if (viewBtn) {
                    viewBtn.click();
                }
            });
        });
    }

    viewCertificate(cert) {
        if (!cert || !cert.imageUrl) return;

        // Update active state
        document.querySelectorAll('.cert-item').forEach(item => {
            item.classList.remove('active');
        });
        const activeItem = document.querySelector(`[data-cert-id="${cert.id}"]`);
        if (activeItem) {
            activeItem.classList.add('active');
        }

        // Update viewer
        if (this.certPlaceholder) {
            this.certPlaceholder.style.display = 'none';
        }

        if (this.certViewer) {
            this.certViewer.src = cert.imageUrl;
            this.certViewer.style.display = 'block';
            this.certViewer.classList.add('active');
        }

        // Update title
        if (this.viewerTitle) {
            this.viewerTitle.textContent = cert.title || 'Certificate Preview';
        }

        // Show close button
        if (this.closeViewer) {
            this.closeViewer.style.display = 'flex';
        }

        // Update details
        if (this.certDetails) {
            this.certDetails.style.display = 'grid';
        }

        if (this.certIssuer) {
            this.certIssuer.textContent = cert.issuer || '-';
        }

        if (this.certDate) {
            this.certDate.textContent = cert.issueDate || '-';
        }

        this.currentCertId = cert.id;
    }

    closeCurrentCertificate() {
        document.querySelectorAll('.cert-item').forEach(item => {
            item.classList.remove('active');
        });

        if (this.certViewer) {
            this.certViewer.style.display = 'none';
            this.certViewer.classList.remove('active');
            this.certViewer.src = '';
        }

        if (this.certPlaceholder) {
            this.certPlaceholder.style.display = 'flex';
        }

        if (this.viewerTitle) {
            this.viewerTitle.textContent = 'Certificate Preview';
        }

        if (this.closeViewer) {
            this.closeViewer.style.display = 'none';
        }

        if (this.certDetails) {
            this.certDetails.style.display = 'none';
        }

        this.currentCertId = null;
    }

    getIconSVG(provider = 'default') {
        const icons = {
            aws: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>`,
            ibm: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M0 6h24v2H0zM0 10h24v2H0zM0 14h24v2H0z"/>
            </svg>`,
            google: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/>
            </svg>`,
            microsoft: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M0 0h11.377v11.372H0zM12.623 0H24v11.372H12.623zM0 12.623h11.377V24H0zM12.623 12.623H24V24H12.623"/>
            </svg>`,
            coursera: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="8" r="7"/>
                <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
            </svg>`,
            udemy: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="8" r="7"/>
                <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
            </svg>`,
            default: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="8" r="7"/>
                <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
            </svg>`
        };
        return icons[(provider || 'default').toLowerCase()] || icons.default;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    // Initialize toggle
    new ViewToggle();

    // Wait for Firebase to initialize
    setTimeout(() => {
        new FirebaseProjects();
        new FirebaseCertificates();
    }, 500);
});
