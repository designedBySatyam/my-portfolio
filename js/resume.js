/**
 * ============================================
 * RESUME PAGE INTERACTIONS
 * ============================================
 */

// Skill Bar Animations + Typewriter on skill names
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
        // Animate the bar fill
        const skillFill = skillItem.querySelector('.skill-fill');
        if (skillFill) skillFill.classList.add('animate');

        // Typewriter on skill label (text node before the <span>)
        const iconEl = skillItem.querySelector('.skill-icon');
        if (!iconEl) return;

        const textNode = [...iconEl.childNodes].find(
            n => n.nodeType === Node.TEXT_NODE && n.textContent.trim()
        );
        if (!textNode) return;

        const fullText = textNode.textContent.trim();
        textNode.textContent = '';

        let i = 0;
        const speed = 42;
        const type = () => {
            if (i <= fullText.length) {
                textNode.textContent = fullText.slice(0, i) + (i < fullText.length ? '|' : '');
                i++;
                setTimeout(type, speed);
            } else {
                textNode.textContent = fullText;
            }
        };
        setTimeout(type, 120);
    }
}

// Timeline Animations
class TimelineAnimations {
    constructor() {
        this.timelineItems = document.querySelectorAll('.timeline-item');
        this.init();
    }

    init() {
        if (this.timelineItems.length === 0) return;

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



/* ══════════════════════════════════════════════════
   LEETCODE STATS
══════════════════════════════════════════════════ */
class LeetCodeStats {
    constructor() {
        this.grid     = document.getElementById('lcStatsGrid');
        this.username = 'satyam-pandey27';
        this.init();
    }

    async init() {
        if (!this.grid) return;

        // Use alfa-leetcode-api (free, no auth)
        const url = `https://alfa-leetcode-api.onrender.com/${this.username}/solved`;

        try {
            const res  = await fetch(url, { signal: AbortSignal.timeout(8000) });
            if (!res.ok) throw new Error('API error');
            const data = await res.json();
            this.render(data);
        } catch (_) {
            // Fallback: use leetcode-stats-api
            try {
                const res2 = await fetch(
                    `https://leetcode-stats-api.herokuapp.com/${this.username}`,
                    { signal: AbortSignal.timeout(8000) }
                );
                if (!res2.ok) throw new Error();
                const data2 = await res2.json();
                this.renderFallback(data2);
            } catch (_2) {
                this.showError();
            }
        }
    }

    render(data) {
        const total = data.solvedProblem || 0;
        const easy  = data.easySolved   || 0;
        const med   = data.mediumSolved || 0;
        const hard  = data.hardSolved   || 0;

        this.grid.innerHTML = `
            <div class="lc-stat-card">
                <span class="lc-stat-num">${total}</span>
                <span class="lc-stat-label">Total Solved</span>
                <div class="lc-progress-bar">
                    <div class="lc-progress-fill lc-total" style="--lc-w:${Math.min((total/800)*100,100)}%"></div>
                </div>
            </div>
            <div class="lc-stat-card lc-easy">
                <span class="lc-stat-num">${easy}</span>
                <span class="lc-stat-label">Easy</span>
                <div class="lc-progress-bar">
                    <div class="lc-progress-fill lc-easy-fill" style="--lc-w:${Math.min((easy/200)*100,100)}%"></div>
                </div>
            </div>
            <div class="lc-stat-card lc-medium">
                <span class="lc-stat-num">${med}</span>
                <span class="lc-stat-label">Medium</span>
                <div class="lc-progress-bar">
                    <div class="lc-progress-fill lc-med-fill" style="--lc-w:${Math.min((med/400)*100,100)}%"></div>
                </div>
            </div>
            <div class="lc-stat-card lc-hard">
                <span class="lc-stat-num">${hard}</span>
                <span class="lc-stat-label">Hard</span>
                <div class="lc-progress-bar">
                    <div class="lc-progress-fill lc-hard-fill" style="--lc-w:${Math.min((hard/200)*100,100)}%"></div>
                </div>
            </div>
        `;

        // Animate bars in
        requestAnimationFrame(() => {
            this.grid.querySelectorAll('.lc-progress-fill').forEach((el, i) => {
                setTimeout(() => el.classList.add('lc-animate'), i * 120);
            });
        });
    }

    renderFallback(data) {
        // leetcode-stats-api schema
        this.render({
            solvedProblem: data.totalSolved   || 0,
            easySolved:    data.easySolved    || 0,
            mediumSolved:  data.mediumSolved  || 0,
            hardSolved:    data.hardSolved    || 0
        });
    }

    showError() {
        if (!this.grid) return;
        this.grid.innerHTML = `
            <div class="lc-loading">
                <p style="color:var(--text-dim);font-size:.8rem;font-family:var(--font-mono)">
                    Stats unavailable — LeetCode API may be offline
                </p>
            </div>
        `;
    }
}


/* ══════════════════════════════════════════════════
   CHAPTER NAV SCROLL SPY
══════════════════════════════════════════════════ */
(function initChapterSpy() {
  const links    = document.querySelectorAll('.ch-link');
  if (!links.length) return;

  const sections = [...links].map(l => {
    const id = l.dataset.section;
    return { el: document.getElementById(id), link: l };
  }).filter(s => s.el);

  const activate = (id) => {
    links.forEach(l => l.classList.toggle('active', l.dataset.section === id));
  };

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) activate(entry.target.id);
    });
  }, { threshold: 0.25, rootMargin: '-60px 0px -40% 0px' });

  sections.forEach(s => obs.observe(s.el));
})();

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    new SkillAnimations();
    new TimelineAnimations();
    new DownloadTracking();
    new LeetCodeStats();
});