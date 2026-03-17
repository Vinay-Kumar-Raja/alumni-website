/* =====================================================
   RESET PASSWORD PAGE — separate file
===================================================== */
'use strict';

const ResetPasswordPage = (() => {
  function render(params) {
    const token = params?.token || '';
    return `
      <div class="auth-page page-enter">
        <div style="max-width:460px;width:100%">
          <div class="card glass-bright animate-scaleIn">
            <div class="card-inner" style="padding:var(--space-10)">
              <div style="text-align:center;margin-bottom:var(--space-8)">
                <div style="font-size:3rem;margin-bottom:var(--space-4)">🔐</div>
                <h1 class="auth-form-title">Set New Password</h1>
                <p class="auth-form-subtitle" style="margin-bottom:0">Create a strong new password for your account.</p>
              </div>
              <div class="form-group">
                <label class="form-label" for="rp-pwd">New Password</label>
                <div class="input-icon-wrapper">
                  <span class="input-icon">🔒</span>
                  <input class="form-input" id="rp-pwd" type="password" placeholder="Min. 8 characters" autocomplete="new-password" maxlength="128" oninput="updateStrength(this.value)" />
                  <span class="input-icon-right" onclick="togglePwd('rp-pwd')" role="button" aria-label="Toggle">👁</span>
                </div>
                <div class="strength-meter"><div class="strength-bar" id="sb1"></div><div class="strength-bar" id="sb2"></div><div class="strength-bar" id="sb3"></div></div>
                <div class="form-error hidden" id="rp-pwd-err" role="alert"></div>
              </div>
              <div class="form-group">
                <label class="form-label" for="rp-confirm">Confirm Password</label>
                <div class="input-icon-wrapper">
                  <span class="input-icon">🔒</span>
                  <input class="form-input" id="rp-confirm" type="password" placeholder="Repeat password" autocomplete="new-password" maxlength="128"
                    onkeydown="if(event.key==='Enter')handleResetSubmit('${token}')" />
                </div>
                <div class="form-error hidden" id="rp-confirm-err" role="alert"></div>
              </div>
              <div class="form-error hidden" id="rp-global-err" role="alert" style="margin-bottom:var(--space-4);padding:var(--space-3) var(--space-4);background:rgba(239,68,68,0.1);border-radius:var(--radius-md);border:1px solid rgba(239,68,68,0.3)"></div>
              <button class="btn btn-primary w-full btn-lg" id="rp-btn" onclick="handleResetSubmit('${token}')">Reset Password →</button>
              <div class="auth-link-row"><a href="#" onclick="Router.go('/login');return false;" style="color:var(--clr-primary)">← Back to Sign In</a></div>
            </div>
          </div>
        </div>
      </div>`;
  }
  function mount() {}
  return { render, mount };
})();

async function handleResetSubmit(token) {
  const pwd = document.getElementById('rp-pwd')?.value || '';
  const confirm = document.getElementById('rp-confirm')?.value || '';
  const btn = document.getElementById('rp-btn');
  const errEl = document.getElementById('rp-global-err');
  errEl?.classList.add('hidden');
  document.querySelectorAll('[id$="-err"]').forEach(e => e.classList.add('hidden'));
  let valid = true;
  if (!Security.validate('password', pwd)) { showFieldErr('rp-pwd-err','Password must be at least 8 characters.'); valid=false; }
  if (pwd !== confirm) { showFieldErr('rp-confirm-err','Passwords do not match.'); valid=false; }
  if (!valid) return;
  btn.disabled = true;
  btn.innerHTML = '<div style="width:20px;height:20px;border:2px solid rgba(255,255,255,0.3);border-top-color:#fff;border-radius:50%;animation:spin 0.8s linear infinite;display:inline-block"></div> Resetting…';
  try {
    await Auth.resetPassword(token, pwd);
    Components.toast('Password reset! Please sign in.', 'success');
    Router.go('/login');
  } catch(e) {
    errEl.textContent = e.message; errEl.classList.remove('hidden');
    btn.disabled = false; btn.innerHTML = 'Reset Password →';
  }
}

window.ResetPasswordPage = ResetPasswordPage;
