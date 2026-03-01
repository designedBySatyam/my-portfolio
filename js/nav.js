/**
 * nav.js — Portfolio Navigation Component
 * Injects <nav> into any page with <div id="site-nav"></div>.
 * Handles active links, theme toggle, and mobile hamburger menu.
 */

(() => {
  'use strict';

  /* ── Path resolution ────────────────────────────────────────
   * Build each link independently so paths are always correct
   * regardless of whether the current page is at root or in pages/.
   *
   * From root (index.html):
   *   home     → index.html
   *   resume   → pages/resume.html
   *   projects → pages/projects.html
   *   contact  → pages/contact.html
   *
   * From pages/ (resume.html, projects.html, etc.):
   *   home     → ../index.html
   *   resume   → resume.html          ← same dir, NO ../ prefix
   *   projects → projects.html        ← same dir, NO ../ prefix
   *   contact  → contact.html         ← same dir, NO ../ prefix
   */
  const inPages = window.location.pathname.includes('/pages/');

  const href = {
    home:     inPages ? '../index.html'    : 'index.html',
    resume:   inPages ? 'resume.html'      : 'pages/resume.html',
    projects: inPages ? 'projects.html'    : 'pages/projects.html',
    contact:  inPages ? 'contact.html'     : 'pages/contact.html',
  };

  /* ── Active page detection ──────────────────────────────────*/
  const seg     = window.location.pathname.split('/').filter(Boolean).pop() || 'index.html';
  const pageKey = seg.replace('.html', '');

  const a = (k) => pageKey === k ? ' active' : '';
  const c = (k) => pageKey === k ? ' aria-current="page"' : '';

  /* ── Nav HTML ───────────────────────────────────────────────*/
  const navHTML = `
<nav class="nav-container" role="navigation" aria-label="Main navigation">

  <a href="${href.home}" class="nav-logo" aria-label="Satyam Pandey — Home">
    <svg width="36" height="36" viewBox="0 0 40 40" aria-hidden="true" focusable="false">
      <path d="M20 4 L36 14 L36 26 L20 36 L4 26 L4 14 Z" fill="none" stroke="url(#navGrad)" stroke-width="1.5"/>
      <circle cx="20" cy="20" r="7" fill="url(#navGrad)" opacity="0.25"/>
      <defs>
        <linearGradient id="navGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stop-color="#4f8ef7"/>
          <stop offset="100%" stop-color="#f74f8e"/>
        </linearGradient>
      </defs>
    </svg>
    <span>SP</span>
  </a>

  <div class="nav-links" role="list">
    <a href="${href.home}"     class="nav-link${a('index')}"    role="listitem"${c('index')}>Home</a>
    <a href="${href.resume}"   class="nav-link${a('resume')}"   role="listitem"${c('resume')}>Resume</a>
    <a href="${href.projects}" class="nav-link${a('projects')}" role="listitem"${c('projects')}>Projects</a>
    <a href="${href.contact}"  class="nav-link${a('contact')}"  role="listitem"${c('contact')}>Contact</a>
  </div>

  <div class="nav-right-controls">
    <button class="theme-toggle" id="themeToggle" aria-label="Toggle light/dark theme" aria-pressed="false">
      <svg class="theme-icon sun" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <circle cx="12" cy="12" r="5"/>
        <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
        <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
      </svg>
      <svg class="theme-icon moon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
      </svg>
    </button>

    <button class="nav-hamburger" id="navToggle"
            aria-label="Open navigation menu" aria-expanded="false" aria-controls="navDrawer">
      <span class="ham-bar"></span>
      <span class="ham-bar"></span>
      <span class="ham-bar"></span>
    </button>
  </div>

  <div class="nav-drawer" id="navDrawer" aria-hidden="true">
    <a href="${href.home}"     class="drawer-link${a('index')}"${c('index')}>Home</a>
    <a href="${href.resume}"   class="drawer-link${a('resume')}"${c('resume')}>Resume</a>
    <a href="${href.projects}" class="drawer-link${a('projects')}"${c('projects')}>Projects</a>
    <a href="${href.contact}"  class="drawer-link${a('contact')}"${c('contact')}>Contact</a>
  </div>

</nav>`;

  /* ── Inject ─────────────────────────────────────────────────*/
  function inject() {
    const mount = document.getElementById('site-nav');
    if (!mount) { console.warn('[nav.js] #site-nav not found'); return; }
    mount.outerHTML = navHTML;
    initHamburger();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }

  /* ── Hamburger ──────────────────────────────────────────────*/
  function initHamburger() {
    const toggle = document.getElementById('navToggle');
    const drawer = document.getElementById('navDrawer');
    if (!toggle || !drawer) return;

    const open = () => {
      drawer.classList.add('open');
      toggle.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Close navigation menu');
      drawer.setAttribute('aria-hidden', 'false');
    };
    const close = () => {
      drawer.classList.remove('open');
      toggle.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open navigation menu');
      drawer.setAttribute('aria-hidden', 'true');
    };

    toggle.addEventListener('click', () => drawer.classList.contains('open') ? close() : open());
    drawer.querySelectorAll('.drawer-link').forEach(l => l.addEventListener('click', close));
    document.addEventListener('click', (e) => {
      const nav = document.querySelector('.nav-container');
      if (nav && !nav.contains(e.target)) close();
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
    window.addEventListener('resize', () => { if (window.innerWidth > 768) close(); });
  }

  /* ── Theme ──────────────────────────────────────────────────*/
  (function applyStoredTheme() {
    try {
      const stored = localStorage.getItem('portfolio-theme');
      const system = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme',
        (stored === 'light' || stored === 'dark') ? stored : system);
    } catch (_) {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  })();

})();