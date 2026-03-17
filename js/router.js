/* =====================================================
   ROUTER — Client-side SPA router (hash-based)
===================================================== */
'use strict';

const Router = (() => {
  const routes = {
    '/':                 { page: 'HomePage',           public: true  },
    '/login':            { page: 'LoginPage',          public: true  },
    '/forgot-password':  { page: 'ForgotPasswordPage', public: true  },
    '/reset-password':   { page: 'ResetPasswordPage',  public: true  },
    '/dashboard':        { page: 'DashboardPage',      public: false },
    '/feed':             { page: 'FeedPage',           public: false },
    '/chat':             { page: 'ChatPage',           public: false },
    '/events':           { page: 'EventsPage',         public: false },
    '/members':          { page: 'MembersPage',        public: false },
    '/profile':          { page: 'ProfilePage',        public: false },
    '/admin':            { page: 'AdminPage',          public: false, minRole: 'moderator' },
  };

  let _current = '/';
  let _currentParams = {};

  function parseHash() {
    const hash = location.hash.slice(1) || '/';
    const [rawPath, queryStr] = hash.split('?');
    const path = rawPath || '/';
    const params = {};
    if (queryStr) {
      queryStr.split('&').forEach(pair => {
        const [k, v] = pair.split('=');
        if (k) params[decodeURIComponent(k)] = decodeURIComponent(v || '');
      });
    }
    return { path, params };
  }

  function matchRoute(path) {
    // Exact match
    if (routes[path]) return { route: routes[path], params: {} };
    // Parameterized match (e.g., /profile/u001)
    for (const pattern of Object.keys(routes)) {
      const regexStr = pattern.replace(/:[^/]+/g, '([^/]+)');
      const regex = new RegExp('^' + regexStr + '$');
      const match = path.match(regex);
      if (match) {
        const paramKeys = [...pattern.matchAll(/:([^/]+)/g)].map(m => m[1]);
        const paramVals = match.slice(1);
        const params = {};
        paramKeys.forEach((k, i) => { params[k] = paramVals[i]; });
        return { route: routes[pattern], params };
      }
    }
    // Dynamic /profile/:id without explicit pattern — handle manually
    if (path.startsWith('/profile/')) {
      return { route: routes['/profile'], params: { id: path.split('/')[2] } };
    }
    if (path.startsWith('/reset-password')) {
      return { route: routes['/reset-password'], params: {} };
    }
    return null;
  }

  async function navigate() {
    // Stop chat polling if leaving chat
    if (_current === '/chat' && typeof ChatPage !== 'undefined') {
      ChatPage.stopPolling?.();
    }

    const { path, params: qParams } = parseHash();
    _current = path;
    _currentParams = qParams;

    const matched = matchRoute(path);

    if (!matched) {
      document.getElementById('page-content').innerHTML = `
        <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:var(--space-4)">
          <div style="font-size:6rem">🔭</div>
          <h1 style="font-family:var(--font-display);font-size:var(--fs-4xl)">Page Not Found</h1>
          <p style="color:var(--clr-text-muted)">The page you're looking for doesn't exist.</p>
          <button class="btn btn-primary" onclick="Router.go(Auth.isLoggedIn()?'/dashboard':'/')">Go Home</button>
        </div>`;
      return;
    }

    const { route, params } = matched;
    const mergedParams = { ...qParams, ...params };

    // Auth guard
    if (!route.public && !Auth.isLoggedIn()) {
      go('/login');
      return;
    }

    // Role guard
    if (route.minRole && !Auth.hasRole(route.minRole)) {
      go('/dashboard');
      Components.toast('Access denied.', 'error');
      return;
    }

    // Show loader
    Components.showLoader();

    try {
      const pageObj = window[route.page];
      if (!pageObj) throw new Error(`Page module ${route.page} not found`);

      // Update nav
      Components.renderNav();

      // Render page
      const html = await pageObj.render(mergedParams);
      const content = document.getElementById('page-content');
      if (content) {
        content.innerHTML = html || '';
        content.scrollTop  = 0;
        window.scrollTo(0, 0);
      }

      // Mount page
      pageObj.mount?.();

      // Update document title
      const titles = {
        '/':               'Alumni Connect — Home',
        '/login':          'Sign In — Alumni Connect',
        '/forgot-password':'Forgot Password — Alumni Connect',
        '/reset-password': 'Reset Password — Alumni Connect',
        '/dashboard':      'Dashboard — Alumni Connect',
        '/feed':           'Feed — Alumni Connect',
        '/chat':           'Chat — Alumni Connect',
        '/events':         'Events — Alumni Connect',
        '/members':        'Members — Alumni Connect',
        '/profile':        'Profile — Alumni Connect',
        '/admin':          'Admin Portal — Alumni Connect',
      };
      document.title = titles[path] || 'Alumni Connect';

    } catch(e) {
      console.error('Router error:', e);
      Components.toast('Page failed to load. ' + e.message, 'error');
      document.getElementById('page-content').innerHTML = `
        <div style="text-align:center;padding:var(--space-16)">
          <div style="font-size:4rem;margin-bottom:var(--space-4)">⚠️</div>
          <h2>Something went wrong</h2>
          <p style="color:var(--clr-text-muted)">${Security.sanitizeHTML(e.message)}</p>
          <button class="btn btn-primary" style="margin-top:var(--space-6)" onclick="Router.go('/dashboard')">Back to Dashboard</button>
        </div>`;
    } finally {
      Components.hideLoader();
    }
  }

  function go(path) {
    location.hash = path;
  }

  function current() { return _current; }
  function currentParams() { return _currentParams; }

  function init() {
    window.addEventListener('hashchange', navigate);
    navigate(); // Initial load
  }

  return { go, current, currentParams, init };
})();
