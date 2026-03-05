'use strict';

/**
 * features.js — Portfolio Extra Features
 * Handles: page transitions, open-to-work banner,
 *          now-playing widget, visitor counter.
 *
 * Requires firebase-config.js to be loaded first for Firebase features.
 */

/* ══════════════════════════════════════════════════
   PAGE TRANSITIONS
══════════════════════════════════════════════════ */
(function initPageTransitions() {
  // Page enters with fade-in (handled by CSS body animation)
  document.documentElement.classList.add('page-loaded');

  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href]');
    if (!link) return;

    const href = link.getAttribute('href');
    if (
      !href ||
      href.startsWith('#') ||
      href.startsWith('mailto:') ||
      href.startsWith('tel:') ||
      link.target === '_blank' ||
      link.hasAttribute('download') ||
      e.metaKey || e.ctrlKey || e.shiftKey || e.altKey
    ) return;

    // Only intercept same-origin navigation
    try {
      const url = new URL(href, window.location.href);
      if (url.origin !== window.location.origin) return;
    } catch (_) { return; }

    e.preventDefault();
    document.documentElement.classList.add('page-exit');
    setTimeout(() => { window.location.href = href; }, 220);
  });
})();


/* ══════════════════════════════════════════════════
   FIREBASE-DEPENDENT FEATURES
   (waits up to 3s for window.db to be ready)
══════════════════════════════════════════════════ */
function waitForDb(cb, attempts = 0) {
  if (window.db && window.COLLECTIONS) {
    cb();
  } else if (attempts < 30) {
    setTimeout(() => waitForDb(cb, attempts + 1), 100);
  }
}

waitForDb(() => {
  initOpenToWork();
  initNowPlaying();
  initVisitorCounter();
  initPageAnalytics();
});


/* ══════════════════════════════════════════════════
   OPEN TO WORK BANNER
══════════════════════════════════════════════════ */
function initOpenToWork() {
  db.collection(COLLECTIONS.CONFIG).doc('siteConfig')
    .onSnapshot((doc) => {
      const data = doc.exists ? doc.data() : {};
      const isOpen = !!data.openToWork;
      renderOTWBanner(isOpen, data.otwMessage || '');
    }, () => {/* silent fail */});
}

function renderOTWBanner(isOpen, message) {
  let banner = document.getElementById('otwBanner');

  if (!isOpen) {
    if (banner) banner.remove();
    return;
  }

  if (!banner) {
    banner = document.createElement('div');
    banner.id = 'otwBanner';
    banner.className = 'otw-banner';
    banner.setAttribute('role', 'status');
    banner.setAttribute('aria-live', 'polite');
    // Insert after nav
    const nav = document.querySelector('.nav-container');
    if (nav && nav.parentNode) {
      nav.parentNode.insertBefore(banner, nav.nextSibling);
    } else {
      document.body.prepend(banner);
    }
  }

  banner.innerHTML = `
    <span class="otw-dot"></span>
    <span class="otw-text">
      ${message || 'Open to work — available for internships &amp; freelance projects'}
    </span>
    <a href="${window.location.pathname.includes('/pages/') ? 'contact.html' : 'pages/contact.html'}"
       class="otw-link">Get in touch ↗</a>
  `;
}


/* ══════════════════════════════════════════════════
   NOW PLAYING WIDGET
══════════════════════════════════════════════════ */
function initNowPlaying() {
  const slot = document.getElementById('nowPlayingSlot');
  if (!slot) return;

  db.collection(COLLECTIONS.CONFIG).doc('nowPlaying')
    .onSnapshot((doc) => {
      const data = doc.exists ? doc.data() : {};
      if (!data.active || !data.song) {
        slot.hidden = true;
        return;
      }
      slot.hidden = false;
      slot.innerHTML = `
        <div class="np-widget">
          <div class="np-bar-icon">
            <span class="np-bar"></span>
            <span class="np-bar"></span>
            <span class="np-bar"></span>
            <span class="np-bar"></span>
          </div>
          <div class="np-info">
            <span class="np-label">NOW PLAYING</span>
            <a class="np-song" href="${data.link || '#'}" target="_blank" rel="noopener">
              ${escHtml(data.song)}
            </a>
            <span class="np-artist">${escHtml(data.artist || '')}</span>
          </div>
          ${data.albumArt ? `<img class="np-art" src="${escHtml(data.albumArt)}" alt="Album art" loading="lazy">` : ''}
        </div>
      `;
    }, () => { if (slot) slot.hidden = true; });
}


/* ══════════════════════════════════════════════════
   VISITOR COUNTER
══════════════════════════════════════════════════ */
function initVisitorCounter() {
  const el = document.getElementById('visitorCount');
  if (!el) return;

  const ref = db.collection(COLLECTIONS.CONFIG).doc('siteStats');

  // Increment once per session
  const key = 'sp-visited';
  try {
    if (!sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, '1');
      ref.set(
        { visitors: firebase.firestore.FieldValue.increment(1) },
        { merge: true }
      ).catch(() => {});
    }
  } catch (_) {}

  // Live display
  ref.onSnapshot((doc) => {
    if (!doc.exists) return;
    const count = doc.data()?.visitors || 0;
    el.textContent = count >= 1000
      ? (count / 1000).toFixed(1) + 'k'
      : count;
  }, () => {});
}

function escHtml(str) {
  const d = document.createElement('div');
  d.textContent = String(str || '');
  return d.innerHTML;
}


/* ══════════════════════════════════════════════════
   PAGE ANALYTICS — track views per page
══════════════════════════════════════════════════ */
function initPageAnalytics() {
  const pageMap = {
    'index':    'Home',
    'resume':   'Resume',
    'projects': 'Work',
    'contact':  'Contact',
  };

  const seg     = window.location.pathname.split('/').filter(Boolean).pop() || 'index.html';
  const pageKey = seg.replace('.html', '') || 'index';
  const pageName = pageMap[pageKey] || pageKey;

  const key = `sp-view-${pageKey}`;
  try {
    if (sessionStorage.getItem(key)) return; // one view per session per page
    sessionStorage.setItem(key, '1');
  } catch (_) {}

  db.collection(COLLECTIONS.CONFIG).doc('pageAnalytics').set(
    {
      [pageKey]: firebase.firestore.FieldValue.increment(1),
      [`${pageKey}_name`]: pageName,
      lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
    },
    { merge: true }
  ).catch(() => {});
}