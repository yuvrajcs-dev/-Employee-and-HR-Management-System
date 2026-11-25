//df
const form = document.querySelector("form");

const email = document.getElementById("emp-email");
const phone = document.getElementById("emp-phone");
const bank = document.getElementById("bank-acc");

// 2. Form Validation and Save Changes
form.addEventListener("submit", function(event) {

    event.preventDefault();

    // Email Validation
    if (!email.value.includes("@") || !email.value.includes(".")) {
        alert("Please enter a valid email address.");
        email.focus();
        return;
    }

    // Phone Validation
    const phonePattern = /^[+]?[0-9\s-]{10,15}$/;

    if (!phonePattern.test(phone.value.trim())) {
        alert("Please enter a valid phone number.");
        phone.focus();
        return;
    }

    // Check Empty Fields
    if (email.value.trim() === "" ||
        phone.value.trim() === "" ||
        bank.value.trim() === "") {

        alert("Please fill all the fields.");
        return;
    }

    alert("Employee details saved successfully!");

});

// 3. Dynamic Salary Calculation
function calculateSalary() {

    const rows = document.querySelectorAll(
        ".data-table tbody tr"
    );

    let total = 0;

    rows.forEach(function(row) {

        const type = row.cells[1].innerText.trim();
        const amount = row.cells[2].innerText
            .replace(/[₹,\-]/g, "")
            .trim();

        const value = Number(amount);

        if (type === "Earnings") {
            total += value;
        }

        else if (type === "Deduction") {
            total -= value;
        }

    });

    // Update Net Payable Amount
    const lastRow = document.querySelector(
        ".data-table tbody tr:last-child"
    );

    lastRow.cells[2].innerText =
        "₹" + total.toLocaleString("en-IN");

}

// 4. Calculate Salary When Page Loads
calculateSalary();

// 5. Load Default Employee Details
window.addEventListener("load", function() {

    console.log("Employee Settings Page Loaded Successfully");

});