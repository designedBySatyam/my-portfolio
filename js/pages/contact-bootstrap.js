import { initContactPage } from '../modules/contact-page.js';

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initContactPage, { once: true });
} else {
  initContactPage();
}
