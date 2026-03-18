/* =====================================================
   DASHBOARD PAGE
===================================================== */
'use strict';

const DashboardPage = (() => {
  async function render() {
    const session = Auth.getSession();
    const user = Auth.getCurrentUser();
    const events = (await API.getEvents('upcoming')).slice(0,3);
    const posts  = (await API.getPosts(5)).slice(0,5);

    const activities = [
      { icon:'❤️', text:'Priya Sharma liked your post', time: '2 minutes ago' },
      { icon:'💬', text:'Rahul Verma commented on your update', time: '1 hour ago' },
      { icon:'🎉', text:'New event: AI & Future of Work — Register!', time: '3 hours ago' },
      { icon:'👥', text:'2 new members followed you', time: 'Yesterday' },
    ];

    return `
      <div class="page-with-nav page-enter page-bg-container">
        <div class="mesh-gradient"></div>
        <div class="hero-grid-bg"></div>
        <div class="page-container" style="position:relative;z-index:1">
          <!-- Welcome Banner -->
          <div class="dashboard-welcome animate-fadeUp">
            <div>
              ${Components.avatar(user, 70)}
            </div>
            <div class="welcome-text">
              <h1>Welcome back,<br/><span class="text-gradient">${Security.sanitizeHTML(user?.name?.split(' ')[0] || 'Alumni')}!</span></h1>
              <p>Here's what's happening in your community today.</p>
              <div style="display:flex;gap:var(--space-3);margin-top:var(--space-4);flex-wrap:wrap">
                <button class="btn btn-primary btn-sm" onclick="Router.go('/feed')">View Feed</button>
                <button class="btn btn-ghost btn-sm" onclick="Router.go('/chat')">Open Chat</button>
              </div>
            </div>
          </div>

          <!-- Quick Stats -->
          <div class="stats-grid" style="margin-bottom:var(--space-6)">
            ${[
              { icon:'👥', label:'Your Connections', val: (user?.followers?.length || 0) + (user?.following?.length || 0) },
              { icon:'📸', label:'Your Posts', val: Store.findAll('posts', p => p.authorId === session.userId).length },
              { icon:'📅', label:'Events Attending', val: Store.findAll('events', e => e.attendees.includes(session.userId)).length },
              { icon:'💬', label:'Channels Joined', val: Store.findAll('channels', c => c.members.includes(session.userId)).length },
            ].map(s => `
              <div class="stat-card reveal reveal-up">
                <div class="stat-icon" aria-hidden="true">${s.icon}</div>
                <div class="stat-value">${s.val}</div>
                <div class="stat-label">${s.label}</div>
              </div>`).join('')}
          </div>

          <!-- Main content grid -->
          <div class="dashboard-grid">
            <!-- Left: Upcoming Events + Recent Posts -->
            <div class="reveal reveal-up">
              <div class="card" style="margin-bottom:var(--space-6)">
                <div class="card-header">
                  <div class="card-title">📅 Upcoming Events</div>
                  <button class="btn btn-glass btn-sm" onclick="Router.go('/events')">View All</button>
                </div>
                <div class="card-inner pt-0" style="padding-top:var(--space-4)">
                  <div class="upcoming-events-list">
                    ${events.length ? events.map(e => `
                      <div class="upcoming-event-item" onclick="Router.go('/events')">
                        <div class="event-date-box">
                          <div class="event-date-day">${new Date(e.date).getDate()}</div>
                          <div class="event-date-mon">${new Date(e.date).toLocaleString('default',{month:'short'})}</div>
                        </div>
                        <div style="flex:1;min-width:0">
                          <div style="font-weight:600;font-size:var(--fs-sm)">${Security.sanitizeHTML(e.title)}</div>
                          <div style="font-size:var(--fs-xs);color:var(--clr-text-muted)">📍 ${Security.sanitizeHTML(e.location)}</div>
                        </div>
                        <span class="badge badge-primary">${e.attendees.length} going</span>
                      </div>`).join('') : Components.emptyState('📅','No upcoming events','Check back soon!')}
                  </div>
                </div>
              </div>

              <div class="card">
                <div class="card-header">
                  <div class="card-title">📰 Recent Posts</div>
                  <button class="btn btn-glass btn-sm" onclick="Router.go('/feed')">See All</button>
                </div>
                <div class="card-inner" style="padding-top:var(--space-4)">
                  ${posts.map(p => {
                    const author = Store.findById('users', p.authorId);
                    return `
                    <div style="display:flex;gap:var(--space-3);padding:var(--space-3) 0;border-bottom:1px solid rgba(100,130,255,0.06);cursor:pointer" onclick="Router.go('/feed')">
                      ${Components.avatar(author, 36)}
                      <div>
                        <div style="font-size:var(--fs-sm);font-weight:600">${Security.sanitizeHTML(author?.name||'')}</div>
                        <div style="font-size:var(--fs-xs);color:var(--clr-text-muted);margin-top:2px;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical">${Security.sanitizeHTML(p.content.slice(0,100))}…</div>
                        <div style="font-size:var(--fs-xs);color:var(--clr-text-dim);margin-top:4px">❤️ ${p.likes.length} · 💬 ${p.comments.length} · ${Components.timeAgo(p.createdAt)}</div>
                      </div>
                    </div>`;
                  }).join('')}
                </div>
              </div>
            </div>

            <!-- Right: Activity + Quick Links -->
            <div style="display:flex;flex-direction:column;gap:var(--space-5)">
              <div class="card">
                <div class="card-header"><div class="card-title">🔔 Recent Activity</div></div>
                <div class="card-inner" style="padding-top:var(--space-4)">
                  <div class="activity-feed">
                    ${activities.map(a => `
                      <div class="activity-item">
                        <div class="activity-icon">${a.icon}</div>
                        <div>
                          <div class="activity-text">${a.text}</div>
                          <div class="activity-time">${a.time}</div>
                        </div>
                      </div>`).join('')}
                  </div>
                </div>
              </div>

              <div class="card">
                <div class="card-header"><div class="card-title">⚡ Quick Links</div></div>
                <div class="card-inner" style="padding-top:var(--space-4);display:flex;flex-direction:column;gap:var(--space-3)">
                  ${[
                    {icon:'📸',label:'Share an Update',path:'/feed'},
                    {icon:'💬',label:'Join Chat Channels',path:'/chat'},
                    {icon:'👥',label:'Browse Alumni Directory',path:'/members'},
                    {icon:'👤',label:'Edit My Profile',path:'/profile/' + session.userId},
                  ].map(l=>`
                    <button class="sidebar-link" onclick="Router.go('${l.path}')">
                      <span class="si">${l.icon}</span>${l.label} <span style="margin-left:auto">→</span>
                    </button>`).join('')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>`;
  }

  function mount() {
    // Animate stat counters
    setTimeout(() => {
      document.querySelectorAll('[data-count]').forEach(el => {
        const target = parseInt(el.dataset.count);
        let cur = 0;
        const step = Math.max(1, Math.floor(target / 40));
        const t = setInterval(() => {
          cur = Math.min(cur + step, target);
          el.textContent = cur.toLocaleString();
          if (cur >= target) clearInterval(t);
        }, 30);
      });
    }, 200);
  }

  return { render, mount };
})();

window.DashboardPage = DashboardPage;
