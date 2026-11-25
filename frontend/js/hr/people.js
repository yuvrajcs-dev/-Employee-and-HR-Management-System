var grid = document.getElementById('people-grid');
var searchBox = document.getElementById('people-search');
var chips = document.querySelectorAll('.chip');

var employees = getEmployees();   // from employees.js
var activeDept = 'All';           // which chip is selected

// makes text safe before we put it inside HTML
function esc(text) {
  return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// draw only the people who match BOTH the chip and the search text
function showPeople() {
  var text = searchBox.value.toLowerCase();
  var html = '';

  for (var i = 0; i < employees.length; i++) {
    var e = employees[i];

    var deptOk = (activeDept === 'All' || e.dept === activeDept);
    var allText = (e.name + ' ' + e.role + ' ' + e.dept + ' ' + e.email + ' ' + (e.location || '')).toLowerCase();
    var textOk = (allText.indexOf(text) !== -1);

    if (deptOk && textOk) {
      html += '<a class="person-card" href="profile.html?id=' + encodeURIComponent(e.id) + '">';
      html += '<div class="person-avatar" style="background:' + e.color + '">' + esc(e.initials) + '</div>';
      html += '<div>';
      html += '<div class="person-name">' + esc(e.name) + '</div>';
      html += '<div class="person-role">' + esc(e.role) + ' · ' + esc(e.dept) + '</div>';
      html += '<div class="person-meta"><i class="bi bi-envelope"></i>' + esc(e.email) + '</div>';
      if (e.location) {
        html += '<div class="person-meta" style="margin-top:3px;"><i class="bi bi-geo-alt"></i>' + esc(e.location) + '</div>';
      }
      html += '</div></a>';
    }
  }

  if (html === '') {
    html = '<p style="grid-column:1/-1;color:#8B93A3;">No employees found.</p>';
  }
  grid.innerHTML = html;
}

// clicking a chip: make it active, remember its department, redraw
for (var i = 0; i < chips.length; i++) {
  chips[i].onclick = function () {
    for (var j = 0; j < chips.length; j++) {
      chips[j].classList.remove('active');
    }
    this.classList.add('active');
    activeDept = this.getAttribute('data-dept');
    showPeople();
  };
}

// every key typed in the search box redraws the list
searchBox.oninput = showPeople;

showPeople();
