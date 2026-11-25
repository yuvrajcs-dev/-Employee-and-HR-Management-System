let currentRole = 'hr';

function selectRole(role){
    currentRole = role;

    document.getElementById("role-hr").classList.toggle("active", role === 'hr');
    document.getElementById("role-employee").classList.toggle("active", role === 'employee');

    document.getElementById('role-label').textContent =
        role === 'hr' ? 'HR Manager' : 'Employee';

    document.getElementById('login-email').value =
        role === 'hr'
            ? 'ananya.verma@hrm.co'
            : 'rahul.sharma@hrm.co';
}

function doLogin(){
    window.location.href = currentRole === 'hr'
        ? 'hr/dashboard.html'
        : 'employee/portal.html';
}