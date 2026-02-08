/**
 * ============================================
 * CONTACT PAGE JAVASCRIPT
 * ============================================
 */

// Contact Form Handler with EmailJS
class ContactForm {
    constructor() {
        this.form = document.getElementById('contactForm');
        this.submitBtn = this.form?.querySelector('.submit-btn');
        this.statusDiv = document.getElementById('formStatus');
        
        // EmailJS Configuration
        this.emailConfig = {
            serviceId: 'service_hvoqys3',
            templateId: 'template_guin48a',
            publicKey: 'ERcS2hOvR_hVjIE4G'
        };
        
        this.init();
    }

    init() {
        if (!this.form) return;

        // Initialize EmailJS
        if (typeof emailjs !== 'undefined') {
            emailjs.init(this.emailConfig.publicKey);
        }

        // Form submission
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));

        // Input animations
        this.initInputAnimations();
    }

    async handleSubmit(e) {
        e.preventDefault();

        if (!this.validateForm()) return;

        // Show loading state
        this.setLoadingState(true);

        try {
            // Get form data
            const formData = {
                user_name: this.form.user_name.value,
                user_email: this.form.user_email.value,
                message: this.form.message.value
            };

            // Send via EmailJS
            await emailjs.send(
                this.emailConfig.serviceId,
                this.emailConfig.templateId,
                formData
            );

            // Success
            this.showSuccess();
            this.form.reset();

        } catch (error) {
            console.error('Email send failed:', error);
            this.showError('Failed to send message. Please try again.');
        } finally {
            this.setLoadingState(false);
        }
    }

    validateForm() {
        const name = this.form.user_name.value.trim();
        const email = this.form.user_email.value.trim();
        const message = this.form.message.value.trim();

        if (!name || !email || !message) {
            this.showError('Please fill in all fields');
            return false;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            this.showError('Please enter a valid email address');
            return false;
        }

        return true;
    }

    setLoadingState(loading) {
        if (!this.submitBtn) return;

        const btnText = this.submitBtn.querySelector('.btn-text');
        const btnIcon = this.submitBtn.querySelector('.btn-icon');

        if (loading) {
            btnText.textContent = 'SENDING...';
            btnIcon.style.animation = 'spin 1s linear infinite';
            this.submitBtn.disabled = true;
        } else {
            setTimeout(() => {
                btnText.textContent = 'SEND MESSAGE';
                btnIcon.style.animation = '';
                this.submitBtn.disabled = false;
            }, 2000);
        }
    }

    showSuccess() {
        if (!this.statusDiv) return;

        this.statusDiv.className = 'form-status success';
        this.statusDiv.textContent = 'Message sent successfully! I\'ll get back to you soon.';

        setTimeout(() => {
            this.statusDiv.className = 'form-status';
            this.statusDiv.textContent = '';
        }, 5000);
    }

    showError(message) {
        if (!this.statusDiv) return;

        this.statusDiv.className = 'form-status error';
        this.statusDiv.textContent = message;

        setTimeout(() => {
            this.statusDiv.className = 'form-status';
            this.statusDiv.textContent = '';
        }, 5000);
    }

    initInputAnimations() {
        const inputs = this.form.querySelectorAll('input, textarea');
        
        inputs.forEach(input => {
            // Focus animations
            input.addEventListener('focus', () => {
                const wrapper = input.closest('.input-wrapper');
                if (wrapper) {
                    wrapper.classList.add('focused');
                }
            });

            input.addEventListener('blur', () => {
                const wrapper = input.closest('.input-wrapper');
                if (wrapper) {
                    wrapper.classList.remove('focused');
                }
            });
        });
    }
}

// Social Card Animations
class SocialCardAnimations {
    constructor() {
        this.cards = document.querySelectorAll('.social-card');
        this.init();
    }

    init() {
        if (this.cards.length === 0) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                }
            });
        }, {
            threshold: 0.3
        });

        this.cards.forEach(card => observer.observe(card));
    }
}

// Form Input Effects
class InputEffects {
    constructor() {
        this.inputs = document.querySelectorAll('input, textarea');
        this.init();
    }

    init() {
        if (this.inputs.length === 0) return;

        this.inputs.forEach(input => {
            // Floating label effect
            input.addEventListener('focus', () => {
                const label = input.previousElementSibling;
                if (label && label.tagName === 'LABEL') {
                    label.style.transform = 'translateY(-20px) scale(0.9)';
                    label.style.color = 'var(--neon-cyan)';
                }
            });

            input.addEventListener('blur', () => {
                if (!input.value) {
                    const label = input.previousElementSibling;
                    if (label && label.tagName === 'LABEL') {
                        label.style.transform = '';
                        label.style.color = '';
                    }
                }
            });

            // Character count for textarea (optional)
            if (input.tagName === 'TEXTAREA') {
                input.addEventListener('input', () => {
                    const maxLength = 500;
                    const currentLength = input.value.length;
                    
                    if (currentLength > maxLength) {
                        input.value = input.value.substring(0, maxLength);
                    }
                });
            }
        });
    }
}

// Add spin animation for loading state
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    new ContactForm();
    new SocialCardAnimations();
    new InputEffects();
});
