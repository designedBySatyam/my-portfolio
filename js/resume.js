/**
 * ============================================
 * RESUME PAGE WITH FIREBASE INTEGRATION
 * ============================================
 */

function normalizeCertificateImagePath(imagePath) {
    const trimmed = (imagePath || '').trim();
    if (!trimmed) return '';

    const normalizedPath = trimmed.replace(/\\/g, '/');

    if (/^(?:https?:)?\/\//i.test(normalizedPath) || normalizedPath.startsWith('data:') || normalizedPath.startsWith('blob:')) {
        return normalizedPath;
    }

    if (normalizedPath.startsWith('../') || normalizedPath.startsWith('./') || normalizedPath.startsWith('/')) {
        return normalizedPath;
    }

    if (normalizedPath.startsWith('assets/')) {
        return `../${normalizedPath}`;
    }

    return `../assets/certificates/${normalizedPath}`;
}

// Firebase Real-time Certificates Loader
class FirebaseCertificates {
    constructor() {
        this.certList = document.querySelector('.cert-list');
        this.certViewer = document.getElementById('certViewer');
        this.certPlaceholder = document.getElementById('certPlaceholder');
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
        this.loadCertificates();
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
        // Real-time listener for certificates
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
            <div class="cert-item" data-cert="${cert.id}" style="animation-delay: ${0.3 + (index * 0.1)}s">
                <div class="cert-icon">
                    ${this.getIconSVG(cert.issuer || 'default')}
                </div>
                <div class="cert-info">
                    <h4>${this.escapeHtml(cert.title)}</h4>
                    <p>${this.escapeHtml(cert.issuer)}</p>
                </div>
                <button class="cert-view-btn" onclick="viewCertificate('${cert.id}', '${this.escapeHtml(normalizeCertificateImagePath(cert.imageUrl || ''))}')">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                    </svg>
                </button>
            </div>
        `).join('');
    }

    getIconSVG(provider = 'default') {
        const icons = {
            aws: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>`,
            ibm: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>`,
            google: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>`,
            microsoft: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
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

// Global function for viewing certificates
function viewCertificate(certId, imageUrl) {
    const viewer = document.getElementById('certViewer');
    const placeholder = document.getElementById('certPlaceholder');
    const normalizedImageUrl = normalizeCertificateImagePath(imageUrl);
    
    if (viewer && placeholder && normalizedImageUrl) {
        placeholder.style.display = 'none';
        viewer.src = normalizedImageUrl;
        viewer.style.display = 'block';
        viewer.classList.add('active');
        
        setTimeout(() => {
            viewer.classList.remove('active');
        }, 500);

        // Set active state on cert items
        document.querySelectorAll('.cert-item').forEach(item => {
            item.classList.remove('active');
        });
        const activeItem = document.querySelector(`[data-cert="${certId}"]`);
        if (activeItem) {
            activeItem.classList.add('active');
        }
    }
}

// Legacy function for backward compatibility
function viewCert(certId) {
    const certItem = document.querySelector(`[data-cert="${certId}"]`);
    if (certItem) {
        certItem.click();
    }
}

// Skill Bar Animations
class SkillAnimations {
    constructor() {
        this.skillItems = document.querySelectorAll('.skill-item');
        this.init();
    }

    init() {
        if (this.skillItems.length === 0) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateSkill(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.5
        });

        this.skillItems.forEach(item => observer.observe(item));
    }

    animateSkill(skillItem) {
        const skillFill = skillItem.querySelector('.skill-fill');
        if (skillFill) {
            skillFill.style.animation = 'fillBar 1.5s ease-out forwards';
        }
    }
}

// Timeline Animations
class TimelineAnimations {
    constructor() {
        this.timelineItems = document.querySelectorAll('.timeline-item');
        this.init();
    }

    init() {
        if (this.timelineItems.length === 0) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                }
            });
        }, {
            threshold: 0.3
        });

        this.timelineItems.forEach(item => observer.observe(item));
    }
}

// Download Button Analytics
class DownloadTracking {
    constructor() {
        this.downloadBtn = document.querySelector('.download-btn');
        this.init();
    }

    init() {
        if (!this.downloadBtn) return;

        this.downloadBtn.addEventListener('click', () => {
            console.log('Resume downloaded');
            this.showDownloadFeedback();
        });
    }

    showDownloadFeedback() {
        const btnText = this.downloadBtn.querySelector('span') || this.downloadBtn;
        const originalText = btnText.textContent;
        btnText.textContent = 'DOWNLOADING...';
        
        setTimeout(() => {
            btnText.textContent = 'DOWNLOADED!';
            
            setTimeout(() => {
                btnText.textContent = originalText;
            }, 2000);
        }, 1000);
    }
}

// Add loading state styles
const style = document.createElement('style');
style.textContent = `
    .cert-list .loading-state,
    .cert-list .error-state,
    .cert-list .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: var(--space-xl);
        text-align: center;
        min-height: 200px;
    }

    .cert-list .loading-spinner {
        width: 40px;
        height: 40px;
        border: 3px solid rgba(255, 0, 255, 0.2);
        border-top-color: var(--neon-magenta);
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-bottom: var(--space-md);
    }

    @keyframes spin {
        to { transform: rotate(360deg); }
    }

    .cert-list .loading-state p,
    .cert-list .error-state p,
    .cert-list .empty-state p {
        font-family: 'Rajdhani', sans-serif;
        font-size: 1rem;
        color: var(--text-secondary);
        margin: var(--space-sm) 0 0 0;
    }

    .cert-list .empty-state h3 {
        font-family: 'Orbitron', monospace;
        font-size: 1.2rem;
        color: var(--text-primary);
        margin: var(--space-md) 0;
    }

    .cert-list .error-state svg,
    .cert-list .empty-state svg {
        color: var(--text-muted);
        opacity: 0.5;
    }

    .cert-item.active {
        border-color: var(--neon-magenta);
        background: rgba(255, 0, 255, 0.1);
    }
`;
document.head.appendChild(style);

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    // Wait for Firebase to initialize
    setTimeout(() => {
        new FirebaseCertificates();
    }, 500);
    
    new SkillAnimations();
    new TimelineAnimations();
    new DownloadTracking();
});