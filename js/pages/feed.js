/* =====================================================
   FEED PAGE (Instagram-like)
===================================================== */
'use strict';

const FeedPage = (() => {
  let posts = [];
  let currentUserId;
  const PAGE = 10;
  let offset = 0;
  let loading = false;

  async function render() {
    const session = Auth.getSession();
    currentUserId = session.userId;
    posts = await API.getPosts(PAGE, 0);
    offset = PAGE;

    const users = Store.get('users').filter(u => u.approved && u.id !== currentUserId).slice(0,5);

    const stories = Store.get('users').filter(u=>u.approved).slice(0,8).map(u=>`
      <div class="story-item" onclick="showStory('${u.id}')">
        <div class="story-ring ${Math.random() > 0.5 ? '' : 'seen'}">
          <div class="story-avatar-wrap">
            ${Components.avatar(u, 56)}
          </div>
        </div>
        <span class="story-name">${Security.sanitizeHTML(u.name.split(' ')[0])}</span>
      </div>`).join('');

    return `
      <div class="page-with-nav page-enter page-bg-container">
        <div class="mesh-gradient"></div>
        <div class="hero-grid-bg"></div>
        <div style="max-width:1020px;margin:0 auto;padding:var(--space-8) var(--space-6);position:relative;z-index:1">
          <div class="feed-layout">
            <!-- Main Feed -->
            <div>
              <!-- Stories -->
              <div class="stories-bar" role="region" aria-label="Stories">
                <div class="story-item">
                  <div class="story-ring" style="background:conic-gradient(var(--clr-primary),var(--clr-accent))">
                    <div class="story-avatar-wrap" style="font-size:1.5rem">+</div>
                  </div>
                  <span class="story-name">Your Story</span>
                </div>
                ${stories}
              </div>

              <!-- Post Composer -->
              <div class="post-composer">
                <div class="composer-row">
                  ${Components.avatar(Auth.getCurrentUser(), 40)}
                  <div class="composer-input" onclick="expandComposer()" role="button" tabindex="0" aria-label="Create post">What's on your mind?</div>
                </div>
                <div class="composer-expanded" id="composer-expanded">
                  <textarea class="form-textarea" id="post-content" placeholder="Share something with the alumni community…" rows="4" maxlength="2000" aria-label="Post content"></textarea>
                  <div class="post-image-preview" id="img-preview">
                    <img id="img-preview-img" src="" alt="Post image preview" />
                  </div>
                  <div class="composer-actions">
                    <label class="composer-action-btn" for="img-upload" style="cursor:pointer">🖼️ Photo</label>
                    <input type="file" id="img-upload" accept="image/*" class="sr-only" onchange="handleImageUpload(event)" />
                    <button class="composer-action-btn">🏷️ Tag Alumni</button>
                    <button class="composer-action-btn">😊 Feeling</button>
                    <button class="btn btn-primary btn-sm" style="margin-left:auto" id="post-submit-btn" onclick="handleCreatePost()">Post</button>
                  </div>
                </div>
              </div>

              <!-- Posts Feed -->
              <div id="posts-container">
                ${posts.map(p => Components.postCard(p, currentUserId)).join('')}
              </div>
              <div style="text-align:center;padding:var(--space-6)">
                <button class="btn btn-ghost" id="load-more-btn" onclick="loadMorePosts()">Load More</button>
              </div>
            </div>

            <!-- Right Sidebar -->
            <div class="feed-sidebar">
              <div class="card" style="padding:var(--space-5)">
                <div class="feed-sidebar-title">Suggested Alumni</div>
                ${users.map(u=>`
                  <div class="suggested-user">
                    ${Components.avatar(u, 36)}
                    <div class="suggested-user-info">
                      <div class="suggested-user-name" onclick="Router.go('/profile/${u.id}')" style="cursor:pointer">${Security.sanitizeHTML(u.name)}</div>
                      <div class="suggested-user-meta">${Security.sanitizeHTML(u.batch)} · ${Security.sanitizeHTML(u.department)}</div>
                    </div>
                    <button class="btn btn-glass btn-sm" onclick="handleFollow('${u.id}',this)">Follow</button>
                  </div>`).join('')}
              </div>
              <div class="card" style="padding:var(--space-5);margin-top:var(--space-4)">
                <div class="feed-sidebar-title">Trending Tags</div>
                <div style="display:flex;flex-wrap:wrap;gap:var(--space-2);margin-top:var(--space-3)">
                  ${['#Alumni','#CareerMilestone','#Startup','#EdTech','#Hiring','#Reunion','#Networking','#Innovation'].map(t=>`
                    <span class="chip chip-interactive">${t}</span>`).join('')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>`;
  }

  function mount() {
    // Nothing extra needed — handlers are inline
  }

  return { render, mount };
})();

window.FeedPage = FeedPage;

// ── Global feed handlers ──
function expandComposer() {
  const exp = document.getElementById('composer-expanded');
  if (exp) { exp.classList.toggle('show'); if (exp.classList.contains('show')) document.getElementById('post-content')?.focus(); }
}

function handleImageUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) { Components.toast('Only image files allowed.', 'warning'); return; }
  if (file.size > 5 * 1024 * 1024) { Components.toast('Image must be under 5MB.', 'warning'); return; }
  const reader = new FileReader();
  reader.onload = ev => {
    const preview = document.getElementById('img-preview');
    const img = document.getElementById('img-preview-img');
    if (preview && img) { img.src = ev.target.result; preview.style.display = 'block'; }
  };
  reader.readAsDataURL(file);
}

async function handleCreatePost() {
  const content = document.getElementById('post-content')?.value?.trim() || '';
  const imgEl = document.getElementById('img-preview-img');
  const img = imgEl?.src?.startsWith('data:') ? imgEl.src : null;
  const btn = document.getElementById('post-submit-btn');

  if (!content && !img) { Components.toast('Please write something to post.', 'warning'); return; }
  if (content.length > 2000) { Components.toast('Post too long (max 2000 chars).', 'warning'); return; }

  const session = Auth.getSession();
  btn.disabled = true; btn.textContent = 'Posting…';

  try {
    const tags = (content.match(/#\w+/g) || []).map(t => t.slice(1));
    const post = await API.createPost(session.userId, content, img, tags);
    const container = document.getElementById('posts-container');
    if (container) {
      container.insertAdjacentHTML('afterbegin', Components.postCard(post, session.userId));
    }
    document.getElementById('post-content').value = '';
    if (imgEl) imgEl.src = '';
    const preview = document.getElementById('img-preview');
    if (preview) preview.style.display = 'none';
    document.getElementById('composer-expanded')?.classList.remove('show');
    Components.toast('Post published! 🎉', 'success');
  } catch(e) { Components.toast(e.message, 'error'); }
  btn.disabled = false; btn.textContent = 'Post';
}

async function handleLike(postId) {
  const session = Auth.getSession();
  const post = await API.toggleLike(postId, session.userId);
  const btn = document.getElementById(`like-btn-${postId}`);
  if (btn) {
    const liked = post.likes.includes(session.userId);
    btn.className = `post-action-btn ${liked ? 'liked' : ''}`;
    btn.innerHTML = `<span class="action-icon">${liked ? '❤️' : '🤍'}</span> Like`;
    btn.setAttribute('aria-pressed', liked);
    if (liked) btn.querySelector('.action-icon').classList.add('heart-animation');
  }
  const stats = document.querySelector(`#post-${postId} .post-stats span`);
  if (stats) stats.textContent = `${post.likes.length} likes`;
}

function toggleComments(postId) {
  const section = document.getElementById(`comments-${postId}`);
  section?.classList.toggle('open');
}

async function handleComment(postId) {
  const input = document.getElementById(`comment-input-${postId}`);
  const text = input?.value?.trim() || '';
  if (!text) return;
  const session = Auth.getSession();
  try {
    const updated = await API.addComment(postId, session.userId, text);
    const section = document.getElementById(`comments-${postId}`);
    const composer = section?.querySelector('.comment-composer');
    if (composer) {
      composer.insertAdjacentHTML('beforebegin', Components.commentCard(updated.comments[updated.comments.length - 1], session.userId));
    }
    input.value = '';
    const stats = document.querySelectorAll(`#post-${postId} .post-stats span`);
    if (stats[1]) stats[1].textContent = `${updated.comments.length} comments`;
  } catch(e) { Components.toast(e.message, 'error'); }
}

async function loadMorePosts() {
  const session = Auth.getSession();
  const btn = document.getElementById('load-more-btn');
  btn.disabled = true; btn.textContent = 'Loading…';
  const more = await API.getPosts(10, FeedPage._offset || 10);
  if (more.length === 0) { btn.textContent = 'No more posts'; return; }
  FeedPage._offset = (FeedPage._offset || 10) + 10;
  const container = document.getElementById('posts-container');
  more.forEach(p => container.insertAdjacentHTML('beforeend', Components.postCard(p, session.userId)));
  btn.disabled = false; btn.textContent = 'Load More';
}

function handleFollow(userId, btn) {
  const session = Auth.getSession();
  const me = Store.findById('users', session.userId);
  const isFollowing = me.following.includes(userId);
  const newFollowing = isFollowing ? me.following.filter(id => id !== userId) : [...me.following, userId];
  Store.update('users', session.userId, { following: newFollowing });
  btn.textContent = isFollowing ? 'Follow' : 'Following';
  btn.className = isFollowing ? 'btn btn-glass btn-sm' : 'btn btn-accent btn-sm';
}

function showStory(userId) {
  const user = Store.findById('users', userId);
  Components.openModal(`
    <div style="background:var(--grad-primary);min-height:400px;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:var(--space-4);position:relative">
      <button onclick="Components.closeModal()" style="position:absolute;top:var(--space-4);right:var(--space-4);background:rgba(0,0,0,0.3);border:none;color:#fff;font-size:var(--fs-xl);cursor:pointer;border-radius:50%;width:36px;height:36px">✕</button>
      ${Components.avatar(user, 80)}
      <div style="text-align:center;color:#fff">
        <div style="font-size:var(--fs-xl);font-weight:700">${Security.sanitizeHTML(user?.name||'')}</div>
        <div style="opacity:0.8">${Security.sanitizeHTML(user?.bio||'No story yet')}</div>
      </div>
    </div>`);
}

function handleShare(postId) {
  Components.toast('Link copied to clipboard! 🔗', 'success');
}
