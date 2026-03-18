/* =====================================================
   HOME PAGE
===================================================== */
'use strict';

const HomePage = (() => {
  function render() {
    return `
      <div class="home-hero page-enter" style="background:var(--clr-bg);min-height:90vh;display:flex;align-items:center;justify-content:center;text-align:center;">
        <div>
          <h1 class="hero-title" style="font-size: clamp(var(--fs-4xl), 8vw, var(--fs-7xl)); font-weight:700; color:var(--clr-text); line-height:1.1; letter-spacing:-0.02em;">Alumni. Reimagined.</h1>
          <p class="hero-subtitle" style="font-size:var(--fs-xl); color:var(--clr-text-muted); max-width:600px; margin:var(--space-6) auto var(--space-10); font-weight:500;">The platform for the Shanti Bhavan family. Connect, mentor, and grow together.</p>
          <div class="hero-cta" style="display:flex; gap:var(--space-4); justify-content:center;">
            <button class="btn btn-primary btn-lg btn-round" onclick="Router.go('/login')" style="padding:0.8rem 2.5rem; font-size:var(--fs-base);">Get Started</button>
            <button class="btn btn-ghost btn-lg btn-round" onclick="scrollToFeatures()" style="padding:0.8rem 2.5rem; font-size:var(--fs-base); border-color:var(--clr-primary); color:var(--clr-primary);">Learn more ></button>
          </div>
        </div>
      </div>

      <section class="home-stats" id="home-stats" style="padding:var(--space-20) 0; background:#fff;">
        <div class="stats-grid" style="max-width:var(--max-w);margin:0 auto; display:grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap:var(--space-12); padding:0 var(--space-6);">
          <div class="stat-card animate-fadeUp stagger-1" style="background:none; box-shadow:none; padding:0; text-align:center;">
            <div class="stat-value" data-count="15000" data-suffix="+" style="font-size:var(--fs-6xl); color:var(--clr-text); font-weight:700;">0+</div>
            <div class="stat-label" style="font-size:var(--fs-lg); font-weight:600; color:var(--clr-text-muted);">Lives Transformed</div>
          </div>
          <div class="stat-card animate-fadeUp stagger-2" style="background:none; box-shadow:none; padding:0; text-align:center;">
            <div class="stat-value" data-count="2" data-suffix="" style="font-size:var(--fs-6xl); color:var(--clr-text); font-weight:700;">0</div>
            <div class="stat-label" style="font-size:var(--fs-lg); font-weight:600; color:var(--clr-text-muted);">Schools Built</div>
          </div>
          <div class="stat-card animate-fadeUp stagger-3" style="background:none; box-shadow:none; padding:0; text-align:center;">
            <div class="stat-value" data-count="25" data-suffix="+" style="font-size:var(--fs-6xl); color:var(--clr-text); font-weight:700;">0+</div>
            <div class="stat-label" style="font-size:var(--fs-lg); font-weight:600; color:var(--clr-text-muted);">Countries Represented</div>
          </div>
          <div class="stat-card animate-fadeUp stagger-4" style="background:none; box-shadow:none; padding:0; text-align:center;">
            <div class="stat-value" data-count="100" data-suffix="%" style="font-size:var(--fs-6xl); color:var(--clr-text); font-weight:700;">0%</div>
            <div class="stat-label" style="font-size:var(--fs-lg); font-weight:600; color:var(--clr-text-muted);">Commitment</div>
          </div>
        </div>
      </section>

      <section class="home-features" id="features-section" style="padding:var(--space-20) 0; background:var(--clr-bg);">
        <div style="max-width:var(--max-w);margin:0 auto; padding:0 var(--space-6);">
          <div class="section-label" style="text-align:center; color:var(--clr-text-muted); font-weight:600; letter-spacing:0.05em; margin-bottom:var(--space-4);">Features</div>
          <h2 style="font-family:var(--font-display);font-size:clamp(var(--fs-3xl), 5vw, var(--fs-5xl));font-weight:700;margin-bottom:var(--space-12);text-align:center;color:var(--clr-text);letter-spacing:-0.01em;">Everything you need to<br/>stay connected</h2>
          <div class="features-grid" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap:var(--space-8);">
            ${[
              { icon:'📸', title:'Alumni Feed', desc:'Milestones, updates, and shared achievements in one place.'},
              { icon:'💬', title:'Mentorship', desc:'Direct lines to mentor graduates or connect with industry peers.'},
              { icon:'📅', title:'Events', desc:'Reunions, webinars, and volunteer opportunities with one-click RSVP.'},
              { icon:'🛡️', title:'Secure Community', desc:'Admin-approved members only. A trustworthy space for alumni.'},
              { icon:'🔍', title:'Directory', desc:'Search alumni by batch, college, company, or current location.'},
              { icon:'🤲', title:'Give Back', desc:'Direct pathways to support Shanti Bhavan’s future mission.'}
            ].map(f => `
              <div class="feature-card" style="background:#fff; border-radius:var(--radius-xl); padding:var(--space-10); border:none; box-shadow:var(--shadow-md); transition:transform var(--transition-base), box-shadow var(--transition-base); text-align:left;">
                <div class="feature-icon" style="font-size:2.5rem; margin-bottom:var(--space-6);">${f.icon}</div>
                <h3 class="feature-title" style="font-size:var(--fs-xl); font-weight:700; color:var(--clr-text); margin-bottom:var(--space-3);">${f.title}</h3>
                <p class="feature-desc" style="color:var(--clr-text-muted); font-size:var(--fs-base); line-height:1.5;">${f.desc}</p>
              </div>`).join('')}
          </div>
        </div>
      </section>

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
          <span style="font-family:var(--font-display);font-weight:800;color:var(--clr-text)">Shanti Bhavan Alumni Network</span>
        </div>
        <div>© ${new Date().getFullYear()} Shanti Bhavan Children's Project. All rights reserved. &nbsp;·&nbsp; 
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
          observer.disconnect();
        }
      });
    }, { threshold: 0.2 });
    const statsEl = document.getElementById('home-stats');
    if (statsEl) observer.observe(statsEl);
  }

  return { render, mount };
})();

function scrollToFeatures() {
  document.getElementById('features-section')?.scrollIntoView({ behavior: 'smooth' });
}

window.HomePage = HomePage;
