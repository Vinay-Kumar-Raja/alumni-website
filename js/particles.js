/* =====================================================
   PARTICLES — Canvas particle animation engine
===================================================== */
'use strict';

const Particles = (() => {
  let canvas, ctx, particles = [], animId, w, h;

  function init() {
    canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    resize();
    populate();
    animate();
    window.addEventListener('resize', () => { resize(); populate(); });
  }

  function resize() {
    w = canvas.width  = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }

  function randomParticle() {
    return {
      x: Math.random() * w, y: Math.random() * h,
      r: Math.random() * 1.5 + 0.5,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.6 + 0.2,
      hue: Math.floor(Math.random() * 60) + 220 // blues/purples
    };
  }

  function populate() {
    particles = [];
    const count = Math.min(Math.floor((w * h) / 12000), 120);
    for (let i = 0; i < count; i++) particles.push(randomParticle());
  }

  function drawConnections() {
    const limit = 100;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < limit) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(99,102,241,${0.15 * (1 - dist/limit)})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, w, h);
    drawConnections();
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue},80%,70%,${p.alpha})`;
      ctx.fill();
    });
    animId = requestAnimationFrame(animate);
  }

  function destroy() {
    if (animId) cancelAnimationFrame(animId);
    if (canvas) ctx.clearRect(0, 0, w, h);
  }

  return { init, destroy };
})();
