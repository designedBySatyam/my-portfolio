/**
 * ============================================
 * PORTFOLIO MAIN JAVASCRIPT
 * Author: Satyam Pandey
 * ============================================
 */

/**
 * Theme Management
 * Handles dark/light mode toggle with localStorage persistence
 */
const ThemeManager = {
    STORAGE_KEY: 'portfolio-theme',
    
    /**
     * Toggle between dark and light mode
     */
    toggle() {
        const isDark = document.body.classList.toggle('dark-mode');
        const btn = document.querySelector('.dark-toggle');
        
        if (btn) {
            btn.textContent = isDark ? '☀️' : '🌙';
            btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
        }
        
        localStorage.setItem(this.STORAGE_KEY, isDark ? 'dark' : 'light');
        
        return isDark;
    },
    
    /**
     * Apply saved theme from localStorage
     */
    applySaved() {
        const savedTheme = localStorage.getItem(this.STORAGE_KEY);
        const btn = document.querySelector('.dark-toggle');
        
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-mode');
            if (btn) {
                btn.textContent = '☀️';
                btn.setAttribute('aria-label', 'Switch to light mode');
            }
        } else {
            document.body.classList.remove('dark-mode');
            if (btn) {
                btn.textContent = '🌙';
                btn.setAttribute('aria-label', 'Switch to dark mode');
            }
        }
    }
};

/**
 * Typewriter Effect
 * Creates animated typing effect for hero text
 */
const TypewriterEffect = {
    texts: [
        "I build fast, scalable software solutions.",
        "I design elegant digital logic systems.",
        "I optimize performance for high-stakes gaming."
    ],
    textIndex: 0,
    charIndex: 0,
    element: null,
    
    /**
     * Initialize the typewriter effect
     */
    init() {
        this.element = document.getElementById('typewriter');
        if (this.element) {
            this.type();
        }
    },
    
    /**
     * Type out characters one by one
     */
    type() {
        if (!this.element) return;
        
        const currentText = this.texts[this.textIndex];
        
        if (this.charIndex < currentText.length) {
            this.element.textContent += currentText.charAt(this.charIndex);
            this.charIndex++;
            setTimeout(() => this.type(), 50);
        } else {
            setTimeout(() => this.erase(), 2000);
        }
    },
    
    /**
     * Erase characters one by one
     */
    erase() {
        if (!this.element) return;
        
        if (this.element.textContent.length > 0) {
            this.element.textContent = this.element.textContent.slice(0, -1);
            setTimeout(() => this.erase(), 25);
        } else {
            this.textIndex = (this.textIndex + 1) % this.texts.length;
            this.charIndex = 0;
            setTimeout(() => this.type(), 500);
        }
    }
};

/**
 * Interactive Effects
 * Handles mouse-following blob and 3D text effects
 */
const InteractiveEffects = {
    /**
     * Initialize all interactive effects
     */
    init() {
        const blob = document.querySelector('.blob');
        const helloText = document.querySelector('.hero-right h1');
        
        // Mouse-following blob effect
        document.addEventListener('mousemove', (e) => {
            if (blob) {
                blob.animate({
                    left: `${e.clientX}px`,
                    top: `${e.clientY}px`
                }, {
                    duration: 3000,
                    fill: 'forwards'
                });
            }
            
            // 3D tilt effect on heading
            if (helloText) {
                const xAxis = (window.innerWidth / 2 - e.pageX) / 25;
                const yAxis = (window.innerHeight / 2 - e.pageY) / 25;
                helloText.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
            }
        });
        
        // Reset transform when mouse leaves
        document.addEventListener('mouseleave', () => {
            if (helloText) {
                helloText.style.transform = 'rotateY(0deg) rotateX(0deg)';
            }
        });
    }
};

/**
 * Icon Initialization
 * Initialize Lucide icons if library is loaded
 */
function initIcons() {
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

/**
 * Global Functions
 * Exposed for inline event handlers
 */
function toggleDark() {
    ThemeManager.toggle();
}

/**
 * Initialization
 * Setup everything when DOM is ready
 */
window.addEventListener('load', () => {
    // Apply saved theme immediately
    ThemeManager.applySaved();
    
    // Initialize typewriter effect
    TypewriterEffect.init();
    
    // Initialize interactive effects
    InteractiveEffects.init();
    
    // Initialize icons
    initIcons();
    
    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

// Export for use in other modules if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ThemeManager,
        TypewriterEffect,
        InteractiveEffects
    };
}
