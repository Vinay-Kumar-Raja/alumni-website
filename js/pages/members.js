/* =====================================================
   MEMBERS PAGE — Alumni Directory
===================================================== */
'use strict';

const MembersPage = (() => {
  async function render() {
    const users = await API.getUsers({ approved: true });
    const batches = [...new Set(users.map(u=>u.batch))].sort().reverse();
    const depts   = [...new Set(users.map(u=>u.department))].sort();

    return `
      <div class="page-with-nav page-enter page-bg-container">
        <div class="mesh-gradient"></div>
        <div class="hero-grid-bg"></div>
        <div class="page-container" style="position:relative;z-index:1">
          <div style="margin-bottom:var(--space-8)">
            <div class="section-label">Alumni Network</div>
            <h1 style="font-family:var(--font-display);font-size:var(--fs-4xl);font-weight:800;margin-bottom:var(--space-2)">
              <span class="text-gradient text-shimmer">Meet Your Alumniverse</span>
            </h1>
            <p style="color:var(--clr-text-muted)">${users.length} verified alumni from around the world.</p>
          </div>

          <div class="members-filters">
            <div class="search-bar" style="flex:1;max-width:360px">
              <span class="search-icon">🔍</span>
              <input type="text" placeholder="Search by name, company, or department…" id="member-search" oninput="searchMembers(this.value)" aria-label="Search members" />
            </div>
            <select class="form-select" id="batch-filter" onchange="filterMembers()" style="width:140px" aria-label="Filter by batch">
              <option value="">All Batches</option>
              ${batches.map(b=>`<option value="${b}">${b}</option>`).join('')}
            </select>
            <select class="form-select" id="dept-filter" onchange="filterMembers()" style="width:150px" aria-label="Filter by department">
              <option value="">All Depts</option>
              ${depts.map(d=>`<option value="${d}">${d}</option>`).join('')}
            </select>
            <select class="form-select" id="role-filter" onchange="filterMembers()" style="width:130px" aria-label="Filter by role">
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="moderator">Moderator</option>
              <option value="alumni">Alumni</option>
            </select>
          </div>

          <div class="members-grid" id="members-grid">
            ${users.map(u => Components.memberCard(u)).join('')}
          </div>
        </div>
      </div>`;
  }

  function mount() {}
  return { render, mount };
})();

window.MembersPage = MembersPage;

// ── Global member handlers ──
function searchMembers(q) {
  const query = q.toLowerCase();
  document.querySelectorAll('.member-card').forEach(card => {
    const name = card.querySelector('.member-card-name')?.textContent?.toLowerCase() || '';
    const role = card.querySelector('.member-card-role')?.textContent?.toLowerCase() || '';
    const company = card.querySelectorAll('.member-card-name + * + *')[0]?.textContent?.toLowerCase() || '';
    card.style.display = (name.includes(query) || role.includes(query) || company.includes(query)) ? '' : 'none';
  });
}

async function filterMembers() {
  const batch = document.getElementById('batch-filter')?.value || '';
  const dept  = document.getElementById('dept-filter')?.value  || '';
  const role  = document.getElementById('role-filter')?.value  || '';
  const users = await API.getUsers({ approved: true });
  const filtered = users.filter(u => {
    if (batch && u.batch !== batch)      return false;
    if (dept  && u.department !== dept)  return false;
    if (role  && u.role !== role)        return false;
    return true;
  });
  const grid = document.getElementById('members-grid');
  if (grid) grid.innerHTML = filtered.length ? filtered.map(u => Components.memberCard(u)).join('') : Components.emptyState('👥', 'No members match your filters');
}
