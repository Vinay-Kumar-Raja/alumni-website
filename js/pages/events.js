/* =====================================================
   EVENTS PAGE
===================================================== */
'use strict';

const EventsPage = (() => {
  let filter = 'upcoming';

  async function render() {
    const session = Auth.getSession();
    const events = await API.getEvents('upcoming');
    return `
      <div class="page-with-nav page-enter page-bg-container">
        <div class="mesh-gradient"></div>
        <div class="hero-grid-bg"></div>
        <div class="page-container" style="position:relative;z-index:1">
          <!-- Hero -->
          <div class="events-hero animate-fadeUp">
            <div style="position:relative;z-index:1">
              <div class="section-label">Community Events</div>
              <h1 style="font-family:var(--font-display);font-size:var(--fs-5xl);font-weight:800;margin-bottom:var(--space-4)">
                <span class="text-gradient">Discover. Attend. Connect.</span>
              </h1>
              <p style="color:var(--clr-text-muted);max-width:500px;margin:0 auto var(--space-6)">From grand galas to intimate workshops — find alumni events happening near you and around the world.</p>
              ${Auth.isModerator() ? `<button class="btn btn-accent" onclick="openCreateEvent()">+ Create Event</button>` : ''}
            </div>
          </div>

          <!-- Filters -->
          <div style="display:flex;gap:var(--space-3);flex-wrap:wrap;align-items:center;margin-bottom:var(--space-6)">
            ${['upcoming','past','all'].map(f=>`
              <button class="btn ${filter===f?'btn-primary':'btn-ghost'} btn-sm btn-round" onclick="filterEvents('${f}')">${f.charAt(0).toUpperCase()+f.slice(1)}</button>
            `).join('')}
            <div class="search-bar" style="flex:1;max-width:300px;margin-left:auto">
              <span class="search-icon">🔍</span>
              <input type="text" placeholder="Search events…" id="event-search" oninput="searchEvents(this.value)" aria-label="Search events" />
            </div>
          </div>

          <!-- Category chips -->
          <div style="display:flex;gap:var(--space-2);flex-wrap:wrap;margin-bottom:var(--space-6)">
            ${['All','Social','Professional','Workshop','Sports','Cultural'].map(c=>`
              <span class="chip chip-interactive ${c==='All'?'selected':''}" onclick="filterByCategory('${c}',this)">${c}</span>
            `).join('')}
          </div>

          <!-- Stats row -->
          <div class="stats-grid" style="margin-bottom:var(--space-8);grid-template-columns:repeat(4,1fr)">
            ${[
              {icon:'📅',val:events.length,label:'Upcoming Events'},
              {icon:'👥',val:events.reduce((a,e)=>a+e.attendees.length,0),label:'Total RSVPs'},
              {icon:'🌍',val:'4',label:'Cities'},
              {icon:'🎗️',val:events.filter(e=>e.attendees.includes(session.userId)).length,label:'You\'re Attending'},
            ].map(s=>`<div class="stat-card"><div class="stat-icon">${s.icon}</div><div class="stat-value">${s.val}</div><div class="stat-label">${s.label}</div></div>`).join('')}
          </div>

          <!-- Events Grid -->
          <div class="events-grid" id="events-grid">
            ${events.length ? events.map(e => Components.eventCard(e, session.userId)).join('') : Components.emptyState('📅','No events found','Check back soon or create one!')}
          </div>
        </div>
      </div>`;
  }

  async function mount() {}

  return { render, mount };
})();

window.EventsPage = EventsPage;

// ── Global event handlers ──
async function filterEvents(f) {
  const session = Auth.getSession();
  const events = await API.getEvents(f);
  const grid = document.getElementById('events-grid');
  if (grid) grid.innerHTML = events.length ? events.map(e => Components.eventCard(e, session.userId)).join('') : Components.emptyState('📅','No events found','');
  document.querySelectorAll('.events-page-filter').forEach(b => b.classList.remove('btn-primary'));
}

function searchEvents(q) {
  document.querySelectorAll('.event-card').forEach(card => {
    const title = card.querySelector('.event-card-title')?.textContent?.toLowerCase() || '';
    card.style.display = title.includes(q.toLowerCase()) ? '' : 'none';
  });
}

function filterByCategory(cat, el) {
  document.querySelectorAll('.chip-interactive').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  document.querySelectorAll('.event-card').forEach(card => {
    if (cat === 'All') { card.style.display = ''; return; }
    const badge = card.querySelector('.badge')?.textContent || '';
    card.style.display = badge === cat ? '' : 'none';
  });
}

async function handleRSVP(eventId) {
  const session = Auth.getSession();
  const btn = document.getElementById(`rsvp-${eventId}`);
  if (btn) { btn.disabled = true; btn.textContent = '…'; }
  try {
    const ev = await API.rsvpEvent(eventId, session.userId);
    const attending = ev.attendees.includes(session.userId);
    if (btn) {
      btn.className = `btn ${attending ? 'btn-ghost' : 'btn-primary'} btn-sm`;
      btn.textContent = attending ? '✓ Attending' : 'RSVP';
      btn.disabled = false;
    }
    Components.toast(attending ? 'You\'re attending! See you there! 🎉' : 'RSVP cancelled.', attending ? 'success' : 'info');
  } catch(e) { Components.toast(e.message,'error'); if(btn) { btn.disabled=false; btn.textContent='RSVP'; } }
}

function openCreateEvent() {
  Components.openModal(`
    <div style="padding:var(--space-6)">
      <h2 style="font-family:var(--font-display);font-size:var(--fs-2xl);font-weight:700;margin-bottom:var(--space-6)">Create New Event</h2>
      <div class="form-group"><label class="form-label">Event Title</label><input class="form-input" id="ev-title" placeholder="e.g., Annual Alumni Gala" maxlength="100" /></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-4)">
        <div class="form-group"><label class="form-label">Date</label><input class="form-input" id="ev-date" type="date" /></div>
        <div class="form-group"><label class="form-label">Time</label><input class="form-input" id="ev-time" type="time" defaultValue="18:00" /></div>
      </div>
      <div class="form-group"><label class="form-label">Location</label><input class="form-input" id="ev-location" placeholder="Venue or Virtual link" /></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-4)">
        <div class="form-group"><label class="form-label">Category</label>
          <select class="form-select" id="ev-cat">${['Social','Professional','Workshop','Sports','Cultural'].map(c=>`<option>${c}</option>`).join('')}</select>
        </div>
        <div class="form-group"><label class="form-label">Max Capacity</label><input class="form-input" id="ev-cap" type="number" placeholder="100" min="1" /></div>
      </div>
      <div class="form-group"><label class="form-label">Emoji</label><input class="form-input" id="ev-emoji" placeholder="🎪" maxlength="4" /></div>
      <div class="form-group"><label class="form-label">Description</label><textarea class="form-textarea" id="ev-desc" placeholder="Tell people about this event…" maxlength="1000"></textarea></div>
      <div style="display:flex;gap:var(--space-3);justify-content:flex-end">
        <button class="btn btn-ghost" onclick="Components.closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="submitCreateEvent()">Create Event</button>
      </div>
    </div>`);
}

async function submitCreateEvent() {
  const session = Auth.getSession();
  const title = document.getElementById('ev-title')?.value?.trim();
  const date = document.getElementById('ev-date')?.value;
  const time = document.getElementById('ev-time')?.value || '18:00';
  const location = document.getElementById('ev-location')?.value?.trim();
  const category = document.getElementById('ev-cat')?.value;
  const cap = parseInt(document.getElementById('ev-cap')?.value) || 100;
  const emoji = document.getElementById('ev-emoji')?.value?.trim() || '📅';
  const desc = document.getElementById('ev-desc')?.value?.trim();

  if (!title || !date || !location || !desc) { Components.toast('Please fill all required fields.','warning'); return; }

  try {
    const ev = await API.createEvent({ title, date, time, location, category, maxCapacity: cap, emoji, description: desc, status:'upcoming', endDate:date, endTime:time }, session.userId);
    Components.closeModal();
    Components.toast('Event created! 🎉','success');
    const grid = document.getElementById('events-grid');
    if (grid) grid.insertAdjacentHTML('afterbegin', Components.eventCard(ev, session.userId));
  } catch(e) { Components.toast(e.message,'error'); }
}
