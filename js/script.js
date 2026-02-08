/**
 * ============================================
 * MAIN JAVASCRIPT - CYBERPUNK PORTFOLIO
 * ============================================
 */

// Theme Management
class ThemeManager {
    constructor() {
        this.themeToggle = document.getElementById('themeToggle');
        this.init();
    }

    init() {
        // Load saved theme
        this.loadTheme();
        
        // Add event listener
        if (this.themeToggle) {
            this.themeToggle.addEventListener('click', () => this.toggleTheme());
        }
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('portfolio-theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-theme');
        }
    }

    toggleTheme() {
        document.body.classList.toggle('dark-theme');
        const isDark = document.body.classList.contains('dark-theme');
        localStorage.setItem('portfolio-theme', isDark ? 'dark' : 'light');
        
        // Add animation to toggle button
        if (this.themeToggle) {
            this.themeToggle.style.transform = 'rotate(360deg)';
            setTimeout(() => {
                this.themeToggle.style.transform = 'rotate(0deg)';
            }, 400);
        }
    }
}

// Role Typer Animation
class RoleTyper {
    constructor() {
        this.element = document.getElementById('roleTyper');
        this.roles = [
            'DIGITAL ARCHITECT',
            'CODE CRAFTSMAN',
            'SYSTEM ENGINEER',
            'PROBLEM SOLVER'
        ];
        this.currentIndex = 0;
        this.currentText = '';
        this.isDeleting = false;
        this.typeSpeed = 100;
        this.deleteSpeed = 50;
        this.pauseDelay = 2000;
        
        if (this.element) {
            this.type();
        }
    }

    type() {
        const currentRole = this.roles[this.currentIndex];
        
        if (this.isDeleting) {
            this.currentText = currentRole.substring(0, this.currentText.length - 1);
        } else {
            this.currentText = currentRole.substring(0, this.currentText.length + 1);
        }
        
        this.element.textContent = this.currentText;
        
        let timeout = this.isDeleting ? this.deleteSpeed : this.typeSpeed;
        
        if (!this.isDeleting && this.currentText === currentRole) {
            timeout = this.pauseDelay;
            this.isDeleting = true;
        } else if (this.isDeleting && this.currentText === '') {
            this.isDeleting = false;
            this.currentIndex = (this.currentIndex + 1) % this.roles.length;
            timeout = 500;
        }
        
        setTimeout(() => this.type(), timeout);
    }
}

// Smooth Scroll for Navigation
class SmoothScroll {
    constructor() {
        this.init();
    }

    init() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const href = anchor.getAttribute('href');
                if (href !== '#' && href !== '') {
                    e.preventDefault();
                    const target = document.querySelector(href);
                    if (target) {
                        target.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                }
            });
        });
    }
}

// Parallax Effect for Orbs
class ParallaxOrbs {
    constructor() {
        this.orbs = document.querySelectorAll('.orb');
        this.init();
    }

    init() {
        if (this.orbs.length === 0) return;
        
        window.addEventListener('mousemove', (e) => {
            const mouseX = e.clientX / window.innerWidth;
            const mouseY = e.clientY / window.innerHeight;
            
            this.orbs.forEach((orb, index) => {
                const speed = (index + 1) * 20;
                const x = (mouseX - 0.5) * speed;
                const y = (mouseY - 0.5) * speed;
                
                orb.style.transform = `translate(${x}px, ${y}px)`;
            });
        });
    }
}

// Intersection Observer for Fade-in Animations
class ScrollAnimations {
    constructor() {
        this.init();
    }

    init() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observe elements with data-animate attribute
        document.querySelectorAll('[data-animate]').forEach(el => {
            observer.observe(el);
        });
    }
}

// Cursor Trail Effect (Optional Enhancement)
class CursorTrail {
    constructor() {
        this.coords = { x: 0, y: 0 };
        this.circles = [];
        this.init();
    }

    init() {
        // Create cursor circles
        const colors = ['#00ffff', '#ff00ff', '#0066ff'];
        
        for (let i = 0; i < 3; i++) {
            const circle = document.createElement('div');
            circle.className = 'cursor-circle';
            circle.style.cssText = `
                position: fixed;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                background: ${colors[i]};
                pointer-events: none;
                z-index: 9999;
                opacity: 0;
                filter: blur(${i * 3}px);
                transition: opacity 0.3s;
            `;
            document.body.appendChild(circle);
            this.circles.push(circle);
        }

        // Track mouse movement
        window.addEventListener('mousemove', (e) => {
            this.coords.x = e.clientX;
            this.coords.y = e.clientY;
        });

        // Animate circles
        this.animateCircles();
    }

    animateCircles() {
        let x = this.coords.x;
        let y = this.coords.y;
        
        this.circles.forEach((circle, index) => {
            circle.style.left = x - 10 + 'px';
            circle.style.top = y - 10 + 'px';
            circle.style.opacity = '0.3';
            
            circle.style.transform = `scale(${(this.circles.length - index) / this.circles.length})`;
            
            const nextCircle = this.circles[index + 1] || this.circles[0];
            x += (nextCircle.offsetLeft - x) * 0.3;
            y += (nextCircle.offsetTop - y) * 0.3;
        });
        
        requestAnimationFrame(() => this.animateCircles());
    }
}

// Page Loading Animation
class PageLoader {
    constructor() {
        this.init();
    }

    init() {
        window.addEventListener('load', () => {
            // Remove loading class if exists
            document.body.classList.remove('loading');
            
            // Trigger entrance animations
            this.triggerAnimations();
        });
    }

    triggerAnimations() {
        // Add stagger effect to elements
        const elements = document.querySelectorAll('.hero-content > *');
        elements.forEach((el, index) => {
            setTimeout(() => {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }
}

// Initialize Everything
document.addEventListener('DOMContentLoaded', () => {
    // Core functionality
    new ThemeManager();
    new SmoothScroll();
    new PageLoader();
    
    // Visual enhancements
    new ParallaxOrbs();
    new ScrollAnimations();
    
    // Only on home page
    if (document.getElementById('roleTyper')) {
        new RoleTyper();
    }
    
    // Cursor trail (comment out if too distracting)
    // new CursorTrail();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ThemeManager, RoleTyper, SmoothScroll };
}
