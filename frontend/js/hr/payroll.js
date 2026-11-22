document.addEventListener("DOMContentLoaded", () => {

    // Pending count helper
    const pendingCount = document.querySelector(".pending-count");

    function countPending() {
        return document.querySelectorAll(".status.processing, .status.pending").length;
    }

    function updatePendingCount() {
        const n = countPending();
        if (pendingCount) pendingCount.textContent = n === 0 ? "All records settled" : `${n} record${n > 1 ? "s" : ""} pending`;
    }

    // Approve a single row
    function approveRow(row) {
        const statusEl = row.querySelector(".status.processing, .status.pending");
        if (!statusEl) return;
        statusEl.className = "status paid";
        statusEl.textContent = "Paid";
        const actionsEl = row.querySelector(".row-actions");
        if (actionsEl) {
            actionsEl.innerHTML = '<a href="#" class="view-slip">View slip</a>';
            // re-bind view-slip for this new link
            actionsEl.querySelector(".view-slip").addEventListener("click", (e) => {
                e.preventDefault();
                const name = row.querySelector(".employee")?.textContent.trim();
                window.location.href = "../employee/e-payroll.html" + (name ? "?employee=" + encodeURIComponent(name) : "");
            });
        }
        updatePendingCount();
    }

    // Reject a single row
    function rejectRow(row) {
        const name = row.querySelector(".employee")?.textContent.trim() || "this employee";
        if (!window.confirm(`Reject payroll for ${name}?`)) return;
        const statusEl = row.querySelector(".status.processing, .status.pending");
        if (statusEl) {
            statusEl.className = "status rejected";
            statusEl.textContent = "Rejected";
        }
        const actionsEl = row.querySelector(".row-actions");
        if (actionsEl) actionsEl.innerHTML = "";
        updatePendingCount();
        showToast(`Payroll rejected for ${name}.`, "error");
    }

    // Individual row button clicks (delegated)
    document.querySelector(".records-card")?.addEventListener("click", (e) => {
        const row = e.target.closest(".table-row");
        if (!row) return;
        if (e.target.classList.contains("approve-row-btn")) approveRow(row);
        if (e.target.classList.contains("reject-row-btn")) rejectRow(row);
    });

    // Approve all
    const approveButton = document.querySelector(".approve-btn");

    approveButton?.addEventListener("click", () => {
        const pending = document.querySelectorAll(".status.processing, .status.pending");
        if (pending.length === 0) { showToast("No pending records to approve."); return; }
        pending.forEach((statusEl) => {
            const row = statusEl.closest(".table-row");
            if (row) approveRow(row);
        });
        approveButton.innerHTML = '<i class="fa-solid fa-circle-check"></i><span>Approved</span>';
        approveButton.disabled = true;
        showToast("All pending payroll records approved.");
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
    function showToast(message, type = "success") {
        const toast = document.createElement("div");
        toast.className = "toast";
        const icon = type === "error" ? "fa-circle-xmark" : "fa-circle-check";
        toast.innerHTML = `<i class="fa-solid ${icon}"></i> ${message}`;
        document.body.appendChild(toast);
        requestAnimationFrame(() => toast.classList.add("toast-show"));
        setTimeout(() => {
            toast.classList.remove("toast-show");
            setTimeout(() => toast.remove(), 400);
        }, 3000);
    }

    updatePendingCount();
});
