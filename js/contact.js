/**
 * ============================================
 * CONTACT PAGE JAVASCRIPT
 * ============================================
 */

/**
 * Contact Form Handler
 * Manages form submission with EmailJS integration
 */
const ContactForm = {
    form: null,
    submitBtn: null,
    
    // EmailJS Configuration
    config: {
        serviceId: 'service_hvoqys3',
        templateId: 'template_guin48a',
        publicKey: 'ERcS2hOvR_hVjIE4G'
    },
    
    /**
     * Initialize the contact form
     */
    init() {
        this.form = document.getElementById('contact-form');
        this.submitBtn = this.form?.querySelector('.submit-btn');
        
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        }
        
        // Initialize EmailJS
        if (typeof emailjs !== 'undefined') {
            emailjs.init(this.config.publicKey);
        }
    },
    
    /**
     * Handle form submission
     * @param {Event} e - Submit event
     */
    async handleSubmit(e) {
        e.preventDefault();
        
        if (!this.validateForm()) {
            return;
        }
        
        // Disable submit button and show loading state
        this.setLoadingState(true);
        
        try {
            // Prepare template parameters
            const templateParams = {
                form_name: this.form.querySelector('input[name="user_name"]').value,
                reply_to: this.form.querySelector('input[name="user_email"]').value,
                message: this.form.querySelector('textarea[name="message"]').value
            };
            
            // Send email via EmailJS
            await emailjs.send(
                this.config.serviceId,
                this.config.templateId,
                templateParams
            );
            
            // Success
            this.showSuccess();
            this.form.reset();
            
        } catch (error) {
            console.error('Email send failed:', error);
            this.showError();
        } finally {
            this.setLoadingState(false);
        }
    },
    
    /**
     * Validate form fields
     * @returns {boolean} - True if valid
     */
    validateForm() {
        const name = this.form.querySelector('input[name="user_name"]').value.trim();
        const email = this.form.querySelector('input[name="user_email"]').value.trim();
        const message = this.form.querySelector('textarea[name="message"]').value.trim();
        
        if (!name || !email || !message) {
            alert('Please fill in all fields');
            return false;
        }
        
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Please enter a valid email address');
            return false;
        }
        
        return true;
    },
    
    /**
     * Set loading state on submit button
     * @param {boolean} loading - Loading state
     */
    setLoadingState(loading) {
        if (!this.submitBtn) return;
        
        if (loading) {
            this.submitBtn.textContent = 'Sending...';
            this.submitBtn.disabled = true;
        } else {
            setTimeout(() => {
                this.submitBtn.textContent = 'Send Message';
                this.submitBtn.disabled = false;
            }, 3000);
        }
    },
    
    /**
     * Show success message
     */
    showSuccess() {
        if (!this.submitBtn) return;
        
        this.submitBtn.textContent = 'Message Sent! ✨';
        this.submitBtn.style.background = '#22c55e';
        
        setTimeout(() => {
            this.submitBtn.style.background = '';
        }, 3000);
    },
    
    /**
     * Show error message
     */
    showError() {
        if (!this.submitBtn) return;
        
        this.submitBtn.textContent = 'Error! ❌';
        this.submitBtn.style.background = '#ef4444';
        
        setTimeout(() => {
            this.submitBtn.style.background = '';
        }, 3000);
    }
};

/**
 * Social Links Animation
 * Adds staggered entrance animation to social cards
 */
function animateSocialCards() {
    const socialCards = document.querySelectorAll('.social-card');
    
    socialCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(10px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 400 + (index * 100));
    });
}

/**
 * Initialization
 */
document.addEventListener('DOMContentLoaded', () => {
    // Apply saved theme
    if (typeof ThemeManager !== 'undefined') {
        ThemeManager.applySaved();
    } else {
        // Fallback if main script not loaded
        const savedTheme = localStorage.getItem('portfolio-theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-mode');
        }
    }
    
    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    // Initialize contact form
    ContactForm.init();
    
    // Animate social cards
    animateSocialCards();
    
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
