//df
// 1. Get Password Reset Form
const passwordForm = document.querySelectorAll("form")[0];

const employee = document.getElementById("emp-select");
const password = document.getElementById("new-pass");
const forceChange = document.getElementById("force-change");

// 2. Get Audit Log Table
const auditTable = document.querySelectorAll(".data-table")[1]
    .querySelector("tbody");

// 3. Add New Audit Log
function addAuditLog(action, target) {

    const newRow = document.createElement("tr");

    const currentDate = new Date();

    newRow.innerHTML = `
        <td>${action}</td>
        <td>${target}</td>
        <td>${currentDate.toLocaleDateString("en-IN")} ${
            currentDate.toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit"
            })
        }</td>
    `;

    auditTable.prepend(newRow);

}

// 4. Password Reset Validation
passwordForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const empID = employee.value;
    const pass = password.value;

    // Password Pattern
    const passwordPattern =
        /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;

    if (empID === "") {
        alert("Please select an employee.");
        employee.focus();
        return;
    }

    if (!passwordPattern.test(pass)) {
        alert(
            "Password must contain at least 8 characters, " +
            "one letter, one number and one special character."
        );

        password.focus();
        return;
    }

    // Get Employee Name
    const empName = employee.options[employee.selectedIndex].text;

    alert(
        "Password reset successfully for " + empName +
        "\nForce password change: " +
        (forceChange.checked ? "Enabled" : "Disabled")
    );

    // Add Audit Log
    addAuditLog("Password Reset", empID);

    // Reset Form
    passwordForm.reset();

});

// 5. Get Policy Controls
const policyForm = document.querySelectorAll("form")[1];

const policyCheckboxes =
    policyForm.querySelectorAll('input[type="checkbox"]');

// 6. Save Policy Settings
policyForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const sickLeave = policyCheckboxes[0].checked;
    const overtime = policyCheckboxes[1].checked;

    // Save Settings in Local Storage
    localStorage.setItem("sickLeave", sickLeave);
    localStorage.setItem("overtime", overtime);

    alert("HR Policy Settings Saved Successfully!");

    // Add Audit Log
    addAuditLog("Policy Settings Updated", "All Employees");

});

// 7. Load Previously Saved Policies
window.addEventListener("load", function() {

    const savedSickLeave = localStorage.getItem("sickLeave");
    const savedOvertime = localStorage.getItem("overtime");

    if (savedSickLeave !== null) {
        policyCheckboxes[0].checked =
            savedSickLeave === "true";
    }

    if (savedOvertime !== null) {
        policyCheckboxes[1].checked =
            savedOvertime === "true";
    }

});

// 8. Get Holiday Table
const holidayTable = document.querySelectorAll(".data-table")[0]
    .querySelector("tbody");

// 9. Update Holiday Overview
function updateHolidayStats() {

    const rows = holidayTable.querySelectorAll("tr");

    let officialHolidays = 0;
    let workingHolidays = 0;

    rows.forEach(function(row) {

        const status = row.cells[2].innerText.trim();

        if (status === "Official Holiday") {
            officialHolidays++;
        }

        else if (status === "Worked Day") {
            workingHolidays++;
        }

    });

    const stats = document.querySelectorAll(".card")[0]
        .querySelectorAll("h2");

    stats[1].innerText = officialHolidays + " Days";
    stats[2].innerText = workingHolidays + " Days";

}

// 10. Change Holiday Status
holidayTable.addEventListener("click", function(event) {

    const badge = event.target.closest(".badge");

    if (!badge || badge.parentElement.cellIndex !== 2) {
        return;
    }

    const row = badge.closest("tr");

    if (badge.innerText === "Official Holiday") {

        badge.innerText = "Worked Day";
        badge.className = "badge badge-warning";

        row.cells[3].innerText = "To Be Assigned";

    }

    else {

        badge.innerText = "Official Holiday";
        badge.className = "badge badge-success";

        row.cells[3].innerText = "N/A";

    }

    // Update Overview
    updateHolidayStats();

    // Add Audit Log
    addAuditLog(
        "Holiday Status Updated",
        row.cells[0].innerText
    );

});

// 11. Initial Page Load
updateHolidayStats();

console.log("Trellis HR Settings Loaded Successfully");