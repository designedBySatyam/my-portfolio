'use strict';

(() => {
  function normalizeCertificateImagePath(imagePath) {
    const trimmed = String(imagePath || '').trim();
    if (!trimmed) return '';

    const normalizedPath = trimmed.replace(/\\/g, '/');

    // Full URLs pass through unchanged
    if (/^(?:https?:)?\/\//i.test(normalizedPath) || normalizedPath.startsWith('data:') || normalizedPath.startsWith('blob:')) {
      return normalizedPath;
    }

    // Redirect old stored local paths (../assets/certificates/file.jpg) to GitHub CDN
    const localCertPattern = /^(?:\.\.\/)*assets\/certificates\//i;
    if (localCertPattern.test(normalizedPath)) {
      const filename = normalizedPath.replace(localCertPattern, '');
      return `https://raw.githubusercontent.com/designedBySatyam/assets/main/certificates/${filename}`;
    }

    // Other relative paths (../, ./, /) pass through
    if (normalizedPath.startsWith('../') || normalizedPath.startsWith('./') || normalizedPath.startsWith('/')) {
      return normalizedPath;
    }

    // assets/something (without certificates subfolder) — redirect to CDN
    if (normalizedPath.startsWith('assets/')) {
      const filename = normalizedPath.replace(/^assets\/(?:certificates\/)?/, '');
      return `https://raw.githubusercontent.com/designedBySatyam/assets/main/certificates/${filename}`;
    }

    // Bare filename fallback
    return `https://raw.githubusercontent.com/designedBySatyam/assets/main/certificates/${normalizedPath}`;
  }

  window.PortfolioUtils = Object.assign({}, window.PortfolioUtils, {
    normalizeCertificateImagePath
  });
})();