/* =====================================================
   HOME PAGE
===================================================== */
'use strict';

const HomePage = (() => {
  function render() {
    return `
      <div class="home-hero page-enter">
        <div>
          <div class="hero-badge">🌱 <span>Educating India's Underrepresented</span></div>
          <h1 class="hero-title text-gradient" style="font-size: clamp(var(--fs-4xl), 7vw, var(--fs-6xl));">From Invisible to<br/>Unstoppable</h1>
          <p class="hero-subtitle">Creating a Legacy of Hope. Connect with the global Shanti Bhavan family and continue the mission of giving back.</p>
          <div class="hero-cta">
            <button class="btn btn-primary btn-lg btn-round" onclick="Router.go('/login')">Get Started →</button>
            <button class="btn btn-ghost btn-lg btn-round" onclick="scrollToFeatures()">See Features</button>
          </div>
        </div>
        <div class="hero-scroll">
          <span>Scroll to explore</span>
          <span class="scroll-arrow">↓</span>
        </div>
      </div>

      <section class="home-stats" id="home-stats">
        <div class="stats-grid" style="max-width:var(--max-w);margin:0 auto">
          <div class="stat-card animate-fadeUp stagger-1">
            <div class="stat-icon" aria-hidden="true">🕊️</div>
            <div class="stat-value" data-count="15000" data-suffix="+">0+</div>
            <div class="stat-label">Lives Transformed</div>
          </div>
          <div class="stat-card animate-fadeUp stagger-2">
            <div class="stat-icon" aria-hidden="true">🏫</div>
            <div class="stat-value" data-count="2" data-suffix="">0</div>
            <div class="stat-label">Schools Built</div>
          </div>
          <div class="stat-card animate-fadeUp stagger-3">
            <div class="stat-icon" aria-hidden="true">🌍</div>
            <div class="stat-value" data-count="25" data-suffix="+">0+</div>
            <div class="stat-label">Countries Represented</div>
          </div>
          <div class="stat-card animate-fadeUp stagger-4">
            <div class="stat-icon" aria-hidden="true">🤝</div>
            <div class="stat-value" data-count="100" data-suffix="%">0%</div>
            <div class="stat-label">Commitment to Giving Back</div>
          </div>
        </div>
      </section>

      <section class="home-features" id="features-section">
        <div style="max-width:var(--max-w);margin:0 auto">
          <div class="section-label">What we offer</div>
          <h2 style="font-family:var(--font-display);font-size:var(--fs-4xl);font-weight:800;margin-bottom:var(--space-3)">Everything you need to<br/><span class="text-gradient">stay connected</span></h2>
          <p style="color:var(--clr-text-muted);max-width:500px;margin:0 auto">Rediscover classmates, celebrate achievements, attend exclusive events, and build your professional network.</p>
          <div class="features-grid">
            ${[
              { icon:'📸', title:'Alumni Feed', desc:'Share milestones, post updates, like and comment — stay connected with the Shanti Bhavan family.'},
              { icon:'💬', title:'Mentorship Chat', desc:'Group channels and direct messages to mentor upcoming graduates or connect with peers.'},
              { icon:'📅', title:'Events & RSVP', desc:'Discover reunions, webinars, and volunteer opportunities. One-click RSVP.'},
              { icon:'🛡️', title:'Verified Community', desc:'Admin-approved members only. Your network stays trustworthy and secure.'},
              { icon:'🔍', title:'Alumni Directory', desc:'Search and filter alumni by batch, college, company, and location.'},
              { icon:'🤲', title:'Give Back Portal', desc:'Find ways to give back, sponsor a child, or help with Shanti Bhavan 2.'}
            ].map(f => `
              <div class="feature-card">
                <div class="feature-icon" aria-hidden="true">${f.icon}</div>
                <h3 class="feature-title">${f.title}</h3>
                <p class="feature-desc">${f.desc}</p>
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
