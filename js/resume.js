/**
 * ============================================
 * RESUME PAGE JAVASCRIPT
 * ============================================
 */

// Certificate Viewer
class CertificateViewer {
    constructor() {
        this.viewer = document.getElementById('certViewer');
        this.placeholder = document.getElementById('certPlaceholder');
        this.certItems = document.querySelectorAll('.cert-item');
        
        // Certificate image paths
        this.certificates = {
            'aws': '../assets/certificates/aws-certificate.jpg',
            'ibm': '../assets/certificates/ibm-certificate.jpg',
            'club': '../assets/certificates/club-cert.jpg'
        };
        
        this.init();
    }

    init() {
        if (!this.viewer || !this.placeholder) return;

        this.certItems.forEach(item => {
            item.addEventListener('click', () => {
                const certId = item.dataset.cert;
                this.showCertificate(certId);
                this.setActiveItem(item);
            });
        });
    }

    showCertificate(certId) {
        const imagePath = this.certificates[certId];
        
        if (imagePath) {
            // Hide placeholder
            this.placeholder.style.display = 'none';
            
            // Show and animate certificate
            this.viewer.src = imagePath;
            this.viewer.style.display = 'block';
            this.viewer.classList.add('active');
            
            // Trigger animation
            setTimeout(() => {
                this.viewer.classList.remove('active');
            }, 500);
        }
    }

    setActiveItem(activeItem) {
        this.certItems.forEach(item => {
            item.classList.remove('active');
        });
        activeItem.classList.add('active');
    }
}

// Global function for onclick handlers
function viewCert(certId) {
    const viewer = new CertificateViewer();
    viewer.showCertificate(certId);
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
            // Trigger fill animation
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
            // Add analytics tracking here if needed
            // Example: gtag('event', 'download', { event_category: 'resume' });
            
            // Visual feedback
            this.showDownloadFeedback();
        });
    }

    showDownloadFeedback() {
        const originalText = this.downloadBtn.querySelector('.btn-text');
        if (originalText) {
            const text = originalText.textContent;
            originalText.textContent = 'DOWNLOADING...';
            
            setTimeout(() => {
                originalText.textContent = 'DOWNLOADED!';
                
                setTimeout(() => {
                    originalText.textContent = text;
                }, 2000);
            }, 1000);
        }
    }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    new CertificateViewer();
    new SkillAnimations();
    new TimelineAnimations();
    new DownloadTracking();
});
