let clockTickTimeoutId = null;

export function initWorkDecoClock() {
  const clockEl = document.getElementById('decoTime');
  if (!clockEl) {
    if (clockTickTimeoutId) {
      window.clearTimeout(clockTickTimeoutId);
      clockTickTimeoutId = null;
    }
    return;
  }

  const updateClock = () => {
    const now = new Date();
    clockEl.textContent = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const scheduleNextTick = () => {
    const now = new Date();
    const delay = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();
    clockTickTimeoutId = window.setTimeout(() => {
      updateClock();
      scheduleNextTick();
    }, Math.max(250, delay));
  };

  if (clockTickTimeoutId) {
    window.clearTimeout(clockTickTimeoutId);
    clockTickTimeoutId = null;
  }

  updateClock();
  scheduleNextTick();
}
