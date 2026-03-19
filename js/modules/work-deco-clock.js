export function initWorkDecoClock() {
  const clockEl = document.getElementById('decoTime');
  if (!clockEl) return;

  const updateClock = () => {
    const now = new Date();
    clockEl.textContent = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  updateClock();
  window.setInterval(updateClock, 1000);
}