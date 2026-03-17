/* =====================================================
   PROFILE PAGE
===================================================== */
'use strict';

const ProfilePage = (() => {
  async function render(params) {
    const session = Auth.getSession();
    const targetId = params?.id || session.userId;
    const user = Store.findById('users', targetId);
    if (!user) return `<div class="page-with-nav page-enter"><div class="page-container">${Components.emptyState('😶','User not found','This profile doesn\'t exist.')}</div></div>`;

    const isOwnProfile = targetId === session.userId;
    const me = Store.findById('users', session.userId);
    const isFollowing = me.following.includes(targetId);

    const posts = Store.findAll('posts', p => p.authorId === targetId).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
    const eventCount = Store.findAll('events', e => e.attendees.includes(targetId)).length;

    return `
      <div class="page-with-nav page-enter">
        <div class="page-container" style="max-width:900px">
          <!-- Profile Card -->
          <div class="card" style="margin-bottom:var(--space-6)">
            <div class="profile-cover"></div>
            <div class="profile-info">
              <div class="profile-top-row">
                <div>
                  <div class="profile-avatar-wrap">
                    <div class="profile-avatar">${Security.sanitizeHTML(user.initials || '?')}</div>
                  </div>
                  <h1 class="profile-name">${Security.sanitizeHTML(user.name)}</h1>
                  <p class="profile-headline">${Security.sanitizeHTML(user.bio || 'Alumni member')}</p>
                  <div style="display:flex;gap:var(--space-3);flex-wrap:wrap;margin-top:var(--space-3)">
                    ${user.company ? `<span style="font-size:var(--fs-sm);color:var(--clr-text-muted)">🏢 ${Security.sanitizeHTML(user.company)}</span>` : ''}
                    ${user.location ? `<span style="font-size:var(--fs-sm);color:var(--clr-text-muted)">📍 ${Security.sanitizeHTML(user.location)}</span>` : ''}
                    <span class="badge badge-primary">${Security.sanitizeHTML(user.batch)} · ${Security.sanitizeHTML(user.department)}</span>
                    <span class="badge ${user.role==='admin'?'badge-gold':user.role==='moderator'?'badge-accent':'badge-primary'}">${user.role}</span>
                  </div>
                </div>
                <div style="display:flex;gap:var(--space-3);flex-wrap:wrap">
                  ${isOwnProfile
                    ? `<button class="btn btn-ghost" onclick="openEditProfile('${user.id}')">✏️ Edit Profile</button>`
                    : `
                      <button class="btn ${isFollowing?'btn-ghost':'btn-primary'}" id="follow-btn-${user.id}" onclick="handleProfileFollow('${user.id}')">
                        ${isFollowing ? 'Following ✓' : '+ Follow'}
                      </button>
                      <button class="btn btn-glass" onclick="handleMessageUser('${user.id}')">💬 Message</button>`}
                </div>
              </div>

              <div class="profile-stats">
                <div class="profile-stat"><div class="profile-stat-num">${posts.length}</div><div class="profile-stat-lab">Posts</div></div>
                <div class="profile-stat"><div class="profile-stat-num">${(user.followers||[]).length}</div><div class="profile-stat-lab">Followers</div></div>
                <div class="profile-stat"><div class="profile-stat-num">${(user.following||[]).length}</div><div class="profile-stat-lab">Following</div></div>
                <div class="profile-stat"><div class="profile-stat-num">${eventCount}</div><div class="profile-stat-lab">Events</div></div>
              </div>
            </div>
          </div>

          <!-- Tabs -->
          <div class="tabs">
            <button class="tab-btn active" onclick="switchProfileTab('posts',this)">📸 Posts</button>
            <button class="tab-btn" onclick="switchProfileTab('about',this)">ℹ️ About</button>
            <button class="tab-btn" onclick="switchProfileTab('connections',this)">👥 Connections</button>
          </div>

          <!-- Posts Tab -->
          <div id="profile-tab-posts">
            ${posts.length
              ? posts.map(p => Components.postCard(p, session.userId)).join('')
              : Components.emptyState('📸','No posts yet', isOwnProfile ? 'Share your first update on the Feed!' : `${user.name} hasn't posted yet.`)}
          </div>

          <!-- About Tab (hidden) -->
          <div id="profile-tab-about" class="hidden">
            <div class="card">
              <div class="card-inner">
                <h3 style="font-family:var(--font-display);font-weight:700;margin-bottom:var(--space-5)">About</h3>
                <div style="display:grid;gap:var(--space-4)">
                  ${[
                    {icon:'🎓',label:'Batch',val:user.batch},
                    {icon:'📚',label:'Department',val:user.department},
                    {icon:'🏢',label:'Company',val:user.company||'—'},
                    {icon:'📍',label:'Location',val:user.location||'—'},
                    {icon:'📅',label:'Joined',val:Components.formatDate(user.joinedAt)},
                    {icon:'👤',label:'Role',val:user.role},
                  ].map(f=>`
                    <div style="display:flex;gap:var(--space-4);align-items:center">
                      <span style="font-size:1.5rem;width:36px">${f.icon}</span>
                      <div>
                        <div style="font-size:var(--fs-xs);color:var(--clr-text-dim);text-transform:uppercase;letter-spacing:0.06em">${f.label}</div>
                        <div style="font-weight:500">${Security.sanitizeHTML(f.val)}</div>
                      </div>
                    </div>`).join('')}
                </div>
              </div>
            </div>
          </div>

          <!-- Connections Tab (hidden) -->
          <div id="profile-tab-connections" class="hidden">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-6)">
              <div class="card">
                <div class="card-header"><div class="card-title">Followers (${(user.followers||[]).length})</div></div>
                <div class="card-inner" style="padding-top:var(--space-4)">
                  ${(user.followers||[]).map(uid => {
                    const u = Store.findById('users', uid);
                    if (!u) return '';
                    return `<div style="display:flex;align-items:center;gap:var(--space-3);padding:var(--space-3) 0;border-bottom:1px solid rgba(100,130,255,0.06);cursor:pointer" onclick="Router.go('/profile/${uid}')">
                      ${Components.avatar(u, 36)}
                      <div><div style="font-weight:600;font-size:var(--fs-sm)">${Security.sanitizeHTML(u.name)}</div><div style="font-size:var(--fs-xs);color:var(--clr-text-muted)">${u.batch} · ${u.department}</div></div>
                    </div>`;
                  }).join('') || '<div style="color:var(--clr-text-dim);font-size:var(--fs-sm)">No followers yet.</div>'}
                </div>
              </div>
              <div class="card">
                <div class="card-header"><div class="card-title">Following (${(user.following||[]).length})</div></div>
                <div class="card-inner" style="padding-top:var(--space-4)">
                  ${(user.following||[]).map(uid => {
                    const u = Store.findById('users', uid);
                    if (!u) return '';
                    return `<div style="display:flex;align-items:center;gap:var(--space-3);padding:var(--space-3) 0;border-bottom:1px solid rgba(100,130,255,0.06);cursor:pointer" onclick="Router.go('/profile/${uid}')">
                      ${Components.avatar(u, 36)}
                      <div><div style="font-weight:600;font-size:var(--fs-sm)">${Security.sanitizeHTML(u.name)}</div><div style="font-size:var(--fs-xs);color:var(--clr-text-muted)">${u.batch} · ${u.department}</div></div>
                    </div>`;
                  }).join('') || '<div style="color:var(--clr-text-dim);font-size:var(--fs-sm)">Not following anyone yet.</div>'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>`;
  }

  function mount() {}
  return { render, mount };
})();

window.ProfilePage = ProfilePage;

// ── Profile handlers ──
function switchProfileTab(tab, btn) {
  ['posts','about','connections'].forEach(t => {
    const el = document.getElementById(`profile-tab-${t}`);
    if (el) el.classList.toggle('hidden', t !== tab);
  });
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

function handleProfileFollow(userId) {
  const session = Auth.getSession();
  const me = Store.findById('users', session.userId);
  const isFollowing = me.following.includes(userId);
  const newFollowing = isFollowing ? me.following.filter(id=>id!==userId) : [...me.following, userId];
  Store.update('users', session.userId, { following: newFollowing });
  // Update target's followers
  const target = Store.findById('users', userId);
  const newFollowers = isFollowing ? (target.followers||[]).filter(id=>id!==session.userId) : [...(target.followers||[]), session.userId];
  Store.update('users', userId, { followers: newFollowers });

  const btn = document.getElementById(`follow-btn-${userId}`);
  if (btn) {
    const nowFollowing = !isFollowing;
    btn.className = nowFollowing ? 'btn btn-ghost' : 'btn btn-primary';
    btn.textContent = nowFollowing ? 'Following ✓' : '+ Follow';
  }
  Components.toast(isFollowing ? 'Unfollowed.' : 'Now following! 👥', 'success');
}

function handleMessageUser(userId) {
  Router.go('/chat');
  // Switch to DM with this user after navigation
  setTimeout(() => {
    const item = document.querySelector(`[data-chat-id="${userId}"][data-is-dm="true"]`);
    if (item) item.click();
  }, 500);
}

function openEditProfile(userId) {
  const user = Store.findById('users', userId);
  Components.openModal(`
    <div style="padding:var(--space-6)">
      <h2 style="font-family:var(--font-display);font-size:var(--fs-2xl);font-weight:700;margin-bottom:var(--space-6)">Edit Profile</h2>
      <div class="form-group"><label class="form-label">Display Name</label><input class="form-input" id="ep-name" value="${Security.sanitizeHTML(user.name)}" maxlength="80" /></div>
      <div class="form-group"><label class="form-label">Bio</label><textarea class="form-textarea" id="ep-bio" maxlength="200">${Security.sanitizeHTML(user.bio||'')}</textarea></div>
      <div class="form-group"><label class="form-label">Company / Organization</label><input class="form-input" id="ep-company" value="${Security.sanitizeHTML(user.company||'')}" maxlength="100" /></div>
      <div class="form-group"><label class="form-label">Location</label><input class="form-input" id="ep-location" value="${Security.sanitizeHTML(user.location||'')}" maxlength="100" /></div>
      <div style="display:flex;gap:var(--space-3);justify-content:flex-end">
        <button class="btn btn-ghost" onclick="Components.closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="saveProfile('${userId}')">Save Changes</button>
      </div>
    </div>`);
}

async function saveProfile(userId) {
  const name = document.getElementById('ep-name')?.value?.trim();
  const bio = document.getElementById('ep-bio')?.value?.trim();
  const company = document.getElementById('ep-company')?.value?.trim();
  const location = document.getElementById('ep-location')?.value?.trim();
  if (!name || name.length < 2) { Components.toast('Name must be at least 2 characters.','warning'); return; }
  await API.updateUser(userId, { name, bio, company, location });
  Components.closeModal();
  Components.toast('Profile updated! ✨','success');
  Router.go('/profile/' + userId);
}
