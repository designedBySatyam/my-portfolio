import codecs
import time
import re

def fix():
    with codecs.open('js/extra-features.js', 'r', encoding='utf-8') as f:
        content = f.read()

    # We need to replace the CSS rules for sys-preloader, preloader-door, and preloader-content
    old_css = r"""    #sys-preloader {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      z-index: 10000; display: flex; align-items: center; justify-content: center;
      transition: visibility 1.2s; overflow: hidden;
    }
    
    /* Blast Doors with Grid Background */
    .preloader-door {
      position: absolute; left: 0; width: 100%; height: 50%;
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
    .pd-top { top: 0; border-bottom: 2px solid rgba(56, 189, 248, 0.4); }
    .pd-top::before { top: 0; }
    
    .pd-bottom { bottom: 0; border-top: 2px solid rgba(56, 189, 248, 0.4); }
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
      position: relative; z-index: 2; width: 360px; font-family: var(--font-mono, monospace);
      color: #38bdf8 !important; font-size: 0.75rem; 
      transition: opacity 0.4s, transform 0.4s;
    }"""
    
    new_css = r"""    #sys-preloader {
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      z-index: 10000; overflow: hidden;
      transition: visibility 1.2s;
      background: transparent;
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
      position: absolute; top: 50%; left: 50%; width: 360px; z-index: 2; 
      font-family: var(--font-mono, monospace);
      color: #38bdf8 !important; font-size: 0.75rem; 
      transition: opacity 0.4s;
    }"""
    
    # We also need to change the bootGlitch animation because we now use absolute translate for centering
    old_bootGlitch = r"""    @keyframes bootGlitch {
      0% { transform: scale(1.05); filter: drop-shadow(4px 0 rgba(244,114,182,0.8)) drop-shadow(-4px 0 rgba(103,232,249,0.8)); opacity: 0; }
      100% { transform: scale(1); filter: none; opacity: 1; }
    }"""
    new_bootGlitch = r"""    @keyframes bootGlitch {
      0% { transform: translate(-50%, -50%) scale(1.05); filter: drop-shadow(4px 0 rgba(244,114,182,0.8)) drop-shadow(-4px 0 rgba(103,232,249,0.8)); opacity: 0; }
      100% { transform: translate(-50%, -50%) scale(1); filter: none; opacity: 1; }
    }
    
    .preloader-content {
      transform: translate(-50%, -50%);
    }"""
    
    if old_css in content:
        content = content.replace(old_css, new_css)
        if old_bootGlitch in content:
            content = content.replace(old_bootGlitch, new_bootGlitch)
        
        with codecs.open('js/extra-features.js', 'w', encoding='utf-8') as f:
            f.write(content)
            
        # Bust Cache
        with codecs.open('index.html', 'r', encoding='utf-8') as f:
            html = f.read()
        ts = int(time.time() * 1000)
        html = re.sub(r'extra-features\.js\?v=[^"]+', f'extra-features.js?v={ts}', html)
        with codecs.open('index.html', 'w', encoding='utf-8') as f:
            f.write(html)
            
        print("Fixed layout correctly.")
    else:
        print("Could not find CSS block!")

if __name__ == '__main__':
    fix()
