/**
 * ============================================
 * RESUME PAGE INTERACTIONS
 * ============================================
 */

// Skill Bar Animations
class SkillAnimations {
    constructor() {
        this.skillItems = document.querySelectorAll('.skill-item');
        this.init();
    }

    init() {
        if (this.skillItems.length === 0) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateSkill(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.5
        });

        this.skillItems.forEach(item => observer.observe(item));
    }

    animateSkill(skillItem) {
        const skillFill = skillItem.querySelector('.skill-fill');
        if (skillFill) {
            // Adding the class triggers the CSS skillGrow animation
            skillFill.classList.add('animate');
        }
    }
}

// Timeline Animations
class TimelineAnimations {
    constructor() {
        this.timelineItems = document.querySelectorAll('.timeline-item');
        this.timeline = document.querySelector('.timeline');
        this.init();
    }

    init() {
        if (this.timelineItems.length === 0) return;

        // Observe the timeline container to trigger the line drawing
        if (this.timeline) {
            const lineObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('line-visible');
                        lineObserver.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.15 });
            lineObserver.observe(this.timeline);
        }

        // Observe individual items for slide-in
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                }
            });
        }, {
            threshold: 0.3
        });

        this.timelineItems.forEach(item => observer.observe(item));
    }
}

// Download Button Analytics
class DownloadTracking {
    constructor() {
        this.downloadBtn = document.querySelector('.download-btn');
        this.init();
    }

    init() {
        if (!this.downloadBtn) return;

        this.downloadBtn.addEventListener('click', () => {
            console.log('Resume downloaded');
            this.showDownloadFeedback();
        });
    }

    showDownloadFeedback() {
        const originalText = this.downloadBtn.dataset.label || 'DOWNLOAD CV';
        this.downloadBtn.dataset.label = originalText; // persist on first click

        // Replace only the text node, leave the SVG intact
        const textNode = [...this.downloadBtn.childNodes]
            .find(n => n.nodeType === Node.TEXT_NODE && n.textContent.trim());

        if (textNode) {
            textNode.textContent = ' DOWNLOADING...';
            setTimeout(() => {
                textNode.textContent = ' DOWNLOADED!';
                setTimeout(() => { textNode.textContent = ` ${originalText}`; }, 2000);
            }, 1000);
        }
    }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    new SkillAnimations();
    new TimelineAnimations();
    new DownloadTracking();
});