'use strict';

(() => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function initThemeToggle() {
    const root = document.documentElement;
    const toggles = Array.from(document.querySelectorAll('#themeToggle, .theme-toggle'));

    const getStoredTheme = () => {
      try {
        const value = localStorage.getItem('portfolio-theme');
        return value === 'light' || value === 'dark' ? value : null;
      } catch (error) {
        return null;
      }
    };

    const storeTheme = (theme) => {
      try {
        localStorage.setItem('portfolio-theme', theme);
      } catch (error) {
        // Ignore storage failures (private mode / restricted storage)
      }
    };

    const applyTheme = (theme) => {
      root.setAttribute('data-theme', theme);
      toggles.forEach((toggle) => {
        toggle.setAttribute('aria-pressed', theme === 'light' ? 'true' : 'false');
      });
      window.dispatchEvent(new CustomEvent('portfolio-theme-change', {
        detail: { theme }
      }));
    };

    const systemDefault = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    const initialTheme = getStoredTheme() || systemDefault;
    applyTheme(initialTheme);

    if (!toggles.length) return;

    toggles.forEach((toggle) => {
      toggle.addEventListener('click', () => {
        const current = root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
        const next = current === 'light' ? 'dark' : 'light';
        applyTheme(next);
        storeTheme(next);
      });
    });
  }

  function initSmoothAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', (event) => {
        const href = anchor.getAttribute('href');
        if (!href || href === '#') return;

        const target = document.querySelector(href);
        if (!target) return;

        event.preventDefault();
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      });
    });
  }

  function initRoleTyper() {
    const roleElement = document.getElementById('roleTyper');
    if (!roleElement || prefersReducedMotion) return;

    const roles = [
      'CREATIVE DEVELOPER',
      'IMMERSIVE EXPERIENCE BUILDER',
      'THREE.JS SPECIALIST',
      'INTERACTIVE WEB DESIGNER'
    ];

    let roleIndex = 0;
    let charIndex = 0;
    let deleting = false;

    function tick() {
      const currentRole = roles[roleIndex];

      if (deleting) {
        charIndex -= 1;
      } else {
        charIndex += 1;
      }

      roleElement.textContent = currentRole.slice(0, charIndex);

      let delay = deleting ? 45 : 85;

      if (!deleting && charIndex === currentRole.length) {
        deleting = true;
        delay = 1500;
      } else if (deleting && charIndex === 0) {
        deleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        delay = 320;
      }

      window.setTimeout(tick, delay);
    }

    window.setTimeout(tick, 650);
  }

  function initRevealAnimations() {
    const revealItems = document.querySelectorAll('[data-animate]');
    if (!revealItems.length || prefersReducedMotion) return;

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      });
    }, {
      threshold: 0.18,
      rootMargin: '0px 0px -40px 0px'
    });

    revealItems.forEach((item) => observer.observe(item));
  }

  function initThreeBackground() {
    const canvas = document.getElementById('starfield') || document.getElementById('canvas3d');
    if (!canvas || typeof THREE === 'undefined') return;

    const supportsFinePointer = window.matchMedia('(pointer: fine)').matches;
    const evaluateLowPower = () => window.innerWidth < 768;

    let isLowPowerDevice = evaluateLowPower();
    let targetFrameInterval = isLowPowerDevice ? (1000 / 24) : (1000 / 60);
    let renderer;

    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: !isLowPowerDevice,
        alpha: true,
        powerPreference: isLowPowerDevice ? 'low-power' : 'high-performance'
      });
    } catch (error) {
      console.warn('Three.js renderer initialization failed:', error);
      return;
    }

    renderer.setSize(window.innerWidth, window.innerHeight);
    const scene = new THREE.Scene();
    const setRendererQuality = () => {
      isLowPowerDevice = evaluateLowPower();
      targetFrameInterval = isLowPowerDevice ? (1000 / 24) : (1000 / 60);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isLowPowerDevice ? 1.5 : 2));
    };
    setRendererQuality();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 30;

    const particleCount = prefersReducedMotion ? 1200 : isLowPowerDevice ? 800 : 2600;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i += 1) {
      positions[i * 3] = (Math.random() - 0.5) * 110;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 110;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 110;

      const blend = Math.random();
      colors[i * 3] = blend < 0.5 ? 0.31 : 0.97;
      colors[i * 3 + 1] = blend < 0.5 ? 0.56 : 0.31;
      colors[i * 3 + 2] = blend < 0.5 ? 0.97 : 0.56;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.14,
      vertexColors: true,
      transparent: true,
      opacity: 0.68
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    let torusMaterial = null;
    let torus = null;
    let sphereMaterial = null;
    let sphere = null;
    let emeraldMaterial = null;
    let emeraldKnot = null;
    let emeraldOrbMaterial = null;
    let emeraldOrb = null;
    if (!prefersReducedMotion) {
      torusMaterial = new THREE.MeshBasicMaterial({
        color: 0x4f8ef7,
        wireframe: true,
        transparent: true,
        opacity: 0.08
      });
      torus = new THREE.Mesh(
        new THREE.TorusGeometry(
          8,
          2.5,
          isLowPowerDevice ? 12 : 16,
          isLowPowerDevice ? 48 : 60
        ),
        torusMaterial
      );
      torus.position.set(15, -5, -10);
      scene.add(torus);

      sphereMaterial = new THREE.MeshBasicMaterial({
        color: 0xf74f8e,
        wireframe: true,
        transparent: true,
        opacity: 0.08
      });
      sphere = new THREE.Mesh(
        new THREE.IcosahedronGeometry(5, isLowPowerDevice ? 0 : 1),
        sphereMaterial
      );
      sphere.position.set(-15, 5, -15);
      scene.add(sphere);

      emeraldMaterial = new THREE.MeshBasicMaterial({
        color: 0x35f7a3,
        wireframe: true,
        transparent: true,
        opacity: isLowPowerDevice ? 0.06 : 0.08
      });
      emeraldKnot = new THREE.Mesh(
        new THREE.TorusKnotGeometry(
          isLowPowerDevice ? 2.3 : 2.9,
          isLowPowerDevice ? 0.7 : 0.9,
          isLowPowerDevice ? 64 : 96,
          isLowPowerDevice ? 10 : 14
        ),
        emeraldMaterial
      );
      emeraldKnot.position.set(24, -10, -28);
      scene.add(emeraldKnot);

      emeraldOrbMaterial = new THREE.MeshBasicMaterial({
        color: 0x35f7a3,
        wireframe: true,
        transparent: true,
        opacity: isLowPowerDevice ? 0.05 : 0.07
      });
      emeraldOrb = new THREE.Mesh(
        new THREE.OctahedronGeometry(isLowPowerDevice ? 3 : 3.6, 0),
        emeraldOrbMaterial
      );
      emeraldOrb.position.set(27, 9, -26);
      scene.add(emeraldOrb);
    }

    let mouseX = 0;
    let mouseY = 0;

    if (!prefersReducedMotion && !isLowPowerDevice && supportsFinePointer) {
      document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX / window.innerWidth - 0.5) * 2;
        mouseY = -(event.clientY / window.innerHeight - 0.5) * 2;
      });
    }

    const clock = new THREE.Clock();
    let rafId = null;
    let isScrolling = false;
    let scrollIdleTimer = null;
    let lastFrameAt = 0;

    function applySceneTheme(theme) {
      const isLight = theme === 'light';
      particleMaterial.opacity = isLight ? 0.76 : 0.68;
      particleMaterial.size = isLight ? 0.15 : 0.14;
      if (torusMaterial) {
        torusMaterial.opacity = isLight ? 0.1 : 0.08;
        torusMaterial.color.setHex(isLight ? 0x417be0 : 0x4f8ef7);
      }
      if (sphereMaterial) {
        sphereMaterial.opacity = isLight ? 0.1 : 0.08;
        sphereMaterial.color.setHex(isLight ? 0xe14b8f : 0xf74f8e);
      }
      if (emeraldMaterial) {
        emeraldMaterial.opacity = isLight ? (isLowPowerDevice ? 0.08 : 0.1) : (isLowPowerDevice ? 0.06 : 0.08);
        emeraldMaterial.color.setHex(isLight ? 0x2fd88f : 0x35f7a3);
      }
      if (emeraldOrbMaterial) {
        emeraldOrbMaterial.opacity = isLight ? (isLowPowerDevice ? 0.07 : 0.09) : (isLowPowerDevice ? 0.05 : 0.07);
        emeraldOrbMaterial.color.setHex(isLight ? 0x2fd88f : 0x35f7a3);
      }
    }

    applySceneTheme(document.documentElement.getAttribute('data-theme') || 'dark');
    window.addEventListener('portfolio-theme-change', (event) => {
      const nextTheme = event?.detail?.theme || 'dark';
      applySceneTheme(nextTheme);
    });

    function renderFrame() {
      const t = clock.getElapsedTime();

      particles.rotation.y = t * 0.02;
      particles.rotation.x = t * 0.01;

      if (torus) {
        torus.rotation.x = t * 0.3;
        torus.rotation.y = t * 0.2;
      }

      if (sphere) {
        sphere.rotation.x = t * 0.15;
        sphere.rotation.z = t * 0.2;
      }

      if (emeraldKnot) {
        emeraldKnot.rotation.x = t * 0.2;
        emeraldKnot.rotation.y = t * 0.16;
        emeraldKnot.rotation.z = t * 0.08;
      }

      if (emeraldOrb) {
        emeraldOrb.rotation.x = t * 0.22;
        emeraldOrb.rotation.y = t * 0.14;
      }

      const cameraEase = isLowPowerDevice ? 0.02 : 0.03;
      camera.position.x += (mouseX * 3 - camera.position.x) * cameraEase;
      camera.position.y += (mouseY * 2 - camera.position.y) * cameraEase;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    }

    function animate(now = 0) {
      rafId = window.requestAnimationFrame(animate);
      const activeFrameInterval = isScrolling
        ? Math.max(targetFrameInterval, 1000 / 26)
        : targetFrameInterval;
      if (now - lastFrameAt < activeFrameInterval) return;
      lastFrameAt = now;
      renderFrame();
    }

    renderFrame();
    if (!prefersReducedMotion) animate();

    document.addEventListener('visibilitychange', () => {
      if (prefersReducedMotion) return;
      if (document.hidden) {
        if (rafId !== null) {
          window.cancelAnimationFrame(rafId);
          rafId = null;
        }
      } else if (rafId === null) {
        clock.getDelta();
        lastFrameAt = 0;
        animate();
      }
    });

    window.addEventListener('scroll', () => {
      isScrolling = true;
      if (scrollIdleTimer) window.clearTimeout(scrollIdleTimer);
      scrollIdleTimer = window.setTimeout(() => {
        isScrolling = false;
        lastFrameAt = 0;
      }, 120);
    }, { passive: true });

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      setRendererQuality();
      lastFrameAt = 0;
    });
  }

  function releaseStaleScrollLocks() {
    const unlockIfSafe = () => {
      const drawerOpen = document.querySelector('.nav-drawer.open');
      const paletteOpen = document.getElementById('cmdOverlay')?.classList.contains('cmd-open');
      if (!drawerOpen && !paletteOpen) {
        document.body.style.overflow = '';
      }
    };
    unlockIfSafe();
    window.addEventListener('pageshow', unlockIfSafe);
  }

  document.addEventListener('DOMContentLoaded', () => {
    releaseStaleScrollLocks();
    initThemeToggle();
    initSmoothAnchors();
    initRoleTyper();
    initRevealAnimations();
    initThreeBackground();
  });
})();
