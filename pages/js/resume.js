/**
 * ============================================
 * RESUME PAGE JAVASCRIPT
 * ============================================
 */

/**
 * Certificate Viewer
 * Handles certificate preview functionality
 */
const CertificateViewer = {
    viewer: null,
    placeholder: null,
    currentCert: null,
    
    /**
     * Initialize the certificate viewer
     */
    init() {
        this.viewer = document.getElementById('cert-viewer');
        this.placeholder = document.getElementById('preview-placeholder');
        
        // Add click handlers to certificate list items
        const certItems = document.querySelectorAll('.cert-list li');
        certItems.forEach(item => {
            item.addEventListener('click', () => {
                const imageSrc = item.getAttribute('data-image');
                if (imageSrc) {
                    this.show(imageSrc, item);
                }
            });
            
            // Add keyboard accessibility
            item.setAttribute('tabindex', '0');
            item.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const imageSrc = item.getAttribute('data-image');
                    if (imageSrc) {
                        this.show(imageSrc, item);
                    }
                }
            });
        });
    },
    
    /**
     * Show certificate in viewer
     * @param {string} imageSrc - Certificate image URL
     * @param {HTMLElement} listItem - Clicked list item
     */
    show(imageSrc, listItem = null) {
        if (!this.viewer || !this.placeholder) return;
        
        // Update active state
        if (listItem) {
            document.querySelectorAll('.cert-list li').forEach(item => {
                item.classList.remove('active');
            });
            listItem.classList.add('active');
        }
        
        // Set image source
        this.viewer.src = imageSrc;
        this.viewer.style.display = 'block';
        this.placeholder.style.display = 'none';
        this.currentCert = imageSrc;
        
        // Smooth fade-in animation
        this.viewer.animate([
            { opacity: 0, transform: 'scale(0.95)' },
            { opacity: 1, transform: 'scale(1)' }
        ], {
            duration: 300,
            easing: 'ease-out'
        });
    },
    
    /**
     * Clear viewer
     */
    clear() {
        if (!this.viewer || !this.placeholder) return;
        
        this.viewer.style.display = 'none';
        this.placeholder.style.display = 'block';
        this.currentCert = null;
        
        // Remove active states
        document.querySelectorAll('.cert-list li').forEach(item => {
            item.classList.remove('active');
        });
    }
};

/**
 * Skills Animation
 * Animates skill tags on scroll
 */
function animateSkills() {
    const skillTags = document.querySelectorAll('.skills-tags span');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'scale(1)';
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.5
    });
    
    skillTags.forEach(tag => {
        observer.observe(tag);
    });
}

/**
 * Resume Sections Animation
 * Adds entrance animation to resume sections
 */
function animateResumeSections() {
    const sections = document.querySelectorAll('.resume-section');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 100);
                
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });
    
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });
}

/**
 * Download Button Analytics
 * Track resume downloads (optional - requires analytics setup)
 */
function trackDownload() {
    const downloadBtn = document.querySelector('.download-btn');
    
    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            console.log('Resume downloaded');
            // Add analytics tracking here if needed
            // Example: gtag('event', 'download', { 'event_category': 'resume' });
        });
    }
}

/**
 * Global function for showing certificate (backward compatibility)
 * @param {string} imageSrc - Certificate image URL
 */
function showCert(imageSrc) {
    CertificateViewer.show(imageSrc);
}

/**
 * Initialization
 */
document.addEventListener('DOMContentLoaded', () => {
    // Apply saved theme
    if (typeof ThemeManager !== 'undefined') {
        ThemeManager.applySaved();
    } else {
        const savedTheme = localStorage.getItem('portfolio-theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-mode');
        }
    }
    
    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    // Initialize certificate viewer
    CertificateViewer.init();
    
    // Animate skills
    animateSkills();
    
    // Animate resume sections
    animateResumeSections();
    
    // Track downloads
    trackDownload();
    
    // Initialize interactive effects if available
    if (typeof InteractiveEffects !== 'undefined') {
        InteractiveEffects.init();
    }
});

// Expose toggle function for button
function toggleDark() {
    if (typeof ThemeManager !== 'undefined') {
        ThemeManager.toggle();
    }
}
