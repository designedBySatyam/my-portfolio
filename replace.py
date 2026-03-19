import sys

def modify_css():
    with open('css/style.css', 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    
    # Chunk 1: Cursor
    target_cursor = """/* ── Legacy cursor cleanup ── */
.cursor-dot,
.cursor-ring {
  display: none !important;
}"""
    replacement_cursor = """/* ── Custom Cursor ── */
.cursor-dot {
  position: fixed; top: 0; left: 0; width: 8px; height: 8px;
  background: var(--accent); border-radius: 50%; pointer-events: none; z-index: 9999;
  transform: translate(-50%, -50%); transition: transform 0.1s var(--ease-out-expo), width 0.2s, height 0.2s, background 0.2s;
  mix-blend-mode: screen;
}
.cursor-ring {
  position: fixed; top: 0; left: 0; width: 36px; height: 36px;
  border: 1px solid var(--accent); border-radius: 50%; pointer-events: none; z-index: 9998;
  transform: translate(-50%, -50%); transition: transform 0.15s var(--ease-out-expo), width 0.2s, height 0.2s, border-color 0.2s;
}
.cursor-hover .cursor-dot { transform: translate(-50%, -50%) scale(0.5); background: var(--accent2); }
.cursor-hover .cursor-ring { width: 52px; height: 52px; border-color: var(--accent2); background: rgba(244, 114, 182, 0.05); }
[data-theme="light"] .cursor-dot { mix-blend-mode: multiply; }
@media (pointer: coarse), (hover: none) { .cursor-dot, .cursor-ring { display: none !important; } }"""

    # We will fallback to regex or flexible replacement
    import re
    # Replace cursor
    content = re.sub(r'/\*\s*──\s*Legacy cursor cleanup\s*──\s*\*/\s*\.cursor-dot,\s*\.cursor-ring\s*\{\s*display:\s*none\s*!important;\s*\}', replacement_cursor, content)

    # Replace button
    target_btn = r'(\.cta-btn\.primary\s*\{\s*background:\s*var\(--grad-primary\);\s*color:\s*#fff;\s*box-shadow:\s*0\s*0\s*26px\s*rgba\(56,\s*189,\s*248,\s*0\.28\);\s*\})'
    replacement_btn = r"""\1

.cta-btn.primary { position: relative; overflow: hidden; }
.cta-btn.primary::after {
  content: ''; position: absolute; top: 0; left: -100%; width: 50%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  transform: skewX(-20deg); transition: all 0.6s ease;
}
.cta-btn.primary:hover::after { left: 150%; }"""
    
    content = re.sub(target_btn, replacement_btn, content)

    with open('css/style.css', 'w', encoding='utf-8') as f:
        f.write(content)

if __name__ == '__main__':
    modify_css()
