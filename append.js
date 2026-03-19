
  /* ── PORTFOLIO ENHANCEMENTS (CURSOR & TILT) ── */
  function initEnhancements() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !window.matchMedia('(pointer: fine)').matches) return;

    // 1. Custom Cursor Creation
    const dot = document.createElement('div');
    dot.className = 'cursor-dot';
    const ring = document.createElement('div');
    ring.className = 'cursor-ring';
    document.body.appendChild(dot);
    document.body.appendChild(ring);

    let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
    let dotX = mouseX, dotY = mouseY;
    let ringX = mouseX, ringY = mouseY;
    
    // Smooth cursor logic
    function renderCursor() {
      dotX += (mouseX - dotX) * 0.4;
      dotY += (mouseY - dotY) * 0.4;
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;
      
      dot.style.transform = `translate(${dotX}px, ${dotY}px) translate(-50%, -50%)`;
      ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
      requestAnimationFrame(renderCursor);
    }
    requestAnimationFrame(renderCursor);

    // Track mouse global for everything
    window._sysClientX = mouseX;
    window._sysClientY = mouseY;
    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      window._sysClientX = mouseX;
      window._sysClientY = mouseY;
    });

    // Hover states - dynamically apply to elements
    const updateHoverStates = () => {
      document.querySelectorAll('a, button, .cta-btn, .nav-btn, .social-link, .focus-card').forEach(el => {
        if (!el.hasAttribute('data-hover-init')) {
          el.setAttribute('data-hover-init', 'true');
          el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
          el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
        }
      });
      // 2. 3D Tilt Effect
      document.querySelectorAll('.profile-card, .glass-card, .project-card, .work-card').forEach(el => {
        if (!el.hasAttribute('data-tilt-init')) {
          el.setAttribute('data-tilt-init', 'true');
          el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left; 
            const y = e.clientY - rect.top;
            const xc = rect.width / 2;
            const yc = rect.height / 2;
            const dx = (x - xc) / xc;
            const dy = (y - yc) / yc;
            el.style.transform = `perspective(1000px) rotateX(${-dy * 6}deg) rotateY(${dx * 6}deg) scale3d(1.02, 1.02, 1.02)`;
            el.style.transition = 'none';
          });
          el.addEventListener('mouseleave', () => {
            el.style.transform = '';
            el.style.transition = 'transform 0.5s var(--ease-out-expo)';
          });
        }
      });
    };
    updateHoverStates();
    setInterval(updateHoverStates, 1000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEnhancements);
  } else {
    initEnhancements();
  }
