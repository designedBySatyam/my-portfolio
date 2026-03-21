
/**
 * Extra Cyberpunk Features:
 * 1. Decoder Text Effect
 * 2. HUD Scroll Progress
 */

(function() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.__portfolioExtrasBooted) return;
  window.__portfolioExtrasBooted = true;

  const stalePreloader = document.getElementById('sys-preloader');
  if (stalePreloader) stalePreloader.remove();

  const staleHud = document.getElementById('hud-scroll-container');
  if (staleHud) staleHud.remove();

  const staleStyle = document.getElementById('sys-preloader-style');
  if (staleStyle) staleStyle.remove();

  const isHomePage = document.body.classList.contains('home-page');
  const PRELOADER_SESSION_KEY = 'portfolio-preloader-seen-v2';
  const PRELOADER_VARIANT_KEY = 'portfolio-preloader-variant-v1';
  const hasSeenPreloader = (() => {
    try {
      return sessionStorage.getItem(PRELOADER_SESSION_KEY) === '1';
    } catch (_) {
      return false;
    }
  })();
  const shouldRunPreloader = false;
  const pickPreloaderVariant = () => {
    try {
      const previous = localStorage.getItem(PRELOADER_VARIANT_KEY);
      const next = previous === 'reticle' ? 'terminal' : 'reticle';
      localStorage.setItem(PRELOADER_VARIANT_KEY, next);
      return next;
    } catch (_) {
      return Math.random() < 0.5 ? 'reticle' : 'terminal';
    }
  };
  const preloaderVariant = shouldRunPreloader ? pickPreloaderVariant() : 'terminal';

  let preloader = null;
  let shouldDelayHudReveal = false;
  if (shouldRunPreloader) {
    shouldDelayHudReveal = true;
    // ========== 1. SYSTEM BOOT PRELOADER ==========
    preloader = document.createElement('div');
    preloader.id = 'sys-preloader';
    preloader.dataset.variant = preloaderVariant;

    const terminalPanel = `
      <div class="preloader-door pd-top"></div>
      <div class="preloader-door pd-bottom"></div>
      <div class="pl-scanline"></div>
      
      <!-- System Diagnostics -->
      <div class="sys-metrics top-left">SYS.MEM: <span id="metric-mem">0x00</span></div>
      <div class="sys-metrics top-right">NET.UPLINK: <span id="metric-net">0kbps</span></div>
      <div class="sys-metrics bottom-left">SEC.PROTO: ACTIVE</div>
      <div class="sys-metrics bottom-right">NODE: 77.A9.B2</div>

      <div class="preloader-content crt-glow">
        <div class="pl-glitch-box">
          <div class="pl-head">
            <span class="pl-title">BOOT.SEQ // HOME NODE</span>
            <button type="button" class="pl-skip" id="pl-skip-btn" aria-label="Skip intro">SKIP</button>
          </div>
          <div class="preloader-log" id="pl-log1"></div>
          <div class="preloader-log" id="pl-log2"></div>
          <div class="preloader-log" id="pl-log3"></div>
          <div class="preloader-log" id="pl-log4" style="color: #f472b6 !important; font-weight: bold; margin-top: 8px;"></div><span class="pl-cursor" id="pl-cursor"></span>
        </div>
        <div class="preloader-bar"><div class="preloader-fill"></div></div>
        <div class="pl-progress"><span id="pl-pct">00%</span></div>
      </div>
    `;

    const reticlePanel = `
      <div class="preloader-door pd-top"></div>
      <div class="preloader-door pd-bottom"></div>
      <div class="pl-scanline"></div>

      <!-- System Diagnostics -->
      <div class="sys-metrics top-left">SYS.MEM: <span id="metric-mem">0x00</span></div>
      <div class="sys-metrics top-right">NET.UPLINK: <span id="metric-net">0kbps</span></div>
      <div class="sys-metrics bottom-left">SEC.PROTO: ACTIVE</div>
      <div class="sys-metrics bottom-right">NODE: 77.A9.B2</div>

      <div class="preloader-content preloader-content-reticle crt-glow">
        <button type="button" class="pl-skip pl-skip-reticle" id="pl-skip-btn" aria-label="Skip intro">SKIP</button>
        <div class="pl-reticle-wrap">
          <canvas id="pl-reticle" width="200" height="200"></canvas>
          <div class="pl-ident">
            <div class="pl-ident-init">SP</div>
            <div class="pl-ident-sub">PROFILE LOAD</div>
          </div>
        </div>
        <div class="pl-logs-wrap">
          <div class="preloader-log" id="pl-log1"></div>
          <div class="preloader-log" id="pl-log2"></div>
          <div class="preloader-log" id="pl-log3"></div>
          <div class="preloader-log preloader-log-pink" id="pl-log4"></div><span class="pl-cursor" id="pl-cursor"></span>
        </div>
        <div class="preloader-bar"><div class="preloader-fill"></div></div>
        <div class="pl-progress"><span id="pl-pct">00%</span></div>
      </div>
    `;

    preloader.innerHTML = preloaderVariant === 'reticle' ? reticlePanel : terminalPanel;
    document.body.appendChild(preloader);
  }

  const style = document.createElement('style');
  style.id = 'sys-preloader-style';
  style.innerHTML = `
    #sys-preloader {
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      z-index: 10000; overflow: hidden;
      transition: opacity 0.45s ease, visibility 0s linear 0.45s;
      background: #020510;
      opacity: 1;
      visibility: visible;
      pointer-events: auto;
    }

    #sys-preloader.split {
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
    }
    
    /* Blast Doors with Grid Background */
    .preloader-door {
      position: absolute; left: 0; width: 100vw; height: 50vh;
      background: #020510; z-index: 1; transition: transform 0.9s cubic-bezier(0.8, 0, 0.2, 1);
      overflow: hidden;
    }
    .preloader-door::before {
      content: ''; position: absolute; left: 0; width: 100%; height: 200%;
      background-image: 
        linear-gradient(rgba(56, 189, 248, 0.05) 1px, transparent 1px),
        linear-gradient(90deg, rgba(56, 189, 248, 0.05) 1px, transparent 1px);
      background-size: 25px 25px;
      animation: gridMove 15s linear infinite; pointer-events: none;
    }
    .pd-top { top: 0; border-bottom: 2px solid rgba(56, 189, 248, 0.5); }
    .pd-top::before { top: 0; }
    
    .pd-bottom { top: 50vh; border-top: 2px solid rgba(56, 189, 248, 0.5); }
    .pd-bottom::before { bottom: -100%; }
    
    @keyframes gridMove {
      0% { transform: translateY(0); }
      100% { transform: translateY(50px); }
    }
    
    #sys-preloader.split .pd-top { transform: translateY(-100%); }
    #sys-preloader.split .pd-bottom { transform: translateY(100%); }
    #sys-preloader.split .pl-scanline, 
    #sys-preloader.split .preloader-content,
    #sys-preloader.split .sys-metrics { opacity: 0; }

    /* Corner Diagnostics */
    .sys-metrics {
      position: absolute; font-family: var(--font-mono, monospace); font-size: 0.6rem;
      color: rgba(56, 189, 248, 0.7); z-index: 2; text-shadow: 0 0 6px rgba(56, 189, 248, 0.4);
      letter-spacing: 0.1em; transition: opacity 0.3s;
    }
    .top-left { top: 24px; left: 24px; }
    .top-right { top: 24px; right: 24px; text-align: right; }
    .bottom-left { bottom: 24px; left: 24px; }
    .bottom-right { bottom: 24px; right: 24px; text-align: right; }

    .pl-scanline {
      position: absolute; top: 0; left: 0; width: 100%; height: 4px;
      background: rgba(56, 189, 248, 0.6); box-shadow: 0 0 16px rgba(56, 189, 248, 1);
      z-index: 3; opacity: 0.6; animation: scanDown 3.5s linear infinite; pointer-events: none;
      transition: opacity 0.3s;
    }
    @keyframes scanDown {
      0% { top: -10%; }
      100% { top: 110%; }
    }

    .preloader-content {
      position: absolute; top: 41%; left: 50%; width: 390px; z-index: 2; 
      font-family: var(--font-mono, monospace);
      color: #38bdf8 !important; font-size: 0.75rem; 
      transition: opacity 0.4s;
    }
    .preloader-content-reticle {
      top: 50%;
      width: min(92vw, 420px);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 14px;
    }
    .pl-skip-reticle {
      align-self: flex-end;
      margin-bottom: -4px;
    }
    .pl-reticle-wrap {
      position: relative;
      width: 200px;
      height: 200px;
      flex-shrink: 0;
    }
    #pl-reticle {
      position: absolute;
      inset: 0;
      width: 200px;
      height: 200px;
    }
    .pl-ident {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      pointer-events: none;
    }
    .pl-ident-init {
      font-family: var(--font-mono, monospace);
      font-size: 2rem;
      font-weight: 700;
      letter-spacing: 0.15em;
      color: #38bdf8;
      text-shadow: 0 0 20px rgba(56, 189, 248, 0.8), 0 0 40px rgba(56, 189, 248, 0.4);
    }
    .pl-ident-sub {
      margin-top: 4px;
      font-family: var(--font-mono, monospace);
      font-size: 0.5rem;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: rgba(56, 189, 248, 0.5);
    }
    .pl-logs-wrap {
      width: min(92vw, 360px);
      border-left: 1.5px solid rgba(56, 189, 248, 0.25);
      padding-left: 14px;
    }
    .preloader-log-pink {
      color: #f472b6 !important;
      font-weight: 700;
      text-shadow: 0 0 8px rgba(244, 114, 182, 0.7);
    }
    .pl-glitch-box {
      position: relative;
      padding: 12px 14px;
      border: 1px solid rgba(56, 189, 248, 0.35);
      border-left-width: 2px;
      background: linear-gradient(180deg, rgba(7, 18, 38, 0.88), rgba(3, 8, 18, 0.95));
      box-shadow: 0 0 28px rgba(56, 189, 248, 0.18), inset 0 0 12px rgba(56, 189, 248, 0.08);
    }
    .pl-glitch-box::before {
      content: '';
      position: absolute;
      inset: 0;
      background: repeating-linear-gradient(
        0deg,
        rgba(56, 189, 248, 0.04),
        rgba(56, 189, 248, 0.04) 1px,
        transparent 1px,
        transparent 3px
      );
      pointer-events: none;
      opacity: 0.5;
    }
    .pl-head {
      position: relative;
      z-index: 1;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 10px;
    }
    .pl-title {
      font-size: 0.55rem;
      letter-spacing: 0.18em;
      color: rgba(56, 189, 248, 0.85);
    }
    .pl-skip {
      border: 1px solid rgba(56, 189, 248, 0.45);
      background: rgba(4, 12, 24, 0.7);
      color: #9edcff;
      font-family: inherit;
      font-size: 0.52rem;
      letter-spacing: 0.14em;
      padding: 4px 8px;
      border-radius: 999px;
      cursor: pointer;
      opacity: 0;
      transform: translateY(-2px);
      pointer-events: none;
      transition: opacity 0.22s ease, transform 0.22s ease, border-color 0.22s ease;
    }
    .pl-skip.show {
      opacity: 0.92;
      transform: translateY(0);
      pointer-events: auto;
    }
    .pl-skip:hover {
      border-color: rgba(56, 189, 248, 0.8);
    }
    
    /* CRT Glow and flicker */
    .crt-glow {
       text-shadow: 0 0 5px rgba(56, 189, 248, 0.8), 0 0 10px rgba(56, 189, 248, 0.4);
       animation: bootGlitch 0.4s ease-out, crtFlicker 0.15s infinite alternate;
    }
    @keyframes crtFlicker {
      0% { opacity: 0.95; }
      100% { opacity: 1; text-shadow: 0 0 8px rgba(56, 189, 248, 0.9), 0 0 12px rgba(56, 189, 248, 0.5); }
    }
    @keyframes bootGlitch {
      0% { transform: translate(-50%, -50%) scale(1.05); filter: drop-shadow(4px 0 rgba(244,114,182,0.8)) drop-shadow(-4px 0 rgba(103,232,249,0.8)); opacity: 0; }
      100% { transform: translate(-50%, -50%) scale(1); filter: none; opacity: 1; }
    }
    
    .preloader-content {
      transform: translate(-50%, -50%);
    }
    @media (max-width: 640px) {
      .preloader-content {
        top: 39%;
        width: min(89vw, 390px);
      }
      .preloader-content-reticle {
        top: 50%;
        width: min(88vw, 390px);
      }
      .pl-reticle-wrap {
        width: 170px;
        height: 170px;
      }
      #pl-reticle {
        width: 170px;
        height: 170px;
      }
      .pl-ident-init {
        font-size: 1.7rem;
      }
      .pl-logs-wrap {
        width: 100%;
      }
    }

    .preloader-log {
      position: relative;
      z-index: 1;
      min-height: 1.2rem; margin-bottom: 8px; text-transform: uppercase;
      letter-spacing: 0.1em; display: inline-block; width: 100%;
    }
    #pl-log4 { width: auto; max-width: 90%; word-break: break-word; text-shadow: 0 0 6px rgba(244,114,182,0.8); }
    .pl-cursor {
      display: inline-block; width: 10px; height: 16px; background: #f472b6 !important;
      animation: blink 1s step-end infinite; vertical-align: middle; margin-left: 6px; border-radius: 1px;
      box-shadow: 0 0 8px rgba(244,114,182,0.8);
    }
    .pl-cursor.typing { animation: none; opacity: 1; }
    @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }

    /* Segmented Loader Bar */
    .preloader-bar {
      width: 100%; height: 4px; background: rgba(56, 189, 248, 0.1);
      margin-top: 16px; overflow: hidden; position: relative; border-radius: 2px;
    }
    .preloader-fill {
      width: 0%; height: 100%; background: #38bdf8 !important;
      transition: width 0.08s linear;
      box-shadow: 0 0 12px rgba(56, 189, 248, 0.9);
      background-image: repeating-linear-gradient(
        45deg,
        transparent,
        transparent 8px,
        rgba(2, 5, 16, 0.7) 8px,
        rgba(2, 5, 16, 0.7) 12px
      ) !important;
    }
    .pl-progress {
      position: relative;
      z-index: 1;
      margin-top: 8px;
      text-align: right;
      font-size: 0.58rem;
      letter-spacing: 0.14em;
      color: rgba(158, 220, 255, 0.9);
    }
    
    /* HUD Scroll */
    #hud-scroll-container {
      position: fixed; right: 24px; top: 50%; transform: translateY(-50%);
      display: flex; flex-direction: column; align-items: center; gap: 8px;
      z-index: 900; opacity: 0; transition: opacity 1s 2s;
    }
    .hud-label {
      font-family: var(--font-mono); font-size: 0.5rem; color: var(--text-dim);
      letter-spacing: 0.2em; writing-mode: vertical-rl; transform: rotate(180deg);
    }
    .hud-track {
      width: 2px; height: 120px; background: rgba(255, 255, 255, 0.1);
      position: relative;
    }
    .hud-fill {
      position: absolute; top: 0; width: 100%; background: var(--accent, #38bdf8);
      box-shadow: 0 0 8px var(--border-glow, rgba(56, 189, 248, 0.5));
    }
    .hud-value {
      font-family: var(--font-mono); font-size: 0.6rem; color: var(--accent);
      font-weight: bold; margin-top: 4px;
    }
    @media (max-width: 960px) { #hud-scroll-container { display: none; } }
  `;
  document.head.appendChild(style);

  if (preloader) {
    const BOOT_MIN_MS = 1500;
    const BOOT_MAX_MS = 2400;
    const SKIP_SHOW_MS = 850;

    const memEl = preloader.querySelector('#metric-mem');
    const netEl = preloader.querySelector('#metric-net');
    const fill = preloader.querySelector('.preloader-fill');
    const pctEl = preloader.querySelector('#pl-pct');
    const skipBtn = preloader.querySelector('#pl-skip-btn');
    const typeTarget = preloader.querySelector('#pl-log4');
    const cursorObj = preloader.querySelector('#pl-cursor');
    const reticleCanvas = preloader.querySelector('#pl-reticle');

    let preloaderSettled = false;
    let progressValue = 6;
    let progressTarget = 6;
    let progressRaf = 0;
    let reticleRaf = 0;
    let typeInterval = null;
    let settleTimeout = null;
    let skipRevealTimeout = null;
    let minTimer = null;
    let maxTimer = null;
    let navObserver = null;
    let assetsReady = false;
    let typingDone = false;
    let minElapsed = false;

    const setProgressTarget = (value) => {
      if (value > progressTarget) progressTarget = value;
    };

    const metricsInt = setInterval(() => {
      if(memEl) memEl.textContent = '0x' + Math.floor(Math.random() * 16777215).toString(16).toUpperCase().padStart(6, '0');
      if(netEl) netEl.textContent = Math.floor(Math.random() * 900 + 100) + 'kbps';
    }, 120);

    if (reticleCanvas) {
      const reticleCtx = reticleCanvas.getContext('2d');
      if (reticleCtx) {
        const C = 200;
        const CX = C / 2;
        const CY = C / 2;
        let angle = 0;
        let scanAngle = 0;

        const drawReticle = () => {
          reticleCtx.clearRect(0, 0, C, C);

          reticleCtx.beginPath();
          reticleCtx.arc(CX, CY, 92, 0, Math.PI * 2);
          reticleCtx.strokeStyle = 'rgba(56,189,248,.16)';
          reticleCtx.lineWidth = 1;
          reticleCtx.setLineDash([]);
          reticleCtx.stroke();

          reticleCtx.save();
          reticleCtx.translate(CX, CY);
          reticleCtx.rotate(angle);
          reticleCtx.setLineDash([10, 10]);
          reticleCtx.beginPath();
          reticleCtx.arc(0, 0, 82, 0, Math.PI * 2);
          reticleCtx.strokeStyle = 'rgba(56,189,248,.6)';
          reticleCtx.lineWidth = 1.4;
          reticleCtx.stroke();
          reticleCtx.restore();

          reticleCtx.save();
          reticleCtx.translate(CX, CY);
          reticleCtx.rotate(-angle * 0.65);
          reticleCtx.setLineDash([5, 18]);
          reticleCtx.beginPath();
          reticleCtx.arc(0, 0, 68, 0, Math.PI * 2);
          reticleCtx.strokeStyle = 'rgba(244,114,182,.35)';
          reticleCtx.lineWidth = 1;
          reticleCtx.stroke();
          reticleCtx.restore();

          reticleCtx.setLineDash([]);
          reticleCtx.save();
          reticleCtx.translate(CX, CY);
          for (let i = 0; i < 28; i++) {
            const a0 = scanAngle - (i + 1) * 0.05;
            const a1 = scanAngle - i * 0.05;
            reticleCtx.beginPath();
            reticleCtx.moveTo(0, 0);
            reticleCtx.arc(0, 0, 81, a0, a1, false);
            reticleCtx.closePath();
            reticleCtx.fillStyle = `rgba(56,189,248,${(1 - i / 28) * 0.1})`;
            reticleCtx.fill();
          }
          reticleCtx.beginPath();
          reticleCtx.moveTo(0, 0);
          reticleCtx.lineTo(Math.cos(scanAngle) * 81, Math.sin(scanAngle) * 81);
          reticleCtx.strokeStyle = 'rgba(56,189,248,.85)';
          reticleCtx.lineWidth = 1.5;
          reticleCtx.shadowColor = 'rgba(56,189,248,.7)';
          reticleCtx.shadowBlur = 8;
          reticleCtx.stroke();
          reticleCtx.shadowBlur = 0;
          reticleCtx.restore();

          reticleCtx.strokeStyle = 'rgba(56,189,248,.3)';
          reticleCtx.lineWidth = 0.75;
          [
            [CX - 92, CY, CX - 52, CY],
            [CX + 52, CY, CX + 92, CY],
            [CX, CY - 92, CX, CY - 52],
            [CX, CY + 52, CX, CY + 92]
          ].forEach(([x1, y1, x2, y2]) => {
            reticleCtx.beginPath();
            reticleCtx.moveTo(x1, y1);
            reticleCtx.lineTo(x2, y2);
            reticleCtx.stroke();
          });

          reticleCtx.strokeStyle = '#38bdf8';
          reticleCtx.lineWidth = 1.5;
          [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([sx, sy]) => {
            const bx = CX + sx * 62;
            const by = CY + sy * 62;
            reticleCtx.beginPath();
            reticleCtx.moveTo(bx + sx * 12, by);
            reticleCtx.lineTo(bx, by);
            reticleCtx.lineTo(bx, by + sy * 12);
            reticleCtx.stroke();
          });

          reticleCtx.beginPath();
          reticleCtx.arc(CX, CY, 10, 0, Math.PI * 2);
          reticleCtx.strokeStyle = 'rgba(56,189,248,.3)';
          reticleCtx.lineWidth = 0.6;
          reticleCtx.stroke();
          reticleCtx.beginPath();
          reticleCtx.arc(CX, CY, 3, 0, Math.PI * 2);
          reticleCtx.fillStyle = '#38bdf8';
          reticleCtx.shadowColor = 'rgba(56,189,248,.9)';
          reticleCtx.shadowBlur = 10;
          reticleCtx.fill();
          reticleCtx.shadowBlur = 0;

          angle += 0.009;
          scanAngle += 0.022;
          reticleRaf = requestAnimationFrame(drawReticle);
        };

        reticleRaf = requestAnimationFrame(drawReticle);
      }
    }

    const renderProgress = () => {
      progressValue += (progressTarget - progressValue) * 0.16;
      if (Math.abs(progressTarget - progressValue) < 0.2) {
        progressValue = progressTarget;
      }
      const clamped = Math.max(0, Math.min(100, progressValue));
      if (fill) fill.style.width = clamped.toFixed(1) + '%';
      if (pctEl) pctEl.textContent = Math.round(clamped).toString().padStart(2, '0') + '%';
      if (!preloaderSettled) {
        progressRaf = requestAnimationFrame(renderProgress);
      }
    };
    progressRaf = requestAnimationFrame(renderProgress);

    const revealHud = () => {
      const hud = document.getElementById('hud-scroll-container');
      if (hud) hud.style.opacity = '1';
    };
    const markPreloaderSeen = () => {
      try {
        sessionStorage.setItem(PRELOADER_SESSION_KEY, '1');
      } catch (_) {}
    };

    const cleanupBoot = () => {
      clearInterval(metricsInt);
      if (typeInterval) clearInterval(typeInterval);
      if (settleTimeout) clearTimeout(settleTimeout);
      if (skipRevealTimeout) clearTimeout(skipRevealTimeout);
      if (minTimer) clearTimeout(minTimer);
      if (maxTimer) clearTimeout(maxTimer);
      if (progressRaf) cancelAnimationFrame(progressRaf);
      if (reticleRaf) cancelAnimationFrame(reticleRaf);
      if (navObserver) navObserver.disconnect();
    };

    const settlePreloader = (instant) => {
      if (preloaderSettled) return;
      preloaderSettled = true;
      cleanupBoot();
      markPreloaderSeen();
      progressTarget = 100;
      progressValue = 100;
      if (fill) fill.style.width = '100%';
      if (pctEl) pctEl.textContent = '100%';
      preloader.classList.add('split');
      setTimeout(() => {
        preloader.remove();
        revealHud();
      }, instant ? 320 : 760);
    };

    const maybeFinish = () => {
      if (preloaderSettled) return;
      if (assetsReady && typingDone && minElapsed) {
        setProgressTarget(100);
        settleTimeout = setTimeout(() => settlePreloader(false), 220);
      }
    };

    if (skipBtn) {
      skipRevealTimeout = setTimeout(() => {
        skipBtn.classList.add('show');
      }, SKIP_SHOW_MS);
      skipBtn.addEventListener('click', () => settlePreloader(true));
    }

    const logs = [
      { el: preloader.querySelector('#pl-log1'), text: "[SYS.INIT] ESTABLISHING SECURE CONNECTION...", delay: 120, progress: 22 },
      { el: preloader.querySelector('#pl-log2'), text: "[DECRYPTING MODULES] ACCESS GRANTED", delay: 300, progress: 38 },
      { el: preloader.querySelector('#pl-log3'), text: "[UI.DRAW] INITIATING RENDER LAYER", delay: 520, progress: 52 }
    ];

    logs.forEach((log) => {
      setTimeout(() => {
        if (log.el) decodeEffect(log.el, log.text, 11);
        setProgressTarget(log.progress);
      }, log.delay);
    });

    const navReadyPromise = new Promise((resolve) => {
      if (document.querySelector('.nav-container')) {
        resolve();
        return;
      }
      navObserver = new MutationObserver(() => {
        if (document.querySelector('.nav-container')) {
          if (navObserver) navObserver.disconnect();
          navObserver = null;
          resolve();
        }
      });
      navObserver.observe(document.body, { childList: true, subtree: true });
      setTimeout(() => {
        if (navObserver) navObserver.disconnect();
        navObserver = null;
        resolve();
      }, 900);
    });
    navReadyPromise.then(() => setProgressTarget(60));

    const fontsReadyPromise = (document.fonts && document.fonts.ready)
      ? document.fonts.ready.catch(() => {})
      : Promise.resolve();
    fontsReadyPromise.then(() => setProgressTarget(72));

    const heroImagePromise = new Promise((resolve) => {
      const heroImg = document.querySelector('.profile-img');
      if (!heroImg) {
        resolve();
        return;
      }
      const finalize = () => {
        if (heroImg.decode) {
          heroImg.decode().catch(() => {}).then(resolve);
        } else {
          resolve();
        }
      };
      if (heroImg.complete) {
        finalize();
        return;
      }
      heroImg.addEventListener('load', finalize, { once: true });
      heroImg.addEventListener('error', resolve, { once: true });
      setTimeout(resolve, 1200);
    });
    heroImagePromise.then(() => setProgressTarget(84));

    Promise.all([navReadyPromise, fontsReadyPromise, heroImagePromise]).then(() => {
      assetsReady = true;
      setProgressTarget(92);
      maybeFinish();
    });

    const typePhrase = "> LOAD // PORTFOLIO: SATYAM PANDEY";
    setTimeout(() => {
      if (cursorObj) cursorObj.classList.add('typing');
      let idx = 0;
      typeInterval = setInterval(() => {
        if (typeTarget) {
          typeTarget.textContent += typePhrase.charAt(idx);
        }
        idx++;
        if (idx >= typePhrase.length) {
          if (typeInterval) clearInterval(typeInterval);
          if (cursorObj) cursorObj.classList.remove('typing');
          typingDone = true;
          setProgressTarget(89);
          maybeFinish();
        }
      }, 32);
    }, 760);

    minTimer = setTimeout(() => {
      minElapsed = true;
      maybeFinish();
    }, BOOT_MIN_MS);

    maxTimer = setTimeout(() => {
      settlePreloader(true);
    }, BOOT_MAX_MS);
  }

  // ========== 2. DECODER EFFECT ==========
  const chars = '!<>-_\\\\/[]{}-=+*^?#________';
  function decodeEffect(element, finalString, duration) {
    if(!element) return;
    let iterations = 0;
    const interval = setInterval(() => {
      element.textContent = finalString.split('').map((char, index) => {
        if(index < iterations) return finalString[index];
        return chars[Math.floor(Math.random() * chars.length)];
      }).join('');
      
      if(iterations >= finalString.length) clearInterval(interval);
      iterations += 1/3;
    }, duration);
  }

  // Apply to portfolio elements when they scroll into view
  const decodeTargets = document.querySelectorAll('.metric-value, .sl-title');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (!entry.target.dataset.decoded) {
          const original = entry.target.innerText;
          // Temporarily fix width to avoid jumping
          entry.target.style.display = 'inline-block';
          decodeEffect(entry.target, original, 30);
          entry.target.dataset.decoded = "true";
        }
      }
    });
  }, { threshold: 0.2 });

  decodeTargets.forEach(el => observer.observe(el));

  // ========== 3. HUD SCROLL PROGRESS ==========
  const hudContainer = document.createElement('div');
  hudContainer.id = 'hud-scroll-container';
  hudContainer.innerHTML = `
    <div class="hud-label">SCROLL.POS</div>
    <div class="hud-track"><div class="hud-fill" id="hud-bar-fill"></div></div>
    <div class="hud-value" id="hud-val-text">00%</div>
  `;
  document.body.appendChild(hudContainer);
  if (!shouldDelayHudReveal) {
    requestAnimationFrame(() => {
      hudContainer.style.opacity = '1';
    });
  }

  const hudFill = document.getElementById('hud-bar-fill');
  const hudText = document.getElementById('hud-val-text');

  const getScrollElement = () => {
    if (isHomePage && window.innerWidth >= 961) {
      return document.querySelector('.hero-text') || document.documentElement;
    }
    return document.documentElement;
  };

  const updateHud = () => {
    const scrollEl = getScrollElement();

    let scrollTop;
    let scrollHeight;
    let clientHeight;

    if (scrollEl.tagName === 'HTML' || scrollEl.tagName === 'BODY') {
      scrollTop = window.scrollY || document.documentElement.scrollTop;
      scrollHeight = document.documentElement.scrollHeight;
      clientHeight = window.innerHeight;
    } else {
      scrollTop = scrollEl.scrollTop;
      scrollHeight = scrollEl.scrollHeight;
      clientHeight = scrollEl.clientHeight;
    }

    const denominator = Math.max(1, scrollHeight - clientHeight);
    let scrolled = (scrollTop / denominator) * 100;
    if (!Number.isFinite(scrolled) || scrolled < 0) scrolled = 0;
    if (scrolled > 100) scrolled = 100;

    hudFill.style.height = scrolled + '%';
    hudText.innerText = Math.round(scrolled).toString().padStart(2, '0') + '%';
  };

  let hudScroller = null;
  const bindHudScrollSource = () => {
    if (hudScroller) hudScroller.removeEventListener('scroll', updateHud);
    hudScroller = getScrollElement();
    if (hudScroller && hudScroller !== document.documentElement && hudScroller !== document.body) {
      hudScroller.addEventListener('scroll', updateHud, { passive: true });
    }
  };

  window.addEventListener('scroll', updateHud, { passive: true });
  window.addEventListener('resize', () => {
    bindHudScrollSource();
    updateHud();
  }, { passive: true });

  bindHudScrollSource();
  requestAnimationFrame(updateHud);

})();
