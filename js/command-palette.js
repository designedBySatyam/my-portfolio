'use strict';

/**
 * command-palette.js
 * Press "/" or "Ctrl+K" to open the command palette.
 * Supports navigation, quick actions, and social links.
 */

(() => {
  function resolveRoutes() {
    if (window.PortfolioRoutes && typeof window.PortfolioRoutes === 'object') {
      return window.PortfolioRoutes;
    }

    const pathname = window.location.pathname || '/';
    const pagesIndex = pathname.indexOf('/pages/');
    let basePath = '/';

    if (pagesIndex >= 0) {
      basePath = pathname.slice(0, pagesIndex) || '/';
    } else if (pathname.endsWith('/')) {
      basePath = pathname;
    } else {
      basePath = pathname.replace(/[^/]*$/, '');
    }

    if (!basePath.startsWith('/')) basePath = `/${basePath}`;
    if (!basePath.endsWith('/')) basePath = `${basePath}/`;

    return {
      base: basePath,
      home: `${basePath}index.html`,
      resume: `${basePath}pages/resume.html`,
      work: `${basePath}pages/work.html`,
      contact: `${basePath}pages/contact.html`
    };
  }

  const routes = resolveRoutes();
  const GROUP_ORDER = ['Navigate', 'Appearance', 'Action', 'Social'];
  const PRIMARY_KEY = /Mac|iPhone|iPad|iPod/.test(navigator.platform) ? 'Cmd' : 'Ctrl';

  const COMMANDS = [
    {
      id: 'home',
      label: 'Go to Home',
      group: 'Navigate',
      description: 'Open the landing page.',
      keywords: ['index', 'start', 'landing'],
      shortcut: 'H',
      icon: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
      action: () => navigate(routes.home)
    },
    {
      id: 'resume',
      label: 'Go to Resume',
      group: 'Navigate',
      description: 'Jump to your profile timeline.',
      keywords: ['cv', 'about', 'skills'],
      shortcut: 'R',
      icon: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`,
      action: () => navigate(routes.resume)
    },
    {
      id: 'work',
      label: 'Go to Work',
      group: 'Navigate',
      description: 'Open your projects and certificates.',
      keywords: ['projects', 'portfolio', 'builds'],
      shortcut: 'W',
      icon: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="9" x2="15" y2="9"/><line x1="9" y1="15" x2="15" y2="15"/></svg>`,
      action: () => navigate(routes.work)
    },
    {
      id: 'contact',
      label: 'Go to Contact',
      group: 'Navigate',
      description: 'Open contact channels and links.',
      keywords: ['mail', 'message', 'reach'],
      shortcut: 'C',
      icon: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`,
      action: () => navigate(routes.contact)
    },
    {
      id: 'theme',
      label: 'Toggle Theme',
      group: 'Appearance',
      description: 'Switch between light and dark mode.',
      keywords: ['mode', 'light', 'dark'],
      icon: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/></svg>`,
      action: () => {
        if (window.PortfolioTheme?.toggle) {
          window.PortfolioTheme.toggle({ persist: true, animate: true });
          return;
        }
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', next);
        try { localStorage.setItem('portfolio-theme', next); } catch (_) {}
        window.dispatchEvent(new CustomEvent('portfolio-theme-change', { detail: { theme: next } }));
      }
    },
    {
      id: 'copy-email',
      label: 'Copy Email Address',
      group: 'Action',
      description: 'Copy hello.satyam27@gmail.com.',
      keywords: ['email', 'copy', 'mail'],
      shortcut: 'E',
      icon: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`,
      action: () => {
        navigator.clipboard?.writeText('hello.satyam27@gmail.com')
          .then(() => showToast('Email copied.'))
          .catch(() => showToast('hello.satyam27@gmail.com'));
      }
    },
    {
      id: 'download-cv',
      label: 'Download CV',
      group: 'Action',
      description: 'Download the latest resume PDF.',
      keywords: ['resume', 'pdf', 'download'],
      icon: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
      action: () => {
        const a = document.createElement('a');
        a.href = 'https://raw.githubusercontent.com/designedBySatyam/assets/main/pdfs/Satyam_Pandey_Resume.pdf';
        a.download = 'Satyam_Pandey_Resume.pdf';
        a.click();
      }
    },
    {
      id: 'github',
      label: 'Open GitHub',
      group: 'Social',
      description: 'Open github.com/designedBySatyam.',
      keywords: ['repo', 'code', 'profile'],
      icon: `<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>`,
      action: () => window.open('https://github.com/designedBySatyam', '_blank', 'noopener')
    },
    {
      id: 'linkedin',
      label: 'Open LinkedIn',
      group: 'Social',
      description: 'Open your LinkedIn profile page.',
      keywords: ['network', 'career', 'social'],
      icon: `<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>`,
      action: () => window.open('https://www.linkedin.com/in/satyampandey27', '_blank', 'noopener')
    }
  ];

  let activeIdx = 0;
  let filtered = [];

  function buildPalette() {
    if (document.getElementById('cmdPalette')) return;

    const overlay = document.createElement('div');
    overlay.id = 'cmdOverlay';
    overlay.className = 'cmd-overlay';
    overlay.setAttribute('aria-hidden', 'true');

    overlay.innerHTML = `
      <div class="cmd-palette" id="cmdPalette" role="dialog" aria-modal="true" aria-label="Command palette">
        <div class="cmd-head">
          <span class="cmd-kicker">Search</span>
          <span class="cmd-head-shortcut"><kbd>${PRIMARY_KEY}</kbd><span>+</span><kbd>K</kbd></span>
        </div>
        <div class="cmd-search-wrap">
          <svg class="cmd-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            id="cmdInput"
            class="cmd-input"
            placeholder="Type a command, page, or action..."
            autocomplete="off"
            spellcheck="false"
          >
        </div>
        <div class="cmd-results" id="cmdResults" role="listbox"></div>
        <div class="cmd-footer">
          <span><kbd>Up</kbd><kbd>Down</kbd> navigate</span>
          <span><kbd>Enter</kbd> run</span>
          <span><kbd>/</kbd> or <kbd>${PRIMARY_KEY} K</kbd> open</span>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    overlay.addEventListener('click', (event) => {
      if (!event.target.closest('#cmdPalette')) close();
    });

    const input = document.getElementById('cmdInput');
    input?.addEventListener('input', renderResults);
    input?.addEventListener('keydown', onKeydown);
  }

  function tokenize(query) {
    return query.split(/\s+/).map((token) => token.trim()).filter(Boolean);
  }

  function scoreCommand(command, tokens) {
    const label = command.label.toLowerCase();
    const group = command.group.toLowerCase();
    const description = command.description.toLowerCase();
    const keywords = (command.keywords || []).join(' ').toLowerCase();

    let score = 0;

    for (const token of tokens) {
      let tokenScore = 0;

      if (label.startsWith(token)) tokenScore = Math.max(tokenScore, 9);
      if (label.includes(token)) tokenScore = Math.max(tokenScore, 6);
      if (description.includes(token)) tokenScore = Math.max(tokenScore, 4);
      if (keywords.includes(token)) tokenScore = Math.max(tokenScore, 3);
      if (group.includes(token)) tokenScore = Math.max(tokenScore, 2);

      if (!tokenScore) return 0;
      score += tokenScore;
    }

    return score;
  }

  function searchCommands(tokens) {
    return COMMANDS
      .map((command, idx) => ({
        command,
        idx,
        score: scoreCommand(command, tokens)
      }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.idx - b.idx;
      })
      .map((entry) => entry.command);
  }

  function groupCommands(commands) {
    const groups = new Map();
    GROUP_ORDER.forEach((group) => groups.set(group, []));

    commands.forEach((command) => {
      if (!groups.has(command.group)) groups.set(command.group, []);
      groups.get(command.group).push(command);
    });

    return Array.from(groups.entries()).filter(([, list]) => list.length > 0);
  }

  function commandItemMarkup(command, idx, isActive) {
    return `
      <button class="cmd-item ${isActive ? 'cmd-item-active' : ''}"
              data-idx="${idx}"
              role="option"
              aria-selected="${isActive}">
        <span class="cmd-item-icon">${command.icon}</span>
        <span class="cmd-item-content">
          <span class="cmd-item-label">${command.label}</span>
          <span class="cmd-item-desc">${command.description}</span>
        </span>
        <span class="cmd-item-trail">
          ${command.shortcut ? `<kbd class="cmd-item-kbd">${command.shortcut}</kbd>` : ''}
          <svg class="cmd-item-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </span>
      </button>
    `;
  }

  function gridItemMarkup(command, idx, isActive) {
    return `
      <button class="cmd-grid-item ${isActive ? 'cmd-item-active' : ''}"
              data-idx="${idx}"
              role="option"
              aria-selected="${isActive}">
        <span class="cmd-grid-icon">${command.icon}</span>
        <span class="cmd-grid-label">${command.label.replace('Go to ', '')}</span>
      </button>
    `;
  }

  function noResultsMarkup(query) {
    const safeQuery = escapeHtml(query);
    return `
      <div class="cmd-no-results">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.5">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <span>No matching command for "<strong>${safeQuery}</strong>"</span>
      </div>
    `;
  }

  function renderResults() {
    const query = (document.getElementById('cmdInput')?.value || '').toLowerCase().trim();
    const list = document.getElementById('cmdResults');
    if (!list) return;

    const tokens = tokenize(query);
    filtered = tokens.length ? searchCommands(tokens) : COMMANDS.slice();
    activeIdx = 0;

    if (!filtered.length) {
      list.innerHTML = noResultsMarkup(query);
      return;
    }

    const grouped = groupCommands(filtered);
    const idxById = new Map(filtered.map((command, idx) => [command.id, idx]));

    list.innerHTML = grouped.map(([group, commands]) => `
      <div class="cmd-group">
        <div class="cmd-group-label">
          <span>${group}</span>
          <span class="cmd-group-count">${commands.length}</span>
        </div>
        ${commands.map((command) => {
          const idx = idxById.get(command.id);
          return commandItemMarkup(command, idx, idx === activeIdx);
        }).join('')}
      </div>
    `).join('');

    list.querySelectorAll('.cmd-item').forEach((button) => {
      button.addEventListener('click', () => {
        const idx = Number.parseInt(button.dataset.idx || '', 10);
        activateCommand(idx);
      });

      button.addEventListener('mouseenter', () => {
        const idx = Number.parseInt(button.dataset.idx || '', 10);
        if (!Number.isNaN(idx)) setActive(idx);
      });
    });
  }

  function activateCommand(idx) {
    if (!Number.isInteger(idx) || !filtered[idx]) return;
    close();
    setTimeout(() => filtered[idx].action(), 120);
  }

  function setActive(idx) {
    if (!filtered.length) return;

    const list = document.getElementById('cmdResults');
    if (!list) return;

    activeIdx = Math.max(0, Math.min(idx, filtered.length - 1));

    list.querySelectorAll('.cmd-item').forEach((button) => {
      const isActive = Number.parseInt(button.dataset.idx || '', 10) === activeIdx;
      button.classList.toggle('cmd-item-active', isActive);
      button.setAttribute('aria-selected', String(isActive));
      if (isActive) button.scrollIntoView({ block: 'nearest' });
    });
  }

  function onKeydown(event) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActive(activeIdx + 1);
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActive(activeIdx - 1);
      return;
    }

    if (event.key === 'Tab') {
      event.preventDefault();
      setActive(activeIdx + (event.shiftKey ? -1 : 1));
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      activateCommand(activeIdx);
    }
  }

  function open() {
    const overlay = document.getElementById('cmdOverlay');
    if (!overlay) return;

    overlay.classList.add('cmd-open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    const input = document.getElementById('cmdInput');
    if (input) {
      input.value = '';
      input.focus();
    }

    renderResults();
  }

  function close() {
    const overlay = document.getElementById('cmdOverlay');
    if (!overlay) return;

    overlay.classList.remove('cmd-open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  document.addEventListener('keydown', (event) => {
    const activeElement = document.activeElement;
    const inInput = activeElement && (
      activeElement.tagName === 'INPUT' ||
      activeElement.tagName === 'TEXTAREA' ||
      activeElement.isContentEditable
    );

    const key = event.key.toLowerCase();
    const triggerSlash = key === '/' && !inInput && !event.ctrlKey && !event.metaKey && !event.altKey;
    const triggerPalette = key === 'k' && (event.ctrlKey || event.metaKey);

    if (triggerSlash || triggerPalette) {
      event.preventDefault();
      const overlay = document.getElementById('cmdOverlay');
      if (overlay?.classList.contains('cmd-open')) {
        close();
      } else {
        open();
      }
      return;
    }

    if (event.key === 'Escape') {
      const overlay = document.getElementById('cmdOverlay');
      if (overlay?.classList.contains('cmd-open')) close();
    }
  });

  function showToast(message) {
    let toast = document.getElementById('cmdToast');

    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'cmdToast';
      toast.className = 'cmd-toast';
      document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.add('cmd-toast-show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove('cmd-toast-show'), 2200);
  }

  function navigate(url) {
    document.documentElement.classList.add('page-exit');
    setTimeout(() => { window.location.href = url; }, 220);
  }

  function addNavHint() {
    const nav = document.querySelector('.nav-right-controls');
    if (!nav || document.getElementById('cmdHintBtn')) return;

    const button = document.createElement('button');
    button.id = 'cmdHintBtn';
    button.className = 'cmd-hint-btn';
    button.setAttribute('aria-label', 'Open command palette');
    button.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
    `;
    button.addEventListener('click', open);
    nav.prepend(button);
  }

  function escapeHtml(text) {
    return text.replace(/[&<>"']/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[char]));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      buildPalette();
      addNavHint();
    });
  } else {
    buildPalette();
    addNavHint();
  }
})();
