import { initWorkDecoClock } from '../modules/work-deco-clock.js';

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initWorkDecoClock, { once: true });
} else {
  initWorkDecoClock();
}