import codecs
import time

def rewrite_js():
    new_js = r"""
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
    <div class="preloader-door pd-top"></div>
    <div class="preloader-door pd-bottom"></div>
    <div class="pl-scanline"></div>
    <div class="preloader-content">
      <div class="pl-glitch-box">
        <div class="preloader-log" id="pl-log1"></div>
        <div class="preloader-log" id="pl-log2"></div>
        <div class="preloader-log" id="pl-log3"></div>
        <div class="preloader-log" id="pl-log4" style="color: #f472b6 !important; font-weight: bold; margin-top: 8px;"></div><span class="pl-cursor" id="pl-cursor"></span>
      </div>
      <div class="preloader-bar"><div class="preloader-fill"></div></div>
    </div>
  `;
  document.body.appendChild(preloader);

  const style = document.createElement('style');
  style.innerHTML = `
    #sys-preloader {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      z-index: 10000; display: flex; align-items: center; justify-content: center;
      transition: visibility 1.2s;
    }
    .preloader-door {
      position: absolute; left: 0; width: 100%; height: 50%;
      background: #020510; z-index: 1; transition: transform 0.8s cubic-bezier(0.8, 0, 0.2, 1);
    }
    .pd-top { top: 0; border-bottom: 2px solid rgba(56, 189, 248, 0.3); }
    .pd-bottom { bottom: 0; border-top: 2px solid rgba(56, 189, 248, 0.3); }
    
    #sys-preloader.split .pd-top { transform: translateY(-100%); }
    #sys-preloader.split .pd-bottom { transform: translateY(100%); }
    #sys-preloader.split .pl-scanline, #sys-preloader.split .preloader-content { opacity: 0; }

    .pl-scanline {
      position: absolute; top: 0; left: 0; width: 100%; height: 4px;
      background: rgba(56, 189, 248, 0.6); box-shadow: 0 0 12px rgba(56, 189, 248, 0.8);
      z-index: 3; opacity: 0.6; animation: scanDown 3s linear infinite; pointer-events: none;
      transition: opacity 0.3s;
    }
    @keyframes scanDown {
      0% { top: -10%; }
      100% { top: 110%; }
    }

    .preloader-content {
      position: relative; z-index: 2; width: 340px; font-family: var(--font-mono, monospace);
      color: #38bdf8 !important; font-size: 0.75rem; 
      transition: opacity 0.3s, transform 0.4s;
    }
    .pl-glitch-box { position: relative; }
    
    .preloader-content { animation: bootGlitch 0.4s ease-out; }
    @keyframes bootGlitch {
      0% { transform: scale(1.05); filter: drop-shadow(4px 0 rgba(244,114,182,0.8)) drop-shadow(-4px 0 rgba(103,232,249,0.8)); opacity: 0; }
      100% { transform: scale(1); filter: none; opacity: 1; }
    }

    .preloader-log {
      min-height: 1.2rem; margin-bottom: 6px; text-transform: uppercase;
      letter-spacing: 0.1em; display: inline-block; width: 100%;
    }
    #pl-log4 { width: auto; max-width: 90%; word-break: break-word; } /* Important for inline typing alongside cursor */
    .pl-cursor {
      display: inline-block; width: 8px; height: 14px; background: #38bdf8 !important;
      animation: blink 1s step-end infinite; vertical-align: middle; margin-left: 4px; border-radius: 1px;
    }
    .pl-cursor.typing { animation: none; opacity: 1; }
    @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }

    .preloader-bar {
      width: 100%; height: 2px; background: rgba(56, 189, 248, 0.15);
      margin-top: 18px; overflow: hidden; position: relative;
    }
    .preloader-fill {
      width: 0%; height: 100%; background: #38bdf8 !important;
      transition: width 0.08s linear;
      box-shadow: 0 0 10px rgba(56, 189, 248, 0.8);
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
  // Use querySelector to guarantee encapsulation inside the preloader container
  const logs = [
    { el: preloader.querySelector('#pl-log1'), text: "[SYS.INIT] ESTABLISHING CONNECTION...", delay: 150 },
    { el: preloader.querySelector('#pl-log2'), text: "[DECRYPTING MODULES] SECURE", delay: 500 },
    { el: preloader.querySelector('#pl-log3'), text: "[UI.DRAW] INITIATING RENDER LAYER", delay: 850 }
  ];
  
  const fill = preloader.querySelector('.preloader-fill');
  
  let fillPct = 0;
  const fillInterval = setInterval(() => {
    fillPct += (Math.random() * 8 + 1);
    if (fillPct > 98) fillPct = 98; // hold at 98%
    if (fill) fill.style.width = fillPct + '%';
  }, 70);

  logs.forEach(log => {
    setTimeout(() => {
      if (log.el) decodeEffect(log.el, log.text, 12);
    }, log.delay);
  });

  // Typing effect logic
  const typeTarget = preloader.querySelector('#pl-log4');
  const cursorObj = preloader.querySelector('#pl-cursor');
  const typePhrase = "> LOAD // PORTFOLIO: SATYAM PANDEY";
  
  setTimeout(() => {
    if (cursorObj) cursorObj.classList.add('typing');
    let idx = 0;
    const typeInt = setInterval(() => {
      if (typeTarget) {
        // Use textContent for highly robust insertion
        typeTarget.textContent += typePhrase.charAt(idx);
      }
      idx++;
      
      if (idx >= typePhrase.length) {
        clearInterval(typeInt);
        if (cursorObj) cursorObj.classList.remove('typing');
        
        // Trigger completion smoothly
        setTimeout(() => {
          clearInterval(fillInterval);
          if (fill) fill.style.width = '100%';
          setTimeout(() => {
            preloader.classList.add('split');
            setTimeout(() => {
              preloader.style.visibility = 'hidden';
              const hud = document.getElementById('hud-scroll-container');
              if (hud) hud.style.opacity = '1';
            }, 1000);
          }, 350);
        }, 500);
        
      }
    }, 45); // Typing speed
  }, 1350); // Start typing shortly after logs finish

  // ========== 2. DECODER EFFECT ==========
  const chars = '!<>-_\\\\/[]{}—=+*^?#________';
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
    with codecs.open('js/extra-features.js', 'w', encoding='utf-8') as f:
        f.write(new_js)
        
    # Bust cache immediately again
    with codecs.open('index.html', 'r', encoding='utf-8') as f:
        html = f.read()
    
    import re
    ts = int(time.time())
    html = re.sub(r'extra-features\.js\?v=[^"]+', f'extra-features.js?v={ts}', html)
    
    with codecs.open('index.html', 'w', encoding='utf-8') as f:
        f.write(html)
        
    print("Rewritten securely and busted cache.")

if __name__ == '__main__':
    rewrite_js()
