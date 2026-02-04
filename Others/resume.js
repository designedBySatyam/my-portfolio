/**
 * 🎓 RESUME INTERACTIVE LOGIC
 */

document.addEventListener("DOMContentLoaded", () => {
    // 1. Theme Persistence
    // Uses the same key as your main script to keep the look consistent
    const savedTheme = localStorage.getItem("portfolio-theme");
    if (savedTheme === "dark") {
        document.body.classList.add("dark-mode");
    }

    // 2. Initialize Icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
});

/**
 * 🖼️ CERTIFICATE VIEWER
 * Swaps the preview image on the right side when a certificate is clicked.
 */
function showCert(imageSrc) {
    const viewer = document.getElementById('cert-viewer');
    const placeholder = document.getElementById('preview-placeholder');

    if (viewer && placeholder) {
        // Set the new image source
        viewer.src = imageSrc;
        
        // Show the image and hide the placeholder text
        viewer.style.display = 'block';
        placeholder.style.display = 'none';

        // Smooth Fade-in Animation
        viewer.animate([
            { opacity: 0, transform: 'scale(0.95)' },
            { opacity: 1, transform: 'scale(1)' }
        ], {
            duration: 300,
            easing: 'ease-out'
        });
    }
}
document.addEventListener("DOMContentLoaded", () => {
    // 1. Theme Persistence
    const savedTheme = localStorage.getItem("portfolio-theme");
    if (savedTheme === "dark") {
        document.body.classList.add("dark-mode");
    }

    // 2. Initialize Icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // 3. Trigger Mouse Effects from script.js
    if (typeof initInteractions === 'function') {
        initInteractions();
    }
});

function showCert(imageSrc) {
    const viewer = document.getElementById('cert-viewer');
    const placeholder = document.getElementById('preview-placeholder');

    if (viewer && placeholder) {
        viewer.src = imageSrc;
        viewer.style.display = 'block';
        placeholder.style.display = 'none';
        
        viewer.animate([
            { opacity: 0, transform: 'scale(0.95)' },
            { opacity: 1, transform: 'scale(1)' }
        ], { duration: 300, easing: 'ease-out' });
    }
}