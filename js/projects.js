/**
 * ============================================
 * PROJECTS PAGE JAVASCRIPT
 * ============================================
 */

/**
 * Image Modal Handler
 * Manages full-screen image viewing
 */
const ImageModal = {
    modal: null,
    modalImg: null,
    closeBtn: null,
    
    /**
     * Initialize the modal
     */
    init() {
        this.modal = document.getElementById('imageModal');
        this.modalImg = document.getElementById('modalImg');
        this.closeBtn = document.querySelector('.close-modal');
        
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.close());
        }
        
        // Close modal on background click
        if (this.modal) {
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) {
                    this.close();
                }
            });
        }
        
        // Close modal on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen()) {
                this.close();
            }
        });
    },
    
    /**
     * Open modal with image
     * @param {string} imgSrc - Image source URL
     */
    open(imgSrc) {
        if (!this.modal || !this.modalImg) return;
        
        this.modal.classList.add('active');
        this.modal.style.display = 'flex';
        this.modalImg.src = imgSrc;
        
        // Prevent body scroll when modal is open
        document.body.style.overflow = 'hidden';
        
        // Focus on close button for accessibility
        if (this.closeBtn) {
            this.closeBtn.focus();
        }
    },
    
    /**
     * Close modal
     */
    close() {
        if (!this.modal) return;
        
        this.modal.classList.remove('active');
        this.modal.style.display = 'none';
        
        // Restore body scroll
        document.body.style.overflow = '';
    },
    
    /**
     * Check if modal is open
     * @returns {boolean}
     */
    isOpen() {
        return this.modal && this.modal.classList.contains('active');
    }
};

/**
 * Project Cards Animation
 * Adds entrance animation to project cards
 */
function animateProjectCards() {
    const projectCards = document.querySelectorAll('.project-card');
    
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
    
    projectCards.forEach((card) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(card);
    });
}

/**
 * Project Card Click Handler
 * Handle clicks on project cards (if they have links or modals)
 */
function setupProjectCards() {
    const projectCards = document.querySelectorAll('.project-card');
    
    projectCards.forEach(card => {
        // If card has a data-image attribute, open it in modal
        card.addEventListener('click', () => {
            const imageUrl = card.getAttribute('data-image');
            if (imageUrl) {
                ImageModal.open(imageUrl);
            }
        });
        
        // Add keyboard accessibility
        card.setAttribute('tabindex', '0');
        card.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const imageUrl = card.getAttribute('data-image');
                if (imageUrl) {
                    ImageModal.open(imageUrl);
                }
            }
        });
    });
}

/**
 * Global function for opening modal (backward compatibility)
 * @param {string} imgSrc - Image source URL
 */
function openModal(imgSrc) {
    ImageModal.open(imgSrc);
}

/**
 * Global function for closing modal (backward compatibility)
 */
function closeModal() {
    ImageModal.close();
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
    
    // Initialize image modal
    ImageModal.init();
    
    // Setup project cards
    setupProjectCards();
    
    // Animate project cards on scroll
    animateProjectCards();
    
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
