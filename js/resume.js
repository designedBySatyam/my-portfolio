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
        this.username = 'designedbysatyam';
        this.cacheKey = `lcStats:${this.username}`;
        this.cacheTtl = 1000 * 60 * 60 * 24;
        this.init();
    }

    async init() {
        if (!this.grid) return;

        const cached = this.readCache();
        if (cached) this.render(cached);

        const fetchers = [
            () => this.fetchFromAlfa(),
            () => this.fetchFromPied(),
            () => this.fetchFromHeroku()
        ];

        for (const fetcher of fetchers) {
            try {
                const stats = await fetcher();
                if (!stats) continue;
                this.writeCache(stats);
                this.render(stats);
                return;
            } catch (_) {
                // Continue fallback chain.
            }
        }

        if (!cached) this.showError();
    }

    async fetchJson(url) {
        const timeoutMs = 9000;

        if (typeof AbortController === 'function') {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

            try {
                const response = await fetch(url, {
                    signal: controller.signal,
                    cache: 'no-store'
                });
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                return await response.json();
            } finally {
                clearTimeout(timeoutId);
            }
        }

        const response = await fetch(url, { cache: 'no-store' });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    }

    normalizeStats(raw) {
        if (!raw) return null;

        const total = Number(raw.solvedProblem ?? raw.totalSolved ?? raw.total ?? raw.all ?? 0);
        const easy  = Number(raw.easySolved ?? raw.easy ?? 0);
        const med   = Number(raw.mediumSolved ?? raw.medium ?? 0);
        const hard  = Number(raw.hardSolved ?? raw.hard ?? 0);

        if ([total, easy, med, hard].some(Number.isNaN)) return null;

        return {
            solvedProblem: total,
            easySolved: easy,
            mediumSolved: med,
            hardSolved: hard
        };
    }

    async fetchFromAlfa() {
        const data = await this.fetchJson(`https://alfa-leetcode-api.onrender.com/${this.username}/solved`);
        return this.normalizeStats(data);
    }

    async fetchFromHeroku() {
        const data = await this.fetchJson(`https://leetcode-stats-api.herokuapp.com/${this.username}`);
        return this.normalizeStats(data);
    }

    async fetchFromPied() {
        const data = await this.fetchJson(`https://leetcode-api-pied.vercel.app/user/${this.username}`);
        const ac = data?.submitStats?.acSubmissionNum;
        if (!Array.isArray(ac)) return null;

        const byDifficulty = (label) => {
            const item = ac.find((entry) => entry?.difficulty === label);
            return Number(item?.count ?? 0);
        };

        return this.normalizeStats({
            totalSolved: byDifficulty('All'),
            easySolved: byDifficulty('Easy'),
            mediumSolved: byDifficulty('Medium'),
            hardSolved: byDifficulty('Hard')
        });
    }

    readCache() {
        try {
            const raw = localStorage.getItem(this.cacheKey);
            if (!raw) return null;
            const parsed = JSON.parse(raw);
            if (!parsed?.data || !parsed?.updatedAt) return null;

            const age = Date.now() - Number(parsed.updatedAt);
            if (!Number.isFinite(age) || age > this.cacheTtl) return null;

            return this.normalizeStats(parsed.data);
        } catch (_) {
            return null;
        }
    }

    writeCache(data) {
        try {
            localStorage.setItem(
                this.cacheKey,
                JSON.stringify({ data, updatedAt: Date.now() })
            );
        } catch (_) {
            // Ignore private mode/quota write failures.
        }
    }

    updateGoals(data) {
        if (!data) return;
        this.setGoal('lcGoalTotal', data.solvedProblem || 0, 250);
        this.setGoal('lcGoalMedium', data.mediumSolved || 0, 140);
        this.setGoal('lcGoalHard', data.hardSolved || 0, 50);
    }

    setGoal(prefix, current, target) {
        const safeCurrent = Number.isFinite(current) ? current : 0;
        const text = document.getElementById(`${prefix}Text`);
        const fill = document.getElementById(`${prefix}Fill`);

        if (text) text.textContent = `${safeCurrent} / ${target}`;
        if (fill) {
            const width = Math.min((safeCurrent / target) * 100, 100);
            fill.style.setProperty('--goal-w', `${width}%`);
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

        requestAnimationFrame(() => {
            this.grid.querySelectorAll('.lc-progress-fill').forEach((el, i) => {
                setTimeout(() => el.classList.add('lc-animate'), i * 120);
            });
        });

        this.updateGoals({
            solvedProblem: total,
            mediumSolved: med,
            hardSolved: hard
        });
    }

    showError() {
        if (!this.grid) return;
        this.grid.innerHTML = `
            <div class="lc-loading">
                <p style="color:var(--text-dim);font-size:.8rem;font-family:var(--font-mono)">
                    Stats unavailable. Open profile to verify latest activity.
                </p>
            </div>
        `;
    }
}

/*
   CHAPTER NAV SCROLL SPY
*/
function initChapterSpy() {
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
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    new SkillAnimations();
    new TimelineAnimations();
    new DownloadTracking();
    new LeetCodeStats();
    initChapterSpy();
});