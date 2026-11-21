document.addEventListener("DOMContentLoaded", () => {
    const employeeName = new URLSearchParams(window.location.search).get("employee");
    if (employeeName) {
        const employeeValue = document.querySelector(".employee-info .info-value");
        if (employeeValue) employeeValue.textContent = employeeName;
    }

    document.querySelector(".back-link")?.addEventListener("click", (event) => {
        event.preventDefault();
        if (window.history.length > 1) window.history.back();
        else window.location.href = "../hr/payroll.html";
    });

    document.querySelector(".print-btn")?.addEventListener("click", () => window.print());
    document.querySelectorAll(".secondary-btn")[0]?.addEventListener("click", () => window.print());

    document.querySelectorAll(".secondary-btn")[1]?.addEventListener("click", () => {
        const name = document.querySelector(".employee-info .info-value")?.textContent.trim() || "Employee";
        const subject = encodeURIComponent(`Payslip for August 2026 - ${name}`);
        window.location.href = `mailto:?subject=${subject}`;
    });

    document.querySelector(".logout-btn")?.addEventListener("click", () => {
        if (window.confirm("Log out of HRM?")) {
            window.location.href = "../main-dashboard.html";
        }
    });
});
