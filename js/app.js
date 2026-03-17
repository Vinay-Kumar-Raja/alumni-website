/* =====================================================
   APP — Main entry point. Bootstraps everything.
===================================================== */
'use strict';

// ── Global logout handler ──────────────────────────
function handleLogout() {
  Auth.logout();
  Components.renderNav();
  Components.toast('You have been signed out. See you soon! 👋', 'info');
  Router.go('/');
}

// ── DOMContentLoaded bootstrap ────────────────────
window.addEventListener('DOMContentLoaded', () => {
  // Init particle background
  Particles.init();

  // Render nav (may be hidden if not logged in)
  Components.renderNav();

  // Init router (reads hash → renders initial page)
  Router.init();

  // Auto-redirect logged-in users away from auth pages
  // (handled inside Router nav guards)

  // Global click handler — close dropdowns
  document.addEventListener('click', () => {
    document.getElementById('nav-dropdown')?.classList.add('hidden');
  });

  // Handle session expiry — check every 60s
  setInterval(() => {
    if (Auth.getSession() && !Auth.isLoggedIn()) {
      Auth.logout();
      Components.toast('Your session has expired. Please sign in again.', 'warning');
      Router.go('/login');
    }
  }, 60000);
});

// ── Keyboard accessibility ───────────────────────
document.addEventListener('keydown', (e) => {
  // Escape closes modal
  if (e.key === 'Escape') {
    Components.closeModal();
    document.getElementById('nav-dropdown')?.classList.add('hidden');
  }
});

// ── Prevent form submission page reloads ────────
document.addEventListener('submit', (e) => e.preventDefault());

// ── Global error handler ─────────────────────────
window.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled promise rejection:', e.reason);
  if (e.reason?.message?.includes('Rate limit')) {
    Components.toast(e.reason.message, 'warning');
  }
});

// ── Service Worker registration (for PWA-like caching) ──
if ('serviceWorker' in navigator) {
  // Register SW silently — don't block if unavailable
  navigator.serviceWorker.register('/sw.js').catch(() => {});
}
