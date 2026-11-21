document.addEventListener("DOMContentLoaded", () => {

    // Approve all
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
        showToast("All payroll records approved successfully.");
    });

    // View slip navigation
    document.querySelectorAll(".view-slip").forEach((link) => {
        link.addEventListener("click", (event) => {
            event.preventDefault();
            const employeeName = link.closest(".table-row")?.querySelector(".employee")?.textContent.trim();
            const safeName = employeeName ? encodeURIComponent(employeeName) : "";
            window.location.href = "../employee/e-payroll.html" + (safeName ? "?employee=" + safeName : "");
        });
    });

    // Logout
    document.querySelector(".logout-btn")?.addEventListener("click", () => {
        if (window.confirm("Log out of HRM?")) window.location.href = "../main-dashboard.html";
    });

    // Search / filter
    const searchInput = document.getElementById("searchInput");
    searchInput?.addEventListener("input", () => {
        const query = searchInput.value.toLowerCase();
        document.querySelectorAll(".table-row:not(.table-header)").forEach((row) => {
            const name = row.querySelector(".employee")?.textContent.toLowerCase() || "";
            const dept = row.children[1]?.textContent.toLowerCase() || "";
            row.style.display = name.includes(query) || dept.includes(query) ? "" : "none";
        });
    });

    // Month selector
    const months = ["January", "February", "March", "April", "May", "June",
                    "July", "August", "September", "October", "November", "December"];
    let currentMonth = 7; // August (0-indexed)
    let currentYear = 2026;

    const monthDisplay = document.querySelector(".month-display");
    const cycleLabel = document.querySelector(".cycle-label");

    const updateMonth = () => {
        const label = `${months[currentMonth]} ${currentYear}`;
        if (monthDisplay) monthDisplay.textContent = label;
        if (cycleLabel) cycleLabel.textContent = `${label} payroll cycle`;
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

    // Export CSV
    document.querySelector(".export-btn")?.addEventListener("click", () => {
        const rows = [["Employee", "Department", "Net Pay", "Status"]];
        document.querySelectorAll(".table-row:not(.table-header)").forEach((row) => {
            const cols = row.querySelectorAll("div");
            rows.push([
                cols[0]?.textContent.trim(),
                cols[1]?.textContent.trim(),
                cols[2]?.textContent.trim(),
                cols[3]?.textContent.trim(),
            ]);
        });
        const csv = rows.map((r) => r.join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `payroll-${months[currentMonth]}-${currentYear}.csv`;
        a.click();
        showToast("CSV exported successfully.");
    });

    // Toast helper
    function showToast(message) {
        const toast = document.createElement("div");
        toast.className = "toast";
        toast.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${message}`;
        document.body.appendChild(toast);
        requestAnimationFrame(() => toast.classList.add("toast-show"));
        setTimeout(() => {
            toast.classList.remove("toast-show");
            setTimeout(() => toast.remove(), 400);
        }, 3000);
    }
});
