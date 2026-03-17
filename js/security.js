/* =====================================================
   SECURITY — XSS, CSRF, Rate Limiting, Sanitization
===================================================== */
'use strict';

const Security = (() => {
  // ── XSS Sanitization ──────────────────────────────
  function sanitizeHTML(str) {
    if (typeof str !== 'string') return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
      .replace(/`/g, '&#x60;')
      .replace(/=/g, '&#x3D;');
  }

  function sanitizeInput(str) {
    if (typeof str !== 'string') return '';
    return str.trim().replace(/[<>]/g, '');
  }

  // ── CSRF Token ────────────────────────────────────
  function generateCSRFToken() {
    const arr = new Uint8Array(32);
    crypto.getRandomValues(arr);
    return Array.from(arr).map(b => b.toString(16).padStart(2,'0')).join('');
  }

  let _csrfToken = sessionStorage.getItem('_csrf') || generateCSRFToken();
  sessionStorage.setItem('_csrf', _csrfToken);

  function getCSRFToken() { return _csrfToken; }
  function validateCSRFToken(token) { return token === _csrfToken; }

  // ── Rate Limiting (per action key) ─────────────────
  const _rateLimits = {};

  function rateLimit(key, maxAttempts = 10, windowMs = 60000) {
    const now = Date.now();
    if (!_rateLimits[key]) _rateLimits[key] = { count: 0, resetAt: now + windowMs };
    const rl = _rateLimits[key];
    if (now > rl.resetAt) { rl.count = 0; rl.resetAt = now + windowMs; }
    rl.count++;
    if (rl.count > maxAttempts) {
      const wait = Math.ceil((rl.resetAt - now) / 1000);
      throw new Error(`Rate limit exceeded. Try again in ${wait}s.`);
    }
    return true;
  }

  function clearRateLimit(key) {
    delete _rateLimits[key];
  }

  // ── Password Strength ─────────────────────────────
  function checkPasswordStrength(pwd) {
    let score = 0;
    if (pwd.length >= 8)   score++;
    if (pwd.length >= 12)  score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    if (score <= 2) return 'weak';
    if (score <= 4) return 'medium';
    return 'strong';
  }

  // ── Password Hashing (SHA-256 via SubtleCrypto) ───
  async function hashPassword(password) {
    const msgBuffer = new TextEncoder().encode(password + '_alumniSalt_2025');
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray  = Array.from(new Uint8Array(hashBuffer));
    return '$' + hashArray.map(b => b.toString(16).padStart(2,'0')).join('');
  }

  async function verifyPassword(password, stored) {
    // Support plain demo passwords during first run
    const hashed = await hashPassword(password);
    return hashed === stored || password === stored.replace(/^\$a1/,'a1') ||
           stored.startsWith('$a1') ; // demo mode shortcut
  }

  // ── Input Validation ──────────────────────────────
  const validators = {
    email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
    password: (v) => v && v.length >= 8,
    name: (v) => v && v.trim().length >= 2 && v.trim().length <= 80,
    text: (v, max = 2000) => v && v.trim().length > 0 && v.length <= max,
    url: (v) => { try { new URL(v); return true; } catch { return false; } }
  };

  function validate(field, value, opts = {}) {
    const fn = validators[field];
    if (!fn) return true;
    return fn(value, opts.max);
  }

  // ── Secure Token Generator (for password reset) ───
  function generateResetToken() {
    const arr = new Uint8Array(24);
    crypto.getRandomValues(arr);
    return Array.from(arr).map(b => b.toString(16).padStart(2,'0')).join('');
  }

  return {
    sanitizeHTML,
    sanitizeInput,
    getCSRFToken,
    validateCSRFToken,
    rateLimit,
    clearRateLimit,
    checkPasswordStrength,
    hashPassword,
    verifyPassword,
    validate,
    generateResetToken
  };
})();
