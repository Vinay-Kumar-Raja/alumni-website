/* =====================================================
   AUTH — Session management, login, logout, RBAC
===================================================== */
'use strict';

const Auth = (() => {
  const SESSION_KEY = 'ac_session';
  const MAX_ATTEMPTS = 5;
  const LOCK_DURATION = 15 * 60 * 1000; // 15 minutes

  let _session = null;

  function loadSession() {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      const s = JSON.parse(raw);
      // Check expiry
      if (s.expiresAt && Date.now() > s.expiresAt) {
        sessionStorage.removeItem(SESSION_KEY);
        return null;
      }
      return s;
    } catch { return null; }
  }

  function saveSession(s) {
    _session = s;
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(s));
  }

  // Initialize
  _session = loadSession();

  // ── Login ──────────────────────────────────────────
  async function login(email, password, csrfToken) {
    // CSRF check
    if (!Security.validateCSRFToken(csrfToken)) {
      throw new Error('Invalid request. Please refresh and try again.');
    }

    // Rate limit: 10 attempts per minute per IP simulation
    Security.rateLimit('login_' + email.toLowerCase(), 10, 60000);

    const user = Store.findAll('users', u => u.email.toLowerCase() === email.toLowerCase())[0];
    if (!user) {
      await sleep(300); // timing attack prevention
      throw new Error('Invalid email or password.');
    }

    // Check account lock
    if (user.locked && user.lockUntil && Date.now() < user.lockUntil) {
      const mins = Math.ceil((user.lockUntil - Date.now()) / 60000);
      throw new Error(`Account locked. Try again in ${mins} minute(s).`);
    }

    // Check approval
    if (!user.approved) {
      throw new Error('Your account is pending admin approval. Please wait.');
    }

    // Verify password (demo: compare directly for seeded users)
    const validPwd = isDemoPassword(password, user.password) || await Security.verifyPassword(password, user.password);
    if (!validPwd) {
      const attempts = (user.loginAttempts || 0) + 1;
      const locked = attempts >= MAX_ATTEMPTS;
      Store.update('users', user.id, {
        loginAttempts: attempts,
        locked,
        lockUntil: locked ? Date.now() + LOCK_DURATION : null
      });
      if (locked) throw new Error('Too many failed attempts. Account locked for 15 minutes.');
      throw new Error(`Invalid email or password. ${MAX_ATTEMPTS - attempts} attempt(s) remaining.`);
    }

    // Success: reset attempts
    Store.update('users', user.id, { loginAttempts: 0, locked: false, lockUntil: null, lastSeen: new Date().toISOString() });

    const session = {
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      initials: user.initials,
      expiresAt: Date.now() + 8 * 60 * 60 * 1000 // 8h
    };
    saveSession(session);

    // Audit log
    Store.add('auditLog', {
      id: Store.genId('a'),
      userId: user.id,
      action: 'LOGIN',
      detail: `${user.name} logged in`,
      createdAt: new Date().toISOString()
    });

    return session;
  }

  // Demo password check for seeded data
  function isDemoPassword(input, stored) {
    const demos = {
      'Admin@123': '$a1d2m3in',
      'Alumni@2025': '$a1lumni2025',
    };
    return demos[input] === stored;
  }

  // ── Logout ─────────────────────────────────────────
  function logout() {
    if (_session) {
      Store.add('auditLog', {
        id: Store.genId('a'),
        userId: _session.userId,
        action: 'LOGOUT',
        detail: 'User logged out',
        createdAt: new Date().toISOString()
      });
    }
    _session = null;
    sessionStorage.removeItem(SESSION_KEY);
  }

  // ── Current User ───────────────────────────────────
  function getSession() { return _session; }
  function getCurrentUser() {
    if (!_session) return null;
    return Store.findById('users', _session.userId);
  }
  function isLoggedIn() { return !!_session && Date.now() < (_session.expiresAt || 0); }

  // ── RBAC ───────────────────────────────────────────
  const ROLE_LEVELS = { alumni: 1, moderator: 2, admin: 3 };
  function hasRole(minRole) {
    if (!_session) return false;
    return (ROLE_LEVELS[_session.role] || 0) >= (ROLE_LEVELS[minRole] || 0);
  }
  function isAdmin()     { return _session?.role === 'admin'; }
  function isModerator() { return hasRole('moderator'); }

  // ── Password Reset Flow ────────────────────────────
  function initiatePasswordReset(email) {
    Security.rateLimit('reset_' + email.toLowerCase(), 3, 300000); // 3 per 5min
    const user = Store.findAll('users', u => u.email.toLowerCase() === email.toLowerCase())[0];
    if (!user) return true; // Silent — don't reveal user existence

    const token = Security.generateResetToken();
    const resets = Store.get('passwordResets') || {};
    resets[token] = { userId: user.id, expiresAt: Date.now() + 30 * 60 * 1000, used: false };
    Store.set('passwordResets', resets);

    // In a real app: send email. Here we simulate by returning token.
    console.info('[DEV] Reset token for', email, ':', token);
    return token; // In production, this would be sent via email
  }

  async function resetPassword(token, newPassword) {
    const resets = Store.get('passwordResets') || {};
    const entry = resets[token];
    if (!entry) throw new Error('Invalid or expired reset link.');
    if (entry.used) throw new Error('This reset link has already been used.');
    if (Date.now() > entry.expiresAt) throw new Error('Reset link has expired. Please request a new one.');
    if (!Security.validate('password', newPassword)) throw new Error('Password must be at least 8 characters.');

    const hashed = await Security.hashPassword(newPassword);
    Store.update('users', entry.userId, { password: hashed, loginAttempts: 0, locked: false, lockUntil: null });
    resets[token].used = true;
    Store.set('passwordResets', resets);

    Store.add('auditLog', {
      id: Store.genId('a'),
      userId: entry.userId,
      action: 'PASSWORD_RESET',
      detail: 'Password reset completed',
      createdAt: new Date().toISOString()
    });
    return true;
  }

  // ── Registration ───────────────────────────────────
  async function register(data) {
    Security.rateLimit('register', 5, 3600000); // 5 per hour
    const { name, email, password, batch, department } = data;

    if (!Security.validate('name', name)) throw new Error('Name must be 2-80 characters.');
    if (!Security.validate('email', email)) throw new Error('Invalid email address.');
    if (!Security.validate('password', password)) throw new Error('Password must be at least 8 characters.');

    const exists = Store.findAll('users', u => u.email.toLowerCase() === email.toLowerCase())[0];
    if (exists) throw new Error('An account with this email already exists.');

    const hashed = await Security.hashPassword(password);
    const initials = name.split(' ').slice(0,2).map(n=>n[0].toUpperCase()).join('');
    const newUser = {
      id: Store.genId('u'),
      name: Security.sanitizeInput(name),
      email: email.toLowerCase(),
      password: hashed,
      role: 'alumni', batch, department,
      bio: '', avatar: null, initials,
      company: '', location: '',
      approved: !Store.get('settings').requireApproval,
      locked: false, lockUntil: null, loginAttempts: 0,
      followers: [], following: [],
      joinedAt: new Date().toISOString(), lastSeen: null
    };
    Store.add('users', newUser);
    return newUser;
  }

  function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

  return { login, logout, getSession, getCurrentUser, isLoggedIn, hasRole, isAdmin, isModerator, initiatePasswordReset, resetPassword, register, isDemoPassword };
})();
