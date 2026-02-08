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
        
        // EmailJS Configuration - YOUR CREDENTIALS
        this.emailConfig = {
            serviceId: 'service_hvoqys3',  // Get from Email Services page
            templateId: 'template_guin48a',          // Your "Contact Us" template ID
            publicKey: 'ERcS2hOvR_hVjIE4G'    // Get from Account > General page
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
            // Prepare template parameters matching your EmailJS template
            const templateParams = {
                user_name: this.form.user_name.value.trim(),
                user_email: this.form.user_email.value.trim(),
                message: this.form.message.value.trim(),
                title: 'New Contact Form Submission' // Optional: for subject line
            };

            // Send via EmailJS
            const response = await emailjs.send(
                this.emailConfig.serviceId,
                this.emailConfig.templateId,
                templateParams
            );

            console.log('SUCCESS!', response.status, response.text);

            // Success
            this.showSuccess();
            this.form.reset();

        } catch (error) {
            console.error('FAILED...', error);
            this.showError('Failed to send message. Please try again or email me directly at hello.satyam27@gmail.com');
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

        if (message.length < 10) {
            this.showError('Message must be at least 10 characters long');
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
            if (btnIcon) {
                btnIcon.style.animation = 'spin 1s linear infinite';
            }
            this.submitBtn.disabled = true;
            this.submitBtn.style.opacity = '0.7';
            this.submitBtn.style.cursor = 'not-allowed';
        } else {
            setTimeout(() => {
                btnText.textContent = 'SEND MESSAGE';
                if (btnIcon) {
                    btnIcon.style.animation = '';
                }
                this.submitBtn.disabled = false;
                this.submitBtn.style.opacity = '1';
                this.submitBtn.style.cursor = 'pointer';
            }, 2000);
        }
    }

    showSuccess() {
        if (!this.statusDiv) return;

        this.statusDiv.className = 'form-status success';
        this.statusDiv.textContent = '✨ Message sent successfully! You\'ll receive an auto-reply confirmation. I\'ll get back to you within 24 hours.';

        setTimeout(() => {
            this.statusDiv.className = 'form-status';
            this.statusDiv.textContent = '';
        }, 8000);
    }

    showError(message) {
        if (!this.statusDiv) return;

        this.statusDiv.className = 'form-status error';
        this.statusDiv.textContent = '❌ ' + message;

        setTimeout(() => {
            this.statusDiv.className = 'form-status';
            this.statusDiv.textContent = '';
        }, 6000);
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
                    const maxLength = 1000;
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