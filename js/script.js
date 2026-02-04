/**
 * =============================================
 * PORTFOLIO MAIN JAVASCRIPT
 * =============================================
 */

// ============================================
// THEME MANAGEMENT
// ============================================
function toggleDark() {
    const isDark = document.body.classList.toggle("dark-mode");
    const btn = document.querySelector(".dark-toggle");
    
    if (btn) {
        btn.textContent = isDark ? "☀️" : "🌙";
    }

    // Unified theme key across all pages
    localStorage.setItem("portfolio-theme", isDark ? "dark" : "light");
}

function applySavedTheme() {
    const savedTheme = localStorage.getItem("portfolio-theme");
    const btn = document.querySelector(".dark-toggle");

    if (savedTheme === "dark") {
        document.body.classList.add("dark-mode");
        if (btn) btn.textContent = "☀️";
    } else {
        document.body.classList.remove("dark-mode");
        if (btn) btn.textContent = "🌙";
    }
}

// ============================================
// TYPEWRITER EFFECT
// ============================================
const textArray = [
    "I build fast, scalable software solutions.",
    "I design elegant digital logic systems.",
    "I optimize performance for high-stakes gaming.",
    "I create beautiful, responsive web experiences."
];

let textIndex = 0;
let charIndex = 0;
let isDeleting = false;

function typeEffect() {
    const el = document.getElementById("typewriter");
    if (!el) return;

    const currentFullText = textArray[textIndex];

    if (!isDeleting) {
        // Typing forward
        if (charIndex < currentFullText.length) {
            el.textContent += currentFullText.charAt(charIndex);
            charIndex++;
            setTimeout(typeEffect, 50);
        } else {
            // Pause before deleting
            setTimeout(() => {
                isDeleting = true;
                typeEffect();
            }, 2000);
        }
    } else {
        // Deleting
        if (charIndex > 0) {
            el.textContent = currentFullText.substring(0, charIndex - 1);
            charIndex--;
            setTimeout(typeEffect, 25);
        } else {
            // Move to next text
            isDeleting = false;
            textIndex = (textIndex + 1) % textArray.length;
            setTimeout(typeEffect, 500);
        }
    }
}

// ============================================
// INTERACTIVE BLOB EFFECT
// ============================================
function initBlobEffect() {
    const blob = document.querySelector(".blob");
    
    if (blob) {
        document.addEventListener("mousemove", (e) => {
            const { clientX, clientY } = e;
            
            blob.animate({
                left: `${clientX}px`,
                top: `${clientY}px`
            }, {
                duration: 3000,
                fill: "forwards"
            });
        });
    }
}

// ============================================
// 3D TILT EFFECT ON HEADING
// ============================================
function init3DTilt() {
    const heroText = document.querySelector(".hero-right h1");
    
    if (heroText) {
        document.addEventListener("mousemove", (e) => {
            const { pageX, pageY } = e;
            const xAxis = (window.innerWidth / 2 - pageX) / 25;
            const yAxis = (window.innerHeight / 2 - pageY) / 25;
            
            heroText.style.transform = `perspective(1000px) rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
        });

        // Reset on mouse leave
        document.addEventListener("mouseleave", () => {
            heroText.style.transform = "perspective(1000px) rotateY(0deg) rotateX(0deg)";
        });
    }
}

// ============================================
// SMOOTH SCROLL FOR ANCHOR LINKS
// ============================================
function initSmoothScroll() {
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
}

// ============================================
// INITIALIZATION
// ============================================
window.addEventListener("load", () => {
    // Apply saved theme
    applySavedTheme();
    
    // Start typewriter effect
    typeEffect();
    
    // Initialize interactive effects
    initBlobEffect();
    init3DTilt();
    initSmoothScroll();
    
    // Add loaded class for animations
    document.body.classList.add('loaded');
});

// ============================================
// EXPORT FUNCTIONS FOR OTHER PAGES
// ============================================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        toggleDark,
        applySavedTheme
    };
}
