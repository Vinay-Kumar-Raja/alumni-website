/* =====================================================
   API — Data access layer (simulated async)
===================================================== */
'use strict';

const API = (() => {
  function delay(ms = 150) { return new Promise(r => setTimeout(r, ms)); }

  // ── Users ──
  async function getUser(id) {
    await delay(80);
    return Store.findById('users', id);
  }
  async function getUsers(filters = {}) {
    await delay(100);
    return Store.findAll('users', u => {
      if (filters.approved !== undefined && u.approved !== filters.approved) return false;
      if (filters.role && u.role !== filters.role) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || (u.department||'').toLowerCase().includes(q);
      }
      return true;
    });
  }
  async function updateUser(id, updates) {
    await delay(100);
    const sanitized = {};
    for (const [k,v] of Object.entries(updates)) {
      sanitized[k] = typeof v === 'string' ? Security.sanitizeInput(v) : v;
    }
    return Store.update('users', id, sanitized);
  }
  async function deleteUser(id) { await delay(100); Store.delete('users', id); }

  // ── Posts ──
  async function getPosts(limit = 20, offset = 0) {
    await delay(120);
    const all = [...Store.get('posts')].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
    return all.slice(offset, offset + limit);
  }
  async function createPost(authorId, content, image = null, tags = []) {
    await delay(150);
    if (!Security.validate('text', content, { max: 2000 })) throw new Error('Post content too long (max 2000 chars).');
    const post = {
      id: Store.genId('p'),
      authorId,
      content: Security.sanitizeInput(content),
      image, tags: tags.map(t => Security.sanitizeInput(t)),
      likes: [], comments: [],
      createdAt: new Date().toISOString()
    };
    Store.add('posts', post);
    return post;
  }
  async function toggleLike(postId, userId) {
    await delay(80);
    const post = Store.findById('posts', postId);
    if (!post) return null;
    const liked = post.likes.includes(userId);
    const likes = liked ? post.likes.filter(id => id !== userId) : [...post.likes, userId];
    return Store.update('posts', postId, { likes });
  }
  async function addComment(postId, authorId, text) {
    await delay(100);
    const post = Store.findById('posts', postId);
    if (!post) return null;
    if (!Security.validate('text', text, { max: 500 })) throw new Error('Comment too long.');
    const comment = { id: Store.genId('c'), authorId, text: Security.sanitizeInput(text), likes: 0, createdAt: new Date().toISOString() };
    post.comments.push(comment);
    return Store.update('posts', postId, { comments: post.comments });
  }
  async function deletePost(postId) { await delay(100); Store.delete('posts', postId); }

  // ── Events ──
  async function getEvents(filter = 'all') {
    await delay(100);
    const now = new Date();
    return Store.findAll('events', e => {
      if (filter === 'upcoming') return new Date(e.date) >= now;
      if (filter === 'past') return new Date(e.date) < now;
      return true;
    }).sort((a,b) => new Date(a.date) - new Date(b.date));
  }
  async function createEvent(data, hostId) {
    await delay(150);
    const event = { id: Store.genId('e'), ...data, host: hostId, attendees: [hostId], createdAt: new Date().toISOString(), status: 'upcoming' };
    Store.add('events', event);
    return event;
  }
  async function rsvpEvent(eventId, userId) {
    await delay(80);
    const ev = Store.findById('events', eventId);
    if (!ev) return null;
    const joined = ev.attendees.includes(userId);
    const attendees = joined ? ev.attendees.filter(id => id !== userId) : [...ev.attendees, userId];
    return Store.update('events', eventId, { attendees });
  }
  async function deleteEvent(eventId) { await delay(100); Store.delete('events', eventId); }

  // ── Chat ──
  async function getChannels(userId) {
    await delay(80);
    return Store.findAll('channels', c => c.members.includes(userId));
  }
  async function getMessages(channelId, limit = 50) {
    await delay(100);
    const msgs = Store.get('messages')[channelId] || [];
    return msgs.slice(-limit);
  }
  async function sendMessage(channelId, senderId, text) {
    await delay(80);
    if (!Security.validate('text', text, { max: 1000 })) throw new Error('Message too long.');
    const msg = { id: Store.genId('m'), senderId, text: Security.sanitizeInput(text), createdAt: new Date().toISOString(), reactions: {} };
    const msgs = Store.get('messages');
    if (!msgs[channelId]) msgs[channelId] = [];
    msgs[channelId].push(msg);
    Store.set('messages', msgs);
    return msg;
  }
  async function getDMs(userAId, userBId) {
    const key = [userAId, userBId].sort().join('_');
    const dms = Store.get('directMessages') || {};
    return dms[key] || [];
  }
  async function sendDM(userAId, userBId, senderId, text) {
    await delay(80);
    const key = [userAId, userBId].sort().join('_');
    const dms = Store.get('directMessages') || {};
    if (!dms[key]) dms[key] = [];
    const msg = { id: Store.genId('dm'), senderId, text: Security.sanitizeInput(text), createdAt: new Date().toISOString(), reactions: {} };
    dms[key].push(msg);
    Store.set('directMessages', dms);
    return msg;
  }
  async function addReaction(channelId, msgId, userId, emoji) {
    await delay(60);
    const msgs = Store.get('messages');
    const ch = msgs[channelId] || [];
    const msg = ch.find(m => m.id === msgId);
    if (!msg) return;
    if (!msg.reactions[emoji]) msg.reactions[emoji] = [];
    const idx = msg.reactions[emoji].indexOf(userId);
    if (idx >= 0) msg.reactions[emoji].splice(idx, 1);
    else msg.reactions[emoji].push(userId);
    Store.set('messages', msgs);
    return msg;
  }

  // ── Notifications ──
  async function getNotifications(userId) {
    await delay(80);
    return (Store.get('notifications')[userId] || []).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
  async function markNotifRead(userId, notifId) {
    await delay(60);
    const notifs = Store.get('notifications');
    if (!notifs[userId]) return;
    const n = notifs[userId].find(n => n.id === notifId);
    if (n) { n.read = true; Store.set('notifications', notifs); }
  }

  // ── Admin ──
  async function approveUser(userId) {
    await delay(100);
    const u = Store.update('users', userId, { approved: true });
    Store.add('auditLog', { id: Store.genId('a'), userId: Auth.getSession()?.userId, action: 'APPROVE_USER', detail: `Approved user ${userId}`, createdAt: new Date().toISOString() });
    return u;
  }
  async function setUserRole(userId, role) {
    await delay(100);
    Store.add('auditLog', { id: Store.genId('a'), userId: Auth.getSession()?.userId, action: 'ROLE_CHANGE', detail: `Changed role of ${userId} to ${role}`, createdAt: new Date().toISOString() });
    return Store.update('users', userId, { role });
  }
  async function getAuditLog(limit = 30) {
    await delay(100);
    return [...Store.get('auditLog')].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, limit);
  }
  async function getAdminStats() {
    await delay(80);
    const users = Store.get('users');
    const posts = Store.get('posts');
    const events = Store.get('events');
    return {
      totalUsers: users.length,
      approvedUsers: users.filter(u => u.approved).length,
      pendingUsers: users.filter(u => !u.approved).length,
      totalPosts: posts.length,
      totalEvents: events.length,
      adminCount: users.filter(u => u.role === 'admin').length,
      activeToday: users.filter(u => u.lastSeen && new Date(u.lastSeen) > new Date(Date.now() - 86400000)).length
    };
  }

  return {
    getUser, getUsers, updateUser, deleteUser,
    getPosts, createPost, toggleLike, addComment, deletePost,
    getEvents, createEvent, rsvpEvent, deleteEvent,
    getChannels, getMessages, sendMessage, getDMs, sendDM, addReaction,
    getNotifications, markNotifRead,
    approveUser, setUserRole, getAuditLog, getAdminStats
  };
})();
