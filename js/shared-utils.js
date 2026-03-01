'use strict';

(() => {
  function normalizeCertificateImagePath(imagePath) {
    const trimmed = String(imagePath || '').trim();
    if (!trimmed) return '';

    const normalizedPath = trimmed.replace(/\\/g, '/');

    if (/^(?:https?:)?\/\//i.test(normalizedPath) || normalizedPath.startsWith('data:') || normalizedPath.startsWith('blob:')) {
      return normalizedPath;
    }

    if (normalizedPath.startsWith('../') || normalizedPath.startsWith('./') || normalizedPath.startsWith('/')) {
      return normalizedPath;
    }

    if (normalizedPath.startsWith('assets/')) {
      return `../${normalizedPath}`;
    }

    return `../assets/certificates/${normalizedPath}`;
  }

  window.PortfolioUtils = Object.assign({}, window.PortfolioUtils, {
    normalizeCertificateImagePath
  });
})();
