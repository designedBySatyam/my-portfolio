'use strict';

/**
 * features.js
 * Handles: page transitions, scroll progress, open-to-work banner,
 * now-playing widget, visitor counter, page analytics, currently-building card.
 *
 * Requires firebase-config.js to be loaded first for Firebase features.
 */

(function initPageTransitions() {
  document.documentElement.classList.add('page-loaded');

  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href]');
    if (!link) return;

    const href = link.getAttribute('href');
    if (
      !href ||
      href.startsWith('#') ||
      href.startsWith('mailto:') ||
      href.startsWith('tel:') ||
      link.target === '_blank' ||
      link.hasAttribute('download') ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    try {
      const url = new URL(href, window.location.href);
      if (url.origin !== window.location.origin) return;
    } catch (_) {
      return;
    }

    event.preventDefault();
    document.documentElement.classList.add('page-exit');
    setTimeout(() => {
      window.location.href = href;
    }, 220);
  });
})();

(function initScrollProgress() {
  const bar = document.createElement('div');
  bar.id = 'scrollProgress';
  bar.className = 'scroll-progress';
  document.body.appendChild(bar);

  let ticking = false;
  window.addEventListener(
    'scroll',
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        bar.style.width = `${pct}%`;
        ticking = false;
      });
    },
    { passive: true }
  );
})();

const CONFIG_CACHE_KEYS = {
  siteConfig: 'sp-config-siteConfig',
  nowPlaying: 'sp-config-nowPlaying',
  currentlyBuilding: 'sp-config-currentlyBuilding'
};

function readConfigCache(docId) {
  const key = CONFIG_CACHE_KEYS[docId];
  if (!key) return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
}

function writeConfigCache(docId, data) {
  const key = CONFIG_CACHE_KEYS[docId];
  if (!key) return;
  try {
    localStorage.setItem(key, JSON.stringify(data || {}));
  } catch (_) {
    // Ignore storage failures.
  }
}

function watchConfigCache(docId, handler) {
  const key = CONFIG_CACHE_KEYS[docId];
  if (!key || typeof handler !== 'function') return;
  window.addEventListener('storage', (event) => {
    if (event.key !== key) return;
    handler(readConfigCache(docId) || {});
  });
}

function getCurrentPageKey() {
  const pathname = window.location.pathname || '/';
  const seg = pathname.endsWith('/')
    ? 'index.html'
    : (pathname.split('/').filter(Boolean).pop() || 'index.html');
  return seg.replace('.html', '') || 'index';
}

const currentPageKey = getCurrentPageKey();

function isPage(...keys) {
  return keys.includes(currentPageKey);
}

function toBool(value) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    return normalized === 'true' || normalized === '1' || normalized === 'yes' || normalized === 'on';
  }
  return false;
}

function getSpotifyEmbedUrl(rawLink) {
  const link = String(rawLink || '').trim();
  if (!link) return '';

  const uriMatch = link.match(/spotify:track:([A-Za-z0-9]+)/i);
  if (uriMatch?.[1]) {
    return `https://open.spotify.com/embed/track/${uriMatch[1]}?utm_source=generator&autoplay=1`;
  }

  try {
    const url = new URL(link);
    const match = url.pathname.match(/\/track\/([A-Za-z0-9]+)/i);
    if (match?.[1]) {
      return `https://open.spotify.com/embed/track/${match[1]}?utm_source=generator&autoplay=1`;
    }
  } catch (_) {
    // Continue to relaxed parsing fallback.
  }

  const looseMatch = link.match(/track\/([A-Za-z0-9]+)/i);
  if (looseMatch?.[1]) {
    return `https://open.spotify.com/embed/track/${looseMatch[1]}?utm_source=generator&autoplay=1`;
  }

  return '';
}

function getDirectAudioUrl(rawLink) {
  const link = String(rawLink || '').trim();
  if (!link) return '';

  const looksLikeAudio = (value) => /\.(mp3|m4a|aac|ogg|wav|webm)(?:[?#].*)?$/i.test(value);

  try {
    const url = new URL(link, window.location.href);
    return looksLikeAudio(url.href) ? url.href : '';
  } catch (_) {
    return looksLikeAudio(link) ? link : '';
  }
}

function placeBannerAfterNav(banner) {
  const nav = document.querySelector('.nav-container');
  if (!nav || !nav.parentNode) return false;

  if (nav.nextSibling === banner) return true;
  nav.parentNode.insertBefore(banner, nav.nextSibling);
  return true;
}

let firebaseFeaturesInitialized = false;

function initFirebaseFeaturesOnce() {
  if (firebaseFeaturesInitialized) return true;
  if (!window.db || !window.COLLECTIONS) return false;

  firebaseFeaturesInitialized = true;
  initOpenToWork();
  initNowPlaying();
  initVisitorCounter();
  initPageAnalytics();
  initCurrentlyBuilding();
  return true;
}

if (!initFirebaseFeaturesOnce()) {
  const startedAt = Date.now();
  const intervalId = setInterval(() => {
    const ready = initFirebaseFeaturesOnce();
    const timedOut = Date.now() - startedAt > 20000;
    if (ready || timedOut) {
      clearInterval(intervalId);
      if (timedOut && !ready) {
        console.warn('Firebase features could not initialize (db unavailable).');
      }
    }
  }, 250);

  window.addEventListener(
    'firebase-ready',
    () => {
      initFirebaseFeaturesOnce();
      clearInterval(intervalId);
    },
    { once: true }
  );
}

function initOpenToWork() {
  if (!isPage('index', 'contact')) {
    renderOTWBanner(false, '');
    return;
  }

  const apply = (data = {}) => {
    renderOTWBanner(
      toBool(data.openToWork ?? data.otwActive ?? data.availabilityActive),
      data.otwMessage || data.message || ''
    );
  };

  const cached = readConfigCache('siteConfig');
  if (cached) apply(cached);
  watchConfigCache('siteConfig', apply);

  db.collection(COLLECTIONS.CONFIG)
    .doc('siteConfig')
    .onSnapshot(
      (doc) => {
        const data = doc.exists ? doc.data() : {};
        const clientData = {
          openToWork: toBool(data.openToWork ?? data.otwActive ?? data.availabilityActive),
          otwMessage: data.otwMessage || data.message || ''
        };
        apply(clientData);
        writeConfigCache('siteConfig', clientData);
      },
      (error) => {
        console.warn('[features] Failed to load siteConfig:', error?.message || error);
        const fallback = readConfigCache('siteConfig');
        apply(fallback || { openToWork: false, otwMessage: '' });
      }
    );
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
  }

  if (!placeBannerAfterNav(banner)) {
    if (!banner.isConnected) document.body.prepend(banner);
    if (!banner.dataset.deferNavMount) {
      banner.dataset.deferNavMount = '1';
      const remount = () => placeBannerAfterNav(banner);
      document.addEventListener('DOMContentLoaded', remount, { once: true });
      window.setTimeout(remount, 60);
      window.setTimeout(remount, 250);
    }
  }

  banner.innerHTML = `
    <span class="otw-dot"></span>
    <span class="otw-text">
      ${message || 'Open to work - available for internships & freelance projects'}
    </span>
    <a href="${window.location.pathname.includes('/pages/') ? 'contact.html' : 'pages/contact.html'}"
       class="otw-link">Get in touch</a>
  `;
}

function initNowPlaying() {
  if (!isPage('index')) return;

  const slot = document.getElementById('nowPlayingSlot');
  if (!slot) return;

  const apply = (data = {}) => {
    if (!data.active || !data.song) {
      slot.hidden = true;
      slot.innerHTML = '';
      return;
    }

    const songLink = String(data.link || '').trim();
    const embedUrl = getSpotifyEmbedUrl(songLink);
    const directAudioUrl = getDirectAudioUrl(songLink);
    const canPlayInline = Boolean(embedUrl || directAudioUrl);
    const songElement = songLink
      ? `<a class="np-song" href="${escHtml(songLink)}" target="_blank" rel="noopener">${escHtml(data.song)}</a>`
      : `<span class="np-song">${escHtml(data.song)}</span>`;

    slot.hidden = false;
    slot.innerHTML = `
      <div class="np-stack">
        <div class="np-widget">
          <div class="np-bar-icon">
            <span class="np-bar"></span>
            <span class="np-bar"></span>
            <span class="np-bar"></span>
            <span class="np-bar"></span>
          </div>
          <div class="np-info">
            <span class="np-label">NOW PLAYING</span>
            ${songElement}
            <span class="np-artist">${escHtml(data.artist || '')}</span>
          </div>
          ${data.albumArt ? `<img class="np-art" src="${escHtml(data.albumArt)}" alt="Album art" loading="lazy">` : ''}
        </div>
        ${embedUrl ? `
          <iframe
            class="np-embed"
            src="${embedUrl}"
            loading="lazy"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            title="Spotify player">
          </iframe>
        ` : ''}
        ${!embedUrl && directAudioUrl ? `
          <audio class="np-audio" controls preload="none" src="${escHtml(directAudioUrl)}"></audio>
        ` : ''}
        ${canPlayInline ? `<p class="np-play-note">Tap play to start audio</p>` : ''}
      </div>
    `;
  };

  const cached = readConfigCache('nowPlaying');
  if (cached) apply(cached);
  watchConfigCache('nowPlaying', apply);

  db.collection(COLLECTIONS.CONFIG)
    .doc('nowPlaying')
    .onSnapshot(
      (doc) => {
        const data = doc.exists ? doc.data() : {};
        const clientData = {
          active: !!data.active,
          song: data.song || '',
          artist: data.artist || '',
          albumArt: data.albumArt || '',
          link: data.link || ''
        };
        apply(clientData);
        writeConfigCache('nowPlaying', clientData);
      },
      (error) => {
        console.warn('[features] Failed to load nowPlaying:', error?.message || error);
        const fallback = readConfigCache('nowPlaying');
        apply(fallback || {});
      }
    );
}

function initVisitorCounter() {
  const el = document.getElementById('visitorCount');
  if (!el) return;

  const ref = db.collection(COLLECTIONS.CONFIG).doc('siteStats');

  const key = 'sp-visited';
  try {
    if (!sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, '1');
      ref.set({ visitors: firebase.firestore.FieldValue.increment(1) }, { merge: true }).catch(() => {});
    }
  } catch (_) {
    // Ignore sessionStorage errors.
  }

  ref.onSnapshot(
    (doc) => {
      const count = doc.exists ? doc.data()?.visitors || 0 : 0;
      el.textContent = count >= 1000 ? `${(count / 1000).toFixed(1)}k` : String(count);
    },
    () => {
      el.textContent = '-';
    }
  );
}

function escHtml(value) {
  const div = document.createElement('div');
  div.textContent = String(value || '');
  return div.innerHTML;
}

function initPageAnalytics() {
  const pageMap = {
    index: 'Home',
    resume: 'Resume',
    work: 'Work',
    projects: 'Work',
    contact: 'Contact'
  };

  const seg = window.location.pathname.split('/').filter(Boolean).pop() || 'index.html';
  const pageKey = seg.replace('.html', '') || 'index';
  const pageName = pageMap[pageKey] || pageKey;

  const key = `sp-view-${pageKey}`;
  try {
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');
  } catch (_) {
    // Ignore sessionStorage errors.
  }

  db.collection(COLLECTIONS.CONFIG)
    .doc('pageAnalytics')
    .set(
      {
        [pageKey]: firebase.firestore.FieldValue.increment(1),
        [`${pageKey}_name`]: pageName,
        lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
      },
      { merge: true }
    )
    .catch(() => {});
}

function initCurrentlyBuilding() {
  if (!isPage('index')) return;

  const slot = document.getElementById('currentlyBuildingSlot');
  if (!slot) return;

  const apply = (data = {}) => {
    if (!data.active || !data.title) {
      slot.innerHTML = '';
      return;
    }

    slot.innerHTML = `
      <div class="wib-card">
        <div class="wib-header">
          <span class="wib-dot"></span>
          <span class="wib-label">CURRENTLY BUILDING</span>
        </div>
        <div class="wib-body">
          <span class="wib-title">${escHtml(data.title)}</span>
          ${data.desc ? `<span class="wib-desc">${escHtml(data.desc)}</span>` : ''}
        </div>
        ${data.link ? `
          <a href="${escHtml(data.link)}" target="_blank" rel="noopener" class="wib-link">
            View progress
          </a>` : ''}
      </div>
    `;
  };

  const cached = readConfigCache('currentlyBuilding');
  if (cached) apply(cached);
  watchConfigCache('currentlyBuilding', apply);

  db.collection(COLLECTIONS.CONFIG)
    .doc('currentlyBuilding')
    .onSnapshot(
      (doc) => {
        const data = doc.exists ? doc.data() : {};
        const clientData = {
          active: !!data.active,
          title: data.title || '',
          desc: data.desc || '',
          link: data.link || ''
        };
        apply(clientData);
        writeConfigCache('currentlyBuilding', clientData);
      },
      (error) => {
        console.warn('[features] Failed to load currentlyBuilding:', error?.message || error);
        const fallback = readConfigCache('currentlyBuilding');
        apply(fallback || {});
      }
    );
}
