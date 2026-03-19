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

function getFirebaseDb() {
  if (window.db) return window.db;
  try {
    if (typeof db !== 'undefined') return db;
  } catch (_) {
    // Ignore scope access errors.
  }
  return null;
}

function getConfigCollectionName() {
  if (window.COLLECTIONS?.CONFIG) return window.COLLECTIONS.CONFIG;
  try {
    if (typeof COLLECTIONS !== 'undefined' && COLLECTIONS?.CONFIG) return COLLECTIONS.CONFIG;
  } catch (_) {
    // Ignore scope access errors.
  }
  return null;
}

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

function applyHeroMetrics(data = {}) {
  const metrics = Array.isArray(data.heroMetrics) ? data.heroMetrics : [];
  const metricItems = document.querySelectorAll('[data-hero-metric]');
  if (metrics.length && metricItems.length) {
    metricItems.forEach((item, index) => {
      const metric = metrics[index];
      if (!metric) return;
      const valueEl = item.querySelector('[data-hero-metric-value]');
      const labelEl = item.querySelector('[data-hero-metric-label]');
      const value = String(metric.value ?? '').trim();
      const label = String(metric.label ?? '').trim();
      if (label && labelEl) {
        labelEl.textContent = label;
      }
      if (value && valueEl && valueEl.id !== 'visitorCount') {
        valueEl.textContent = value;
      }
    });
  }
  applySystemLog(data);
}

function applySystemLog(data = {}) {
  if (!isPage('index')) return;
  const container = document.querySelector('.system-log');
  const list = container?.querySelector('.system-log-list');
  if (!container || !list) return;

  const systemLog = data.systemLog || {};
  if (typeof systemLog.active !== 'undefined') {
    container.hidden = !toBool(systemLog.active);
  }

  const items = Array.isArray(systemLog.items) ? systemLog.items : [];
  const visibleItems = items.filter((item) => String(item?.title || '').trim());
  if (!visibleItems.length) return;

  const statusMap = {
    complete: { cls: 'is-complete', label: '[✓]' },
    progress: { cls: 'is-progress', label: '[~]' },
    active: { cls: 'is-active', label: '[+]' }
  };

  list.innerHTML = visibleItems.map((item) => {
    const statusKey = String(item.status || '').trim().toLowerCase();
    const status = statusMap[statusKey] || statusMap.progress;
    const title = escHtml(item.title || '');
    const desc = escHtml(item.desc || '');
    return `
      <li class="system-log-item ${status.cls}">
        <span class="sl-status">${status.label}</span>
        <div class="sl-body">
          <span class="sl-title">${title}</span>
          ${desc ? `<span class="sl-desc">${desc}</span>` : ''}
        </div>
      </li>
    `;
  }).join('');
}

(function initHeroMetricsFromCache() {
  const cached = readConfigCache('siteConfig');
  if (cached) applyHeroMetrics(cached);
  watchConfigCache('siteConfig', applyHeroMetrics);
})();

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

function getSafeExternalLink(rawLink) {
  const link = String(rawLink || '').trim();
  if (!link) return '';

  const spotifyUriMatch = link.match(/^spotify:track:([A-Za-z0-9]+)$/i);
  if (spotifyUriMatch?.[1]) {
    return `https://open.spotify.com/track/${spotifyUriMatch[1]}`;
  }

  try {
    const url = new URL(link, window.location.href);
    return (url.protocol === 'http:' || url.protocol === 'https:') ? url.href : '';
  } catch (_) {
    return '';
  }
}

function placeBannerInNav(banner) {
  const nav = document.querySelector('.nav-container');
  if (!nav) return false;

  const brandGroup = nav.querySelector('.nav-brand-group');
  const logo = nav.querySelector('.nav-logo');
  const mount = brandGroup || nav;
  if (!mount || !logo || !logo.parentNode) return false;

  if (banner.parentNode === mount && logo.nextSibling === banner) return true;
  mount.insertBefore(banner, logo.nextSibling);
  return true;
}

let firebaseFeaturesInitialized = false;

function initFirebaseFeaturesOnce() {
  if (firebaseFeaturesInitialized) return true;
  const dbRef = getFirebaseDb();
  const configCollection = getConfigCollectionName();
  if (!dbRef || !configCollection) return false;

  firebaseFeaturesInitialized = true;
  try { initOpenToWork(); } catch (error) { console.warn('[features] initOpenToWork failed:', error); }
  try { initNowPlaying(); } catch (error) { console.warn('[features] initNowPlaying failed:', error); }
  try { initVisitorCounter(); } catch (error) { console.warn('[features] initVisitorCounter failed:', error); }
  try { initPageAnalytics(); } catch (error) { console.warn('[features] initPageAnalytics failed:', error); }
  try { initCurrentlyBuilding(); } catch (error) { console.warn('[features] initCurrentlyBuilding failed:', error); }
  return true;
}

if (!initFirebaseFeaturesOnce()) {
  try { initVisitorCounter(); } catch (_) {}
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

let otwScrollHandler = null;

function detachOTWScrollBehavior() {
  if (typeof otwScrollHandler === 'function') {
    window.removeEventListener('scroll', otwScrollHandler);
  }
  otwScrollHandler = null;
}

function attachOTWScrollBehavior(banner) {
  detachOTWScrollBehavior();
  if (!banner) return;

  let ticking = false;
  otwScrollHandler = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(() => {
      banner.classList.toggle('is-compact', window.scrollY > 90);
      ticking = false;
    });
  };
  window.addEventListener('scroll', otwScrollHandler, { passive: true });
  otwScrollHandler();
}

function initOpenToWork() {
  const normalizeAvailabilityStatus = (rawStatus, enabled) => {
    const value = String(rawStatus || '').trim().toLowerCase();
    if (value === 'open') return 'available';
    if (value === 'available' || value === 'working' || value === 'closed') {
      return value;
    }
    return enabled ? 'available' : 'closed';
  };

  const apply = (data = {}) => {
    const enabled = toBool(data.openToWork ?? data.otwActive ?? data.availabilityActive);
    const status = normalizeAvailabilityStatus(data.availabilityStatus, enabled);
    renderOTWBanner(
      enabled,
      status
    );
    applyHeroMetrics(data);
  };

  const cached = readConfigCache('siteConfig');
    const cachedHeroMetrics = Array.isArray(cached?.heroMetrics) ? cached.heroMetrics : [];
    const cachedSystemLog = cached?.systemLog || {};
  if (cached) apply(cached);
  watchConfigCache('siteConfig', apply);

  const dbRef = getFirebaseDb();
  const configCollection = getConfigCollectionName();
  if (!dbRef || !configCollection) return;

  dbRef.collection(configCollection)
    .doc('siteConfig')
    .onSnapshot(
      (doc) => {
        const data = doc.exists ? doc.data() : {};
        const heroMetrics = Array.isArray(data.heroMetrics) ? data.heroMetrics : cachedHeroMetrics;
        const clientData = {
          openToWork: toBool(data.openToWork ?? data.otwActive ?? data.availabilityActive),
          availabilityStatus: data.availabilityStatus || '',
          otwMessage: data.otwMessage || data.message || '',
          heroMetrics,
          systemLog: data.systemLog || cachedSystemLog
        };
        apply(clientData);
        writeConfigCache('siteConfig', clientData);
      },
      (error) => {
        console.warn('[features] Failed to load siteConfig:', error?.message || error);
        const fallback = readConfigCache('siteConfig');
        apply(fallback || { openToWork: false, availabilityStatus: 'closed', otwMessage: '' });
      }
    );
}

function renderOTWBanner(isEnabled, status) {
  let banner = document.getElementById('otwBanner');

  if (!isEnabled) {
    if (banner) banner.remove();
    document.body.classList.remove('has-otw-banner');
    detachOTWScrollBehavior();
    return;
  }

  if (!banner) {
    banner = document.createElement('div');
    banner.id = 'otwBanner';
    banner.className = 'otw-banner';
    banner.setAttribute('role', 'status');
    banner.setAttribute('aria-live', 'polite');
  }

  if (!placeBannerInNav(banner)) {
    if (!banner.isConnected) document.body.prepend(banner);
    if (!banner.dataset.deferNavMount) {
      banner.dataset.deferNavMount = '1';
      const remount = () => placeBannerInNav(banner);
      document.addEventListener('DOMContentLoaded', remount, { once: true });
      window.setTimeout(remount, 60);
      window.setTimeout(remount, 250);
    }
  }

  document.body.classList.add('has-otw-banner');
  const normalizedStatus = String(status || '').trim().toLowerCase();
  const activeStatus = normalizedStatus === 'working' || normalizedStatus === 'closed' || normalizedStatus === 'available'
    ? normalizedStatus
    : 'available';
  const statusLabel = activeStatus.charAt(0).toUpperCase() + activeStatus.slice(1);
  const statusClass = `otw-status-tag otw-status-tag--${activeStatus} is-active`;

  banner.dataset.status = activeStatus;
  banner.innerHTML = `
    <div class="otw-status-pill" role="status" aria-label="Availability: ${statusLabel}">
      <span class="${statusClass}">${statusLabel}</span>
    </div>
  `;
  attachOTWScrollBehavior(banner);
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
    const songHref = getSafeExternalLink(songLink);
    const embedUrl = getSpotifyEmbedUrl(songLink);
    const directAudioUrl = getDirectAudioUrl(songLink);
    const canPlayInline = Boolean(embedUrl || directAudioUrl);
    const songElement = songHref
      ? `<a class="np-song" href="${escHtml(songHref)}" target="_blank" rel="noopener noreferrer">${escHtml(data.song)}</a>`
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

  const dbRef = getFirebaseDb();
  const configCollection = getConfigCollectionName();
  if (!dbRef || !configCollection) return;

  dbRef.collection(configCollection)
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

  const dbRef = getFirebaseDb();
  const configCollection = getConfigCollectionName();
  if (!dbRef || !configCollection) {
    let fallbackText = '0';
    try {
      fallbackText = localStorage.getItem('sp-visitor-count-cache') || localStorage.getItem('sp-visitor-estimate') || '0';
    } catch (_) {
      fallbackText = '0';
    }
    el.textContent = fallbackText;
    return;
  }

  const ref = dbRef.collection(configCollection).doc('siteStats');
  const sessionKey = 'sp-visited';
  const cacheKey = 'sp-visitor-count-cache';
  const localEstimateKey = 'sp-visitor-estimate';
  let hasRemoteValue = false;

  const formatCount = (value) => {
    const raw = Number(value);
    const count = Number.isFinite(raw) ? Math.max(0, Math.trunc(raw)) : 0;
    return count >= 1000 ? `${(count / 1000).toFixed(1)}k` : String(count);
  };

  const setDisplay = (value) => {
    el.textContent = formatCount(value);
  };

  const readStoredCount = () => {
    try {
      const cached = Number(localStorage.getItem(cacheKey));
      if (Number.isFinite(cached)) return Math.max(0, Math.trunc(cached));
      const estimated = Number(localStorage.getItem(localEstimateKey));
      if (Number.isFinite(estimated)) return Math.max(0, Math.trunc(estimated));
    } catch (_) {
      // Ignore storage errors.
    }
    return null;
  };

  const storeCount = (value, key = cacheKey) => {
    try {
      localStorage.setItem(key, String(Math.max(0, Math.trunc(Number(value) || 0))));
    } catch (_) {
      // Ignore storage errors.
    }
  };

  const initialStored = readStoredCount();
  if (initialStored !== null) {
    setDisplay(initialStored);
  } else {
    setDisplay(0);
  }

  try {
    if (!sessionStorage.getItem(sessionKey)) {
      sessionStorage.setItem(sessionKey, '1');
      ref.set({ visitors: firebase.firestore.FieldValue.increment(1) }, { merge: true }).catch(() => {
        const estimate = readStoredCount() ?? 0;
        const next = estimate + 1;
        storeCount(next, localEstimateKey);
        if (!hasRemoteValue) setDisplay(next);
      });
    }
  } catch (_) {
    // Ignore sessionStorage errors.
  }

  const fallbackTimer = window.setTimeout(() => {
    if (hasRemoteValue) return;
    const fallback = readStoredCount();
    if (fallback !== null) setDisplay(fallback);
  }, 2500);

  ref.onSnapshot(
    (doc) => {
      hasRemoteValue = true;
      window.clearTimeout(fallbackTimer);
      const count = doc.exists ? doc.data()?.visitors || 0 : 0;
      setDisplay(count);
      storeCount(count, cacheKey);
    },
    () => {
      window.clearTimeout(fallbackTimer);
      const fallback = readStoredCount();
      setDisplay(fallback ?? 0);
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
    'projects-certificates': 'Work',
    contact: 'Contact'
  };

  const seg = window.location.pathname.split('/').filter(Boolean).pop() || 'index.html';
  const rawKey = seg.replace('.html', '') || 'index';
  const pageKey = (rawKey === 'projects' || rawKey === 'projects-certificates') ? 'work' : rawKey;
  const pageName = pageMap[rawKey] || pageMap[pageKey] || pageKey;

  const key = `sp-view-${pageKey}`;
  try {
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');
  } catch (_) {
    // Ignore sessionStorage errors.
  }

  const dbRef = getFirebaseDb();
  const configCollection = getConfigCollectionName();
  if (!dbRef || !configCollection) return;

  dbRef.collection(configCollection)
    .doc('siteStats')
    .set(
      {
        [`pageViews.${pageKey}`]: firebase.firestore.FieldValue.increment(1),
        [`pageViewsNames.${pageKey}`]: pageName,
        pageViewsUpdatedAt: firebase.firestore.FieldValue.serverTimestamp()
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

    const progressHref = getSafeExternalLink(data.link);

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
        ${progressHref ? `
          <a href="${escHtml(progressHref)}" target="_blank" rel="noopener noreferrer" class="wib-link">
            View progress
          </a>` : ''}
      </div>
    `;
  };

  const cached = readConfigCache('currentlyBuilding');
  if (cached) apply(cached);
  watchConfigCache('currentlyBuilding', apply);

  const dbRef = getFirebaseDb();
  const configCollection = getConfigCollectionName();
  if (!dbRef || !configCollection) return;

  dbRef.collection(configCollection)
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

(function initGithubActivityOnLoad() {
  try {
    initGithubActivity();
  } catch (error) {
    console.warn('[features] initGithubActivity failed:', error);
  }
})();
