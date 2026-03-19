'use strict';

/**
 * script.js — Advanced Constellation Background
 * Scene 08: Your skills as an interactive star map
 *
 * Features:
 *  - Real skill names + proficiency levels from your resume
 *  - 4 constellation groups: Languages, Web, Tools, Soft Skills
 *  - Stars sized by skill level (bigger = stronger)
 *  - Hover: star pulses, label appears, whole group highlights
 *  - Click: locks star, shows % badge
 *  - Shooting stars cross the field randomly
 *  - Nebula orbs drift behind constellations
 *  - Per-star twinkle at unique speed + phase
 *  - Per-star gentle float animation
 *  - Mouse parallax with smooth camera easing
 *  - Scroll throttle + tab-visibility RAF pause
 *  - Debounced resize
 *  - WebGL context lost/restored handlers
 *  - Reduced motion + high contrast support
 *  - Theme-aware opacity adjustments
 */

(() => {
  const PRM  = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const PHC  = window.matchMedia('(prefers-contrast: more)').matches;
  const FINE = window.matchMedia('(pointer: fine)').matches;

  /* ══════════════════════════════════════════════════
     THEME TOGGLE
  ══════════════════════════════════════════════════ */
  function initThemeToggle() {
    const root    = document.documentElement;
    const toggles = Array.from(document.querySelectorAll('#themeToggle, .theme-toggle'));

    const getStored = () => {
      try {
        const v = localStorage.getItem('portfolio-theme');
        return (v === 'light' || v === 'dark') ? v : null;
      } catch { return null; }
    };
    const store = (t) => { try { localStorage.setItem('portfolio-theme', t); } catch {} };
    const apply = (theme) => {
      root.setAttribute('data-theme', theme);
      toggles.forEach(t => t.setAttribute('aria-pressed', theme === 'light' ? 'true' : 'false'));
      window.dispatchEvent(new CustomEvent('portfolio-theme-change', { detail: { theme } }));
    };

    apply(getStored() || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'));
    toggles.forEach(t => t.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      apply(next); store(next);
    }));
  }

  /* ══════════════════════════════════════════════════
     SMOOTH ANCHORS
  ══════════════════════════════════════════════════ */
  function initSmoothAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const href = a.getAttribute('href');
        if (!href || href === '#') return;
        const el = document.querySelector(href);
        if (!el) return;
        e.preventDefault();
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  /* ══════════════════════════════════════════════════
     ROLE TYPER
  ══════════════════════════════════════════════════ */
  function initRoleTyper() {
    const el = document.getElementById('roleTyper');
    if (!el || PRM) return;
    const roles = [
      'ASPIRING SOFTWARE DEVELOPER',
      'FRONTEND DEVELOPER | Student',
      'WEB DEVELOPMENT STUDENT',
      'TECH ENTHUSIAST',
    ];
    let ri = 0, ci = 0, del = false;
    function tick() {
      const cur = roles[ri];
      del ? ci-- : ci++;
      el.textContent = cur.slice(0, ci);
      let d = del ? 45 : 85;
      if (!del && ci === cur.length) { del = true; d = 1600; }
      else if (del && ci === 0) { del = false; ri = (ri + 1) % roles.length; d = 320; }
      setTimeout(tick, d);
    }
    setTimeout(tick, 700);
  }

  /* ══════════════════════════════════════════════════
     SCROLL REVEAL
  ══════════════════════════════════════════════════ */
  function initRevealAnimations() {
    const items = document.querySelectorAll('[data-animate]');
    if (!items.length || PRM) return;
    const obs = new IntersectionObserver((entries, o) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); o.unobserve(e.target); }
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -40px 0px' });
    items.forEach(i => obs.observe(i));
  }

  /* ── Dot Grid Particles ── */
  function initDotGridParticles() {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W = 0;
    let H = 0;
    let particles = [];

    const getDpr = () => Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      W = window.innerWidth;
      H = window.innerHeight;
      const dpr = getDpr();
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function makeParticle() {
      return {
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.2 + 0.4,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        alpha: Math.random() * 0.4 + 0.1,
        pulse: Math.random() * Math.PI * 2
      };
    }

    function vignetteAlpha(x, y) {
      const dx = (x / W - 0.5) * 2;
      const dy = (y / H - 0.5) * 2;
      const d = Math.sqrt(dx * dx + dy * dy);
      return Math.max(0, 1 - Math.pow(d / 1.0, 1.6));
    }

    function init() {
      resize();
      const count = Math.min(Math.floor((W * H) / 14000), 110);
      particles = Array.from({ length: count }, makeParticle);
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      const mx = window._sysClientX || -1000;
      const my = window._sysClientY || -1000;
      
      particles.forEach((p) => {
        // Repel from mouse
        const dx = p.x - mx;
        const dy = p.y - my;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 120) {
          const force = (120 - dist) / 120;
          p.x += (dx / dist) * force * 2.5;
          p.y += (dy / dist) * force * 2.5;
        }

        p.x += p.vx;
        p.y += p.vy;
        p.pulse += 0.012;

        if (p.x < -5) p.x = W + 5;
        if (p.x > W + 5) p.x = -5;
        if (p.y < -5) p.y = H + 5;
        if (p.y > H + 5) p.y = -5;

        const breathe = 0.5 + 0.5 * Math.sin(p.pulse);
        const va = vignetteAlpha(p.x, p.y);
        const a = p.alpha * breathe * va;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(167, 139, 250, ${a})`;
        ctx.fill();
      });

      requestAnimationFrame(draw);
    }

    window.addEventListener('resize', () => {
      resize();
      particles.forEach((p) => {
        p.x = Math.random() * W;
        p.y = Math.random() * H;
      });
    });

    init();
    draw();
  }

  /* ══════════════════════════════════════════════════
     SCROLL LOCK CLEANUP
  ══════════════════════════════════════════════════ */
  function releaseStaleScrollLocks() {
    const unlock = () => {
      const d = document.querySelector('.nav-drawer.open');
      const p = document.getElementById('cmdOverlay')?.classList.contains('cmd-open');
      if (!d && !p) document.body.style.overflow = '';
    };
    unlock();
    window.addEventListener('pageshow', unlock);
  }

  /* ══════════════════════════════════════════════════
     ADVANCED CONSTELLATION BACKGROUND
  ══════════════════════════════════════════════════ */
  function initConstellationBackground() {
    const canvas = document.getElementById('starfield') || document.getElementById('canvas3d');
    if (!canvas || typeof THREE === 'undefined') return;

    /* ── Skill groups — real data from your resume ── */
    const GROUPS = [
      {
        name: 'Languages',
        color: 0x38bdf8,
        colorHex: '#38bdf8',
        skills: [
          { name: 'C++',    level: 0.85, x: -10, y:  5,  z:  2  },
          { name: 'Java',   level: 0.80, x:  -7, y:  2,  z: -1  },
          { name: 'Python', level: 0.75, x:  -6, y:  7,  z:  3  },
          { name: 'DSA',    level: 0.70, x: -12, y:  2,  z:  1  },
        ]
      },
      {
        name: 'Web Dev',
        color: 0x4ade80,
        colorHex: '#4ade80',
        skills: [
          { name: 'HTML & CSS',  level: 0.90, x:  3,  y:  6,  z:  2  },
          { name: 'JavaScript',  level: 0.80, x:  6,  y:  3,  z: -1  },
          { name: 'Three.js',    level: 0.72, x:  5,  y:  8,  z:  3  },
          { name: 'Node.js',     level: 0.65, x:  9,  y:  1,  z:  2  },
          { name: 'React',       level: 0.60, x:  8,  y:  5,  z:  1  },
        ]
      },
      {
        name: 'Tools',
        color: 0xf472b6,
        colorHex: '#f472b6',
        skills: [
          { name: 'MySQL',    level: 0.80, x:  2,  y: -5,  z:  1  },
          { name: 'Git',      level: 0.75, x: -3,  y: -4,  z: -2  },
          { name: 'Firebase', level: 0.70, x:  5,  y: -7,  z:  2  },
          { name: 'MongoDB',  level: 0.60, x: -1,  y: -8,  z:  3  },
        ]
      },
      {
        name: 'Soft Skills',
        color: 0xc084fc,
        colorHex: '#c084fc',
        skills: [
          { name: 'Problem Solving', level: 0.90, x: -8,  y: -2,  z:  3  },
          { name: 'Teamwork',        level: 0.85, x: -11, y: -5,  z:  1  },
          { name: 'Communication',   level: 0.80, x:  -6, y: -7,  z: -1  },
          { name: 'Adaptability',    level: 0.88, x: -12, y: -4,  z:  2  },
        ]
      },
    ];

    /* ── Renderer setup ── */
    const evalLP = () => window.innerWidth < 768;
    let isLP = evalLP();

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas, antialias: !isLP, alpha: true,
        powerPreference: isLP ? 'low-power' : 'high-performance',
      });
    } catch (err) {
      console.warn('[constellation] WebGL init failed:', err);
      return;
    }

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isLP ? 1.5 : 2));

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 300);
    camera.position.z = 26;

    /* ── Canvas texture helpers ── */
    function makeLabel(text, colorHex) {
      const c   = document.createElement('canvas');
      c.width   = 256; c.height = 48;
      const ctx = c.getContext('2d');
      ctx.clearRect(0, 0, 256, 48);
      ctx.fillStyle = 'rgba(2,12,24,0.85)';
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(4, 8, 248, 32, 6);
      else ctx.rect(4, 8, 248, 32);
      ctx.fill();
      ctx.strokeStyle = colorHex + 'bb';
      ctx.lineWidth   = 1.5;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(4, 8, 248, 32, 6);
      else ctx.rect(4, 8, 248, 32);
      ctx.stroke();
      ctx.fillStyle    = colorHex;
      ctx.font         = 'bold 15px monospace';
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, 128, 24);
      const tex         = new THREE.CanvasTexture(c);
      tex.needsUpdate   = true;
      return tex;
    }

    function makePercent(text, colorHex) {
      const c   = document.createElement('canvas');
      c.width   = 96; c.height = 40;
      const ctx = c.getContext('2d');
      ctx.clearRect(0, 0, 96, 40);
      ctx.fillStyle = colorHex + '22';
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(2, 2, 92, 36, 8);
      else ctx.rect(2, 2, 92, 36);
      ctx.fill();
      ctx.strokeStyle  = colorHex + '88';
      ctx.lineWidth    = 1;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(2, 2, 92, 36, 8);
      else ctx.rect(2, 2, 92, 36);
      ctx.stroke();
      ctx.fillStyle    = colorHex;
      ctx.font         = 'bold 17px monospace';
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, 48, 20);
      const tex       = new THREE.CanvasTexture(c);
      tex.needsUpdate = true;
      return tex;
    }

    function makeGroupTag(text, colorHex) {
      const c   = document.createElement('canvas');
      c.width   = 200; c.height = 36;
      const ctx = c.getContext('2d');
      ctx.clearRect(0, 0, 200, 36);
      ctx.fillStyle    = colorHex + '18';
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(2, 2, 196, 32, 5);
      else ctx.rect(2, 2, 196, 32);
      ctx.fill();
      ctx.strokeStyle  = colorHex + '55';
      ctx.lineWidth    = 1;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(2, 2, 196, 32, 5);
      else ctx.rect(2, 2, 196, 32);
      ctx.stroke();
      ctx.fillStyle    = colorHex + 'cc';
      ctx.font         = '11px monospace';
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text.toUpperCase(), 100, 18);
      const tex       = new THREE.CanvasTexture(c);
      tex.needsUpdate = true;
      return tex;
    }

    /* ── Build constellation ── */
    const starMeshes = [];    // for raycasting
    const starData   = [];    // metadata
    const lineData   = [];    // edge metadata
    let   lockedIdx  = null;  // clicked star

    GROUPS.forEach((grp, gi) => {
      /* Group centroid for group-label placement */
      const cx = grp.skills.reduce((s, k) => s + k.x, 0) / grp.skills.length;
      const cy = grp.skills.reduce((s, k) => s + k.y, 0) / grp.skills.length;
      const cz = grp.skills.reduce((s, k) => s + k.z, 0) / grp.skills.length;

      /* Group name label — always slightly visible */
      const gtex = makeGroupTag(grp.name, grp.colorHex);
      const gmat = new THREE.SpriteMaterial({ map: gtex, transparent: true, opacity: 0.35, depthWrite: false });
      const gsp  = new THREE.Sprite(gmat);
      gsp.scale.set(3.0, 0.55, 1);
      gsp.position.set(cx, cy + 3.2, cz);
      scene.add(gsp);

      grp.skills.forEach((sk, si) => {
        const radius = 0.18 + sk.level * 0.30;

        /* Core star */
        const starGeo = new THREE.SphereGeometry(radius, 12, 12);
        const starMat = new THREE.MeshBasicMaterial({ color: grp.color, transparent: true, opacity: 0.9 });
        const star    = new THREE.Mesh(starGeo, starMat);
        star.position.set(sk.x, sk.y, sk.z);
        scene.add(star);

        /* Inner bright core — tiny, very bright */
        const coreGeo = new THREE.SphereGeometry(radius * 0.45, 8, 8);
        const coreMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6 });
        const coreM   = new THREE.Mesh(coreGeo, coreMat);
        coreM.position.set(sk.x, sk.y, sk.z);
        scene.add(coreM);

        /* Spinning ring */
        const ringGeo = new THREE.RingGeometry(radius + 0.12, radius + 0.30, 28);
        const ringMat = new THREE.MeshBasicMaterial({ color: grp.color, transparent: true, opacity: 0.15, side: THREE.DoubleSide });
        const ring    = new THREE.Mesh(ringGeo, ringMat);
        ring.position.set(sk.x, sk.y, sk.z);
        scene.add(ring);

        /* Outer halo — large, faint */
        const haloGeo = new THREE.RingGeometry(radius + 0.40, radius + 1.1, 28);
        const haloMat = new THREE.MeshBasicMaterial({ color: grp.color, transparent: true, opacity: 0.04, side: THREE.DoubleSide });
        const halo    = new THREE.Mesh(haloGeo, haloMat);
        halo.position.set(sk.x, sk.y, sk.z);
        scene.add(halo);

        /* Name label */
        const labelTex = makeLabel(sk.name, grp.colorHex);
        const labelMat = new THREE.SpriteMaterial({ map: labelTex, transparent: true, opacity: 0, depthWrite: false });
        const label    = new THREE.Sprite(labelMat);
        label.scale.set(3.0, 0.58, 1);
        label.position.set(sk.x, sk.y + radius + 0.65, sk.z);
        scene.add(label);

        /* Percent badge — shows on click */
        const pctTex = makePercent(`${Math.round(sk.level * 100)}%`, grp.colorHex);
        const pctMat = new THREE.SpriteMaterial({ map: pctTex, transparent: true, opacity: 0, depthWrite: false });
        const pctBadge = new THREE.Sprite(pctMat);
        pctBadge.scale.set(1.1, 0.46, 1);
        pctBadge.position.set(sk.x + 0.9, sk.y - radius - 0.5, sk.z);
        scene.add(pctBadge);

        /* Per-star random animation params */
        const twinklePhase = Math.random() * Math.PI * 2;
        const twinkleSpeed = 0.5 + Math.random() * 1.4;
        const floatPhase   = Math.random() * Math.PI * 2;
        const floatSpeed   = 0.12 + Math.random() * 0.22;
        const floatAmp     = 0.06 + Math.random() * 0.14;
        const ringTilt     = Math.random() * Math.PI;

        starMeshes.push(star);
        starData.push({
          star, coreM, ring, halo, label, pctBadge,
          starMat, coreMat, ringMat, haloMat, labelMat, pctMat,
          gmat,         // group label mat (ref)
          sk, grp, gi,
          twinklePhase, twinkleSpeed,
          floatPhase, floatSpeed, floatAmp, ringTilt,
          basePos: new THREE.Vector3(sk.x, sk.y, sk.z),
          idx: starData.length,
        });
      });

      /* Constellation edges */
      const positions = grp.skills.map(s => new THREE.Vector3(s.x, s.y, s.z));
      for (let a = 0; a < positions.length; a++) {
        for (let b = a + 1; b < positions.length; b++) {
          if (positions[a].distanceTo(positions[b]) < 9.0) {
            const geo  = new THREE.BufferGeometry().setFromPoints([positions[a].clone(), positions[b].clone()]);
            const mat  = new THREE.LineBasicMaterial({ color: grp.color, transparent: true, opacity: 0.14 });
            const line = new THREE.Line(geo, mat);
            scene.add(line);
            lineData.push({ mat, gi, base: 0.14 });
          }
        }
      }

      /* Shooting star data (added later) */
    });

    /* ── Background particle field ── */
    if (!PHC) {
      const pCnt = PRM ? 700 : isLP ? 500 : 1800;
      const pGeo = new THREE.BufferGeometry();
      const pPos = new Float32Array(pCnt * 3);
      const pCol = new Float32Array(pCnt * 3);
      for (let i = 0; i < pCnt; i++) {
        pPos[i*3]   = (Math.random() - 0.5) * 140;
        pPos[i*3+1] = (Math.random() - 0.5) * 100;
        pPos[i*3+2] = (Math.random() - 0.5) * 70;
        const v = Math.random();
        if (v < 0.45) { pCol[i*3]=0.22; pCol[i*3+1]=0.74; pCol[i*3+2]=0.97; }
        else if (v < 0.72) { pCol[i*3]=0.95; pCol[i*3+1]=0.44; pCol[i*3+2]=0.71; }
        else { pCol[i*3]=0.38; pCol[i*3+1]=0.39; pCol[i*3+2]=0.50; }
      }
      pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
      pGeo.setAttribute('color',    new THREE.BufferAttribute(pCol, 3));
      const pMat = new THREE.PointsMaterial({ size: 0.09, vertexColors: true, transparent: true, opacity: 0.42 });
      scene.add(new THREE.Points(pGeo, pMat));

      window.addEventListener('portfolio-theme-change', e => {
        pMat.opacity = e?.detail?.theme === 'light' ? 0.60 : 0.42;
      });
    }

    /* ── Nebula orbs ── */
    if (!PRM && !PHC) {
      [
        [ 15,  4, -22, 0x38bdf8, 0.040],
        [-16, -3, -20, 0xf472b6, 0.035],
        [  1,  9, -25, 0xc084fc, 0.028],
        [-10, -9, -18, 0x4ade80, 0.022],
      ].forEach(([x, y, z, c, o]) => {
        const m = new THREE.Mesh(
          new THREE.SphereGeometry(5 + Math.random() * 2.5, 10, 10),
          new THREE.MeshBasicMaterial({ color: c, wireframe: true, transparent: true, opacity: o })
        );
        m.position.set(x, y, z);
        scene.add(m);
      });
    }

    /* ── Shooting stars ── */
    const shooters = [];
    if (!PRM && !PHC) {
      for (let i = 0; i < 4; i++) {
        const geo  = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,0), new THREE.Vector3(-3.5, 0.5, 0)]);
        const mat  = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 });
        const line = new THREE.Line(geo, mat);
        scene.add(line);
        shooters.push({ line, mat, active: false, progress: 0, speed: 0, sx:0, sy:0, dx:0, dy:0, cooldown: 3 + i * 3.5 + Math.random() * 6 });
      }
    }

    /* ── Raycaster + mouse ── */
    const raycaster = new THREE.Raycaster();
    const mouseVec  = new THREE.Vector2(9999, 9999);
    let mouseX = 0, mouseY = 0;

    const onMove = (e) => {
      mouseX = (e.clientX / window.innerWidth  - 0.5) * 2;
      mouseY = -(e.clientY / window.innerHeight - 0.5) * 2;
      mouseVec.x = mouseX;
      mouseVec.y = mouseY;
    };

    if (!PRM && FINE) document.addEventListener('mousemove', onMove);

    /* Click to lock/unlock a star */
    canvas.addEventListener('click', () => {
      raycaster.setFromCamera(mouseVec, camera);
      const hits = raycaster.intersectObjects(starMeshes);
      if (hits.length > 0) {
        const idx = starMeshes.indexOf(hits[0].object);
        lockedIdx = (lockedIdx === idx) ? null : idx;
      } else {
        lockedIdx = null;
      }
    });

    /* ── Theme awareness ── */
    function applyTheme(theme) {
      const light = theme === 'light';
      starData.forEach(d => { d.starMat.opacity = light ? 1.0 : 0.9; });
      lineData.forEach(l => { l.base = light ? 0.22 : 0.14; });
    }
    applyTheme(document.documentElement.getAttribute('data-theme') || 'dark');
    window.addEventListener('portfolio-theme-change', e => applyTheme(e?.detail?.theme || 'dark'));

    /* ── Animation loop ── */
    const clock = new THREE.Clock();
    let rafId       = null;
    let isScrolling = false;
    let scrollTimer = null;
    let lastFrame   = 0;
    const TARGET_FPS = isLP ? (1000 / 24) : (1000 / 60);

    function renderFrame() {
      const t = clock.getElapsedTime();

      /* Raycasting for hover */
      raycaster.setFromCamera(mouseVec, camera);
      const hits      = raycaster.intersectObjects(starMeshes);
      const hitIdxSet = new Set(hits.map(h => starMeshes.indexOf(h.object)));

      /* Determine active group */
      let activeGI = -1;
      if (lockedIdx !== null) activeGI = starData[lockedIdx].gi;
      else if (hitIdxSet.size > 0) activeGI = starData[[...hitIdxSet][0]].gi;

      /* ── Per-star updates ── */
      starData.forEach((d, i) => {
        const hovered  = hitIdxSet.has(i);
        const locked   = lockedIdx === i;
        const active   = hovered || locked;
        const inGroup  = activeGI === d.gi;
        const dimmed   = activeGI >= 0 && !inGroup;

        /* Floating Y offset */
        const fy = Math.sin(t * d.floatSpeed + d.floatPhase) * d.floatAmp;
        const py = d.basePos.y + fy;

        d.star.position.y     = py;
        d.coreM.position.y    = py;
        d.ring.position.y     = py;
        d.halo.position.y     = py;
        d.label.position.y    = py + d.sk.level * 0.30 + 0.18 + 0.65;
        d.pctBadge.position.y = py - d.sk.level * 0.30 - 0.18 - 0.50;

        /* Twinkle */
        const twinkle  = 0.62 + Math.sin(t * d.twinkleSpeed + d.twinklePhase) * 0.38;
        const baseOp   = active ? 1.0 : inGroup ? twinkle * 0.90 : dimmed ? twinkle * 0.28 : twinkle * 0.72;
        d.starMat.opacity  += (baseOp   - d.starMat.opacity)  * 0.10;
        d.coreMat.opacity  += ((active ? 0.9 : inGroup ? 0.55 : 0.35) * twinkle - d.coreMat.opacity) * 0.10;

        /* Scale */
        const targetSc = active ? 1.6 : inGroup ? 1.12 : dimmed ? 0.85 : 1.0;
        d.star.scale.x += (targetSc - d.star.scale.x) * 0.10;
        d.star.scale.y  = d.star.scale.z = d.star.scale.x;
        d.coreM.scale.x = d.coreM.scale.y = d.coreM.scale.z = d.star.scale.x;

        /* Ring — tilts + spins */
        d.ring.rotation.z  = t * 0.45 + d.ringTilt;
        d.ring.rotation.x  = t * 0.22 + d.ringTilt * 0.5;
        const targetRingOp = active ? 0.75 : inGroup ? 0.28 : dimmed ? 0.04 : 0.12;
        d.ringMat.opacity  += (targetRingOp - d.ringMat.opacity) * 0.10;

        /* Halo */
        d.halo.rotation.z = -t * 0.28;
        const targetHalo  = active ? 0.22 : inGroup ? 0.08 : dimmed ? 0.01 : 0.04;
        d.haloMat.opacity += (targetHalo - d.haloMat.opacity) * 0.08;

        /* Name label — show on hover/lock or when group is active */
        const targetLabel = active ? 1.0 : (inGroup && activeGI >= 0) ? 0.50 : 0.0;
        d.labelMat.opacity += (targetLabel - d.labelMat.opacity) * 0.09;

        /* Pct badge — only when locked */
        const targetPct = locked ? 1.0 : 0.0;
        d.pctMat.opacity += (targetPct - d.pctMat.opacity) * 0.09;
      });

      /* ── Group label opacity ── */
      /* Each group has one shared gmat — update via first star in group */
      GROUPS.forEach((grp, gi) => {
        const inGroup = activeGI === gi;
        const dimmed  = activeGI >= 0 && !inGroup;
        const targetGLabelOp = inGroup ? 0.85 : dimmed ? 0.10 : 0.30;
        // Find first star of this group
        const rep = starData.find(d => d.gi === gi);
        if (rep) rep.gmat.opacity += (targetGLabelOp - rep.gmat.opacity) * 0.08;
      });

      /* ── Constellation line brightness ── */
      lineData.forEach(l => {
        const inGroup   = activeGI === l.gi;
        const dimmed    = activeGI >= 0 && !inGroup;
        const targetOp  = inGroup ? l.base * 2.8 : dimmed ? l.base * 0.20 : l.base;
        l.mat.opacity  += (targetOp - l.mat.opacity) * 0.09;
      });

      /* ── Shooting stars ── */
      shooters.forEach(s => {
        s.cooldown -= 0.016;
        if (!s.active && s.cooldown <= 0) {
          s.active   = true; s.progress = 0;
          s.speed    = 0.010 + Math.random() * 0.016;
          s.sx       = (Math.random() - 0.5) * 28;
          s.sy       = 7 + Math.random() * 5;
          s.dx       = 0.35 + Math.random() * 0.45;
          s.dy       = -(0.12 + Math.random() * 0.18);
          s.cooldown = 6 + Math.random() * 14;
        }
        if (s.active) {
          s.progress = Math.min(s.progress + s.speed, 1);
          s.line.position.set(s.sx + s.progress * 22 * s.dx, s.sy + s.progress * 22 * s.dy, -5);
          s.line.rotation.z = Math.atan2(s.dy, s.dx);
          const fade = s.progress < 0.25 ? s.progress / 0.25 : (1 - s.progress) / 0.75;
          s.mat.opacity = Math.max(0, fade * 0.88);
          if (s.progress >= 1) { s.active = false; s.mat.opacity = 0; }
        }
      });

      /* ── Camera parallax ── */
      const ease = isLP ? 0.018 : 0.028;
      camera.position.x += (mouseX * 3.8 - camera.position.x) * ease;
      camera.position.y += (mouseY * 2.2 - camera.position.y) * ease;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    }

    function animate(now = 0) {
      rafId = requestAnimationFrame(animate);
      const interval = isScrolling ? Math.max(TARGET_FPS, 1000 / 26) : TARGET_FPS;
      if (now - lastFrame < interval) return;
      lastFrame = now;
      renderFrame();
    }

    renderFrame();
    if (!PRM) animate();

    /* ── Lifecycle events ── */
    document.addEventListener('visibilitychange', () => {
      if (PRM) return;
      if (document.hidden) {
        if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
      } else if (!rafId) {
        clock.getDelta(); lastFrame = 0; animate();
      }
    });

    window.addEventListener('scroll', () => {
      isScrolling = true;
      if (scrollTimer) clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => { isScrolling = false; lastFrame = 0; }, 120);
    }, { passive: true });

    let resizeTimer = null;
    window.addEventListener('resize', () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        isLP = evalLP();
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isLP ? 1.5 : 2));
        lastFrame = 0;
      }, 100);
    });

    canvas.addEventListener('webglcontextlost', e => {
      e.preventDefault();
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    });

    canvas.addEventListener('webglcontextrestored', () => {
      if (!PRM && !rafId) { clock.getDelta(); lastFrame = 0; animate(); }
    });
  }

  
  /* ══════════════════════════════════════════════════
     PORTFOLIO ENHANCEMENTS (CURSOR & TILT)
  ══════════════════════════════════════════════════ */
  function initEnhancements() {
    if (PRM || !FINE) return; // Skip if reduced motion or touch

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

    // Track mouse global
    window._sysClientX = mouseX;
    window._sysClientY = mouseY;
    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      window._sysClientX = mouseX;
      window._sysClientY = mouseY;
    });

    // Hover states
    const hoverElements = document.querySelectorAll('a, button, .cta-btn, .nav-btn, .social-link, .focus-card');
    hoverElements.forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });

    // 2. 3D Tilt Effect
    const tiltElements = document.querySelectorAll('.profile-card, .glass-card, .project-card, .work-card');
    tiltElements.forEach(el => {
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
    });
  }


  /* ══════════════════════════════════════════════════
     PORTFOLIO ENHANCEMENTS (CURSOR & TILT)
  ══════════════════════════════════════════════════ */
  function initEnhancements() {
    if (PRM || !FINE) return; // Skip if reduced motion or touch

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

    // Track mouse global
    window._sysClientX = mouseX;
    window._sysClientY = mouseY;
    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      window._sysClientX = mouseX;
      window._sysClientY = mouseY;
    });

    // Hover states
    const hoverElements = document.querySelectorAll('a, button, .cta-btn, .nav-btn, .social-link, .focus-card');
    hoverElements.forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });

    // 2. 3D Tilt Effect
    const tiltElements = document.querySelectorAll('.profile-card, .glass-card, .project-card, .work-card');
    tiltElements.forEach(el => {
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
    });
  }

/* ══════════════════════════════════════════════════
     BOOT
  ══════════════════════════════════════════════════ */
  
  /* ── PORTFOLIO ENHANCEMENTS (CURSOR & TILT) ── */
  function initEnhancements() {
    if (PRM || !FINE) return; // Skip if reduced motion or touch

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

    // Track mouse global
    window._sysClientX = mouseX;
    window._sysClientY = mouseY;
    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      window._sysClientX = mouseX;
      window._sysClientY = mouseY;
    });

    // Hover states
    const hoverElements = document.querySelectorAll('a, button, .cta-btn, .nav-btn, .social-link, .focus-card');
    hoverElements.forEach(el => {
      el.addEventListener('mouseenter', () => { document.body.classList.add('cursor-hover'); });
      el.addEventListener('mouseleave', () => { document.body.classList.remove('cursor-hover'); });
    });

    // 2. 3D Tilt Effect
    const tiltElements = document.querySelectorAll('.profile-card, .glass-card, .project-card, .work-card');
    tiltElements.forEach(el => {
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
    });
  }

document.addEventListener('DOMContentLoaded', () => {
    releaseStaleScrollLocks();
    initThemeToggle();
    initSmoothAnchors();
    initRoleTyper();
    initRevealAnimations();
    initDotGridParticles();
    initConstellationBackground();
    initEnhancements();
    initEnhancements();
    initEnhancements();
  });

})();

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
