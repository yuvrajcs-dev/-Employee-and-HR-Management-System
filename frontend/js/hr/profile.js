const e = getEmployee(new URLSearchParams(location.search).get('id'));
const place = e.location;
const f = {
  initials: e.initials,
  name: e.name,
  roleLine: `${e.role} · ${e.dept} Department`,
  since: 'Employee since ' + (e.since || 'recently'),
  attendance: e.attendance, leave: e.leave, experience: e.experience,
  email: e.email, phone: e.phone, emergency: e.emergency,
  location: place && place + ', India',
  workLocation: place && place + ' Office',
  empId: e.empId, manager: e.manager, type: e.type,
};
document.querySelectorAll('[data-f]').forEach(el => { el.textContent = f[el.dataset.f] || '—'; });
document.title = 'HRM — ' + e.name;
// New employees have no history yet.
if (e.isNew) document.getElementById('activity').hidden = true;
