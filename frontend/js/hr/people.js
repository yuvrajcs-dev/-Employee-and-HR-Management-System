const esc = s => String(s).replace(/[&<>"']/g, c => '&#' + c.charCodeAt(0) + ';');

document.getElementById('people-grid').innerHTML = getEmployees().map(e => `
  <a class="person-card" href="profile.html?id=${encodeURIComponent(e.id)}">
    <div class="person-avatar" style="background:${e.color}">${esc(e.initials)}</div>
    <div>
      <div class="person-name">${esc(e.name)}</div>
      <div class="person-role">${esc(e.role)} · ${esc(e.dept)}</div>
      <div class="person-meta"><i class="bi bi-envelope"></i>${esc(e.email)}</div>
      ${e.location ? `<div class="person-meta" style="margin-top:3px;"><i class="bi bi-geo-alt"></i>${esc(e.location)}</div>` : ''}
    </div>
  </a>`).join('');
