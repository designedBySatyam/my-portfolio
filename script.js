/**
 * 🌙 UNIFIED THEME MANAGEMENT
 */
function toggleDark() {
    const isDark = document.body.classList.toggle("dark-mode");
    const btn = document.querySelector(".dark-toggle");
    
    if (btn) btn.textContent = isDark ? "☀️" : "🌙";

    // Use a single, consistent key for all pages
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

/**
 * ⌨️ TYPEWRITER EFFECT
 */
const textArray = [
    "I build fast, scalable software solutions.",
    "I design elegant digital logic systems.",
    "I optimize performance for high-stakes gaming."
];
let textIndex = 0;
let charIndex = 0;

function typeEffect() {
    const el = document.getElementById("typewriter");
    if (!el) return; // Prevents errors on pages without a typewriter element

    const currentFullText = textArray[textIndex];
    if (charIndex < currentFullText.length) {
        el.innerHTML += currentFullText.charAt(charIndex);
        charIndex++;
        setTimeout(typeEffect, 50);
    } else {
        setTimeout(eraseEffect, 2000);
    }
}

function eraseEffect() {
    const el = document.getElementById("typewriter");
    if (!el) return;

    if (el.innerHTML.length > 0) {
        el.innerHTML = el.innerHTML.slice(0, -1);
        setTimeout(eraseEffect, 25);
    } else {
        textIndex = (textIndex + 1) % textArray.length;
        charIndex = 0;
        setTimeout(typeEffect, 500);
    }
}

/**
 * 🖱️ INTERACTIVE EFFECTS
 */
function initInteractions() {
    const blob = document.querySelector(".blob");
    const helloText = document.querySelector(".hero-right h1");

    document.addEventListener("mousemove", (e) => {
        const { clientX, clientY, pageX, pageY } = e;

        if (blob) {
            blob.animate({
                left: `${clientX}px`,
                top: `${clientY}px`
            }, { duration: 3000, fill: "forwards" });
        }

        if (helloText) {
            let xAxis = (window.innerWidth / 2 - pageX) / 25;
            let yAxis = (window.innerHeight / 2 - pageY) / 25;
            helloText.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
        }
    });
}

/**
 * 🚀 INITIALIZATION
 */
window.addEventListener("load", () => {
    applySavedTheme();
    typeEffect();
    initInteractions();
    
    // Initialize Lucide icons if the library is loaded
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
});