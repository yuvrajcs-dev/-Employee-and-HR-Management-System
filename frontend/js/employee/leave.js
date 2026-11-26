/**
 * Employee Leave Module (leave.js)
 * Handles leave balance calculation, leave application with validation & overlap detection,
 * live duration preview, localStorage persistence (synced with Portal & Attendance),
 * request filtering, expandable request details, withdrawal of awaited requests,
 * navbar notifications, and toast feedback.
 */

(function () {
    "use strict";

    // --- Shared Storage Keys ---
    const LEAVES_KEY = "hrm_employee_leaves_v1";
    const NOTIF_KEY = "hrm_employee_notifications_v1";
    const TOTAL_LEAVE_ALLOWANCE = 18;
    const PRIOR_USED_DAYS = 3; // Earlier leaves taken before Sep so initial balance = 10 / 18 (8 used)

    // --- Default Seed Data (matches original leave.html cards) ---
    const SEED_LEAVES = [
        {
            id: "lv-seed-2",
            type: "Annual",
            leaveKey: "earned",
            from: "2026-11-14",
            to: "2026-11-17",
            days: 3,
            reason: "Planned family function and outstation travel.",
            contact: "+91 98765 43210",
            documentName: "",
            status: "awaited",
            createdAt: "2026-11-10"
        },
        {
            id: "lv-seed-1",
            type: "Sick",
            leaveKey: "sick",
            from: "2026-09-12",
            to: "2026-09-13",
            days: 2,
            reason: "Viral fever and rest advised by doctor.",
            contact: "+91 98765 43210",
            documentName: "medical_certificate.pdf",
            status: "approved",
            createdAt: "2026-09-11"
        }
    ];

    const SEED_NOTIFICATIONS = [
        {
            id: "notif-1",
            type: "approved",
            title: "Leave Approved",
            body: "Your leave request for <strong>12–13 September</strong> has been approved by HR.",
            time: "2 hours ago",
            read: false
        },
        {
            id: "notif-2",
            type: "meeting",
            title: "Team Meeting",
            body: "Monthly team meeting scheduled for <strong>15 September at 11:00 AM.</strong>",
            time: "Yesterday",
            read: false
        },
        {
            id: "notif-3",
            type: "general",
            title: "Event",
            body: "An event is scheduled for <strong>12 September</strong> on the occasion of Janmashtami.",
            time: "2 days ago",
            read: true
        },
        {
            id: "notif-4",
            type: "member",
            title: "New Team Member",
            body: "<strong>Rahul</strong> has joined your team.",
            time: "Yesterday",
            read: true
        },
        {
            id: "notif-5",
            type: "rejected",
            title: "Leave Rejected",
            body: "Your leave request for <strong>20 September</strong> was rejected.",
            time: "2 days ago",
            read: true
        }
    ];

    // --- DOM Elements ---
    const remainingLeaveEl = document.getElementById("used-leave");
    const totalLeaveEl = document.getElementById("out-of");
    const leaveProgressEl = document.querySelector(".progress-bar");
    const leaveSummaryEl = document.getElementById("remaning-leave");
    const leaveForm = document.querySelector(".leave-form");
    const requestList = document.querySelector(".leave-request");
    const leaveTypeSelect = document.getElementById("leave-type");
    const fromDateInput = document.getElementById("from-date");
    const toDateInput = document.getElementById("to-date");
    const reasonInput = document.getElementById("reason");
    const contactInput = document.getElementById("contact");
    const documentInput = document.getElementById("document");
    const navBell = document.querySelector(".nav .notification");
    const navLogo = document.querySelector(".nav .logo");

    let activeFilter = "all";
    let expandedCardId = null;

    // --- Storage Helpers ---
    function loadLeaves() {
        try {
            const raw = localStorage.getItem(LEAVES_KEY);
            if (!raw) {
                localStorage.setItem(LEAVES_KEY, JSON.stringify(SEED_LEAVES));
                return [...SEED_LEAVES];
            }
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [...SEED_LEAVES];
        } catch (err) {
            return [...SEED_LEAVES];
        }
    }

    function saveLeaves(list) {
        try {
            localStorage.setItem(LEAVES_KEY, JSON.stringify(list));
        } catch (err) {
            // Ignore storage quota errors
        }
    }

    function loadNotifications() {
        try {
            const raw = localStorage.getItem(NOTIF_KEY);
            if (!raw) {
                localStorage.setItem(NOTIF_KEY, JSON.stringify(SEED_NOTIFICATIONS));
                return [...SEED_NOTIFICATIONS];
            }
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [...SEED_NOTIFICATIONS];
        } catch (err) {
            return [...SEED_NOTIFICATIONS];
        }
    }

    function pushNotification(notif) {
        const list = loadNotifications();
        list.unshift({
            id: "notif-" + Date.now(),
            read: false,
            ...notif
        });
        try {
            localStorage.setItem(NOTIF_KEY, JSON.stringify(list.slice(0, 20)));
        } catch (err) {
            // Ignore
        }
        renderNavNotifications();
    }

    // --- Inject Scoped Helper Styles for Enhancements ---
    function injectEnhancementStyles() {
        if (document.getElementById("emp-leave-js-styles")) return;
        const style = document.createElement("style");
        style.id = "emp-leave-js-styles";
        style.textContent = `
            .lv-preview-banner {
                display: none;
                align-items: center;
                justify-content: space-between;
                flex-wrap: wrap;
                gap: 8px;
                padding: 10px 14px;
                border-radius: 8px;
                font-size: 13px;
                background: #edf1ff;
                color: #26376d;
                border: 1px solid #d4defc;
            }
            .lv-preview-banner.visible { display: flex; }
            .lv-preview-banner.warn {
                background: #fff4e5;
                color: #9a5b00;
                border-color: #f7d6a8;
            }
            .lv-preview-banner.error {
                background: #fdecec;
                color: #b42318;
                border-color: #f5c2c7;
            }
            .lv-toolbar {
                width: min(65rem, calc(100% - 30px));
                margin: 26px auto 12px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                flex-wrap: wrap;
                gap: 12px;
            }
            .lv-toolbar h3 {
                font-size: 18px;
                color: #1f2937;
            }
            .lv-filter-group {
                display: flex;
                align-items: center;
                gap: 8px;
                flex-wrap: wrap;
            }
            .lv-filter-btn {
                padding: 6px 12px;
                border-radius: 999px;
                border: 1px solid #dfe4ef;
                background: #ffffff;
                color: #596579;
                font-size: 13px;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            .lv-filter-btn:hover {
                border-color: #344784;
                color: #344784;
            }
            .lv-filter-btn.active {
                background: #344784;
                border-color: #344784;
                color: #ffffff;
            }
            .request-wrapper {
                margin-bottom: 10px;
            }
            .request-wrapper .request {
                margin-bottom: 0;
                cursor: pointer;
                transition: transform 0.15s ease, box-shadow 0.2s ease;
            }
            .request-wrapper .request:hover {
                transform: translateY(-1px);
                box-shadow: 0 8px 18px rgba(52, 71, 132, 0.12);
            }
            .request-details-drawer {
                display: none;
                background: #ffffff;
                border: 1px solid #dbdbd8;
                border-top: none;
                border-radius: 0 0 14px 14px;
                padding: 16px 24px;
                margin-top: -8px;
                font-size: 13px;
                color: #4b5563;
            }
            .request-details-drawer.open {
                display: block;
            }
            .request-details-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                gap: 12px;
                padding-top: 6px;
            }
            .request-details-grid strong {
                display: block;
                font-size: 11px;
                text-transform: uppercase;
                color: #8b93a1;
                margin-bottom: 3px;
            }
            .lv-withdraw-btn {
                margin-top: 14px;
                padding: 7px 14px;
                border-radius: 7px;
                border: 1px solid #f1b4be;
                background: #fff5f6;
                color: #cf4960;
                font-size: 13px;
                font-weight: 600;
                cursor: pointer;
                transition: background 0.2s ease;
            }
            .lv-withdraw-btn:hover {
                background: #fde4e8;
            }
            .lv-empty-state {
                text-align: center;
                padding: 36px 20px;
                background: #ffffff;
                border: 1px dashed #cfd6e4;
                border-radius: 14px;
                color: #6b7280;
                font-size: 14px;
            }
            .emp-toast-wrap {
                position: fixed;
                bottom: 24px;
                right: 24px;
                z-index: 9999;
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            .emp-toast {
                background: #1f2937;
                color: #ffffff;
                padding: 12px 18px;
                border-radius: 10px;
                font-size: 14px;
                box-shadow: 0 12px 28px rgba(0,0,0,0.18);
                display: flex;
                align-items: center;
                gap: 10px;
                animation: empToastIn 0.25s ease;
            }
            .emp-toast.success { border-left: 4px solid #20967f; }
            .emp-toast.warn { border-left: 4px solid #ecb131; }
            .emp-toast.error { border-left: 4px solid #cf4960; }
            @keyframes empToastIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            /* Navbar Bell Popover */
            .nav .notification { position: relative; }
            .emp-bell-dot {
                position: absolute;
                top: 6px;
                right: 7px;
                width: 8px;
                height: 8px;
                background: #db1919;
                border-radius: 50%;
                border: 1.5px solid #fff;
            }
            .emp-notif-popover {
                position: absolute;
                top: 52px;
                right: 0;
                width: 330px;
                max-height: 360px;
                background: #ffffff;
                border: 1px solid #dfe4ef;
                border-radius: 12px;
                box-shadow: 0 18px 45px rgba(31, 41, 55, 0.14);
                overflow: hidden;
                display: none;
                z-index: 100;
                cursor: default;
            }
            .emp-notif-popover.open { display: block; }
            .emp-notif-head {
                padding: 12px 16px;
                background: linear-gradient(135deg, #edf1ff, #f8faff);
                border-bottom: 1px solid #dfe4ef;
                display: flex;
                align-items: center;
                justify-content: space-between;
                font-size: 14px;
                font-weight: 700;
                color: #26376d;
            }
            .emp-notif-head button {
                border: none;
                background: transparent;
                color: #344784;
                font-size: 12px;
                cursor: pointer;
                text-decoration: underline;
            }
            .emp-notif-list {
                max-height: 300px;
                overflow-y: auto;
                padding: 8px 0;
            }
            .emp-notif-row {
                padding: 10px 16px;
                border-bottom: 1px solid #f1f4f9;
                font-size: 12.5px;
                color: #4b5563;
                cursor: pointer;
                transition: background 0.15s ease;
            }
            .emp-notif-row:hover { background: #f8faff; }
            .emp-notif-row.unread { background: #f4f7ff; }
            .emp-notif-row h5 {
                font-size: 13px;
                color: #1f2937;
                margin-bottom: 3px;
                display: flex;
                justify-content: space-between;
            }
            .emp-notif-row small {
                display: block;
                margin-top: 4px;
                color: #9ca3af;
                font-size: 11px;
            }
        `;
        document.head.appendChild(style);
    }

    // --- Toast Helper ---
    function showToast(message, type = "success") {
        let wrap = document.querySelector(".emp-toast-wrap");
        if (!wrap) {
            wrap = document.createElement("div");
            wrap.className = "emp-toast-wrap";
            document.body.appendChild(wrap);
        }
        const toast = document.createElement("div");
        toast.className = `emp-toast ${type}`;
        toast.textContent = message;
        wrap.appendChild(toast);
        setTimeout(() => {
            toast.remove();
        }, 3200);
    }

    // --- Balance Calculation ---
    function getBalanceStats(leaves) {
        const activePaidDays = leaves
            .filter((item) => item.status !== "rejected" && item.leaveKey !== "unpaid")
            .reduce((sum, item) => sum + (Number(item.days) || 0), 0);

        const used = Math.min(TOTAL_LEAVE_ALLOWANCE, PRIOR_USED_DAYS + activePaidDays);
        const remaining = Math.max(0, TOTAL_LEAVE_ALLOWANCE - used);
        const percent = TOTAL_LEAVE_ALLOWANCE > 0 ? Math.min(100, (used / TOTAL_LEAVE_ALLOWANCE) * 100) : 0;

        return { total: TOTAL_LEAVE_ALLOWANCE, used, remaining, percent };
    }

    function updateLeaveBalanceUI() {
        if (!remainingLeaveEl || !totalLeaveEl || !leaveProgressEl || !leaveSummaryEl) return;

        const leaves = loadLeaves();
        const stats = getBalanceStats(leaves);

        remainingLeaveEl.textContent = String(stats.remaining);
        totalLeaveEl.textContent = String(stats.total);
        leaveProgressEl.style.setProperty("--leave", `${stats.percent}%`);
        leaveSummaryEl.textContent = stats.remaining === 0
            ? "All paid leave days used"
            : `${stats.used} days used this year`;
    }

    // --- Date Utilities ---
    function formatDateShort(dateString) {
        const d = new Date(`${dateString}T00:00:00`);
        if (Number.isNaN(d.getTime())) return dateString;
        return d.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short"
        });
    }

    function formatRange(fromStr, toStr) {
        if (fromStr === toStr) return formatDateShort(fromStr);
        const d1 = new Date(`${fromStr}T00:00:00`);
        const d2 = new Date(`${toStr}T00:00:00`);
        if (!Number.isNaN(d1.getTime()) && !Number.isNaN(d2.getTime()) &&
            d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear()) {
            const monthLabel = d2.toLocaleDateString("en-IN", { month: "short" });
            return `${d1.getDate()}–${d2.getDate()} ${monthLabel}`;
        }
        return `${formatDateShort(fromStr)}–${formatDateShort(toStr)}`;
    }

    function countDaysInclusive(startString, endString) {
        const start = new Date(`${startString}T00:00:00`);
        const end = new Date(`${endString}T00:00:00`);
        return Math.round((end - start) / 86400000) + 1;
    }

    function findOverlappingLeave(fromStr, toStr, leaves) {
        return leaves.find((item) => {
            if (item.status === "rejected") return false;
            return fromStr <= item.to && toStr >= item.from;
        });
    }

    // --- Live Form Preview Banner ---
    let previewBanner = null;
    function setupPreviewBanner() {
        const dateRow = document.querySelector(".date-row");
        if (!dateRow) return;
        previewBanner = document.createElement("div");
        previewBanner.className = "lv-preview-banner";
        dateRow.insertAdjacentElement("afterend", previewBanner);
    }

    function updatePreviewBanner() {
        if (!previewBanner || !fromDateInput || !toDateInput) return;

        const fromVal = fromDateInput.value;
        const toVal = toDateInput.value;
        const leaveKey = leaveTypeSelect ? leaveTypeSelect.value : "";

        if (!fromVal || !toVal) {
            previewBanner.className = "lv-preview-banner";
            previewBanner.textContent = "";
            return;
        }

        if (toVal < fromVal) {
            previewBanner.className = "lv-preview-banner error visible";
            previewBanner.innerHTML = `<span>End date must be on or after the start date.</span>`;
            return;
        }

        const days = countDaysInclusive(fromVal, toVal);
        const leaves = loadLeaves();
        const overlap = findOverlappingLeave(fromVal, toVal, leaves);

        if (overlap) {
            previewBanner.className = "lv-preview-banner error visible";
            previewBanner.innerHTML = `<span>Overlaps with your existing <strong>${overlap.type} leave</strong> (${formatRange(overlap.from, overlap.to)}).</span>`;
            return;
        }

        const stats = getBalanceStats(leaves);
        if (leaveKey && leaveKey !== "unpaid" && days > stats.remaining) {
            previewBanner.className = "lv-preview-banner warn visible";
            previewBanner.innerHTML = `<span>Requested <strong>${days} ${days === 1 ? "day" : "days"}</strong> exceeds paid balance (${stats.remaining} left). Select <strong>Unpaid Leave</strong> or shorten dates.</span>`;
            return;
        }

        const afterBalance = leaveKey === "unpaid" ? stats.remaining : Math.max(0, stats.remaining - days);
        previewBanner.className = "lv-preview-banner visible";
        previewBanner.innerHTML = `
            <span>Duration: <strong>${days} ${days === 1 ? "day" : "days"}</strong> (${formatRange(fromVal, toVal)})</span>
            <span>${leaveKey === "unpaid" ? "Unpaid leave · Paid balance unchanged" : `Remaining balance after request: <strong>${afterBalance} days</strong>`}</span>
        `;
    }

    // --- Toolbar & Request History Rendering ---
    let toolbarContainer = null;
    function setupToolbar() {
        if (!requestList) return;
        toolbarContainer = document.createElement("div");
        toolbarContainer.className = "lv-toolbar";
        requestList.parentNode.insertBefore(toolbarContainer, requestList);
    }

    function renderToolbar(leaves) {
        if (!toolbarContainer) return;
        const counts = {
            all: leaves.length,
            awaited: leaves.filter((l) => l.status === "awaited").length,
            approved: leaves.filter((l) => l.status === "approved").length,
            rejected: leaves.filter((l) => l.status === "rejected").length
        };

        toolbarContainer.innerHTML = `
            <h3>My Leave Requests (${counts.all})</h3>
            <div class="lv-filter-group">
                <button type="button" class="lv-filter-btn ${activeFilter === "all" ? "active" : ""}" data-filter="all">All (${counts.all})</button>
                <button type="button" class="lv-filter-btn ${activeFilter === "awaited" ? "active" : ""}" data-filter="awaited">Awaited (${counts.awaited})</button>
                <button type="button" class="lv-filter-btn ${activeFilter === "approved" ? "active" : ""}" data-filter="approved">Approved (${counts.approved})</button>
                <button type="button" class="lv-filter-btn ${activeFilter === "rejected" ? "active" : ""}" data-filter="rejected">Rejected (${counts.rejected})</button>
            </div>
        `;

        toolbarContainer.querySelectorAll(".lv-filter-btn").forEach((btn) => {
            btn.addEventListener("click", () => {
                activeFilter = btn.getAttribute("data-filter") || "all";
                renderLeaveRequests();
            });
        });
    }

    function buildStepperHTML(status) {
        if (status === "approved") {
            return `
                <div class="status-step completed">
                    <div class="step-circle"><i class="fa-solid fa-check"></i></div>
                    <span>Submitted</span>
                </div>
                <div class="status-step completed">
                    <div class="step-circle"><i class="fa-solid fa-check"></i></div>
                    <span>Manager review</span>
                </div>
                <div class="status-step completed">
                    <div class="step-circle"><i class="fa-solid fa-check"></i></div>
                    <span>Confirmed</span>
                </div>`;
        }
        if (status === "rejected") {
            return `
                <div class="status-step completed">
                    <div class="step-circle"><i class="fa-solid fa-check"></i></div>
                    <span>Submitted</span>
                </div>
                <div class="status-step active">
                    <div class="step-circle"><i class="fa-solid fa-xmark"></i></div>
                    <span>Manager review</span>
                </div>
                <div class="status-step">
                    <div class="step-circle">3</div>
                    <span>Declined</span>
                </div>`;
        }
        return `
            <div class="status-step completed">
                <div class="step-circle"><i class="fa-solid fa-check"></i></div>
                <span>Submitted</span>
            </div>
            <div class="status-step completed">
                <div class="step-circle"><i class="fa-solid fa-check"></i></div>
                <span>Manager review</span>
            </div>
            <div class="status-step active">
                <div class="step-circle">3</div>
                <span>Confirmed</span>
            </div>`;
    }

    function createRequestElement(item) {
        const wrapper = document.createElement("div");
        wrapper.className = "request-wrapper";

        const card = document.createElement("article");
        card.className = "request";
        card.title = "Click to view leave request details";

        const summary = document.createElement("div");
        const title = document.createElement("h2");
        title.textContent = `${item.type} leave`;
        const dates = document.createElement("p");
        dates.textContent = `${formatRange(item.from, item.to)} · ${item.days} ${item.days === 1 ? "day" : "days"}`;
        summary.append(title, dates);

        const progress = document.createElement("div");
        progress.className = "leave-status-bar";
        progress.innerHTML = buildStepperHTML(item.status);

        const statusBadge = document.createElement("div");
        const statusLabel = item.status.charAt(0).toUpperCase() + item.status.slice(1);
        statusBadge.className = `leave-status ${item.status}`;
        statusBadge.textContent = statusLabel;

        card.append(summary, progress, statusBadge);

        const drawer = document.createElement("div");
        drawer.className = `request-details-drawer ${expandedCardId === item.id ? "open" : ""}`;

        const docText = item.documentName ? item.documentName : "None attached";
        const appliedDate = item.createdAt ? formatDateShort(item.createdAt) : "Recently";

        drawer.innerHTML = `
            <div class="request-details-grid">
                <div>
                    <strong>Applied On</strong>
                    <span>${appliedDate}</span>
                </div>
                <div>
                    <strong>Contact During Leave</strong>
                    <span></span>
                </div>
                <div>
                    <strong>Supporting Document</strong>
                    <span></span>
                </div>
                <div style="grid-column: 1 / -1;">
                    <strong>Reason</strong>
                    <span></span>
                </div>
            </div>
        `;

        const spans = drawer.querySelectorAll(".request-details-grid span");
        if (spans[1]) spans[1].textContent = item.contact || "Not provided";
        if (spans[2]) spans[2].textContent = docText;
        if (spans[3]) spans[3].textContent = item.reason || "No reason specified";

        if (item.status === "awaited") {
            const withdrawBtn = document.createElement("button");
            withdrawBtn.type = "button";
            withdrawBtn.className = "lv-withdraw-btn";
            withdrawBtn.innerHTML = `<i class="fa-regular fa-trash-can"></i> Withdraw Request`;
            withdrawBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                withdrawLeaveRequest(item.id);
            });
            drawer.appendChild(withdrawBtn);
        }

        card.addEventListener("click", () => {
            expandedCardId = expandedCardId === item.id ? null : item.id;
            renderLeaveRequests();
        });

        wrapper.append(card, drawer);
        return wrapper;
    }

    function renderLeaveRequests() {
        if (!requestList) return;
        const leaves = loadLeaves();
        renderToolbar(leaves);

        const filtered = activeFilter === "all"
            ? leaves
            : leaves.filter((item) => item.status === activeFilter);

        requestList.innerHTML = "";

        if (filtered.length === 0) {
            const empty = document.createElement("div");
            empty.className = "lv-empty-state";
            empty.textContent = activeFilter === "all"
                ? "You have not submitted any leave requests yet."
                : `No ${activeFilter} leave requests found.`;
            requestList.appendChild(empty);
            return;
        }

        filtered.forEach((item) => {
            requestList.appendChild(createRequestElement(item));
        });
    }

    function withdrawLeaveRequest(id) {
        const leaves = loadLeaves();
        const target = leaves.find((item) => item.id === id);
        if (!target) return;

        const updated = leaves.filter((item) => item.id !== id);
        saveLeaves(updated);
        expandedCardId = null;

        updateLeaveBalanceUI();
        renderLeaveRequests();
        updatePreviewBanner();

        pushNotification({
            type: "general",
            title: "Leave Request Withdrawn",
            body: `You withdrew your <strong>${target.type} leave</strong> request (${formatRange(target.from, target.to)}).`,
            time: "Just now"
        });

        showToast(`${target.type} leave request withdrawn and balance updated.`, "warn");
    }

    // --- Navbar Notifications ---
    let notifPopover = null;
    function setupNavNotifications() {
        if (!navBell) return;
        notifPopover = document.createElement("div");
        notifPopover.className = "emp-notif-popover";
        navBell.appendChild(notifPopover);

        navBell.addEventListener("click", (e) => {
            e.stopPropagation();
            notifPopover.classList.toggle("open");
        });

        document.addEventListener("click", (e) => {
            if (notifPopover && !navBell.contains(e.target)) {
                notifPopover.classList.remove("open");
            }
        });

        renderNavNotifications();
    }

    function renderNavNotifications() {
        if (!navBell || !notifPopover) return;
        const list = loadNotifications();
        const unreadCount = list.filter((n) => !n.read).length;

        let dot = navBell.querySelector(".emp-bell-dot");
        if (unreadCount > 0) {
            if (!dot) {
                dot = document.createElement("span");
                dot.className = "emp-bell-dot";
                navBell.appendChild(dot);
            }
        } else if (dot) {
            dot.remove();
        }

        notifPopover.innerHTML = `
            <div class="emp-notif-head">
                <span>Notifications ${unreadCount > 0 ? `(${unreadCount})` : ""}</span>
                ${unreadCount > 0 ? `<button type="button" id="lv-mark-all-read">Mark all read</button>` : ""}
            </div>
            <div class="emp-notif-list"></div>
        `;

        const listEl = notifPopover.querySelector(".emp-notif-list");
        list.forEach((item) => {
            const row = document.createElement("div");
            row.className = `emp-notif-row ${item.read ? "" : "unread"}`;
            row.innerHTML = `
                <h5><span>${item.title}</span>${!item.read ? `<span style="color:#db1919;font-size:10px;">●</span>` : ""}</h5>
                <div>${item.body}</div>
                <small>${item.time}</small>
            `;
            row.addEventListener("click", (e) => {
                e.stopPropagation();
                if (!item.read) {
                    const updated = loadNotifications().map((n) => n.id === item.id ? { ...n, read: true } : n);
                    localStorage.setItem(NOTIF_KEY, JSON.stringify(updated));
                    renderNavNotifications();
                }
            });
            listEl.appendChild(row);
        });

        const markAllBtn = notifPopover.querySelector("#lv-mark-all-read");
        if (markAllBtn) {
            markAllBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                const updated = loadNotifications().map((n) => ({ ...n, read: true }));
                localStorage.setItem(NOTIF_KEY, JSON.stringify(updated));
                renderNavNotifications();
            });
        }
    }

    // --- Form Event Listeners ---
    if (fromDateInput && toDateInput) {
        fromDateInput.addEventListener("change", () => {
            toDateInput.min = fromDateInput.value;
            if (toDateInput.value && toDateInput.value < fromDateInput.value) {
                toDateInput.value = fromDateInput.value;
            }
            updatePreviewBanner();
        });
        toDateInput.addEventListener("change", updatePreviewBanner);
    }

    if (leaveTypeSelect) {
        leaveTypeSelect.addEventListener("change", updatePreviewBanner);
    }

    if (leaveForm) {
        ["leave-type", "from-date", "to-date", "reason", "contact"].forEach((id) => {
            const field = document.getElementById(id);
            if (field) field.required = true;
        });

        leaveForm.addEventListener("reset", () => {
            if (toDateInput) toDateInput.removeAttribute("min");
            setTimeout(updatePreviewBanner, 0);
        });

        leaveForm.addEventListener("submit", (event) => {
            event.preventDefault();
            if (!leaveForm.reportValidity()) return;

            if (toDateInput.value < fromDateInput.value) {
                toDateInput.setCustomValidity("The end date must be on or after the start date.");
                toDateInput.reportValidity();
                toDateInput.setCustomValidity("");
                return;
            }

            const phonePattern = /^[+]?[0-9\s-]{10,15}$/;
            if (contactInput && !phonePattern.test(contactInput.value.trim())) {
                contactInput.setCustomValidity("Please enter a valid 10 to 15 digit contact number.");
                contactInput.reportValidity();
                contactInput.setCustomValidity("");
                return;
            }

            if (reasonInput && reasonInput.value.trim().length < 5) {
                reasonInput.setCustomValidity("Please provide a brief reason (at least 5 characters).");
                reasonInput.reportValidity();
                reasonInput.setCustomValidity("");
                return;
            }

            const leaves = loadLeaves();
            const overlap = findOverlappingLeave(fromDateInput.value, toDateInput.value, leaves);
            if (overlap) {
                showToast(`Dates overlap with your existing ${overlap.type} leave (${formatRange(overlap.from, overlap.to)}).`, "error");
                return;
            }

            const leaveKey = leaveTypeSelect.value;
            const typeLabel = leaveTypeSelect.options[leaveTypeSelect.selectedIndex].text.replace(/\s+Leave$/i, "");
            const days = countDaysInclusive(fromDateInput.value, toDateInput.value);
            const stats = getBalanceStats(leaves);

            if (leaveKey !== "unpaid" && days > stats.remaining) {
                showToast(`Insufficient paid leave balance (${stats.remaining} days remaining). Choose Unpaid Leave or fewer days.`, "error");
                return;
            }

            const fileName = documentInput && documentInput.files && documentInput.files[0]
                ? documentInput.files[0].name
                : "";

            const todayISO = new Date().toISOString().split("T")[0];
            const newRequest = {
                id: "lv-" + Date.now(),
                type: typeLabel,
                leaveKey,
                from: fromDateInput.value,
                to: toDateInput.value,
                days,
                reason: reasonInput.value.trim(),
                contact: contactInput.value.trim(),
                documentName: fileName,
                status: "awaited",
                createdAt: todayISO
            };

            leaves.unshift(newRequest);
            saveLeaves(leaves);

            activeFilter = "all";
            expandedCardId = newRequest.id;
            updateLeaveBalanceUI();
            renderLeaveRequests();

            pushNotification({
                type: "general",
                title: "Leave Request Submitted",
                body: `Your <strong>${typeLabel} leave</strong> request for <strong>${formatRange(newRequest.from, newRequest.to)}</strong> (${days} ${days === 1 ? "day" : "days"}) is awaiting review.`,
                time: "Just now"
            });

            leaveForm.reset();
            toDateInput.removeAttribute("min");
            updatePreviewBanner();
            showToast(`${typeLabel} leave request submitted for ${days} ${days === 1 ? "day" : "days"}!`, "success");
        });
    }

    if (navLogo) {
        navLogo.style.cursor = "pointer";
        navLogo.addEventListener("click", () => {
            window.location.href = "portal.html";
        });
    }

    // --- Initialize ---
    injectEnhancementStyles();
    setupPreviewBanner();
    setupToolbar();
    setupNavNotifications();
    updateLeaveBalanceUI();
    renderLeaveRequests();
})();
