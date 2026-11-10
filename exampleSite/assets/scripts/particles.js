// Animated "plexus" background for the home section: drifting dots linked by lines.
(function () {
  const canvas = document.getElementById('home-particles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const cfg = {
    density: 1 / 11000,   // particles per CSS px²
    maxParticles: 150,
    minParticles: 35,
    speed: 0.25,
    linkDist: 150,
    dotRadius: [1.2, 2.4],
    colorTop: '#151a3c',
    colorBottom: '#2a2f5f',
    dot: '255, 255, 255',
    mouseRadius: 200,     // raggio d'influenza del cursore (px)
    mousePull: 0.018,     // forza di attrazione verso il cursore
    mouseLinkDist: 220,   // distanza max delle linee verso il cursore
  };

  let w = 0, h = 0, dpr = 1, particles = [], raf = null, visible = true;
  const mouse = { x: -1e4, y: -1e4, active: false, strength: 0 };

  function setMouse(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    mouse.x = clientX - rect.left;
    mouse.y = clientY - rect.top;
    mouse.active = mouse.x >= 0 && mouse.y >= 0 && mouse.x <= rect.width && mouse.y <= rect.height;
    start();
  }
  const home = canvas.parentElement;
  home.addEventListener('mousemove', (e) => setMouse(e.clientX, e.clientY));
  home.addEventListener('mouseleave', () => { mouse.active = false; });
  home.addEventListener('touchmove', (e) => { const t = e.touches[0]; if (t) setMouse(t.clientX, t.clientY); }, { passive: true });
  home.addEventListener('touchend', () => { mouse.active = false; });

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    w = Math.max(1, rect.width);
    h = Math.max(1, rect.height);
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const n = Math.max(cfg.minParticles, Math.min(cfg.maxParticles, Math.round(w * h * cfg.density)));
    while (particles.length < n) particles.push(spawn());
    particles.length = n;
    particles.forEach((p) => { p.x = Math.min(p.x, w); p.y = Math.min(p.y, h); });
  }

  function spawn() {
    const a = Math.random() * Math.PI * 2;
    const s = cfg.speed * (0.4 + Math.random());
    return {
      x: Math.random() * w,
      y: Math.random() * h,
      vx: Math.cos(a) * s,
      vy: Math.sin(a) * s,
      r: cfg.dotRadius[0] + Math.random() * (cfg.dotRadius[1] - cfg.dotRadius[0]),
    };
  }

  function step() {
    // l'influenza del cursore cresce e svanisce gradualmente
    mouse.strength += ((mouse.active ? 1 : 0) - mouse.strength) * 0.08;
    const r2 = cfg.mouseRadius * cfg.mouseRadius;
    for (const p of particles) {
      if (mouse.strength > 0.01) {
        const dx = mouse.x - p.x, dy = mouse.y - p.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < r2 && d2 > 1) {
          const d = Math.sqrt(d2);
          const f = cfg.mousePull * (1 - d / cfg.mouseRadius) * mouse.strength;
          p.vx += (dx / d) * f;
          p.vy += (dy / d) * f;
        }
      }
      // limita la velocità così i puntini non schizzano via dopo l'attrazione
      const sp = Math.hypot(p.vx, p.vy), max = cfg.speed * 3;
      if (sp > max) { p.vx = (p.vx / sp) * max; p.vy = (p.vy / sp) * max; }
      else if (sp < cfg.speed * 0.3) { p.vx *= 1.02; p.vy *= 1.02; }
      p.x += p.vx; p.y += p.vy;
      if (p.x < -10) p.x = w + 10; else if (p.x > w + 10) p.x = -10;
      if (p.y < -10) p.y = h + 10; else if (p.y > h + 10) p.y = -10;
    }
  }

  function draw() {
    const g = ctx.createLinearGradient(0, 0, w * 0.3, h);
    g.addColorStop(0, cfg.colorTop);
    g.addColorStop(1, cfg.colorBottom);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    const d2 = cfg.linkDist * cfg.linkDist;
    ctx.lineWidth = 1;
    for (let i = 0; i < particles.length; i++) {
      const a = particles[i];
      for (let j = i + 1; j < particles.length; j++) {
        const b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist2 = dx * dx + dy * dy;
        if (dist2 > d2) continue;
        const alpha = 0.35 * (1 - dist2 / d2);
        ctx.strokeStyle = 'rgba(' + cfg.dot + ',' + alpha.toFixed(3) + ')';
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }
    }
    if (mouse.strength > 0.01) {
      const m2 = cfg.mouseLinkDist * cfg.mouseLinkDist;
      for (const p of particles) {
        const dx = p.x - mouse.x, dy = p.y - mouse.y;
        const dist2 = dx * dx + dy * dy;
        if (dist2 > m2) continue;
        const alpha = 0.6 * (1 - dist2 / m2) * mouse.strength;
        ctx.strokeStyle = 'rgba(' + cfg.dot + ',' + alpha.toFixed(3) + ')';
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
      }
    }
    for (const p of particles) {
      ctx.fillStyle = 'rgba(' + cfg.dot + ',0.18)';
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(' + cfg.dot + ',0.9)';
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
    }
  }

  function loop() {
    raf = null;
    if (!visible || document.hidden) return;
    step(); draw();
    raf = requestAnimationFrame(loop);
  }
  function start() { if (!raf && !reduceMotion) raf = requestAnimationFrame(loop); }

  let t;
  window.addEventListener('resize', () => { clearTimeout(t); t = setTimeout(() => { resize(); draw(); }, 120); });
  document.addEventListener('visibilitychange', start);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver((e) => { visible = e[0].isIntersecting; start(); }).observe(canvas);
  }

  resize();
  draw();
  start();
})();
