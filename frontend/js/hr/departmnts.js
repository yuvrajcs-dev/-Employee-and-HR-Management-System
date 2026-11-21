//df

// 1. Get Form Elements
const form = document.querySelector("#add-dept-form form");

const deptName = document.getElementById("dept-name");
const deptCode = document.getElementById("dept-code");
const deptHead = document.getElementById("dept-head");
const budget = document.getElementById("initial-budget");
const headcount = document.getElementById("approved-headcount");

// 2. Get Department Table
const deptTable = document.querySelectorAll(".data-table")[0].querySelector("tbody");

// 3. Get Overview Cards
const overviewCards = document.querySelectorAll(".card")[0].querySelectorAll("h2");

// 4. Update Overview Information
function updateOverview() {

    const rows = deptTable.querySelectorAll("tr");

    let totalDepartments = rows.length;
    let totalHeadcount = 0;

    rows.forEach(function(row) {

        const countText = row.cells[2].innerText;
        const numbers = countText.match(/\d+/g);

        if (numbers) {
            totalHeadcount += Number(numbers[1]);
        }

    });

    overviewCards[0].innerText = totalDepartments + " Active";
    overviewCards[1].innerText = totalHeadcount + " Positions";
}

// 5. Add New Department
form.addEventListener("submit", function(event) {

    event.preventDefault();

    const name = deptName.value.trim();
    const code = deptCode.value.trim().toUpperCase();
    const manager = deptHead.value;
    const deptBudget = Number(budget.value);
    const maxStaff = Number(headcount.value);

    // Validate Department Code
    const codePattern = /^[A-Z]{2,5}-\d{2}$/;

    if (!codePattern.test(code)) {
        alert("Enter a valid department code (e.g. QA-04).");
        deptCode.focus();
        return;
    }

    // Prevent Duplicate Department Code
    const existingRows = deptTable.querySelectorAll("tr");

    for (let row of existingRows) {

        if (row.cells[0].innerText.trim().toUpperCase() === name.toUpperCase() ||
            row.cells[0].innerText.trim().toUpperCase() === code) {

            alert("Department already exists!");
            return;
        }

    }

    // Validate Budget
    if (deptBudget < 100000 || !Number.isFinite(deptBudget)) {
        alert("Budget must be at least ₹1,00,000.");
        budget.focus();
        return;
    }

    // Validate Headcount
    if (maxStaff < 1 || !Number.isInteger(maxStaff)) {
        alert("Enter a valid headcount.");
        headcount.focus();
        return;
    }

    // Create New Table Row
    const newRow = document.createElement("tr");

    newRow.innerHTML = `
        <td><strong>${name}</strong></td>
        <td>${manager}</td>
        <td>
            <span class="badge badge-warning">
                0 / ${maxStaff} Staff
            </span>
        </td>
        <td>₹${deptBudget.toLocaleString("en-IN")}</td>
        <td>
            <span class="badge badge-warning">
                Pending Review
            </span>
        </td>
    `;

    // Add Department to Table
    deptTable.appendChild(newRow);

    // Update Overview
    updateOverview();

    alert("Department created successfully!");

    // Reset Form
    form.reset();

});

// 6. Manage Department Buttons
const manageButtons = document.querySelectorAll(".data-table")[1]
    .querySelectorAll("button");

manageButtons.forEach(function(button) {

    button.addEventListener("click", function() {

        const row = button.closest("tr");

        const code = row.cells[0].innerText;
        const location = row.cells[1].innerText;
        const status = row.cells[2].innerText;

        alert(
            "Department Details\n\n" +
            "Code: " + code + "\n" +
            "Location: " + location + "\n" +
            "Hiring Status: " + status
        );

    });

});

// 7. Dynamic HR Approval Status
deptTable.addEventListener("click", function(event) {

    const selectedBadge = event.target.closest(".badge");

    if (!selectedBadge || selectedBadge.parentElement.cellIndex !== 4) {
        return;
    }

    if (selectedBadge.innerText === "Approved") {

        selectedBadge.innerText = "Pending Review";
        selectedBadge.className = "badge badge-warning";

    }

    else {

        selectedBadge.innerText = "Approved";
        selectedBadge.className = "badge badge-success";

    }

});

// 8. Run When Page Loads
updateOverview();

console.log("Trellis Department Management Loaded Successfully");
