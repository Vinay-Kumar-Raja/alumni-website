/* =====================================================
   HOME PAGE
===================================================== */
'use strict';

const HomePage = (() => {
  function render() {
    return `
      <div class="home-hero page-enter reveal reveal-up visible" style="background:var(--clr-bg);min-height:90vh;display:flex;align-items:center;justify-content:center;text-align:center;position:relative;overflow:hidden;">
        <div class="mesh-gradient"></div>
        <div class="hero-grid-bg"></div>
        <div class="animate-float" style="position:relative; z-index:1;">
          <h1 class="hero-title text-shimmer" style="font-size: clamp(var(--fs-4xl), 8vw, var(--fs-8xl)); font-weight:700; line-height:1; letter-spacing:-0.04em; margin-bottom:var(--space-4);">Alumni. Reimagined.</h1>
          <p class="hero-subtitle" style="font-size:var(--fs-xl); color:var(--clr-text-muted); max-width:600px; margin:var(--space-6) auto var(--space-10); font-weight:500; letter-spacing:-0.01em;">The platform for the Seeyami Nursery and Primary School family. Connect, mentor, and grow together.</p>
          <div class="hero-cta" style="display:flex; gap:var(--space-4); justify-content:center;">
            <button class="btn btn-primary btn-lg btn-round" onclick="Router.go('/login')" style="padding:1rem 3rem; font-size:var(--fs-base); font-weight:600;">Get Started</button>
            <button class="btn btn-ghost btn-lg btn-round" onclick="scrollToFeatures()" style="padding:1rem 3rem; font-size:var(--fs-base); font-weight:600; border-color:var(--clr-primary); color:var(--clr-primary);">Learn more ></button>
          </div>
        </div>
      </div>

      <section class="home-stats reveal reveal-up" id="home-stats" style="padding:var(--space-20) 0; background:#fff;">
        <div class="stats-grid" style="max-width:var(--max-w);margin:0 auto; display:grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap:var(--space-12); padding:0 var(--space-6);">
          <div class="stat-card stagger-1" style="background:none; box-shadow:none; padding:0; text-align:center;">
            <div class="stat-value" data-count="15000" data-suffix="+" style="font-size:var(--fs-6xl); color:var(--clr-text); font-weight:700;">0+</div>
            <div class="stat-label" style="font-size:var(--fs-lg); font-weight:600; color:var(--clr-text-muted);">Lives Transformed</div>
          </div>
          <div class="stat-card stagger-2" style="background:none; box-shadow:none; padding:0; text-align:center;">
            <div class="stat-value" data-count="2" data-suffix="" style="font-size:var(--fs-6xl); color:var(--clr-text); font-weight:700;">0</div>
            <div class="stat-label" style="font-size:var(--fs-lg); font-weight:600; color:var(--clr-text-muted);">Schools Built</div>
          </div>
          <div class="stat-card stagger-3" style="background:none; box-shadow:none; padding:0; text-align:center;">
            <div class="stat-value" data-count="25" data-suffix="+" style="font-size:var(--fs-6xl); color:var(--clr-text); font-weight:700;">0+</div>
            <div class="stat-label" style="font-size:var(--fs-lg); font-weight:600; color:var(--clr-text-muted);">Countries Represented</div>
          </div>
          <div class="stat-card stagger-4" style="background:none; box-shadow:none; padding:0; text-align:center;">
            <div class="stat-value" data-count="100" data-suffix="%" style="font-size:var(--fs-6xl); color:var(--clr-text); font-weight:700;">0%</div>
            <div class="stat-label" style="font-size:var(--fs-lg); font-weight:600; color:var(--clr-text-muted);">Commitment</div>
          </div>
        </div>
      </section>

      <section class="home-features" id="features-section" style="padding:var(--space-24) 0; background:var(--clr-bg); overflow:hidden;">
        <div style="max-width:var(--max-w);margin:0 auto; padding:0 var(--space-6);">
          <div class="section-label" style="text-align:center; color:var(--clr-primary); font-weight:700; letter-spacing:0.1em; margin-bottom:var(--space-4);">Our Ecosystem</div>
          <h2 style="font-family:var(--font-display);font-size:clamp(var(--fs-3xl), 5vw, var(--fs-6xl));font-weight:700;margin-bottom:var(--space-16);text-align:center;color:var(--clr-text);letter-spacing:-0.02em;">Everything you need to<br/>stay connected</h2>
          
          <div class="tabs-container" style="margin-bottom:var(--space-12); display:flex; justify-content:center; gap:var(--space-4); flex-wrap:wrap;">
            ${['Individual', 'Community', 'Global'].map((tab, i) => `
              <button class="btn btn-ghost btn-round tab-trigger ${i === 0 ? 'active' : ''}" data-tab="tab-${i}" style="padding:0.6rem 2rem; border-color:var(--clr-border); color:var(--clr-text-muted); font-weight:600; transition:all var(--transition-base);">
                ${tab}
              </button>
            `).join('')}
          </div>

          <div class="tab-content-wrapper" style="min-height:400px;">
            <div id="tab-0" class="tab-panel active reveal reveal-up">
              <div class="features-grid" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap:var(--space-10);">
                <div class="feature-card glass-card-glow" style="background:#fff; border-radius:var(--radius-xl); padding:var(--space-12); border:none; box-shadow:var(--shadow-md);">
                  <div class="feature-icon" style="font-size:3rem; margin-bottom:var(--space-8);">📸</div>
                  <h3 class="feature-title" style="font-size:var(--fs-2xl); font-weight:700; color:var(--clr-text); margin-bottom:var(--space-4);">Alumni Feed</h3>
                  <p class="feature-desc" style="color:var(--clr-text-muted); font-size:var(--fs-base); line-height:1.6;">Milestones, updates, and shared achievements translated into inspiration.</p>
                </div>
                <div class="feature-card glass-card-glow" style="background:#fff; border-radius:var(--radius-xl); padding:var(--space-12); border:none; box-shadow:var(--shadow-md);">
                  <div class="feature-icon" style="font-size:3rem; margin-bottom:var(--space-8);">🔍</div>
                  <h3 class="feature-title" style="font-size:var(--fs-2xl); font-weight:700; color:var(--clr-text); margin-bottom:var(--space-4);">Smart Directory</h3>
                  <p class="feature-desc" style="color:var(--clr-text-muted); font-size:var(--fs-base); line-height:1.6;">Find peers by expertise, location, or batch with high-precision search.</p>
                </div>
              </div>
            </div>
            
            <div id="tab-1" class="tab-panel hidden reveal reveal-up">
              <div class="features-grid" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap:var(--space-10);">
                <div class="feature-card glass-card-glow" style="background:#fff; border-radius:var(--radius-xl); padding:var(--space-12); border:none; box-shadow:var(--shadow-md);">
                  <div class="feature-icon" style="font-size:3rem; margin-bottom:var(--space-8);">💬</div>
                  <h3 class="feature-title" style="font-size:var(--fs-2xl); font-weight:700; color:var(--clr-text); margin-bottom:var(--space-4);">Mentorship</h3>
                  <p class="feature-desc" style="color:var(--clr-text-muted); font-size:var(--fs-base); line-height:1.6;">Bridging generational gaps with direct lines to industry leaders.</p>
                </div>
                <div class="feature-card glass-card-glow" style="background:#fff; border-radius:var(--radius-xl); padding:var(--space-12); border:none; box-shadow:var(--shadow-md);">
                  <div class="feature-icon" style="font-size:3rem; margin-bottom:var(--space-8);">🛡️</div>
                  <h3 class="feature-title" style="font-size:var(--fs-2xl); font-weight:700; color:var(--clr-text); margin-bottom:var(--space-4);">Secure Network</h3>
                  <p class="feature-desc" style="color:var(--clr-text-muted); font-size:var(--fs-base); line-height:1.6;">An exclusive, admin-verified space where privacy meets community.</p>
                </div>
              </div>
            </div>

            <div id="tab-2" class="tab-panel hidden reveal reveal-up">
              <div class="features-grid" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap:var(--space-10);">
                <div class="feature-card glass-card-glow" style="background:#fff; border-radius:var(--radius-xl); padding:var(--space-12); border:none; box-shadow:var(--shadow-md);">
                  <div class="feature-icon" style="font-size:3rem; margin-bottom:var(--space-8);">📅</div>
                  <h3 class="feature-title" style="font-size:var(--fs-2xl); font-weight:700; color:var(--clr-text); margin-bottom:var(--space-4);">Global Events</h3>
                  <p class="feature-desc" style="color:var(--clr-text-muted); font-size:var(--fs-base); line-height:1.6;">From local reunions to global webinars, one click to belong.</p>
                </div>
                <div class="feature-card glass-card-glow" style="background:#fff; border-radius:var(--radius-xl); padding:var(--space-12); border:none; box-shadow:var(--shadow-md);">
                  <div class="feature-icon" style="font-size:3rem; margin-bottom:var(--space-8);">🤲</div>
                  <h3 class="feature-title" style="font-size:var(--fs-2xl); font-weight:700; color:var(--clr-text); margin-bottom:var(--space-4);">Legacy of Giving</h3>
                  <p class="feature-desc" style="color:var(--clr-text-muted); font-size:var(--fs-base); line-height:1.6;">Empowering Seeyami Nursery and Primary School’s future through direct, transparent impact.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div class="marquee-container">
        <div class="marquee-content">
          ${Array(4).fill(['Amazon', 'Google', 'Microsoft', 'Goldman Sachs', 'Stanford', 'Harvard', 'Yale', 'Meta', 'J.P. Morgan']).flat().map(name => `
            <span class="marquee-item">${name}</span>
          `).join('')}
        </div>
      </div>

      <section class="home-cta-section">
        <div style="max-width:700px;margin:0 auto;position:relative;z-index:1">
          <h2 style="font-family:var(--font-display);font-size:var(--fs-4xl);font-weight:800;margin-bottom:var(--space-4)">Ready to reconnect?</h2>
          <p style="color:var(--clr-text-muted);margin-bottom:var(--space-8)">Join thousands of alumni already on the platform. Your next opportunity — or reunion — is one click away.</p>
          <div style="display:flex;gap:var(--space-4);justify-content:center;flex-wrap:wrap">
            <button class="btn btn-primary btn-lg btn-round" onclick="Router.go('/login')">Sign In</button>
            <button class="btn btn-accent btn-lg btn-round" onclick="Router.go('/login?register=1')">Create Account</button>
          </div>
        </div>
      </section>

      <footer style="border-top:1px solid var(--clr-border);padding:var(--space-8) var(--space-6);text-align:center;color:var(--clr-text-dim);font-size:var(--fs-sm)">
        <div style="margin-bottom:var(--space-4)">
          <span style="font-family:var(--font-display);font-weight:800;color:var(--clr-text)">Seeyami Nursery and Primary School</span>
        </div>
        <div>© ${new Date().getFullYear()} Seeyami Nursery and Primary School. All rights reserved. &nbsp;·&nbsp; 
          <span style="color:var(--clr-primary);cursor:default">Privacy Policy</span> &nbsp;·&nbsp; 
          <span style="color:var(--clr-primary);cursor:default">Terms of Service</span>
        </div>
      </footer>
    `;
  }

  function mount() {
    // Start counter animation when stats section visible
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          Components.animateCounters();
          Components.initScrollReveal();
          Components.initCustomCursor();
          observer.disconnect();
        }
      });
    }, { threshold: 0.2 });
    const statsEl = document.getElementById('home-stats');
    if (statsEl) observer.observe(statsEl);

    // Tab switching logic
    document.querySelectorAll('.tab-trigger').forEach(trigger => {
      trigger.addEventListener('click', () => {
        const tabId = trigger.getAttribute('data-tab');
        
        // Update triggers
        document.querySelectorAll('.tab-trigger').forEach(t => {
          t.classList.remove('active');
          t.style.borderColor = 'var(--clr-border)';
          t.style.color = 'var(--clr-text-muted)';
          t.style.background = 'transparent';
        });
        trigger.classList.add('active');
        trigger.style.borderColor = 'var(--clr-primary)';
        trigger.style.color = 'var(--clr-primary)';
        trigger.style.background = 'rgba(0,102,204,0.05)';

        // Update panels
        document.querySelectorAll('.tab-panel').forEach(panel => {
          panel.classList.add('hidden');
          panel.classList.remove('active');
        });
        const activePanel = document.getElementById(tabId);
        if (activePanel) {
          activePanel.classList.remove('hidden');
          setTimeout(() => activePanel.classList.add('active'), 10);
        }
      });
    });
  }

  return { render, mount };
})();

function scrollToFeatures() {
  document.getElementById('features-section')?.scrollIntoView({ behavior: 'smooth' });
}

window.HomePage = HomePage;
