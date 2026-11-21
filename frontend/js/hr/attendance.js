/**
 * Trellis Workforce OS — Interactive Attendance Module
 * Handles calendar inspection, employee attendance logs, check-ins, check-outs, and exports.
 */

document.addEventListener("DOMContentLoaded", () => {
    // --- State & DOM References ---
    const detailContainer = document.querySelector(".cal-detail");
    const chips = Array.from(document.querySelectorAll(".chip"));
    const tableBody = document.getElementById("attendance-table-body");
    const searchInput = document.getElementById("table-search-input");
    const filterPills = Array.from(document.querySelectorAll("#attendance-filter-pills .filter-pill"));
    const liveCountBadge = document.getElementById("live-count-badge");
    const monthTitle = document.getElementById("month-title");
    const currentMonthDisplay = document.getElementById("current-month-display");
    const prevMonthBtn = document.getElementById("prev-month-btn");
    const nextMonthBtn = document.getElementById("next-month-btn");
    const quickCheckinBtn = document.getElementById("btn-quick-checkin");
    const checkinModal = document.getElementById("checkin-modal");
    const modalCloseBtn = document.getElementById("modal-close-btn");
    const modalCancelBtn = document.getElementById("modal-cancel-btn");
    const checkinForm = document.getElementById("checkin-form");
    const exportBtn = document.getElementById("export-btn");
    const toastContainer = document.getElementById("toast-container");

    // Month Data Configuration for interactive browsing
    const monthsData = {
        "2026-08": {
            name: "August 2026",
            startDayOffset: 5, // Sat Aug 1, 2026
            totalDays: 31,
            overallRate: "93.1%",
            avgCheckin: "9:12 AM",
            lateCount: 11,
            absentCount: 5
        },
        "2026-09": {
            name: "September 2026",
            startDayOffset: 1, // Tue Sep 1, 2026 (Mon=0, Tue=1)
            totalDays: 30,
            overallRate: "92.4%",
            avgCheckin: "9:14 AM",
            lateCount: 14,
            absentCount: 6
        },
        "2026-10": {
            name: "October 2026",
            startDayOffset: 3, // Thu Oct 1, 2026
            totalDays: 31,
            overallRate: "94.0%",
            avgCheckin: "9:09 AM",
            lateCount: 8,
            absentCount: 4
        }
    };

    const monthKeys = ["2026-08", "2026-09", "2026-10"];
    let currentMonthIndex = 1; // "2026-09"
    let individualMode = false;
    let selectedDayNumber = null;
    let activeStatusFilter = "all";
    let searchQuery = "";

    // Simulated employee individual records
    const employeeProfiles = {
        "Rahul Sharma": { dept: "IT", presentDays: 20, lateDays: 1, absentDays: 0, rate: "95.2%", avgCheckin: "09:04 AM" },
        "Priya Nair": { dept: "IT", presentDays: 17, lateDays: 3, absentDays: 1, rate: "85.7%", avgCheckin: "09:38 AM" },
        "Sana Iqbal": { dept: "Marketing", presentDays: 21, lateDays: 0, absentDays: 0, rate: "100%", avgCheckin: "08:58 AM" },
        "Farhan Ali": { dept: "Finance", presentDays: 18, lateDays: 1, absentDays: 2, rate: "85.7%", avgCheckin: "09:18 AM" },
        "Neha Gupta": { dept: "HR", presentDays: 19, lateDays: 1, absentDays: 0, rate: "95.0%", avgCheckin: "09:05 AM" }
    };

    // --- Toast System ---
    function showToast(message, type = "success") {
        if (!toastContainer) return;
        const toast = document.createElement("div");
        toast.className = `toast ${type}`;
        
        const icon = type === "success" ? "✓" : type === "warning" ? "⚠" : "ℹ";
        toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.classList.add("toast-exit");
            toast.addEventListener("animationend", () => toast.remove());
        }, 3200);
    }

    // --- Format Helper ---
    function formatCurrentTime() {
        const now = new Date();
        let hours = now.getHours();
        const minutes = String(now.getMinutes()).padStart(2, "0");
        const ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12 || 12;
        return `${String(hours).padStart(2, "0")}:${minutes} ${ampm}`;
    }

    // --- Calendar Day Rate Generator ---
    function getRateForDay(monthKey, day) {
        // Deterministic realistic rates
        const seed = (parseInt(monthKey.replace("-", ""), 10) * 31 + day) % 100;
        if (seed > 80) return { cls: "rate-high", label: "97%+ · excellent", pct: 98, present: 49, late: 1, absent: 0 };
        if (seed > 45) return { cls: "rate-good", label: "93–97% · good", pct: 95, present: 47, late: 2, absent: 1 };
        if (seed > 20) return { cls: "rate-mid", label: "88–93% · fair", pct: 90, present: 45, late: 3, absent: 2 };
        return { cls: "rate-low", label: "Below 88% · needs attention", pct: 84, present: 42, late: 4, absent: 4 };
    }

    // --- Render Calendar Grid ---
    function renderCalendarGrid() {
        const calGrid = document.querySelector(".cal-grid");
        if (!calGrid) return;

        const currentMonthData = monthsData[monthKeys[currentMonthIndex]];
        if (monthTitle) monthTitle.textContent = currentMonthData.name;
        if (currentMonthDisplay) currentMonthDisplay.textContent = currentMonthData.name;

        // Update sidebar month stats if needed
        const statNums = document.querySelectorAll(".stat-block-num");
        if (statNums.length >= 4) {
            statNums[0].textContent = currentMonthData.overallRate;
            statNums[1].textContent = currentMonthData.avgCheckin;
            statNums[2].textContent = String(currentMonthData.lateCount);
            statNums[3].textContent = String(currentMonthData.absentCount);
        }

        calGrid.innerHTML = "";

        // Empty cells before start day (Mon=0, Tue=1, ... Sun=6)
        for (let i = 0; i < currentMonthData.startDayOffset; i++) {
            const emptyCell = document.createElement("div");
            emptyCell.className = "cal-cell empty";
            calGrid.appendChild(emptyCell);
        }

        // Day cells
        for (let day = 1; day <= currentMonthData.totalDays; day++) {
            const dayOfWeek = (currentMonthData.startDayOffset + day - 1) % 7;
            const isWeekend = dayOfWeek === 5 || dayOfWeek === 6; // Sat or Sun

            const cell = document.createElement("div");
            cell.className = "cal-cell";
            cell.textContent = day;
            cell.tabIndex = individualMode ? -1 : 0;
            cell.setAttribute("role", "button");
            cell.setAttribute("aria-label", `Day ${day}, ${currentMonthData.name}`);

            if (isWeekend) {
                cell.classList.add("weekend");
                cell.dataset.rateType = "weekend";
            } else {
                const rateInfo = getRateForDay(monthKeys[currentMonthIndex], day);
                cell.classList.add(rateInfo.cls);
                cell.dataset.rateType = rateInfo.cls;
                cell.dataset.pct = rateInfo.pct;
                cell.dataset.present = rateInfo.present;
                cell.dataset.late = rateInfo.late;
                cell.dataset.absent = rateInfo.absent;
                cell.dataset.rateLabel = rateInfo.label;
            }

            // Highlight if today is selected
            if (selectedDayNumber === day) {
                cell.classList.add("selected");
            }

            cell.addEventListener("click", () => handleDayClick(cell, day, isWeekend));
            cell.addEventListener("keydown", (e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleDayClick(cell, day, isWeekend);
                }
            });

            calGrid.appendChild(cell);
        }

        // Fill trailing empty cells to complete the grid
        const totalRendered = currentMonthData.startDayOffset + currentMonthData.totalDays;
        const remaining = (7 - (totalRendered % 7)) % 7;
        for (let i = 0; i < remaining; i++) {
            const emptyCell = document.createElement("div");
            emptyCell.className = "cal-cell empty";
            calGrid.appendChild(emptyCell);
        }
    }

    // --- Calendar Day Click Handler ---
    function handleDayClick(cell, day, isWeekend) {
        if (individualMode) {
            showToast("Switch to 'Organization' view to inspect daily rate details.", "info");
            return;
        }

        document.querySelectorAll(".cal-cell").forEach((c) => c.classList.remove("selected"));
        cell.classList.add("selected");
        selectedDayNumber = day;

        const currentMonthData = monthsData[monthKeys[currentMonthIndex]];

        if (detailContainer) {
            if (isWeekend) {
                detailContainer.innerHTML = `
                    <div class="detail-card-rich">
                        <div class="detail-card-head">
                            <span class="detail-card-date">${currentMonthData.name.split(" ")[0]} ${day}, 2026</span>
                            <span class="detail-card-rate-pill" style="background:#f1f5f9; color:#64748b;">Weekend</span>
                        </div>
                        <p style="font-size:12px; color:#64748b; margin:4px 0;">No scheduled office operations recorded on weekends.</p>
                    </div>
                `;
            } else {
                const pct = cell.dataset.pct || 94;
                const present = cell.dataset.present || 47;
                const late = cell.dataset.late || 2;
                const absent = cell.dataset.absent || 1;
                const label = cell.dataset.rateLabel || "Good";

                let pillBg = "#dbeafe", pillColor = "#1e40af";
                if (cell.classList.contains("rate-high")) { pillBg = "#2563eb"; pillColor = "#ffffff"; }
                else if (cell.classList.contains("rate-mid")) { pillBg = "#f5e6c8"; pillColor = "#7b6334"; }
                else if (cell.classList.contains("rate-low")) { pillBg = "#f6dcdc"; pillColor = "#824949"; }

                detailContainer.innerHTML = `
                    <div class="detail-card-rich">
                        <div class="detail-card-head">
                            <span class="detail-card-date">${currentMonthData.name.split(" ")[0]} ${day}, 2026</span>
                            <span class="detail-card-rate-pill" style="background:${pillBg}; color:${pillColor};">${label}</span>
                        </div>
                        <div class="detail-grid">
                            <div class="detail-grid-item">
                                <div class="detail-grid-val" style="color:#2563eb;">${pct}%</div>
                                <div class="detail-grid-lbl">Turnout</div>
                            </div>
                            <div class="detail-grid-item">
                                <div class="detail-grid-val" style="color:#10b981;">${present}</div>
                                <div class="detail-grid-lbl">Present</div>
                            </div>
                            <div class="detail-grid-item">
                                <div class="detail-grid-val" style="color:#f59e0b;">${late}</div>
                                <div class="detail-grid-lbl">Late</div>
                            </div>
                            <div class="detail-grid-item">
                                <div class="detail-grid-val" style="color:#ef4444;">${absent}</div>
                                <div class="detail-grid-lbl">Absent</div>
                            </div>
                        </div>
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:2px;">
                            <span style="font-size:11px; color:#64748b;">50 active workforce members</span>
                            <button class="btn-table-action" id="view-day-log-btn" style="font-size:11px;">View Log</button>
                        </div>
                    </div>
                `;

                const viewDayLogBtn = document.getElementById("view-day-log-btn");
                if (viewDayLogBtn) {
                    viewDayLogBtn.addEventListener("click", () => {
                        showToast(`Showing check-in logs for ${currentMonthData.name.split(" ")[0]} ${day}.`, "info");
                    });
                }
            }
        }
    }

    // --- Month Navigation ---
    if (prevMonthBtn) {
        prevMonthBtn.addEventListener("click", () => {
            if (currentMonthIndex > 0) {
                currentMonthIndex--;
                selectedDayNumber = null;
                renderCalendarGrid();
                resetDetailView();
                showToast(`Viewing ${monthsData[monthKeys[currentMonthIndex]].name}`, "info");
            } else {
                showToast("Earlier records archived in annual reports.", "info");
            }
        });
    }

    if (nextMonthBtn) {
        nextMonthBtn.addEventListener("click", () => {
            if (currentMonthIndex < monthKeys.length - 1) {
                currentMonthIndex++;
                selectedDayNumber = null;
                renderCalendarGrid();
                resetDetailView();
                showToast(`Viewing ${monthsData[monthKeys[currentMonthIndex]].name}`, "info");
            } else {
                showToast("Future schedule not yet finalized.", "info");
            }
        });
    }

    function resetDetailView() {
        if (!detailContainer) return;
        const currentMonthData = monthsData[monthKeys[currentMonthIndex]];
        detailContainer.innerHTML = `
            <div class="cal-detail-empty">
                📊 Attendance data is shown for ${currentMonthData.name}. Click any day to view attendance breakdown.
            </div>
        `;
    }

    // --- Mode Switching (Organization vs Individual) ---
    chips.forEach((chip) => {
        chip.addEventListener("click", () => {
            chips.forEach((c) => c.classList.remove("active"));
            chip.classList.add("active");
            individualMode = chip.textContent.toLowerCase().includes("individual employee");

            const rows = Array.from(tableBody.querySelectorAll("tr"));
            rows.forEach((r) => {
                r.classList.toggle("employee-selectable", individualMode);
                r.classList.remove("employee-selected");
            });

            if (individualMode) {
                detailContainer.innerHTML = `
                    <div class="cal-detail-empty">
                        👤 <strong>Individual Employee Mode:</strong> Click any employee in Today's Check-ins below to view their attendance record and stats.
                    </div>
                `;
                showToast("Select any employee row below to inspect attendance history.", "info");
            } else {
                resetDetailView();
            }
        });
    });

    // --- Table Filtering and Search ---
    function updateTableCounts() {
        const rows = Array.from(tableBody.querySelectorAll("tr:not(.empty-row)"));
        let present = 0, late = 0, absent = 0, leave = 0;

        rows.forEach((row) => {
            const status = row.getAttribute("data-status");
            if (status === "Present") present++;
            else if (status === "Late") late++;
            else if (status === "Absent") absent++;
            else if (status === "On leave") leave++;
        });

        const total = rows.length;
        const countAll = document.getElementById("count-all");
        const countPresent = document.getElementById("count-present");
        const countLate = document.getElementById("count-late");
        const countAbsent = document.getElementById("count-absent");
        const countLeave = document.getElementById("count-leave");

        if (countAll) countAll.textContent = total;
        if (countPresent) countPresent.textContent = present;
        if (countLate) countLate.textContent = late;
        if (countAbsent) countAbsent.textContent = absent;
        if (countLeave) countLeave.textContent = leave;
        if (liveCountBadge) liveCountBadge.textContent = `${total} employees`;
    }

    function filterTableRows() {
        const rows = Array.from(tableBody.querySelectorAll("tr:not(.empty-row)"));
        let visibleCount = 0;

        rows.forEach((row) => {
            const empName = (row.getAttribute("data-emp") || "").toLowerCase();
            const dept = (row.getAttribute("data-dept") || "").toLowerCase();
            const status = row.getAttribute("data-status") || "";

            const matchesStatus = (activeStatusFilter === "all" || status.toLowerCase() === activeStatusFilter.toLowerCase());
            const matchesSearch = !searchQuery || empName.includes(searchQuery) || dept.includes(searchQuery);

            if (matchesStatus && matchesSearch) {
                row.style.display = "";
                visibleCount++;
            } else {
                row.style.display = "none";
            }
        });

        // Handle empty search result row
        let emptyRow = tableBody.querySelector(".empty-row");
        if (visibleCount === 0) {
            if (!emptyRow) {
                emptyRow = document.createElement("tr");
                emptyRow.className = "empty-row";
                emptyRow.innerHTML = `<td colspan="6" class="empty-table-message">🔍 No employee check-ins found matching "${searchQuery || activeStatusFilter}".</td>`;
                tableBody.appendChild(emptyRow);
            } else {
                emptyRow.style.display = "";
            }
        } else if (emptyRow) {
            emptyRow.style.display = "none";
        }
    }

    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            searchQuery = e.target.value.trim().toLowerCase();
            filterTableRows();
        });
    }

    filterPills.forEach((pill) => {
        pill.addEventListener("click", () => {
            filterPills.forEach((p) => p.classList.remove("active"));
            pill.classList.add("active");
            activeStatusFilter = pill.getAttribute("data-status") || "all";
            filterTableRows();
        });
    });

    // --- Table Row Click & Action Handlers ---
    tableBody.addEventListener("click", (e) => {
        const row = e.target.closest("tr");
        if (!row || row.classList.contains("empty-row")) return;

        const empName = row.getAttribute("data-emp");
        const dept = row.getAttribute("data-dept");

        // Action: Check out button clicked
        if (e.target.classList.contains("check-out-btn")) {
            e.stopPropagation();
            const checkOutCell = row.querySelector(".check-out-cell");
            if (checkOutCell) {
                const nowTime = formatCurrentTime();
                checkOutCell.textContent = nowTime;
                e.target.textContent = "Checked out";
                e.target.disabled = true;
                e.target.classList.add("disabled");
                showToast(`Checked out ${empName} at ${nowTime}.`, "success");
            }
            return;
        }

        // Action: Mark Present button clicked (for absent employee)
        if (e.target.classList.contains("mark-present-btn")) {
            e.stopPropagation();
            const nowTime = formatCurrentTime();
            const checkInCell = row.querySelector(".check-in-cell");
            if (checkInCell) checkInCell.textContent = nowTime;

            row.setAttribute("data-status", "Present");
            const statusCell = row.cells[4];
            if (statusCell) {
                statusCell.innerHTML = `
                    <span class="status-pill pill-teal">
                        <span class="sq"></span> Present
                    </span>
                `;
            }
            e.target.className = "btn-table-action check-out-btn";
            e.target.textContent = "Check out";
            updateTableCounts();
            filterTableRows();
            showToast(`Marked ${empName} as Present (Check-in: ${nowTime}).`, "success");
            return;
        }

        // If in Individual Mode, show employee attendance inspection card
        if (individualMode && empName) {
            Array.from(tableBody.querySelectorAll("tr")).forEach((r) => r.classList.remove("employee-selected"));
            row.classList.add("employee-selected");

            const profile = employeeProfiles[empName] || {
                dept: dept,
                presentDays: 19,
                lateDays: 1,
                absentDays: 1,
                rate: "90.5%",
                avgCheckin: "09:12 AM"
            };

            if (detailContainer) {
                detailContainer.innerHTML = `
                    <div class="employee-stat-card">
                        <div class="employee-stat-header">
                            <div class="avatar-sm" style="width:30px; height:30px; font-size:10px;">${empName.split(" ").map(n => n[0]).join("")}</div>
                            <div>
                                <div class="employee-stat-name">${empName}</div>
                                <div class="employee-stat-dept">${profile.dept} · Monthly Presence: <strong>${profile.rate}</strong></div>
                            </div>
                        </div>
                        <div class="stat-bar-container">
                            <div class="stat-bar-fill" style="width:${profile.rate};"></div>
                        </div>
                        <div class="detail-grid" style="margin-top:10px;">
                            <div class="detail-grid-item">
                                <div class="detail-grid-val" style="color:#10b981;">${profile.presentDays}</div>
                                <div class="detail-grid-lbl">Present</div>
                            </div>
                            <div class="detail-grid-item">
                                <div class="detail-grid-val" style="color:#f59e0b;">${profile.lateDays}</div>
                                <div class="detail-grid-lbl">Late</div>
                            </div>
                            <div class="detail-grid-item">
                                <div class="detail-grid-val" style="color:#ef4444;">${profile.absentDays}</div>
                                <div class="detail-grid-lbl">Absent</div>
                            </div>
                            <div class="detail-grid-item">
                                <div class="detail-grid-val" style="font-size:12px; color:#2563eb;">${profile.avgCheckin}</div>
                                <div class="detail-grid-lbl">Avg In</div>
                            </div>
                        </div>
                    </div>
                `;
            }
        }
    });

    // --- Quick Check-in Modal ---
    function openModal() {
        if (!checkinModal) return;
        checkinModal.classList.add("open");
        checkinModal.setAttribute("aria-hidden", "false");
        const timeInput = document.getElementById("input-checkin-time");
        if (timeInput && !timeInput.value) {
            timeInput.value = formatCurrentTime();
        }
        const nameInput = document.getElementById("input-emp-name");
        if (nameInput) nameInput.focus();
    }

    function closeModal() {
        if (!checkinModal) return;
        checkinModal.classList.remove("open");
        checkinModal.setAttribute("aria-hidden", "true");
        if (checkinForm) checkinForm.reset();
    }

    if (quickCheckinBtn) quickCheckinBtn.addEventListener("click", openModal);
    if (modalCloseBtn) modalCloseBtn.addEventListener("click", closeModal);
    if (modalCancelBtn) modalCancelBtn.addEventListener("click", closeModal);

    if (checkinModal) {
        checkinModal.addEventListener("click", (e) => {
            if (e.target === checkinModal) closeModal();
        });
    }

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && checkinModal && checkinModal.classList.contains("open")) {
            closeModal();
        }
    });

    if (checkinForm) {
        checkinForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const name = document.getElementById("input-emp-name").value.trim();
            const dept = document.getElementById("input-emp-dept").value;
            const inTime = document.getElementById("input-checkin-time").value.trim();
            const outTime = document.getElementById("input-checkout-time").value.trim() || "—";
            const status = document.getElementById("input-emp-status").value;

            if (!name) return;

            let pillClass = "pill-teal";
            if (status === "Late") pillClass = "pill-amber";
            else if (status === "Absent") pillClass = "pill-rose";
            else if (status === "On leave") pillClass = "pill-brand";

            const newRow = document.createElement("tr");
            newRow.setAttribute("data-emp", name);
            newRow.setAttribute("data-dept", dept);
            newRow.setAttribute("data-status", status);
            newRow.className = "highlight-row";

            let actionButtonHtml = "";
            if (status === "Present" || status === "Late") {
                actionButtonHtml = `<button class="btn-table-action check-out-btn" title="Record Check-out">Check out</button>`;
            } else if (status === "Absent") {
                actionButtonHtml = `<button class="btn-table-action mark-present-btn" title="Mark Present">Mark Present</button>`;
            } else {
                actionButtonHtml = `<button class="btn-table-action disabled" disabled>Excused</button>`;
            }

            newRow.innerHTML = `
                <td>${name}</td>
                <td>${dept}</td>
                <td class="check-in-cell">${inTime}</td>
                <td class="check-out-cell">${outTime}</td>
                <td>
                    <span class="status-pill ${pillClass}">
                        <span class="sq"></span> ${status}
                    </span>
                </td>
                <td>${actionButtonHtml}</td>
            `;

            // If employee already in table, update them; otherwise prepend
            const existingRow = Array.from(tableBody.querySelectorAll("tr")).find(
                (r) => (r.getAttribute("data-emp") || "").toLowerCase() === name.toLowerCase()
            );

            if (existingRow) {
                tableBody.replaceChild(newRow, existingRow);
                showToast(`Updated attendance record for ${name}.`, "success");
            } else {
                tableBody.prepend(newRow);
                showToast(`Recorded ${status.toLowerCase()} check-in for ${name}.`, "success");
            }

            closeModal();
            updateTableCounts();
            filterTableRows();
        });
    }

    // --- CSV Export Report ---
    if (exportBtn) {
        exportBtn.addEventListener("click", () => {
            const rows = Array.from(tableBody.querySelectorAll("tr:not(.empty-row)"));
            if (rows.length === 0) {
                showToast("No attendance records to export.", "warning");
                return;
            }

            const currentMonthData = monthsData[monthKeys[currentMonthIndex]];
            const csvRows = [
                ["Employee", "Department", "Check-in", "Check-out", "Status", "Date"]
            ];

            rows.forEach((row) => {
                if (row.style.display !== "none") {
                    const cells = Array.from(row.querySelectorAll("td"));
                    if (cells.length >= 5) {
                        csvRows.push([
                            cells[0].textContent.trim(),
                            cells[1].textContent.trim(),
                            cells[2].textContent.trim(),
                            cells[3].textContent.trim(),
                            cells[4].textContent.trim(),
                            currentMonthData.name
                        ]);
                    }
                }
            });

            const escapeCsv = (val) => `"${val.replace(/"/g, '""')}"`;
            const csvString = csvRows.map((r) => r.map(escapeCsv).join(",")).join("\r\n");
            const blob = new Blob([`\uFEFF${csvString}`], { type: "text/csv;charset=utf-8" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `attendance-report-${monthKeys[currentMonthIndex]}.csv`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);

            showToast("Attendance report downloaded successfully!", "success");
        });
    }

    // --- Initial Setup ---
    renderCalendarGrid();
    updateTableCounts();
});
