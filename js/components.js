/* =====================================================
   COMPONENTS — Shared UI component builders
===================================================== */
'use strict';

const Components = (() => {
  // ── Toast Notifications ─────────────────────────────
  function toast(message, type = 'info', duration = 3500) {
    const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
    const container = document.getElementById('toast-container');
    const div = document.createElement('div');
    div.className = `toast ${type}`;
    div.innerHTML = `<span class="toast-icon" role="img" aria-label="${type}">${icons[type]}</span><span>${Security.sanitizeHTML(message)}</span>`;
    container.appendChild(div);
    setTimeout(() => {
      div.classList.add('toast-out');
      setTimeout(() => div.remove(), 300);
    }, duration);
  }

  // ── Modal ────────────────────────────────────────────
  function openModal(html) {
    const overlay = document.getElementById('modal-overlay');
    const box = document.getElementById('modal-box');
    box.innerHTML = html;
    overlay.classList.remove('hidden');
    overlay.onclick = (e) => { if (e.target === overlay) closeModal(); };
    document.addEventListener('keydown', escHandler);
  }
  function closeModal() {
    document.getElementById('modal-overlay').classList.add('hidden');
    document.removeEventListener('keydown', escHandler);
  }
  function escHandler(e) { if (e.key === 'Escape') closeModal(); }

  // ── Global Loader ─────────────────────────────────────
  function showLoader() { document.getElementById('global-loader').classList.remove('hidden'); }
  function hideLoader() { document.getElementById('global-loader').classList.add('hidden'); }

  // ── Avatar ───────────────────────────────────────────
  function avatar(user, size = 36) {
    const colors = ['#6366f1','#8b5cf6','#f72585','#06d6a0','#f59e0b','#3b82f6'];
    const color = colors[(user?.name?.charCodeAt(0) || 0) % colors.length];
    if (user?.avatar) {
      return `<img class="avatar" src="${user.avatar}" alt="${user.name}" width="${size}" height="${size}" style="width:${size}px;height:${size}px" />`;
    }
    return `<div class="avatar-placeholder" style="width:${size}px;height:${size}px;font-size:${Math.floor(size*0.36)}px;background:${color}" aria-label="${user?.name}">${Security.sanitizeHTML(user?.initials || '?')}</div>`;
  }

  // ── Nav ──────────────────────────────────────────────
  function renderNav() {
    const nav = document.getElementById('main-nav');
    const session = Auth.getSession();
    if (!session) { nav.classList.add('hidden'); return; }
    nav.classList.remove('hidden');

    const links = [
      { path: '/dashboard', icon: '🏠', label: 'Home' },
      { path: '/feed',      icon: '📸', label: 'Feed' },
      { path: '/chat',      icon: '💬', label: 'Chat' },
      { path: '/events',    icon: '📅', label: 'Events' },
      { path: '/members',   icon: '👥', label: 'Members' },
    ];
    if (Auth.isAdmin() || Auth.isModerator()) {
      links.push({ path: '/admin', icon: '🛡️', label: 'Admin' });
    }

    const user = Store.findById('users', session.userId);
    const unreadCount = (Store.get('notifications')[session.userId] || []).filter(n => !n.read).length;

    nav.innerHTML = `
      <div class="nav-brand" onclick="Router.go('/dashboard')">
        <div class="brand-icon">🌱</div>
        <span class="text-gradient" style="font-weight: 800; font-family: var(--font-display);">Shanti Bhavan Alumni</span>
      </div>
      <div class="nav-links">
        ${links.map(l => `
          <button class="nav-link ${Router.current() === l.path ? 'active' : ''}" onclick="Router.go('${l.path}')" aria-label="${l.label}">
            <span class="nav-icon" aria-hidden="true">${l.icon}</span>
            <span>${l.label}</span>
          </button>
        `).join('')}
      </div>
      <div class="nav-right">
        <div style="position:relative">
          <button class="nav-notification" id="notif-btn" aria-label="Notifications">
            🔔
            ${unreadCount > 0 ? `<span class="notif-dot" aria-label="${unreadCount} unread"></span>` : ''}
          </button>
        </div>
        <div style="position:relative">
          <div id="nav-avatar-btn" style="cursor:pointer;position:relative">
            ${avatar(user, 36)}
          </div>
          <div id="nav-dropdown" class="dropdown-menu hidden">
            <div style="padding:var(--space-4);border-bottom:1px solid var(--clr-border)">
              <div style="font-weight:700">${Security.sanitizeHTML(session.name)}</div>
              <div style="font-size:var(--fs-xs);color:var(--clr-text-muted)">${Security.sanitizeHTML(session.role)}</div>
            </div>
            <button class="dropdown-item" onclick="Router.go('/profile/${session.userId}');Components.closeDropdown()">👤 My Profile</button>
            <button class="dropdown-item" onclick="Router.go('/settings');Components.closeDropdown()">⚙️ Settings</button>
            <div class="dropdown-divider"></div>
            <button class="dropdown-item danger" onclick="handleLogout()">🚪 Sign Out</button>
          </div>
        </div>
      </div>
    `;

    // Dropdown toggle
    document.getElementById('nav-avatar-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      document.getElementById('nav-dropdown')?.classList.toggle('hidden');
    });
    document.getElementById('notif-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      showNotifPanel();
    });
    document.addEventListener('click', () => closeDropdown(), { once: false });
  }

  function closeDropdown() {
    document.getElementById('nav-dropdown')?.classList.add('hidden');
  }

  async function showNotifPanel() {
    const session = Auth.getSession();
    if (!session) return;
    const notifs = await API.getNotifications(session.userId);

    const panel = document.createElement('div');
    panel.id = 'notif-panel-popup';
    panel.className = 'notif-panel';
    panel.style.cssText = 'position:fixed;top:70px;right:80px;z-index:5000';
    panel.innerHTML = `
      <div class="notif-header">
        <span>Notifications</span>
        <button style="background:none;border:none;color:var(--clr-text-muted);font-size:var(--fs-xs);cursor:pointer" onclick="document.getElementById('notif-panel-popup')?.remove()">Mark all read</button>
      </div>
      ${notifs.length === 0 ? '<div style="padding:var(--space-6);text-align:center;color:var(--clr-text-dim)">No notifications</div>' :
        notifs.map(n => `
          <div class="notif-item ${n.read ? '' : 'unread'}">
            <div style="font-size:1.5rem">${n.type === 'like' ? '❤️' : n.type === 'comment' ? '💬' : '🔔'}</div>
            <div>
              <div class="notif-text">${Security.sanitizeHTML(n.text)}</div>
              <div class="notif-time">${timeAgo(n.createdAt)}</div>
            </div>
          </div>
        `).join('')}
    `;
    document.getElementById('notif-panel-popup')?.remove();
    document.body.appendChild(panel);
    setTimeout(() => document.addEventListener('click', () => panel.remove(), { once: true }), 10);
  }

  // ── Time helpers ─────────────────────────────────────
  function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = diff / 60000, h = diff / 3600000, d = diff / 86400000;
    if (diff < 60000)  return 'just now';
    if (m < 60)        return `${Math.floor(m)}m ago`;
    if (h < 24)        return `${Math.floor(h)}h ago`;
    if (d < 7)         return `${Math.floor(d)}d ago`;
    return new Date(dateStr).toLocaleDateString();
  }

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  }
  function formatTime(timeStr) { return timeStr; }

  // ── Stat Counter Animation ────────────────────────────
  function animateCounters() {
    document.querySelectorAll('[data-count]').forEach(el => {
      const target = parseInt(el.dataset.count) || 0;
      const suffix = el.dataset.suffix || '';
      let current = 0;
      const step = Math.max(1, Math.floor(target / 60));
      const timer = setInterval(() => {
        current = Math.min(current + step, target);
        el.textContent = current.toLocaleString() + suffix;
        if (current >= target) clearInterval(timer);
      }, 25);
    });
  }

  // ── Post Card ─────────────────────────────────────────
  function postCard(post, currentUserId) {
    const author = Store.findById('users', post.authorId);
    const liked = post.likes.includes(currentUserId);
    return `
      <article class="post-card" id="post-${post.id}" aria-label="Post by ${author?.name}">
        <div class="post-header">
          ${avatar(author, 40)}
          <div class="post-user-info">
            <div class="post-user-name" onclick="Router.go('/profile/${post.authorId}')" style="cursor:pointer">${Security.sanitizeHTML(author?.name || 'Unknown')}</div>
            <div class="post-meta">
              <span class="badge badge-primary">${Security.sanitizeHTML(author?.batch || '')} — ${Security.sanitizeHTML(author?.department || '')}</span>
              <span>·</span>
              <span>${timeAgo(post.createdAt)}</span>
            </div>
          </div>
          <button class="post-options" aria-label="Post options">⋯</button>
        </div>
        ${post.image ? `<img class="post-image" src="${post.image}" alt="Post image" loading="lazy" />` : ''}
        <div class="post-content">${Security.sanitizeHTML(post.content)}</div>
        ${post.tags?.length ? `<div class="post-tags">${post.tags.map(t=>`<span class="post-tag">#${Security.sanitizeHTML(t)}</span>`).join('')}</div>` : ''}
        <div class="post-stats">
          <span>${post.likes.length} likes</span>
          <span>${post.comments.length} comments</span>
        </div>
        <div class="post-actions">
          <button class="post-action-btn ${liked ? 'liked' : ''}" onclick="handleLike('${post.id}')" id="like-btn-${post.id}" aria-label="Like post" aria-pressed="${liked}">
            <span class="action-icon">${liked ? '❤️' : '🤍'}</span> Like
          </button>
          <button class="post-action-btn" onclick="toggleComments('${post.id}')" aria-label="Comment">
            <span class="action-icon">💬</span> Comment
          </button>
          <button class="post-action-btn" onclick="handleShare('${post.id}')" aria-label="Share">
            <span class="action-icon">↗️</span> Share
          </button>
        </div>
        <div class="comments-section" id="comments-${post.id}">
          ${post.comments.map(c => commentCard(c, currentUserId)).join('')}
          <div class="comment-composer">
            ${avatar(Store.findById('users', currentUserId), 32)}
            <input id="comment-input-${post.id}" type="text" placeholder="Write a comment…" 
              onkeydown="if(event.key==='Enter' && !event.shiftKey){handleComment('${post.id}');event.preventDefault();}"
              maxlength="500" aria-label="Write a comment" />
            <button class="btn btn-glass btn-sm" onclick="handleComment('${post.id}')">Post</button>
          </div>
        </div>
      </article>`;
  }

  function commentCard(comment, currentUserId) {
    const author = Store.findById('users', comment.authorId);
    return `
      <div class="comment-item">
        ${avatar(author, 32)}
        <div class="comment-body">
          <div class="comment-author">${Security.sanitizeHTML(author?.name || 'Unknown')}</div>
          <div class="comment-text">${Security.sanitizeHTML(comment.text)}</div>
          <div class="comment-actions">
            <button class="comment-action">❤️ ${comment.likes}</button>
            <span style="color:var(--clr-text-dim);font-size:var(--fs-xs)">${timeAgo(comment.createdAt)}</span>
          </div>
        </div>
      </div>`;
  }

  // ── Member Card ───────────────────────────────────────
  function memberCard(user) {
    return `
      <div class="member-card" onclick="Router.go('/profile/${user.id}')" tabindex="0" role="button" aria-label="View ${user.name}'s profile">
        ${avatar(user, 72)}
        <div class="member-card-name">${Security.sanitizeHTML(user.name)}</div>
        <div class="member-card-role">${Security.sanitizeHTML(user.batch)} · ${Security.sanitizeHTML(user.department)}</div>
        <div style="font-size:var(--fs-xs);color:var(--clr-text-dim);margin-bottom:var(--space-4)">${Security.sanitizeHTML(user.company || '')}</div>
        <div style="display:flex;gap:var(--space-2);">
          <span class="badge ${user.role === 'admin' ? 'badge-gold' : user.role === 'moderator' ? 'badge-accent' : 'badge-primary'}">${user.role}</span>
          ${user.approved ? '' : '<span class="badge badge-warning">Pending</span>'}
        </div>
      </div>`;
  }

  // ── Event Card ─────────────────────────────────────────
  function eventCard(event, currentUserId) {
    const host = Store.findById('users', event.host);
    const attending = event.attendees.includes(currentUserId);
    const spotsLeft = event.maxCapacity - event.attendees.length;
    return `
      <article class="event-card" id="event-${event.id}">
        <div class="event-card-banner">
          <span role="img" aria-label="${event.category}">${event.emoji || '📅'}</span>
          <span class="badge badge-primary" style="position:absolute;top:var(--space-3);right:var(--space-3)">${event.category}</span>
        </div>
        <div class="event-card-body">
          <div class="event-card-date">📅 ${formatDate(event.date)} · ${event.time}</div>
          <div class="event-card-title">${Security.sanitizeHTML(event.title)}</div>
          <div class="event-card-location">📍 ${Security.sanitizeHTML(event.location)}</div>
          <p style="font-size:var(--fs-sm);color:var(--clr-text-muted);margin-bottom:var(--space-4);line-height:1.5">${Security.sanitizeHTML(event.description.slice(0,120))}…</p>
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:var(--space-3)">
            <div style="font-size:var(--fs-xs);color:var(--clr-text-muted)">
              <b style="color:var(--clr-text)">${event.attendees.length}</b> attending · ${spotsLeft > 0 ? `${spotsLeft} spots left` : 'Full'}
            </div>
            <button class="btn ${attending ? 'btn-ghost' : 'btn-primary'} btn-sm" onclick="handleRSVP('${event.id}')" id="rsvp-${event.id}">
              ${attending ? '✓ Attending' : 'RSVP'}
            </button>
          </div>
        </div>
      </article>`;
  }

  // ── Confirm Dialog ─────────────────────────────────────
  function confirm(message, onYes) {
    openModal(`
      <div style="padding:var(--space-8);text-align:center">
        <div style="font-size:3rem;margin-bottom:var(--space-4)">⚠️</div>
        <h2 style="font-family:var(--font-display);margin-bottom:var(--space-4)">${Security.sanitizeHTML(message)}</h2>
        <div style="display:flex;gap:var(--space-4);justify-content:center">
          <button class="btn btn-ghost" onclick="Components.closeModal()">Cancel</button>
          <button class="btn btn-danger" onclick="(${onYes.toString()})();Components.closeModal()">Confirm</button>
        </div>
      </div>`);
  }

  // ── Spinner inline ─────────────────────────────────────
  function spinner(size = 20) {
    return `<div aria-label="Loading" style="width:${size}px;height:${size}px;border:2px solid rgba(99,102,241,0.2);border-top-color:var(--clr-primary);border-radius:50%;animation:spin 0.8s linear infinite;display:inline-block"></div>`;
  }

  // ── Empty State ───────────────────────────────────────
  function emptyState(icon, title, subtitle = '') {
    return `<div style="text-align:center;padding:var(--space-16);color:var(--clr-text-muted)">
      <div style="font-size:4rem;margin-bottom:var(--space-4)">${icon}</div>
      <div style="font-size:var(--fs-xl);font-weight:700;color:var(--clr-text);margin-bottom:var(--space-2)">${Security.sanitizeHTML(title)}</div>
      ${subtitle ? `<div style="font-size:var(--fs-sm)">${Security.sanitizeHTML(subtitle)}</div>` : ''}
    </div>`;
  }

  return { toast, openModal, closeModal, showLoader, hideLoader, avatar, renderNav, timeAgo, formatDate, formatTime, animateCounters, postCard, commentCard, memberCard, eventCard, confirm, spinner, emptyState, closeDropdown };
})();
