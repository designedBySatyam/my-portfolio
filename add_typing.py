import re

def upgrade():
    with open('js/extra-features.js', 'r', encoding='utf-8') as f:
        content = f.read()

    new_preloader = r"""  // ========== 1. SYSTEM BOOT PRELOADER ==========
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
        <div class="preloader-log" id="pl-log4" style="color: var(--accent2, #f472b6); font-weight: bold; margin-top: 8px;"></div><span class="pl-cursor" id="pl-cursor"></span>
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
      color: var(--accent, #38bdf8); font-size: 0.75rem; 
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
      display: inline-block; width: 8px; height: 14px; background: var(--accent);
      animation: blink 1s step-end infinite; vertical-align: middle; margin-left: 4px; border-radius: 1px;
    }
    .pl-cursor.typing { animation: none; opacity: 1; }
    @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }

    .preloader-bar {
      width: 100%; height: 2px; background: rgba(56, 189, 248, 0.15);
      margin-top: 18px; overflow: hidden; position: relative;
    }
    .preloader-fill {
      width: 0%; height: 100%; background: var(--accent, #38bdf8);
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
  const logs = [
    { el: document.getElementById('pl-log1'), text: "[SYS.INIT] ESTABLISHING CONNECTION...", delay: 150 },
    { el: document.getElementById('pl-log2'), text: "[DECRYPTING MODULES] SECURE", delay: 500 },
    { el: document.getElementById('pl-log3'), text: "[UI.DRAW] INITIATING RENDER LAYER", delay: 850 }
  ];
  
  const fill = document.querySelector('.preloader-fill');
  
  let fillPct = 0;
  const fillInterval = setInterval(() => {
    fillPct += (Math.random() * 8 + 1);
    if (fillPct > 98) fillPct = 98; // hold at 98%
    fill.style.width = fillPct + '%';
  }, 70);

  logs.forEach(log => {
    setTimeout(() => {
      decodeEffect(log.el, log.text, 12);
    }, log.delay);
  });

  // Typing effect logic
  const typeTarget = document.getElementById('pl-log4');
  const cursorObj = document.getElementById('pl-cursor');
  const typePhrase = "> LOAD // PORTFOLIO: SATYAM PANDEY";
  
  setTimeout(() => {
    cursorObj.classList.add('typing');
    let idx = 0;
    const typeInt = setInterval(() => {
      typeTarget.innerText += typePhrase.charAt(idx);
      idx++;
      if (idx >= typePhrase.length) {
        clearInterval(typeInt);
        cursorObj.classList.remove('typing');
        
        // Trigger completion smoothly
        setTimeout(() => {
          clearInterval(fillInterval);
          fill.style.width = '100%';
          setTimeout(() => {
            preloader.classList.add('split');
            setTimeout(() => {
              preloader.style.visibility = 'hidden';
              document.getElementById('hud-scroll-container').style.opacity = '1';
            }, 1000);
          }, 350);
        }, 500);
        
      }
    }, 45); // Typing speed
  }, 1350); // Start typing shortly after logs finish

  // ========== 2. DECODER EFFECT =========="""

    start_token = "// ========== 1. SYSTEM BOOT PRELOADER =========="
    end_token = "// ========== 2. DECODER EFFECT =========="
    
    if start_token in content and end_token in content:
        start_idx = content.find(start_token)
        end_idx = content.find(end_token)
        
        new_content = content[:start_idx] + new_preloader + content[end_idx + len(end_token):]
        
        with open('js/extra-features.js', 'w', encoding='utf-8') as f:
            f.write(new_content)
        print("Typing effect applied.")
    else:
        print("Tokens not found.")

if __name__ == '__main__':
    upgrade()
