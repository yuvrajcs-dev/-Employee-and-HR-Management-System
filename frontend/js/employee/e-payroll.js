document.addEventListener("DOMContentLoaded", () => {

    // Load employee name from URL
    const rawName = new URLSearchParams(window.location.search).get("employee");
    if (rawName) {
        const safeName = rawName.replace(/[<>"'&]/g, "");
        const employeeValue = document.querySelector(".employee-info .info-value");
        if (employeeValue) employeeValue.textContent = safeName;
    }

    // Back button
    document.querySelector(".back-link")?.addEventListener("click", (event) => {
        event.preventDefault();
        if (window.history.length > 1) window.history.back();
        else window.location.href = "../hr/payroll.html";
    });

    // Print
    document.querySelector(".print-btn")?.addEventListener("click", () => window.print());
    document.querySelectorAll(".secondary-btn")[0]?.addEventListener("click", () => window.print());

    // Email payslip
    document.querySelectorAll(".secondary-btn")[1]?.addEventListener("click", () => {
        const name = document.querySelector(".employee-info .info-value")?.textContent.trim() || "Employee";
        const monthLabel = document.querySelector(".month-display")?.textContent || "August 2026";
        const subject = encodeURIComponent(`Payslip for ${monthLabel} - ${name}`);
        window.location.href = `mailto:?subject=${subject}`;
    });

    // Logout
    document.querySelector(".logout-btn")?.addEventListener("click", () => {
        if (window.confirm("Log out of HRM?")) window.location.href = "../../index.html";
    });

    // Month selector
    const months = ["January", "February", "March", "April", "May", "June",
                    "July", "August", "September", "October", "November", "December"];
    let currentMonth = 7;
    let currentYear = 2026;

    const monthDisplay = document.querySelector(".month-display");
    const netPayTitle = document.querySelector(".net-pay-title");

    const updateMonth = () => {
        const label = `${months[currentMonth]} ${currentYear}`;
        if (monthDisplay) monthDisplay.textContent = label;
        if (netPayTitle) netPayTitle.textContent = `Net pay for ${label}`;
        animateNetPay();
    };

    document.getElementById("prevMonth")?.addEventListener("click", () => {
        currentMonth--;
        if (currentMonth < 0) { currentMonth = 11; currentYear--; }
        updateMonth();
    });

    document.getElementById("nextMonth")?.addEventListener("click", () => {
        currentMonth++;
        if (currentMonth > 11) { currentMonth = 0; currentYear++; }
        updateMonth();
    });

    // Animate net pay on load
    function animateNetPay() {
        const netPayEl = document.querySelector(".net-pay-amount");
        if (!netPayEl) return;
        const target = 92400;
        const duration = 900;
        const step = target / (duration / 16);
        let current = 0;
        const timer = setInterval(() => {
            current = Math.min(current + step, target);
            netPayEl.textContent = "₹" + Math.floor(current).toLocaleString("en-IN");
            if (current >= target) clearInterval(timer);
        }, 16);
    }

    animateNetPay();
});
