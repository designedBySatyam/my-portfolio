'use strict';

/**
 * command-palette.js
 * Press "/" or "Ctrl+K" to open a spotlight-style command palette.
 * Allows: page navigation, theme toggle, copy email, open socials.
 */

(() => {
  const inPages = window.location.pathname.includes('/pages/');
  const root    = inPages ? '../' : '';

  const COMMANDS = [
    {
      id: 'home',
      label: 'Go to Home',
      hint: 'Navigate',
      icon: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
      action: () => navigate(`${root}index.html`)
    },
    {
      id: 'resume',
      label: 'Go to Resume',
      hint: 'Navigate',
      icon: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`,
      action: () => navigate(`${root}pages/resume.html`)
    },
    {
      id: 'work',
      label: 'Go to Work',
      hint: 'Navigate',
      icon: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="9" x2="15" y2="9"/><line x1="9" y1="15" x2="15" y2="15"/></svg>`,
      action: () => navigate(`${root}pages/work.html`)
    },
    {
      id: 'contact',
      label: 'Go to Contact',
      hint: 'Navigate',
      icon: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`,
      action: () => navigate(`${root}pages/contact.html`)
    },
    {
      id: 'theme',
      label: 'Toggle Theme',
      hint: 'Appearance',
      icon: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/></svg>`,
      action: () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next    = current === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', next);
        try { localStorage.setItem('portfolio-theme', next); } catch (_) {}
        window.dispatchEvent(new CustomEvent('portfolio-theme-change', { detail: { theme: next } }));
      }
    },
    {
      id: 'copy-email',
      label: 'Copy Email Address',
      hint: 'Action',
      icon: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`,
      action: () => {
        navigator.clipboard?.writeText('hello.satyam27@gmail.com')
          .then(() => showToast('Email copied!'))
          .catch(() => showToast('hello.satyam27@gmail.com'));
      }
    },
    {
      id: 'github',
      label: 'Open GitHub',
      hint: 'Social',
      icon: `<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>`,
      action: () => window.open('https://github.com/designedBySatyam', '_blank', 'noopener')
    },
    {
      id: 'linkedin',
      label: 'Open LinkedIn',
      hint: 'Social',
      icon: `<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>`,
      action: () => window.open('https://www.linkedin.com/in/satyampandey27', '_blank', 'noopener')
    },
    {
      id: 'download-cv',
      label: 'Download CV',
      hint: 'Action',
      icon: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
      action: () => {
        const a = document.createElement('a');
        a.href = 'https://raw.githubusercontent.com/designedBySatyam/assets/main/pdfs/Satyam_Pandey_Resume.pdf';
        a.download = 'Satyam_Pandey_Resume.pdf';
        a.click();
      }
    },
  ];

  /* ── Build DOM ───────────────────────────────────────── */
  function buildPalette() {
    if (document.getElementById('cmdPalette')) return;

    const overlay = document.createElement('div');
    overlay.id        = 'cmdOverlay';
    overlay.className = 'cmd-overlay';
    overlay.setAttribute('aria-hidden', 'true');

    overlay.innerHTML = `
      <div class="cmd-palette" id="cmdPalette" role="dialog" aria-modal="true" aria-label="Command palette">
        <div class="cmd-search-wrap">
          <svg class="cmd-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            id="cmdInput"
            class="cmd-input"
            placeholder="Type a command or search…"
            autocomplete="off"
            spellcheck="false"
          >
          <kbd class="cmd-esc-hint">ESC</kbd>
        </div>
        <div class="cmd-results" id="cmdResults" role="listbox"></div>
        <div class="cmd-footer">
          <span><kbd>↑</kbd><kbd>↓</kbd> navigate</span>
          <span><kbd>↵</kbd> select</span>
          <span><kbd>/</kbd> or <kbd>Ctrl K</kbd> open</span>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    overlay.addEventListener('click', (e) => {
      if (!e.target.closest('#cmdPalette')) close();
    });

    document.getElementById('cmdInput').addEventListener('input', renderResults);
    document.getElementById('cmdInput').addEventListener('keydown', onKeydown);
  }

  /* ── Render results ──────────────────────────────────── */
  let activeIdx = 0;
  let filtered  = [];

  function renderResults() {
    const q    = (document.getElementById('cmdInput')?.value || '').toLowerCase().trim();
    const list = document.getElementById('cmdResults');
    if (!list) return;

    filtered = q
      ? COMMANDS.filter(c => c.label.toLowerCase().includes(q) || c.hint.toLowerCase().includes(q))
      : COMMANDS;

    activeIdx = 0;

    // Group by hint
    const groups = {};
    filtered.forEach(cmd => {
      if (!groups[cmd.hint]) groups[cmd.hint] = [];
      groups[cmd.hint].push(cmd);
    });

    list.innerHTML = Object.entries(groups).map(([group, cmds]) => `
      <div class="cmd-group">
        <div class="cmd-group-label">${group}</div>
        ${cmds.map((cmd, i) => {
          const globalIdx = filtered.indexOf(cmd);
          return `
            <button class="cmd-item ${globalIdx === 0 ? 'cmd-item-active' : ''}"
                    data-idx="${globalIdx}"
                    role="option"
                    aria-selected="${globalIdx === 0}">
              <span class="cmd-item-icon">${cmd.icon}</span>
              <span class="cmd-item-label">${cmd.label}</span>
            </button>
          `;
        }).join('')}
      </div>
    `).join('') || `
      <div class="cmd-no-results">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.4">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          <line x1="8" y1="11" x2="14" y2="11"/>
        </svg>
        <span>No results for "<strong>${q}</strong>"</span>
      </div>
    `;

    list.querySelectorAll('.cmd-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.idx, 10);
        if (!isNaN(idx) && filtered[idx]) {
          close();
          setTimeout(() => filtered[idx].action(), 120);
        }
      });
      btn.addEventListener('mouseenter', () => {
        setActive(parseInt(btn.dataset.idx, 10));
      });
    });
  }

  function setActive(idx) {
    const list = document.getElementById('cmdResults');
    if (!list) return;
    activeIdx = Math.max(0, Math.min(idx, filtered.length - 1));
    list.querySelectorAll('.cmd-item').forEach(btn => {
      const active = parseInt(btn.dataset.idx, 10) === activeIdx;
      btn.classList.toggle('cmd-item-active', active);
      btn.setAttribute('aria-selected', active);
      if (active) btn.scrollIntoView({ block: 'nearest' });
    });
  }

  function onKeydown(e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(activeIdx + 1); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setActive(activeIdx - 1); }
    if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[activeIdx]) {
        close();
        setTimeout(() => filtered[activeIdx].action(), 120);
      }
    }
  }

  /* ── Open / Close ────────────────────────────────────── */
  function open() {
    const overlay = document.getElementById('cmdOverlay');
    if (!overlay) return;
    overlay.classList.add('cmd-open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    const input = document.getElementById('cmdInput');
    if (input) { input.value = ''; input.focus(); }
    renderResults();
  }

  function close() {
    const overlay = document.getElementById('cmdOverlay');
    if (!overlay) return;
    overlay.classList.remove('cmd-open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  /* ── Global shortcuts ────────────────────────────────── */
  document.addEventListener('keydown', (e) => {
    const active = document.activeElement;
    const inInput = active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable);

    if ((e.key === '/' && !inInput) || (e.key === 'k' && (e.ctrlKey || e.metaKey))) {
      e.preventDefault();
      const overlay = document.getElementById('cmdOverlay');
      if (overlay?.classList.contains('cmd-open')) { close(); } else { open(); }
    }
    if (e.key === 'Escape') close();
  });

  /* ── Toast ───────────────────────────────────────────── */
  function showToast(msg) {
    let t = document.getElementById('cmdToast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'cmdToast';
      t.className = 'cmd-toast';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add('cmd-toast-show');
    clearTimeout(t._timer);
    t._timer = setTimeout(() => t.classList.remove('cmd-toast-show'), 2200);
  }

  /* ── Navigation helper ───────────────────────────────── */
  function navigate(url) {
    document.documentElement.classList.add('page-exit');
    setTimeout(() => { window.location.href = url; }, 220);
  }

  /* ── Hint badge in nav ───────────────────────────────── */
  function addNavHint() {
    const nav = document.querySelector('.nav-right-controls');
    if (!nav || document.getElementById('cmdHintBtn')) return;
    const btn = document.createElement('button');
    btn.id        = 'cmdHintBtn';
    btn.className = 'cmd-hint-btn';
    btn.setAttribute('aria-label', 'Open command palette');
    btn.innerHTML = `<kbd>/</kbd>`;
    btn.addEventListener('click', open);
    nav.prepend(btn);
  }

  /* ── Init ────────────────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { buildPalette(); addNavHint(); });
  } else {
    buildPalette(); addNavHint();
  }

})();