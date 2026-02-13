/**
 * ============================================
 * PROJECTS PAGE WITH FIREBASE INTEGRATION
 * ============================================
 */

// Firebase Real-time Projects Loader
class FirebaseProjects {
    constructor() {
        this.projectsContainer = document.querySelector('.projects-grid');
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
        // Real-time listener for projects
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

        // Re-initialize animations after rendering
        new ProjectCards();
        new TiltEffect();
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

// Project Card Animations (existing code)
class ProjectCards {
    constructor() {
        this.cards = document.querySelectorAll('.project-card');
        this.init();
    }

    init() {
        if (this.cards.length === 0) return;

        this.cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                this.animateCard(card);
            });

            card.addEventListener('mouseleave', () => {
                this.resetCard(card);
            });
        });

        this.observeCards();
    }

    animateCard(card) {
        const cardNumber = card.querySelector('.card-number');
        if (cardNumber) {
            cardNumber.style.animation = 'pulse 0.5s ease-in-out';
        }
    }

    resetCard(card) {
        const cardNumber = card.querySelector('.card-number');
        if (cardNumber) {
            setTimeout(() => {
                cardNumber.style.animation = '';
            }, 500);
        }
    }

    observeCards() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                }
            });
        }, {
            threshold: 0.2
        });

        this.cards.forEach(card => observer.observe(card));
    }
}

// Project Card 3D Tilt Effect (existing code)
class TiltEffect {
    constructor() {
        this.cards = document.querySelectorAll('.project-card');
        this.init();
    }

    init() {
        if (this.cards.length === 0) return;

        this.cards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                this.handleTilt(e, card);
            });

            card.addEventListener('mouseleave', () => {
                this.resetTilt(card);
            });
        });
    }

    handleTilt(e, card) {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;
        
        card.style.transform = `
            translateY(-10px) 
            perspective(1000px) 
            rotateX(${rotateX}deg) 
            rotateY(${rotateY}deg)
        `;
    }

    resetTilt(card) {
        card.style.transform = 'translateY(0) perspective(1000px) rotateX(0) rotateY(0)';
    }
}

// Add loading and error state styles
const style = document.createElement('style');
style.textContent = `
    .loading-state,
    .error-state,
    .empty-state {
        grid-column: 1 / -1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: var(--space-2xl);
        text-align: center;
        min-height: 400px;
    }

    .loading-spinner {
        width: 50px;
        height: 50px;
        border: 3px solid rgba(0, 255, 255, 0.2);
        border-top-color: var(--neon-cyan);
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-bottom: var(--space-lg);
    }

    @keyframes spin {
        to { transform: rotate(360deg); }
    }

    .loading-state p,
    .error-state p,
    .empty-state p {
        font-family: 'Rajdhani', sans-serif;
        font-size: 1.1rem;
        color: var(--text-secondary);
        margin: var(--space-md) 0 0 0;
    }

    .empty-state h3 {
        font-family: 'Orbitron', monospace;
        font-size: 1.5rem;
        color: var(--text-primary);
        margin: var(--space-md) 0;
    }

    .error-state svg,
    .empty-state svg {
        color: var(--text-muted);
        opacity: 0.5;
    }

    .project-link {
        display: inline-flex;
        align-items: center;
        gap: var(--space-xs);
        padding: var(--space-xs) var(--space-md);
        margin-top: var(--space-md);
        font-family: 'Orbitron', monospace;
        font-size: 0.75rem;
        font-weight: 600;
        letter-spacing: 1px;
        color: var(--neon-cyan);
        text-decoration: none;
        border: 1px solid var(--neon-cyan);
        border-radius: var(--radius-sm);
        transition: all var(--transition-smooth);
    }

    .project-link:hover {
        background: var(--neon-cyan);
        color: var(--bg-primary);
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(0, 255, 255, 0.3);
    }

    .status-indicator.completed .status-dot {
        background: var(--neon-cyan);
    }

    .status-indicator.active .status-dot {
        background: #00ff00;
    }

    .status-indicator.research .status-dot {
        background: var(--neon-magenta);
    }

    .status-indicator.planning .status-dot {
        background: #ffaa00;
    }
`;
document.head.appendChild(style);

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    // Wait for Firebase to initialize
    setTimeout(() => {
        new FirebaseProjects();
    }, 500);
});
