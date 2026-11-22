document.getElementById('save-btn').addEventListener('click', ev => {
  ev.preventDefault();
  const $ = id => document.getElementById(id);
  $('f-name').value = $('f-name').value.trim();
  $('f-title').value = $('f-title').value.trim();
  // Native validation (required + email format); shows the browser's own message.
  if (![$('f-name'), $('f-title'), $('f-email')].every(el => el.reportValidity())) return;

  const list = loadStored();
  list.push({
    id: 'e' + Date.now(),
    name: $('f-name').value,
    role: $('f-title').value,
    dept: $('f-dept').value,
    type: $('f-type').value,
    manager: $('f-manager').value,
    phone: $('f-phone').value.trim(),
    since: $('f-join').value.trim(),
    ...($('f-email').value.trim() && { email: $('f-email').value.trim() }),
    empId: 'TRL-' + (1051 + list.length),
    color: COLORS[(SEED.length + list.length) % COLORS.length],
    isNew: true,
  });
  saveStored(list);
  location.href = 'people.html';
});
