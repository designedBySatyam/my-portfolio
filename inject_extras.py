import os

def run():
    # 1. Extra Features JS content
    extra_js = r"""
/**
 * Extra Cyberpunk Features:
 * 1. Preloader Boot Sequence
 * 2. Decoder Text Effect
 * 3. HUD Scroll Progress
 */

(function() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // ========== 1. SYSTEM BOOT PRELOADER ==========
  const preloader = document.createElement('div');
  preloader.id = 'sys-preloader';
  preloader.innerHTML = `
    <div class="preloader-content">
      <div class="preloader-log" id="pl-log1"></div>
      <div class="preloader-log" id="pl-log2"></div>
      <div class="preloader-log" id="pl-log3"></div>
      <div class="preloader-bar"><div class="preloader-fill"></div></div>
    </div>
  `;
  document.body.appendChild(preloader);

  const style = document.createElement('style');
  style.innerHTML = `
    #sys-preloader {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: #020510; z-index: 10000;
      display: flex; align-items: center; justify-content: center;
      transition: opacity 0.6s var(--ease-out-expo), visibility 0.6s;
    }
    .preloader-content {
      width: 320px; font-family: var(--font-mono, monospace);
      color: var(--accent, #38bdf8); font-size: 0.75rem;
    }
    .preloader-log {
      min-height: 1.2rem; margin-bottom: 6px; text-transform: uppercase;
      letter-spacing: 0.1em;
    }
    .preloader-bar {
      width: 100%; height: 2px; background: rgba(56, 189, 248, 0.2);
      margin-top: 16px; overflow: hidden;
    }
    .preloader-fill {
      width: 0%; height: 100%; background: var(--accent, #38bdf8);
      transition: width 0.1s linear;
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

  // Boot Sequence Logic
  const logs = [
    { el: document.getElementById('pl-log1'), text: "[SYS.INIT] ESTABLISHING CONNECTION...", delay: 100 },
    { el: document.getElementById('pl-log2'), text: "[DECRYPTING MODULES] SUCCESS", delay: 500 },
    { el: document.getElementById('pl-log3'), text: "[UI.DRAW] INITIATING RENDER LAYER", delay: 900 }
  ];
  
  const fill = document.querySelector('.preloader-fill');
  
  let fillPct = 0;
  const fillInterval = setInterval(() => {
    fillPct += Math.random() * 15;
    if (fillPct > 100) fillPct = 100;
    fill.style.width = fillPct + '%';
  }, 80);

  logs.forEach(log => {
    setTimeout(() => {
      // Decode string effect instead of typing
      decodeEffect(log.el, log.text, 20);
    }, log.delay);
  });

  setTimeout(() => {
    clearInterval(fillInterval);
    fill.style.width = '100%';
    setTimeout(() => {
      preloader.style.opacity = '0';
      preloader.style.visibility = 'hidden';
      document.getElementById('hud-scroll-container').style.opacity = '1';
    }, 300);
  }, 1400);

  // ========== 2. DECODER EFFECT ==========
  const chars = '!<>-_\\\\/[]{}—=+*^?#________';
  function decodeEffect(element, finalString, duration) {
    let iterations = 0;
    const interval = setInterval(() => {
      element.innerText = finalString.split('').map((char, index) => {
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

  const hudFill = document.getElementById('hud-bar-fill');
  const hudText = document.getElementById('hud-val-text');

  // We should read scroll on the scrolling container, which is usually home-page body or window
  window.addEventListener('scroll', () => {
    let scrollEl = document.documentElement;
    if (document.body.classList.contains('home-page') && window.innerWidth >= 961) {
      // The hero-text `.hero-text` is the main scroller on desktop! 
      scrollEl = document.querySelector('.hero-text') || document.documentElement;
    }
    
    // In this template, .hero-text or standard body is scrolled
    let scrollTop, scrollHeight, clientHeight;
    if (scrollEl.tagName === 'HTML' || scrollEl.tagName === 'BODY') {
      scrollTop = window.scrollY || document.documentElement.scrollTop;
      scrollHeight = document.documentElement.scrollHeight;
      clientHeight = window.innerHeight;
    } else {
      scrollTop = scrollEl.scrollTop;
      scrollHeight = scrollEl.scrollHeight;
      clientHeight = scrollEl.clientHeight;
    }
    
    let scrolled = (scrollTop / (scrollHeight - clientHeight)) * 100;
    if (isNaN(scrolled)) scrolled = 0;
    if (scrolled > 100) scrolled = 100;
    
    hudFill.style.height = scrolled + '%';
    hudText.innerText = Math.round(scrolled).toString().padStart(2, '0') + '%';
  }, { passive: true });

})();
"""
    with open('js/extra-features.js', 'w', encoding='utf-8') as f:
        f.write(extra_js)

    # 2. Inject into index.html
    html_files = ['index.html', 'index.html.txt']
    
    for html_file in html_files:
        if not os.path.exists(html_file):
            continue
        with open(html_file, 'r', encoding='utf-8', errors='ignore') as f:
            html = f.read()
        
        # Check if already injected
        if 'extra-features.js' not in html:
            # Replace </body> with <script src="js/extra-features.js"></script>\n</body>
            
            # Since standard string replacement failed before due to exact match on some scripts, 
            # </body> tag is extremely consistent.
            if '</body>' in html:
                html = html.replace('</body>', '  <script src="js/extra-features.js"></script>\n</body>')
            
            with open(html_file, 'w', encoding='utf-8') as f:
                f.write(html)

if __name__ == "__main__":
    run()
