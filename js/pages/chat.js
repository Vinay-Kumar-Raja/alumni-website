/* =====================================================
   CHAT PAGE — Real-time group channels + DMs
===================================================== */
'use strict';

const ChatPage = (() => {
  let activeChannel = 'ch001';
  let isDM = false;
  let dmTarget = null;
  let pollingTimer = null;
  let lastMsgCount = 0;

  async function render() {
    const session = Auth.getSession();
    const channels = await API.getChannels(session.userId);
    const users = Store.get('users').filter(u => u.approved && u.id !== session.userId);

    return `
      <div class="page-with-nav" style="height:100vh;overflow:hidden">
        <div class="chat-layout" style="height:calc(100vh - var(--nav-h))">
          <!-- Sidebar -->
          <aside class="chat-sidebar">
            <div class="chat-sidebar-header">
              <div class="search-bar">
                <span class="search-icon">🔍</span>
                <input type="text" placeholder="Search chats…" id="chat-search" oninput="filterChatList(this.value)" aria-label="Search chats" />
              </div>
            </div>
            <div class="chat-list" id="chat-list">
              <div style="padding:var(--space-3) var(--space-4);font-size:var(--fs-xs);font-weight:700;color:var(--clr-text-dim);letter-spacing:0.08em;text-transform:uppercase">Channels</div>
              ${channels.map(ch => chatListItem(ch, session.userId, false)).join('')}

              <div style="padding:var(--space-3) var(--space-4);font-size:var(--fs-xs);font-weight:700;color:var(--clr-text-dim);letter-spacing:0.08em;text-transform:uppercase;margin-top:var(--space-4)">Direct Messages</div>
              ${users.map(u => chatListItem(u, session.userId, true)).join('')}
            </div>
          </aside>

          <!-- Main chat window -->
          <div class="chat-main" id="chat-main">
            ${await chatWindow(activeChannel, false, session.userId)}
          </div>
        </div>
      </div>`;
  }

  function chatListItem(item, myId, isDM) {
    const isChannel = !isDM;
    const name = isDM ? item.name : item.name;
    const icon = isDM ? null : item.icon;
    const msgs = isDM
      ? (Store.get('directMessages')[[myId, item.id].sort().join('_')] || [])
      : (Store.get('messages')[item.id] || []);
    const last = msgs[msgs.length - 1];
    const preview = last ? Security.sanitizeHTML(last.text.slice(0,35) + (last.text.length > 35 ? '…' : '')) : 'No messages yet';
    const id = isDM ? item.id : item.id;
    const active = !isDM && activeChannel === id && !ChatPage._isDM;

    return `
      <div class="chat-list-item ${active ? 'active' : ''}" 
           onclick="switchChat('${id}', ${isDM})" 
           data-chat-id="${id}" data-is-dm="${isDM}"
           role="button" tabindex="0"
           aria-label="Chat with ${Security.sanitizeHTML(name)}">
        <div style="position:relative">
          ${isDM ? Components.avatar(item, 40) : `<div class="avatar-placeholder" style="width:40px;height:40px;font-size:1.2rem">${icon}</div>`}
          ${isDM ? `<div class="chat-online-dot" title="Online"></div>` : ''}
        </div>
        <div class="chat-list-info">
          <div class="chat-list-name">${Security.sanitizeHTML(name)}</div>
          <div class="chat-list-preview">${preview}</div>
        </div>
        <div class="chat-list-meta">
          ${last ? `<div class="chat-list-time">${Components.timeAgo(last.createdAt)}</div>` : ''}
        </div>
      </div>`;
  }

  async function chatWindow(id, isDM, myId) {
    let messages, headerUser, headerName, headerStatus;
    if (isDM) {
      const target = Store.findById('users', id);
      messages = await API.getDMs(myId, id);
      headerUser = target;
      headerName = target?.name || 'Unknown';
      headerStatus = '● Online';
    } else {
      const ch = Store.findAll('channels', c => c.id === id)[0];
      messages = await API.getMessages(id, 60);
      headerName = `${ch?.icon || '💬'} ${ch?.name || id}`;
      headerStatus = `${ch?.members?.length || 0} members`;
    }

    const grouped = groupMessages(messages);

    return `
      <div class="chat-header">
        ${isDM && headerUser ? Components.avatar(headerUser, 40) : `<div style="font-size:1.8rem">${Store.findAll('channels',c=>c.id===id)[0]?.icon||'💬'}</div>`}
        <div class="chat-header-info">
          <div class="chat-header-name">${Security.sanitizeHTML(headerName)}</div>
          <div class="chat-header-status">${headerStatus}</div>
        </div>
        <div class="chat-header-actions">
          <button class="chat-action-btn" title="Search messages" aria-label="Search messages">🔍</button>
          ${!isDM ? '<button class="chat-action-btn" title="Members" aria-label="Members">👥</button>' : ''}
          <button class="chat-action-btn" title="More options" aria-label="More options">⋯</button>
        </div>
      </div>

      <div class="chat-messages" id="chat-messages" role="log" aria-live="polite" aria-label="Chat messages">
        ${grouped.map(g => g.divider
          ? `<div class="chat-date-divider" role="separator">${g.date}</div>`
          : messageBubble(g, myId)).join('')}
        ${messages.length === 0 ? `<div style="text-align:center;color:var(--clr-text-dim);padding:var(--space-8)">No messages yet. Say hello! 👋</div>` : ''}
      </div>

      <div class="chat-input-area">
        <div class="chat-input-wrap">
          <div class="chat-toolbar">
            <button class="chat-tool-btn" onclick="insertEmoji()" title="Emoji" aria-label="Emoji">😊</button>
            <button class="chat-tool-btn" title="Attachment" aria-label="Attach file">📎</button>
          </div>
          <textarea class="chat-input" id="chat-input" 
            placeholder="Message ${Security.sanitizeHTML(headerName)}…" 
            maxlength="1000" rows="1" aria-label="Type a message"
            onkeydown="handleChatKeydown(event, '${id}', ${isDM})"
            oninput="autoResizeChatInput(this)"></textarea>
        </div>
        <button class="btn btn-primary btn-icon btn-round" onclick="sendChatMessage('${id}', ${isDM})" aria-label="Send message" style="width:44px;height:44px;flex-shrink:0">➤</button>
      </div>`;
  }

  function groupMessages(messages) {
    const groups = [];
    let lastDate = '';
    messages.forEach(m => {
      const d = new Date(m.createdAt).toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'});
      if (d !== lastDate) { groups.push({ divider: true, date: d }); lastDate = d; }
      groups.push(m);
    });
    return groups;
  }

  function messageBubble(msg, myId) {
    if (msg.divider) return '';
    const sender = Store.findById('users', msg.senderId);
    const own = msg.senderId === myId;
    const reactions = Object.entries(msg.reactions || {})
      .filter(([,users]) => users.length > 0)
      .map(([emoji, users]) => `<span class="message-reaction" onclick="addReactionToMsg('${activeChannel}','${msg.id}','${emoji}')" title="${users.length} reaction(s)">${emoji} ${users.length}</span>`)
      .join('');

    return `
      <div class="message-group ${own ? 'own' : ''}" id="msg-${msg.id}">
        ${!own ? Components.avatar(sender, 32) : ''}
        <div>
          ${!own ? `<div style="font-size:var(--fs-xs);color:var(--clr-text-muted);margin-bottom:4px;margin-left:4px">${Security.sanitizeHTML(sender?.name||'')}</div>` : ''}
          <div class="message-bubble ${own ? 'own' : 'other'}">${Security.sanitizeHTML(msg.text)}</div>
          ${reactions ? `<div class="message-reactions">${reactions}</div>` : ''}
          <div class="message-time" style="${own ? 'text-align:right' : ''}">
            ${Components.timeAgo(msg.createdAt)}
            ${own ? ' ✓✓' : ''}
          </div>
        </div>
        ${own ? Components.avatar(Store.findById('users', myId), 32) : ''}
      </div>`;
  }

  function mount() {
    scrollToBottom();
    startPolling();
  }

  function scrollToBottom() {
    const el = document.getElementById('chat-messages');
    if (el) el.scrollTop = el.scrollHeight;
  }

  function startPolling() {
    stopPolling();
    pollingTimer = setInterval(async () => {
      const session = Auth.getSession();
      if (!session) { stopPolling(); return; }
      if (isDM) return;
      const msgs = await API.getMessages(activeChannel, 60);
      if (msgs.length !== lastMsgCount) {
        lastMsgCount = msgs.length;
        const container = document.getElementById('chat-messages');
        if (!container) { stopPolling(); return; }
        const myId = session.userId;
        const grouped = groupMessages(msgs);
        container.innerHTML = grouped.map(g => g.divider ? `<div class="chat-date-divider">${g.date}</div>` : messageBubble(g, myId)).join('');
        scrollToBottom();
      }
    }, 2000);
  }

  function stopPolling() { if (pollingTimer) { clearInterval(pollingTimer); pollingTimer = null; } }

  return { render, mount, chatWindow, stopPolling, _stop: stopPolling, get _isDM() { return isDM; } };
})();

window.ChatPage = ChatPage;

// ── Global chat handlers ──
async function switchChat(id, isDMFlag) {
  const session = Auth.getSession();
  ChatPage.stopPolling?.();

  // Update sidebar highlight
  document.querySelectorAll('.chat-list-item').forEach(el => el.classList.remove('active'));
  document.querySelector(`[data-chat-id="${id}"]`)?.classList.add('active');

  // Re-render main area
  const main = document.getElementById('chat-main');
  if (main) {
    main.innerHTML = Components.spinner(40);
    main.innerHTML = await ChatPage.chatWindow(id, isDMFlag, session.userId);
    scrollChatToBottom();
    ChatPage.mount?.();
  }
}

function scrollChatToBottom() {
  const el = document.getElementById('chat-messages');
  if (el) el.scrollTop = el.scrollHeight;
}

function handleChatKeydown(e, id, isDM) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendChatMessage(id, isDM);
  }
}

function autoResizeChatInput(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 120) + 'px';
}

async function sendChatMessage(channelId, isDM) {
  const input = document.getElementById('chat-input');
  const text = input?.value?.trim() || '';
  if (!text) return;

  const session = Auth.getSession();
  input.value = '';
  input.style.height = 'auto';

  try {
    let msg;
    if (isDM) {
      const targetId = channelId;
      msg = await API.sendDM(session.userId, targetId, session.userId, text);
    } else {
      msg = await API.sendMessage(channelId, session.userId, text);
    }
    const container = document.getElementById('chat-messages');
    if (container) {
      const myUser = Store.findById('users', session.userId);
      container.insertAdjacentHTML('beforeend', `
        <div class="message-group own" id="msg-${msg.id}">
          <div>
            <div class="message-bubble own">${Security.sanitizeHTML(msg.text)}</div>
            <div class="message-time" style="text-align:right">${Components.timeAgo(msg.createdAt)} ✓✓</div>
          </div>
          ${Components.avatar(myUser, 32)}
        </div>`);
      scrollChatToBottom();
    }
  } catch(e) { Components.toast(e.message, 'error'); }
}

async function addReactionToMsg(channelId, msgId, emoji) {
  const session = Auth.getSession();
  await API.addReaction(channelId, msgId, session.userId, emoji);
  Components.toast(`${emoji} reaction added!`, 'info', 1500);
}

function insertEmoji() {
  const emojis = ['😊','🎉','👍','❤️','🚀','🔥','💯','🌟'];
  const emoji = emojis[Math.floor(Math.random() * emojis.length)];
  const input = document.getElementById('chat-input');
  if (input) { input.value += emoji; input.focus(); }
}

function filterChatList(query) {
  document.querySelectorAll('.chat-list-item').forEach(el => {
    const name = el.querySelector('.chat-list-name')?.textContent?.toLowerCase() || '';
    el.style.display = name.includes(query.toLowerCase()) ? '' : 'none';
  });
}
