/**
 * ============================================
 * PROJECTS PAGE JAVASCRIPT
 * ============================================
 */

// Project Card Animations
class ProjectCards {
    constructor() {
        this.cards = document.querySelectorAll('.project-card');
        this.init();
    }

    init() {
        if (this.cards.length === 0) return;

        // Add hover sound effect (optional)
        this.cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                this.animateCard(card);
            });

            card.addEventListener('mouseleave', () => {
                this.resetCard(card);
            });
        });

        // Add intersection observer for scroll animations
        this.observeCards();
    }

    animateCard(card) {
        // Add pulse animation to card number
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

// Filter Projects by Category (if needed in future)
class ProjectFilter {
    constructor() {
        this.filterButtons = document.querySelectorAll('[data-filter]');
        this.projectCards = document.querySelectorAll('.project-card');
        this.init();
    }

    init() {
        if (this.filterButtons.length === 0) return;

        this.filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                const filter = button.dataset.filter;
                this.filterProjects(filter);
                this.updateActiveButton(button);
            });
        });
    }

    filterProjects(category) {
        this.projectCards.forEach(card => {
            const cardCategory = card.dataset.category;
            
            if (category === 'all' || cardCategory === category) {
                card.style.display = 'block';
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, 10);
            } else {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    card.style.display = 'none';
                }, 300);
            }
        });
    }

    updateActiveButton(activeButton) {
        this.filterButtons.forEach(button => {
            button.classList.remove('active');
        });
        activeButton.classList.add('active');
    }
}

// Project Card 3D Tilt Effect
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

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    new ProjectCards();
    new TiltEffect();
    // new ProjectFilter(); // Uncomment if adding filter functionality
});
