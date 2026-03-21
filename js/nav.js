/**
 * nav.js - Portfolio navigation component
 * Injects <nav> into any page with <div id="site-nav"></div>.
 * Handles active links, theme toggle, and mobile hamburger menu.
 */

(() => {
  'use strict';

  function resolveRoutes() {
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
      contact: `${basePath}pages/contact.html`,
      admin: `${basePath}pages/admin.html`
    };
  }

  const routes = resolveRoutes();
  window.PortfolioRoutes = routes;

  const pathname = window.location.pathname || '/';
  const seg = pathname.endsWith('/')
    ? 'index.html'
    : (pathname.split('/').filter(Boolean).pop() || 'index.html');
  const pageKey = seg.replace('.html', '');

  const activeClass = (key) => (pageKey === key ? ' active' : '');
  const activeAttr = (key) => (pageKey === key ? ' aria-current="page"' : '');

  const navHTML = `
<nav class="nav-container" role="navigation" aria-label="Main navigation">
  <div class="nav-brand-group">
    <a href="${routes.home}" class="nav-logo" aria-label="Satyam Pandey - Home">
      <svg width="36" height="36" viewBox="0 0 40 40" aria-hidden="true" focusable="false">
        <path d="M20 4 L36 14 L36 26 L20 36 L4 26 L4 14 Z" fill="none" stroke="url(#navGrad)" stroke-width="1.5"/>
        <circle cx="20" cy="20" r="7" fill="url(#navGrad)" opacity="0.25"/>
        <defs>
          <linearGradient id="navGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#4f8ef7"/>
            <stop offset="100%" stop-color="#f74f8e"/>
          </linearGradient>
        </defs>
      </svg>
      <span>SP</span>
    </a>
  </div>

  <div class="nav-links" role="list">
    <a href="${routes.home}" class="nav-link${activeClass('index')}" role="listitem"${activeAttr('index')}>Home</a>
    <a href="${routes.resume}" class="nav-link${activeClass('resume')}" role="listitem"${activeAttr('resume')}>Resume</a>
    <a href="${routes.work}" class="nav-link${activeClass('work')}" role="listitem"${activeAttr('work')}>Work</a>
    <a href="${routes.contact}" class="nav-link${activeClass('contact')}" role="listitem"${activeAttr('contact')}>Contact</a>
  </div>

  <div class="nav-right-controls">
    <a href="${routes.admin}" class="admin-nav-btn${activeClass('admin')}"${activeAttr('admin')}>Admin</a>
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
    <a href="${routes.home}" class="drawer-link${activeClass('index')}"${activeAttr('index')}>Home</a>
    <a href="${routes.resume}" class="drawer-link${activeClass('resume')}"${activeAttr('resume')}>Resume</a>
    <a href="${routes.work}" class="drawer-link${activeClass('work')}"${activeAttr('work')}>Work</a>
    <a href="${routes.contact}" class="drawer-link${activeClass('contact')}"${activeAttr('contact')}>Contact</a>
    <a href="${routes.admin}" class="drawer-link admin-link${activeClass('admin')}"${activeAttr('admin')}>Admin</a>
  </div>
</nav>`;

  function inject() {
    const mount = document.getElementById('site-nav');
    if (!mount) {
      console.warn('[nav.js] #site-nav not found');
      return;
    }
    mount.outerHTML = navHTML;
    initHamburger();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }

  function initHamburger() {
    const toggle = document.getElementById('navToggle');
    const drawer = document.getElementById('navDrawer');
    if (!toggle || !drawer) return;

    const backdrop = document.createElement('div');
    backdrop.className = 'nav-backdrop';
    document.body.appendChild(backdrop);

    const open = () => {
      drawer.classList.add('open');
      backdrop.classList.add('active');
      toggle.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Close navigation menu');
      drawer.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    };

    const close = () => {
      drawer.classList.remove('open');
      backdrop.classList.remove('active');
      toggle.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open navigation menu');
      drawer.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    };

    toggle.addEventListener('click', () => (drawer.classList.contains('open') ? close() : open()));
    backdrop.addEventListener('click', close);
    drawer.querySelectorAll('.drawer-link').forEach((link) => link.addEventListener('click', close));
    document.addEventListener('click', (event) => {
      const nav = document.querySelector('.nav-container');
      if (nav && !nav.contains(event.target)) close();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') close();
    });
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768) close();
    });
  }

  (function applyStoredTheme() {
    try {
      const stored = localStorage.getItem('portfolio-theme');
      document.documentElement.setAttribute('data-theme', stored === 'light' || stored === 'dark' ? stored : 'light');
    } catch (_) {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  })();
})();
