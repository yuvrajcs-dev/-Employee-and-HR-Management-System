document.addEventListener("DOMContentLoaded", () => {
    const approveButton = document.querySelector(".approve-btn");
    const pendingCount = document.querySelector(".pending-count");

    approveButton?.addEventListener("click", () => {
        document.querySelectorAll(".status.processing, .status.pending").forEach((status) => {
            status.className = "status paid";
            status.textContent = "Paid";
        });

        document.querySelectorAll(".pending-text").forEach((label) => {
            label.textContent = "Approved";
            label.classList.add("approved");
        });

        if (pendingCount) pendingCount.textContent = "0 records pending";
        approveButton.innerHTML = '<i class="fa-solid fa-circle-check"></i><span>Approved</span>';
        approveButton.disabled = true;
    });

    document.querySelectorAll(".view-slip").forEach((link) => {
        link.addEventListener("click", (event) => {
            event.preventDefault();
            const employeeName = link.closest(".table-row")?.querySelector(".employee")?.textContent.trim();
            const target = new URL("../employee/e-payroll.html", window.location.href);
            if (employeeName) target.searchParams.set("employee", employeeName);
            window.location.href = target.href;
        });
    });

    document.querySelector(".logout-btn")?.addEventListener("click", () => {
        if (window.confirm("Log out of HRM?")) {
            window.location.href = "../main-dashboard.html";
        }
    });
});
