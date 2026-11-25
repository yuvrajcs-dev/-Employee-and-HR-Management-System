// ===== 1. Search dialog =====
var searchBtn = document.getElementById('search-btn');
var searchModal = document.getElementById('search-modal');
var searchInput = document.getElementById('search-input');
var searchResults = document.getElementById('search-results');
var searchClose = document.getElementById('search-close');

// show the people whose name / role / department contains the typed text
function showResults() {
  var text = searchInput.value.toLowerCase();
  var employees = getEmployees();          // from employees.js
  searchResults.innerHTML = '';            // clear old results

  var found = 0;
  for (var i = 0; i < employees.length; i++) {
    var e = employees[i];
    var allText = (e.name + ' ' + e.role + ' ' + e.dept).toLowerCase();
    if (allText.indexOf(text) !== -1) {
      var link = document.createElement('a');
      link.href = 'profile.html?id=' + e.id;
      link.textContent = e.name + ' — ' + e.role + ' · ' + e.dept;
      searchResults.appendChild(link);
      found = found + 1;
    }
  }

  if (found === 0) {
    searchResults.innerHTML = '<p class="no-result">No one found.</p>';
  }
}

function openSearch() {
  searchModal.style.display = 'flex';
  searchInput.value = '';
  showResults();
  searchInput.focus();
}

function closeSearch() {
  searchModal.style.display = 'none';
}

searchBtn.onclick = openSearch;
searchClose.onclick = closeSearch;
searchInput.oninput = showResults;

// click on the dark area (outside the white box) closes the dialog
searchModal.onclick = function (event) {
  if (event.target === searchModal) {
    closeSearch();
  }
};

// Esc key closes the dialog
document.onkeydown = function (event) {
  if (event.key === 'Escape') {
    closeSearch();
  }
};

// ===== 2. Notification box =====
var bellBtn = document.getElementById('bell-btn');
var bellDot = document.getElementById('bell-dot');
var notifBox = document.getElementById('notif-box');

bellBtn.onclick = function () {
  if (notifBox.style.display === 'block') {
    notifBox.style.display = 'none';
  } else {
    notifBox.style.display = 'block';
  }
  bellDot.style.display = 'none';   // notifications seen, hide the dot
};
