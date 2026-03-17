/* =====================================================
   LOGIN PAGE — Login + Register + Verify Email
===================================================== */
'use strict';

const LoginPage = (() => {
  let mode = 'login'; // 'login' | 'register'

  function render(params) {
    if (params?.register === '1') mode = 'register';
    else mode = 'login';

    return `
      <div class="auth-page page-enter">
        <div class="auth-split">
          <!-- Left showcase -->
          <div class="auth-showcase">
            <div class="hero-badge" style="display:inline-flex;margin-bottom:var(--space-6)">🎓 Alumni Connect</div>
            <h2 class="auth-showcase-title text-gradient">Your Alumni Journey Continues Here</h2>
            <p class="auth-showcase-text">Connect with thousands of alumni worldwide. Share stories, find opportunities, and relive memories.</p>
            <div class="auth-feature-list">
              ${['Secure, admin-verified community', 'Real-time chat & group channels', 'Instagram-like alumni feed', 'Exclusive events & workshops', 'Powerful career networking'].map(f=>`
                <div class="auth-feature-item">
                  <div class="auth-feature-check">✓</div>
                  <span>${f}</span>
                </div>`).join('')}
            </div>
          </div>
          <!-- Right form -->
          <div class="auth-form-panel" id="auth-form-panel">
            ${mode === 'login' ? loginForm() : registerForm()}
          </div>
        </div>
      </div>
    `;
  }

  function loginForm() {
    return `
      <div class="animate-fadeUp">
        <h1 class="auth-form-title">Welcome back 👋</h1>
        <p class="auth-form-subtitle">Sign in to your alumni account</p>

        <div class="form-group">
          <label class="form-label" for="login-email">Email Address</label>
          <div class="input-icon-wrapper">
            <span class="input-icon">📧</span>
            <input class="form-input" id="login-email" type="email" placeholder="you@alumni.com" autocomplete="email" maxlength="200" required aria-required="true" />
          </div>
          <div class="form-error hidden" id="login-email-err" role="alert"></div>
        </div>

        <div class="form-group">
          <label class="form-label" for="login-pwd">Password</label>
          <div class="input-icon-wrapper">
            <span class="input-icon">🔒</span>
            <input class="form-input" id="login-pwd" type="password" placeholder="Your password" autocomplete="current-password" maxlength="128" required aria-required="true" />
            <span class="input-icon-right" onclick="togglePwd('login-pwd')" title="Toggle visibility" role="button" aria-label="Show/hide password">👁</span>
          </div>
          <div class="form-error hidden" id="login-pwd-err" role="alert"></div>
        </div>

        <div style="text-align:right;margin-bottom:var(--space-6)">
          <a href="#" onclick="Router.go('/forgot-password');return false;" style="font-size:var(--fs-sm);color:var(--clr-primary)">Forgot password?</a>
        </div>

        <div class="form-error hidden" id="login-global-err" role="alert" style="margin-bottom:var(--space-4);padding:var(--space-3) var(--space-4);background:rgba(239,68,68,0.1);border-radius:var(--radius-md);border:1px solid rgba(239,68,68,0.3)"></div>

        <button class="btn btn-primary w-full btn-lg" id="login-btn" onclick="handleLoginSubmit()">Sign In →</button>

        <div class="auth-link-row">
          Don't have an account?
          <a href="#" onclick="switchAuthMode('register');return false;" style="color:var(--clr-primary);font-weight:600"> Create Account</a>
        </div>

        <div class="auth-divider">Demo Credentials</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-3)">
          <button class="btn btn-glass btn-sm" onclick="fillDemo('admin@alumni.com','Admin@123')" style="font-size:11px">🛡️ Admin</button>
          <button class="btn btn-glass btn-sm" onclick="fillDemo('priya@alumni.com','Alumni@2025')" style="font-size:11px">👤 Alumni</button>
        </div>
      </div>
    `;
  }

  function registerForm() {
    return `
      <div class="animate-fadeUp">
        <h1 class="auth-form-title">Create Account ✨</h1>
        <p class="auth-form-subtitle">Join the alumni community today</p>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-4)">
          <div class="form-group">
            <label class="form-label" for="reg-name">Full Name</label>
            <input class="form-input" id="reg-name" type="text" placeholder="Your Name" maxlength="80" required aria-required="true" />
            <div class="form-error hidden" id="reg-name-err" role="alert"></div>
          </div>
          <div class="form-group">
            <label class="form-label" for="reg-batch">Batch Year</label>
            <select class="form-select" id="reg-batch" aria-label="Batch year">
              ${Array.from({length:30},(_,i)=>2024-i).map(y=>`<option value="${y}">${y}</option>`).join('')}
            </select>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="reg-email">Email Address</label>
          <div class="input-icon-wrapper">
            <span class="input-icon">📧</span>
            <input class="form-input" id="reg-email" type="email" placeholder="you@email.com" autocomplete="email" maxlength="200" required aria-required="true" />
          </div>
          <div class="form-error hidden" id="reg-email-err" role="alert"></div>
        </div>

        <div class="form-group">
          <label class="form-label" for="reg-dept">Department</label>
          <select class="form-select" id="reg-dept" aria-label="Department">
            ${['CS','ECE','ME','Civil','Chemical','EE','Biotech','MBA','Other'].map(d=>`<option value="${d}">${d}</option>`).join('')}
          </select>
        </div>

        <div class="form-group">
          <label class="form-label" for="reg-pwd">Password</label>
          <div class="input-icon-wrapper">
            <span class="input-icon">🔒</span>
            <input class="form-input" id="reg-pwd" type="password" placeholder="Min. 8 characters" autocomplete="new-password" maxlength="128" required aria-required="true" oninput="updateStrength(this.value)" />
            <span class="input-icon-right" onclick="togglePwd('reg-pwd')" title="Toggle visibility" role="button" aria-label="Show/hide password">👁</span>
          </div>
          <div class="strength-meter" id="strength-meter">
            <div class="strength-bar" id="sb1"></div>
            <div class="strength-bar" id="sb2"></div>
            <div class="strength-bar" id="sb3"></div>
          </div>
          <div class="form-error hidden" id="reg-pwd-err" role="alert"></div>
        </div>

        <div class="form-error hidden" id="reg-global-err" role="alert" style="margin-bottom:var(--space-4);padding:var(--space-3) var(--space-4);background:rgba(239,68,68,0.1);border-radius:var(--radius-md);border:1px solid rgba(239,68,68,0.3)"></div>

        <button class="btn btn-primary w-full btn-lg" id="reg-btn" onclick="handleRegisterSubmit()">Create Account →</button>

        <div class="auth-link-row">
          Already have an account?
          <a href="#" onclick="switchAuthMode('login');return false;" style="color:var(--clr-primary);font-weight:600"> Sign In</a>
        </div>
      </div>
    `;
  }

  function mount() {
    // Support ESC to also handle misc things
  }

  return { render, mount };
})();

window.LoginPage = LoginPage;

// ── Global handlers for login page ──
async function handleLoginSubmit() {
  const email = document.getElementById('login-email')?.value?.trim() || '';
  const pwd   = document.getElementById('login-pwd')?.value || '';
  const btn   = document.getElementById('login-btn');
  const errEl = document.getElementById('login-global-err');

  // Clear errors
  document.querySelectorAll('[id$="-err"]').forEach(e => e.classList.add('hidden'));

  // Validate
  let valid = true;
  if (!email || !Security.validate('email', email)) {
    showFieldErr('login-email-err', 'Please enter a valid email address.');
    valid = false;
  }
  if (!pwd || pwd.length < 1) {
    showFieldErr('login-pwd-err', 'Password is required.');
    valid = false;
  }
  if (!valid) return;

  btn.disabled = true;
  btn.innerHTML = '<div style="width:20px;height:20px;border:2px solid rgba(255,255,255,0.3);border-top-color:#fff;border-radius:50%;animation:spin 0.8s linear infinite;display:inline-block"></div> Signing in…';

  try {
    const csrf = Security.getCSRFToken();
    const session = await Auth.login(email, pwd, csrf);
    Components.toast(`Welcome back, ${session.name}! 🎉`, 'success');
    Router.go('/dashboard');
  } catch(e) {
    errEl.textContent = e.message;
    errEl.classList.remove('hidden');
    btn.disabled = false;
    btn.innerHTML = 'Sign In →';
  }
}

async function handleRegisterSubmit() {
  const name  = document.getElementById('reg-name')?.value?.trim() || '';
  const email = document.getElementById('reg-email')?.value?.trim() || '';
  const pwd   = document.getElementById('reg-pwd')?.value || '';
  const batch = document.getElementById('reg-batch')?.value || '';
  const dept  = document.getElementById('reg-dept')?.value || '';
  const btn   = document.getElementById('reg-btn');
  const errEl = document.getElementById('reg-global-err');

  document.querySelectorAll('[id$="-err"]').forEach(e => e.classList.add('hidden'));
  let valid = true;
  if (!Security.validate('name', name)) { showFieldErr('reg-name-err', 'Name must be 2-80 characters.'); valid = false; }
  if (!Security.validate('email', email)) { showFieldErr('reg-email-err', 'Invalid email address.'); valid = false; }
  if (!Security.validate('password', pwd)) { showFieldErr('reg-pwd-err', 'Password must be at least 8 characters.'); valid = false; }
  if (!valid) return;

  btn.disabled = true;
  btn.innerHTML = '<div style="width:20px;height:20px;border:2px solid rgba(255,255,255,0.3);border-top-color:#fff;border-radius:50%;animation:spin 0.8s linear infinite;display:inline-block"></div> Creating account…';

  try {
    const user = await Auth.register({ name, email, password: pwd, batch, department: dept });
    const needsApproval = !user.approved;
    if (needsApproval) {
      Components.openModal(`
        <div style="padding:var(--space-8);text-align:center">
          <div style="font-size:3rem;margin-bottom:var(--space-4)">⏳</div>
          <h2 style="font-family:var(--font-display);margin-bottom:var(--space-4)">Account Under Review</h2>
          <p style="color:var(--clr-text-muted);margin-bottom:var(--space-6)">Your registration is pending admin approval. You'll be notified once approved, typically within 24 hours.</p>
          <button class="btn btn-primary" onclick="Components.closeModal();Router.go('/')">Back to Home</button>
        </div>`);
    } else {
      const session = await Auth.login(email, pwd, Security.getCSRFToken());
      Components.toast(`Account created! Welcome, ${session.name}! 🎉`, 'success');
      Router.go('/dashboard');
    }
  } catch(e) {
    errEl.textContent = e.message;
    errEl.classList.remove('hidden');
    btn.disabled = false;
    btn.innerHTML = 'Create Account →';
  }
}

function switchAuthMode(m) {
  const panel = document.getElementById('auth-form-panel');
  if (!panel) return;
  panel.innerHTML = m === 'login' ? LoginPage.render().match(/<div class="auth-form-panel"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/)?.[1] || '' : '';
  // Re-render via router shortcut
  if (m === 'login') panel.innerHTML = LoginPage['loginForm'] ? LoginPage.loginForm() : '';
  Router.go(m === 'login' ? '/login' : '/login?register=1');
}

function showFieldErr(id, msg) {
  const el = document.getElementById(id);
  if (el) { el.textContent = '⚠ ' + msg; el.classList.remove('hidden'); }
}

function togglePwd(id) {
  const input = document.getElementById(id);
  if (input) input.type = input.type === 'password' ? 'text' : 'password';
}

function fillDemo(email, pwd) {
  const e = document.getElementById('login-email');
  const p = document.getElementById('login-pwd');
  if (e) e.value = email;
  if (p) p.value = pwd;
}

function updateStrength(pwd) {
  const strength = Security.checkPasswordStrength(pwd);
  const bars = ['sb1','sb2','sb3'].map(id => document.getElementById(id));
  bars.forEach(b => { if(b) b.className = 'strength-bar'; });
  if (strength === 'weak')   { if(bars[0]) bars[0].classList.add('weak'); }
  if (strength === 'medium') { bars.slice(0,2).forEach(b => b && b.classList.add('medium')); }
  if (strength === 'strong') { bars.forEach(b => b && b.classList.add('strong')); }
}
