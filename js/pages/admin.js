/* =====================================================
   ADMIN PORTAL
===================================================== */
'use strict';

const AdminPage = (() => {
  let activeSection = 'dashboard';

  async function render() {
    if (!Auth.isModerator()) {
      return `<div class="page-with-nav page-enter"><div class="page-container">${Components.emptyState('🚫','Access Denied','You do not have administrator privileges.')}</div></div>`;
    }
    return `
      <div class="page-with-nav page-enter page-bg-container">
        <div class="mesh-gradient"></div>
        <div class="hero-grid-bg"></div>
        <div class="admin-layout">
          <!-- Admin Sidebar -->
          <aside class="admin-sidebar">
            <div style="padding:var(--space-2) var(--space-4) var(--space-4);font-family:var(--font-display);font-weight:800;font-size:var(--fs-base);color:var(--clr-text)">
              🛡️ Admin Portal
            </div>
            ${[
              {id:'dashboard', icon:'📊', label:'Dashboard'},
              {id:'users',     icon:'👥', label:'User Management'},
              {id:'posts',     icon:'📸', label:'Content Moderation'},
              {id:'events',    icon:'📅', label:'Event Management'},
              {id:'audit',     icon:'📋', label:'Audit Log'},
              {id:'settings',  icon:'⚙️', label:'Settings'},
            ].map(n=>`
              <button class="admin-nav-link ${activeSection===n.id?'active':''}" onclick="switchAdminSection('${n.id}')">
                <span>${n.icon}</span>${n.label}
              </button>`).join('')}
          </aside>

          <!-- Admin Content -->
          <div class="admin-content" id="admin-content">
            ${await renderSection('dashboard')}
          </div>
        </div>
      </div>`;
  }

  async function renderSection(section) {
    activeSection = section;
    switch(section) {
      case 'dashboard': return await dashboardSection();
      case 'users':     return await usersSection();
      case 'posts':     return await postsSection();
      case 'events':    return await eventsSection();
      case 'audit':     return await auditSection();
      case 'settings':  return settingsSection();
      default:          return dashboardSection();
    }
  }

  async function dashboardSection() {
    const stats = await API.getAdminStats();
    const audit = await API.getAuditLog(5);
    return `
      <div class="admin-header">
        <h1 class="admin-title text-shimmer">Dashboard Overview</h1>
        <p class="admin-subtitle">Platform health and activity at a glance.</p>
      </div>
      <div class="stats-grid" style="margin-bottom:var(--space-8)">
        ${[
          {icon:'👥',label:'Total Users',val:stats.totalUsers},
          {icon:'✅',label:'Approved Users',val:stats.approvedUsers},
          {icon:'⏳',label:'Pending Approval',val:stats.pendingUsers,alert:stats.pendingUsers>0},
          {icon:'📸',label:'Total Posts',val:stats.totalPosts},
          {icon:'📅',label:'Total Events',val:stats.totalEvents},
          {icon:'🌐',label:'Active Today',val:stats.activeToday},
        ].map(s=>`
          <div class="stat-card ${s.alert?'animate-glow':''}">
            <div class="stat-icon">${s.icon}</div>
            <div class="stat-value">${s.val}</div>
            <div class="stat-label">${s.label}</div>
          </div>`).join('')}
      </div>

      <!-- Mini chart -->
      <div class="card" style="margin-bottom:var(--space-6)">
        <div class="card-header"><div class="card-title">📈 User Growth (Last 7 Days)</div></div>
        <div class="card-inner">
          <div class="chart-box" style="align-items:flex-end;padding:var(--space-4) var(--space-4) 0">
            ${[35,42,38,55,48,62,70].map((h,i)=>`
              <div class="chart-bar" style="height:${h}%;opacity:${0.5+i*0.07}" title="Day ${i+1}: ${h} users"></div>
            `).join('')}
          </div>
          <div style="display:flex;justify-content:space-between;font-size:var(--fs-xs);color:var(--clr-text-dim);padding:var(--space-2) var(--space-4)">
            ${['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d=>`<span>${d}</span>`).join('')}
          </div>
        </div>
      </div>

      <!-- Recent audit -->
      <div class="card">
        <div class="card-header"><div class="card-title">🕰️ Recent Activity</div><button class="btn btn-glass btn-sm" onclick="switchAdminSection('audit')">View All</button></div>
        <div class="card-inner" style="padding:0">
          <table class="data-table">
            <thead><tr><th>Action</th><th>User</th><th>Time</th></tr></thead>
            <tbody>
              ${audit.map(a=>{
                const u = Store.findById('users', a.userId);
                return `<tr>
                  <td><span class="badge badge-primary">${Security.sanitizeHTML(a.action)}</span></td>
                  <td>${Security.sanitizeHTML(u?.name||a.userId)}</td>
                  <td>${Components.timeAgo(a.createdAt)}</td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>`;
  }

  async function usersSection() {
    const allUsers = await API.getUsers();
    const pending = allUsers.filter(u=>!u.approved);
    return `
      <div class="admin-header">
        <h1 class="admin-title">User Management</h1>
        <p class="admin-subtitle">${allUsers.length} total users · ${pending.length} pending approval</p>
      </div>
      ${pending.length > 0 ? `
        <div style="background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.3);border-radius:var(--radius-lg);padding:var(--space-4);margin-bottom:var(--space-5)">
          <strong>⏳ ${pending.length} user(s) awaiting approval</strong>
        </div>` : ''}
      <div class="action-bar">
        <div class="search-bar" style="flex:1;max-width:300px">
          <span class="search-icon">🔍</span>
          <input type="text" placeholder="Search users…" oninput="filterAdminUsers(this.value)" aria-label="Search users" />
        </div>
        <select class="form-select" style="width:140px" onchange="filterAdminByStatus(this.value)" aria-label="Filter by status">
          <option value="all">All Users</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="locked">Locked</option>
        </select>
      </div>

      <div class="card">
        <table class="data-table" id="admin-users-table">
          <thead><tr><th>User</th><th>Batch / Dept</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
          <tbody>
            ${allUsers.map(u => userRow(u)).join('')}
          </tbody>
        </table>
      </div>`;
  }

  function userRow(u) {
    return `
      <tr id="urow-${u.id}">
        <td>
          <div style="display:flex;align-items:center;gap:var(--space-3)">
            ${Components.avatar(u, 32)}
            <div>
              <div style="font-weight:600;color:var(--clr-text)">${Security.sanitizeHTML(u.name)}</div>
              <div style="font-size:var(--fs-xs);color:var(--clr-text-dim)">${Security.sanitizeHTML(u.email)}</div>
            </div>
          </div>
        </td>
        <td>${Security.sanitizeHTML(u.batch)} · ${Security.sanitizeHTML(u.department)}</td>
        <td>
          <select class="form-select" style="width:120px;padding:4px 8px;font-size:var(--fs-xs)" 
            onchange="changeUserRole('${u.id}', this.value)" aria-label="Change role for ${u.name}"
            ${u.id === Auth.getSession()?.userId ? 'disabled' : ''}>
            <option value="alumni" ${u.role==='alumni'?'selected':''}>Alumni</option>
            <option value="moderator" ${u.role==='moderator'?'selected':''}>Moderator</option>
            <option value="admin" ${u.role==='admin'?'selected':''}>Admin</option>
          </select>
        </td>
        <td>
          ${u.approved
            ? (u.locked ? '<span class="badge badge-error">Locked</span>' : '<span class="badge badge-accent">Active</span>')
            : '<span class="badge badge-warning">Pending</span>'}
        </td>
        <td>${new Date(u.joinedAt).toLocaleDateString()}</td>
        <td>
          <div style="display:flex;gap:var(--space-2);flex-wrap:wrap">
            ${!u.approved ? `<button class="btn btn-accent btn-sm" onclick="adminApproveUser('${u.id}')">✓ Approve</button>` : ''}
            ${u.id !== Auth.getSession()?.userId ? `<button class="btn btn-danger btn-sm" onclick="adminDeleteUser('${u.id}')">🗑 Delete</button>` : ''}
          </div>
        </td>
      </tr>`;
  }

  async function postsSection() {
    const posts = await API.getPosts(30);
    return `
      <div class="admin-header">
        <h1 class="admin-title">Content Moderation</h1>
        <p class="admin-subtitle">${posts.length} posts · Review and moderate community content</p>
      </div>
      <div class="card">
        <table class="data-table">
          <thead><tr><th>Author</th><th>Content Preview</th><th>Stats</th><th>Posted</th><th>Actions</th></tr></thead>
          <tbody>
            ${posts.map(p => {
              const author = Store.findById('users', p.authorId);
              return `<tr id="prow-${p.id}">
                <td>
                  <div style="display:flex;align-items:center;gap:var(--space-2)">
                    ${Components.avatar(author, 28)}
                    <span style="font-size:var(--fs-sm);font-weight:500">${Security.sanitizeHTML(author?.name||'?')}</span>
                  </div>
                </td>
                <td style="max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${Security.sanitizeHTML(p.content.slice(0,80))}…</td>
                <td><span style="font-size:var(--fs-xs)">❤️ ${p.likes.length} · 💬 ${p.comments.length}</span></td>
                <td>${Components.timeAgo(p.createdAt)}</td>
                <td>
                  <button class="btn btn-danger btn-sm" onclick="adminDeletePost('${p.id}')">🗑 Remove</button>
                </td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>`;
  }

  async function eventsSection() {
    const events = await API.getEvents('all');
    return `
      <div class="admin-header">
        <h1 class="admin-title">Event Management</h1>
        <p class="admin-subtitle">${events.length} total events</p>
      </div>
      <div class="action-bar">
        <button class="btn btn-primary" onclick="openCreateEvent()">+ Create Event</button>
      </div>
      <div class="card">
        <table class="data-table">
          <thead><tr><th>Event</th><th>Date</th><th>Category</th><th>Attendees</th><th>Actions</th></tr></thead>
          <tbody>
            ${events.map(e=>`
              <tr>
                <td style="font-weight:600">${e.emoji} ${Security.sanitizeHTML(e.title)}</td>
                <td>${Components.formatDate(e.date)}</td>
                <td><span class="badge badge-primary">${Security.sanitizeHTML(e.category)}</span></td>
                <td>${e.attendees.length} / ${e.maxCapacity}</td>
                <td>
                  <button class="btn btn-danger btn-sm" onclick="adminDeleteEvent('${e.id}')">🗑 Delete</button>
                </td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>`;
  }

  async function auditSection() {
    const log = await API.getAuditLog(50);
    return `
      <div class="admin-header">
        <h1 class="admin-title">Audit Log</h1>
        <p class="admin-subtitle">Full record of all admin and system actions.</p>
      </div>
      <div class="card">
        <table class="data-table">
          <thead><tr><th>Timestamp</th><th>Action</th><th>User</th><th>Detail</th></tr></thead>
          <tbody>
            ${log.map(a=>{
              const u = Store.findById('users', a.userId);
              return `<tr>
                <td style="font-family:monospace;font-size:var(--fs-xs)">${new Date(a.createdAt).toLocaleString()}</td>
                <td><span class="badge badge-primary">${Security.sanitizeHTML(a.action)}</span></td>
                <td>${Security.sanitizeHTML(u?.name||a.userId)}</td>
                <td style="color:var(--clr-text-muted)">${Security.sanitizeHTML(a.detail)}</td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>`;
  }

  function settingsSection() {
    const settings = Store.get('settings');
    return `
      <div class="admin-header">
        <h1 class="admin-title">Platform Settings</h1>
        <p class="admin-subtitle">Configure global platform behaviour.</p>
      </div>
      <div class="card" style="max-width:600px">
        <div class="card-inner">
          ${[
            {key:'allowRegistration', label:'Allow New Registrations', desc:'When off, no new accounts can be created.'},
            {key:'requireApproval',   label:'Require Admin Approval',  desc:'New accounts must be manually approved before access.'},
            {key:'maintenanceMode',   label:'Maintenance Mode',        desc:'Show maintenance page to non-admins.'},
          ].map(s=>`
            <div style="display:flex;justify-content:space-between;align-items:center;padding:var(--space-5) 0;border-bottom:1px solid var(--clr-border)">
              <div>
                <div style="font-weight:600">${s.label}</div>
                <div style="font-size:var(--fs-xs);color:var(--clr-text-muted);margin-top:2px">${s.desc}</div>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" ${settings[s.key]?'checked':''} onchange="updateSetting('${s.key}', this.checked)" aria-label="${s.label}" />
                <span class="toggle-slider"></span>
              </label>
            </div>`).join('')}
          <div style="margin-top:var(--space-6);display:flex;gap:var(--space-4)">
            <button class="btn btn-danger" onclick="Components.confirm('Reset all demo data? This cannot be undone.', () => { Store.reset(); Components.toast(\'Data reset!\',\'success\'); Router.go(\'/dashboard\'); })">
              🔄 Reset Demo Data
            </button>
          </div>
        </div>
      </div>`;
  }

  function mount() {}

  return { render, mount, _renderSection: renderSection };
})();

window.AdminPage = AdminPage;

// ── Admin handlers ──
async function switchAdminSection(section) {
  document.querySelectorAll('.admin-nav-link').forEach(l => l.classList.remove('active'));
  document.querySelector(`.admin-nav-link[onclick*="'${section}'"]`)?.classList.add('active');
  const content = document.getElementById('admin-content');
  if (content) {
    content.innerHTML = Components.spinner(40) + '<div style="text-align:center;padding:var(--space-4);color:var(--clr-text-muted)">Loading…</div>';
    content.innerHTML = await AdminPage._renderSection(section);
  }
}

async function adminApproveUser(userId) {
  await API.approveUser(userId);
  const row = document.getElementById(`urow-${userId}`);
  if (row) {
    const statusCell = row.querySelectorAll('td')[3];
    if (statusCell) statusCell.innerHTML = '<span class="badge badge-accent">Active</span>';
    const approveBtn = row.querySelector('button.btn-accent');
    if (approveBtn) approveBtn.remove();
  }
  Components.toast('User approved! ✅', 'success');
}

async function adminDeleteUser(userId) {
  Components.confirm('Delete this user permanently?', async () => {
    await API.deleteUser(userId);
    document.getElementById(`urow-${userId}`)?.remove();
    Components.toast('User deleted.', 'info');
  });
}

async function changeUserRole(userId, role) {
  await API.setUserRole(userId, role);
  Components.toast(`Role updated to ${role}`, 'success');
}

async function adminDeletePost(postId) {
  Components.confirm('Remove this post?', async () => {
    await API.deletePost(postId);
    document.getElementById(`prow-${postId}`)?.remove();
    Components.toast('Post removed.', 'info');
  });
}

async function adminDeleteEvent(eventId) {
  Components.confirm('Delete this event?', async () => {
    await API.deleteEvent(eventId);
    Components.toast('Event deleted.', 'info');
    switchAdminSection('events');
  });
}

function filterAdminUsers(q) {
  document.querySelectorAll('#admin-users-table tbody tr').forEach(row => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(q.toLowerCase()) ? '' : 'none';
  });
}

function filterAdminByStatus(status) {
  const allUsers = Store.get('users');
  const filtered = status === 'all' ? allUsers
    : status === 'pending' ? allUsers.filter(u=>!u.approved)
    : status === 'locked'  ? allUsers.filter(u=>u.locked)
    : allUsers.filter(u=>u.approved && !u.locked);
  const tbody = document.querySelector('#admin-users-table tbody');
  if (tbody) tbody.innerHTML = filtered.map(u => AdminPage._userRow ? AdminPage._userRow(u) : userRow(u)).join('');
  // Re-render the section fully for simplicity
  switchAdminSection('users');
}

function updateSetting(key, value) {
  const settings = Store.get('settings');
  settings[key] = value;
  Store.set('settings', settings);
  Components.toast(`Setting "${key}" updated.`, 'success');
}
