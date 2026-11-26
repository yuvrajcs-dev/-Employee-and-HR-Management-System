/**
 * Employee Workspace Dashboard Module (employee-portal.js)
 * Powers dynamic time-of-day greeting & live date, interactive Check-In / Check-Out with live working
 * and overtime timer, dynamic current-week attendance strip synced with leaves & attendance,
 * synced leave balance bar & quick navigation, overtime monthly log updates, upcoming holidays
 * countdown sorting, and bug-free notification & profile dropdown menus with localStorage persistence.
 */

(function () {
    "use strict";

    // --- Shared Storage Keys ---
    const LEAVES_KEY = "hrm_employee_leaves_v1";
    const TODAY_SESSION_KEY = "hrm_employee_today_session_v1";
    const OVERTIME_LOG_KEY = "hrm_employee_overtime_v1";
    const NOTIF_KEY = "hrm_employee_notifications_v1";

    const TOTAL_LEAVE_ALLOWANCE = 18;
    const PRIOR_USED_DAYS = 3;
    const SHIFT_MINUTES = 8 * 60 + 53; // 09:12 AM -> 06:05 PM standard shift (8h 53m)

    // --- Seed Data ---
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

    const SEED_OVERTIME = [
        { id: "ot-1", dateLabel: "Mon, 23 Nov", minutes: 45 },
        { id: "ot-2", dateLabel: "Fri, 15 Sep", minutes: 120 },
        { id: "ot-3", dateLabel: "Fri, 28 Aug", minutes: 45 },
        { id: "ot-4", dateLabel: "Wed, 26 Aug", minutes: 70 }
    ];

    const SEED_NOTIFICATIONS = [
        {
            id: "notif-1",
            type: "approved",
            title: "Leave Approved",
            body: "Your leave request for <strong>18 September</strong> has been approved by HR.",
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
            read: false
        },
        {
            id: "notif-4",
            type: "member",
            title: "New Team Member",
            body: "<strong>Rahul</strong> has joined your team.",
            time: "Yesterday",
            read: false
        },
        {
            id: "notif-5",
            type: "rejected",
            title: "Leave Rejected",
            body: "Your leave request for <strong>20 September</strong> was rejected.",
            time: "2 days ago",
            read: false
        }
    ];

    // --- DOM References ---
    const headingTitle = document.querySelector(".content > .heading h1");
    const headingSub = document.querySelector(".content > .heading p");
    const entryDataBar = document.querySelector(".entry-data");
    const checkInValEl = document.querySelector(".entry-data .check-in h3");
    const workingValEl = document.querySelector(".entry-data .working h3");
    const checkOutLabelEl = document.querySelector(".entry-data .check-out h5");
    const checkOutValEl = document.querySelector(".entry-data .check-out h3");
    const overtimeBarValEl = document.querySelector(".entry-data .over-time h3");

    const weekHeaders = document.querySelectorAll(".attendance .weeks h5");
    const reportContainer = document.querySelector(".attendance-report");
    const payslipLink = document.querySelector(".payslip-month a");

    const overtimeBoxes = document.querySelectorAll(".overtime-card .logged-in h2");
    const overtimeTableBody = document.querySelector(".looged-table tbody");

    const leaveCard = document.querySelector(".right .leave");
    const leftLeaveEl = document.querySelector(".left-leave");
    const outOfEl = document.querySelector(".out-of");
    const leaveBarEl = document.querySelector(".leave-bar");
    const remainingTextEl = document.getElementById("remaining");

    const holidayTableBody = document.querySelector(".holiday-table tbody");

    const notificationBtn = document.querySelector(".notification");
    const notificationStatus = document.querySelector(".notification-status");
    const notificationRing = document.querySelector(".notification-ring");
    const notificationBox = document.querySelector(".notification-box");
    const notificationMessageList = document.querySelector(".notification-box .message");
    const notificationHeading = document.querySelector(".notification-box .heading");

    const profileBtn = document.querySelector(".profile");
    const profilePage = document.querySelector(".profile-page");

    let liveTimerId = null;

    // --- Date & Time Helpers ---
    function getTodayISO() {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    }

    function formatClockTime(dateObj) {
        let hours = dateObj.getHours();
        const minutes = String(dateObj.getMinutes()).padStart(2, "0");
        const period = hours >= 12 ? "PM" : "AM";
        hours = hours % 12 || 12;
        return `${String(hours).padStart(2, "0")}:${minutes} ${period}`;
    }

    function formatDurationMinutes(totalMins) {
        const safe = Math.max(0, Math.floor(totalMins));
        const hrs = Math.floor(safe / 60);
        const mins = safe % 60;
        return `${hrs}h ${String(mins).padStart(2, "0")}m`;
    }

    // --- Scoped Styles for Dashboard Enhancements ---
    function injectStyles() {
        if (document.getElementById("emp-portal-js-styles")) return;
        const style = document.createElement("style");
        style.id = "emp-portal-js-styles";
        style.textContent = `
            .notification-box, .profile-page {
                z-index: 50;
            }
            .punch-action-btn {
                padding: 10px 18px;
                border-radius: 10px;
                border: 1px solid rgba(255, 255, 255, 0.28);
                font-size: 13.5px;
                font-weight: 700;
                cursor: pointer;
                white-space: nowrap;
                transition: transform 0.15s ease, box-shadow 0.2s ease, background 0.2s ease;
            }
            .punch-action-btn.checkout-mode {
                background: #ecb131;
                color: #1f2937;
                border-color: #ecb131;
            }
            .punch-action-btn.checkin-mode {
                background: #20967f;
                color: #ffffff;
                border-color: #20967f;
            }
            .punch-action-btn:hover {
                transform: translateY(-1px);
                box-shadow: 0 6px 16px rgba(0, 0, 0, 0.22);
            }
            .card-leave {
                width: 35px;
                height: 35px;
                display: flex;
                justify-content: center;
                align-items: center;
                border-radius: 12px;
                background-color: #e8ecff;
                color: #344784;
            }
            .attendance-report > div {
                cursor: pointer;
                transition: transform 0.15s ease;
            }
            .attendance-report > div:hover {
                transform: scale(1.1);
            }
            .leave-apply-link {
                display: inline-block;
                margin-top: 8px;
                font-size: 13px;
                font-weight: 600;
                color: #344784;
                text-decoration: none;
            }
            .leave-apply-link:hover { text-decoration: underline; }
            .holiday-badge {
                display: inline-block;
                margin-left: 8px;
                padding: 2px 8px;
                border-radius: 999px;
                background: #edf1ff;
                color: #344784;
                font-size: 11px;
                font-weight: 600;
            }
            .notif-mark-all-btn {
                margin-left: 12px;
                padding: 4px 10px;
                border-radius: 999px;
                border: 1px solid rgba(52, 71, 132, 0.3);
                background: rgba(255, 255, 255, 0.75);
                color: #26376d;
                font-size: 11px;
                font-weight: 600;
                cursor: pointer;
            }
            .notif-mark-all-btn:hover { background: #ffffff; }
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
                box-shadow: 0 12px 28px rgba(0, 0, 0, 0.18);
                border-left: 4px solid #20967f;
            }
        `;
        document.head.appendChild(style);
    }

    function showToast(message) {
        let wrap = document.querySelector(".emp-toast-wrap");
        if (!wrap) {
            wrap = document.createElement("div");
            wrap.className = "emp-toast-wrap";
            document.body.appendChild(wrap);
        }
        const toast = document.createElement("div");
        toast.className = "emp-toast";
        toast.textContent = message;
        wrap.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    // --- 1. Greeting & Today's Date ---
    function updateGreetingAndDate() {
        const now = new Date();
        const hour = now.getHours();
        const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

        if (headingTitle) {
            headingTitle.textContent = `${greeting}, Rahul`;
        }
        if (headingSub) {
            const formatted = now.toLocaleDateString("en-IN", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            });
            headingSub.textContent = `Here's your work overview for today — ${formatted}.`;
        }
    }

    // --- 2. Check-In / Check-Out & Live Working / Overtime Timer ---
    function loadTodaySession() {
        const todayISO = getTodayISO();
        try {
            const raw = localStorage.getItem(TODAY_SESSION_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed && parsed.dateKey === todayISO) {
                    return parsed;
                }
            }
        } catch (err) {
            // Ignore
        }

        // Default initial active shift for today (09:12 AM check-in)
        const now = new Date();
        const defaultStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 12, 0);
        const startISO = defaultStart <= now
            ? defaultStart.toISOString()
            : new Date(now.getTime() - 42 * 60000).toISOString();

        const initial = {
            dateKey: todayISO,
            checkedIn: true,
            checkedOut: false,
            checkInISO: startISO,
            checkInLabel: defaultStart <= now ? "09:12 AM" : formatClockTime(new Date(startISO)),
            expectedOutLabel: "06:05 PM",
            checkOutISO: null,
            checkOutLabel: null,
            workedMinutes: 0,
            overtimeMinutes: 0
        };
        saveTodaySession(initial);
        return initial;
    }

    function saveTodaySession(session) {
        try {
            localStorage.setItem(TODAY_SESSION_KEY, JSON.stringify(session));
        } catch (err) {
            // Ignore
        }
    }

    let punchBtn = null;
    function setupEntryDataControls() {
        if (!entryDataBar) return;
        const divider = document.createElement("div");
        divider.className = "checkin-divider";
        punchBtn = document.createElement("button");
        punchBtn.type = "button";
        punchBtn.className = "punch-action-btn";
        entryDataBar.append(divider, punchBtn);

        punchBtn.addEventListener("click", handlePunchToggle);
        renderSessionState();
        liveTimerId = setInterval(renderSessionState, 15000);
    }

    function getSessionMetrics(session) {
        const startMs = new Date(session.checkInISO).getTime();
        const endMs = session.checkedOut && session.checkOutISO
            ? new Date(session.checkOutISO).getTime()
            : Date.now();
        const rawMinutes = Math.max(0, Math.floor((endMs - startMs) / 60000));
        // Cap automatic default elapsed display to realistic shift window unless actively running new check-in
        const workedMinutes = Math.min(rawMinutes, 12 * 60);
        const overtimeMinutes = Math.max(0, workedMinutes - SHIFT_MINUTES);
        return { workedMinutes, overtimeMinutes };
    }

    function renderSessionState() {
        const session = loadTodaySession();
        const { workedMinutes, overtimeMinutes } = getSessionMetrics(session);

        if (checkInValEl) checkInValEl.textContent = session.checkInLabel || "--:--";
        if (workingValEl) {
            workingValEl.textContent = session.checkedOut
                ? formatDurationMinutes(session.workedMinutes || workedMinutes)
                : formatDurationMinutes(workedMinutes);
        }

        if (session.checkedOut) {
            if (checkOutLabelEl) checkOutLabelEl.textContent = "Checked Out";
            if (checkOutValEl) checkOutValEl.textContent = session.checkOutLabel || "--:--";
            if (overtimeBarValEl) overtimeBarValEl.textContent = formatDurationMinutes(session.overtimeMinutes || 0);
            if (punchBtn) {
                punchBtn.className = "punch-action-btn checkin-mode";
                punchBtn.textContent = "Check In";
            }
        } else {
            if (checkOutLabelEl) checkOutLabelEl.textContent = "Expected check-Out";
            if (checkOutValEl) checkOutValEl.textContent = session.expectedOutLabel || "06:05 PM";
            if (overtimeBarValEl) overtimeBarValEl.textContent = formatDurationMinutes(overtimeMinutes);
            if (punchBtn) {
                punchBtn.className = "punch-action-btn checkout-mode";
                punchBtn.textContent = "Check Out";
            }
        }

        renderOvertimeCard(session.checkedOut ? (session.overtimeMinutes || 0) : overtimeMinutes);
    }

    function handlePunchToggle() {
        const session = loadTodaySession();
        const now = new Date();

        if (!session.checkedOut) {
            // Perform Check-Out
            const { workedMinutes, overtimeMinutes } = getSessionMetrics(session);
            session.checkedOut = true;
            session.checkOutISO = now.toISOString();
            session.checkOutLabel = formatClockTime(now);
            session.workedMinutes = workedMinutes;
            session.overtimeMinutes = overtimeMinutes;
            saveTodaySession(session);

            if (overtimeMinutes > 0) {
                recordOvertimeEntry(now, overtimeMinutes);
            }

            pushNotification({
                type: "approved",
                title: "Checked Out",
                body: `Checked out at <strong>${session.checkOutLabel}</strong> (${formatDurationMinutes(workedMinutes)} worked today).`,
                time: "Just now"
            });
            showToast(`Checked out at ${session.checkOutLabel}. Have a great evening!`);
        } else {
            // Start a new Check-In from current time
            const expected = new Date(now.getTime() + SHIFT_MINUTES * 60000);
            session.checkedIn = true;
            session.checkedOut = false;
            session.checkInISO = now.toISOString();
            session.checkInLabel = formatClockTime(now);
            session.expectedOutLabel = formatClockTime(expected);
            session.checkOutISO = null;
            session.checkOutLabel = null;
            session.workedMinutes = 0;
            session.overtimeMinutes = 0;
            saveTodaySession(session);

            pushNotification({
                type: "approved",
                title: "Checked In",
                body: `You checked in at <strong>${session.checkInLabel}</strong>. Expected check-out: ${session.expectedOutLabel}.`,
                time: "Just now"
            });
            showToast(`Checked in at ${session.checkInLabel}!`);
        }

        renderSessionState();
        renderWeeklyAttendance();
    }

    // --- 3. Overtime Card ---
    function loadOvertimeLogs() {
        try {
            const raw = localStorage.getItem(OVERTIME_LOG_KEY);
            if (!raw) {
                localStorage.setItem(OVERTIME_LOG_KEY, JSON.stringify(SEED_OVERTIME));
                return [...SEED_OVERTIME];
            }
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [...SEED_OVERTIME];
        } catch (err) {
            return [...SEED_OVERTIME];
        }
    }

    function recordOvertimeEntry(dateObj, minutes) {
        const logs = loadOvertimeLogs();
        const dateLabel = dateObj.toLocaleDateString("en-IN", {
            weekday: "short",
            day: "numeric",
            month: "short"
        });
        const existingIdx = logs.findIndex((item) => item.dateLabel === dateLabel);
        if (existingIdx >= 0) {
            logs[existingIdx].minutes = minutes;
        } else {
            logs.unshift({ id: "ot-" + Date.now(), dateLabel, minutes });
        }
        try {
            localStorage.setItem(OVERTIME_LOG_KEY, JSON.stringify(logs));
        } catch (err) {
            // Ignore
        }
    }

    function formatOvertimeShort(mins) {
        if (mins < 60) return `${mins}m`;
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return `${h}h ${String(m).padStart(2, "0")}m`;
    }

    function renderOvertimeCard(todayOvertimeMins) {
        const logs = loadOvertimeLogs();
        const totalHistoricalMins = logs.reduce((acc, item) => acc + (Number(item.minutes) || 0), 0);

        if (overtimeBoxes[0]) {
            overtimeBoxes[0].textContent = formatDurationMinutes(todayOvertimeMins);
        }
        if (overtimeBoxes[1]) {
            overtimeBoxes[1].textContent = formatDurationMinutes(totalHistoricalMins);
        }

        if (overtimeTableBody) {
            overtimeTableBody.innerHTML = "";
            logs.forEach((entry) => {
                const tr = document.createElement("tr");
                tr.innerHTML = `<td>${entry.dateLabel}</td><td>${formatOvertimeShort(entry.minutes)}</td>`;
                overtimeTableBody.appendChild(tr);
            });
        }
    }

    // --- 4. Weekly Attendance Strip (MON - FRI) ---
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

    function isDateOnLeave(dateISO, leaves) {
        return leaves.some((lv) => lv.status !== "rejected" && lv.from <= dateISO && lv.to >= dateISO);
    }

    function renderWeeklyAttendance() {
        if (!reportContainer) return;
        reportContainer.innerHTML = "";

        const now = new Date();
        const currentDow = now.getDay(); // 0=Sun, 1=Mon ... 6=Sat
        const mondayOffset = currentDow === 0 ? -6 : 1 - currentDow;
        const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + mondayOffset);

        const leaves = loadLeaves();
        const session = loadTodaySession();
        const todayISO = getTodayISO();
        const dayNames = ["MON", "TUE", "WED", "THU", "FRI"];
        const fallbackPattern = ["present", "absent", "present", "late", "present"];

        for (let i = 0; i < 5; i++) {
            const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
            const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

            if (weekHeaders[i]) {
                weekHeaders[i].textContent = `${dayNames[i]} ${d.getDate()}`;
            }

            let status = "weekend"; // upcoming / not yet recorded
            if (isDateOnLeave(iso, leaves)) {
                status = "leave";
            } else if (iso === todayISO && session && session.checkedIn) {
                const startDate = new Date(session.checkInISO);
                const mins = startDate.getHours() * 60 + startDate.getMinutes();
                status = mins > 9 * 60 + 15 ? "late" : "present";
            } else if (d < new Date(now.getFullYear(), now.getMonth(), now.getDate())) {
                status = fallbackPattern[i];
            }

            const card = document.createElement("div");
            card.className = `card-${status}`;
            const prettyDate = d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
            card.title = `${prettyDate} — ${status === "weekend" ? "Upcoming" : status.toUpperCase()}`;

            if (status === "present") {
                card.innerHTML = `<i class="fa-solid fa-check fa-2xs" style="color: rgb(9, 156, 112);"></i>`;
            } else if (status === "absent") {
                card.innerHTML = `<i class="fa-solid fa-x fa-2xs" style="color: rgb(230, 77, 77);"></i>`;
            } else if (status === "late") {
                card.innerHTML = `<span>!</span>`;
            } else if (status === "leave") {
                card.innerHTML = `<i class="fa-solid fa-plane-departure fa-2xs"></i>`;
            } else {
                card.innerHTML = `<span></span>`;
            }

            card.addEventListener("click", () => {
                window.location.href = "attendance.html";
            });

            reportContainer.appendChild(card);
        }
    }

    // --- 5. Synced Leave Balance Card ---
    function updateLeaveBalanceCard() {
        const leaves = loadLeaves();
        const activePaidDays = leaves
            .filter((item) => item.status !== "rejected" && item.leaveKey !== "unpaid")
            .reduce((sum, item) => sum + (Number(item.days) || 0), 0);

        const used = Math.min(TOTAL_LEAVE_ALLOWANCE, PRIOR_USED_DAYS + activePaidDays);
        const leftLeave = Math.max(0, TOTAL_LEAVE_ALLOWANCE - used);
        const leaveUsedPct = (used / TOTAL_LEAVE_ALLOWANCE) * 100;

        if (leftLeaveEl) leftLeaveEl.textContent = String(leftLeave);
        if (outOfEl) outOfEl.innerHTML = `${TOTAL_LEAVE_ALLOWANCE} <span> days</span>`;
        if (leaveBarEl) leaveBarEl.style.setProperty("--leave", `${leaveUsedPct}%`);
        if (remainingTextEl) {
            remainingTextEl.textContent = leftLeave === 0
                ? "All Leaves Used"
                : `${used} days used this year`;
        }

        if (leaveCard && !leaveCard.querySelector(".leave-apply-link")) {
            const link = document.createElement("a");
            link.href = "leave.html";
            link.className = "leave-apply-link";
            link.textContent = "Apply or manage leave →";
            leaveCard.appendChild(link);
        }
    }

    // --- 6. Payslip Link & Upcoming Holidays ---
    function fixPayslipLink() {
        if (payslipLink) {
            payslipLink.setAttribute("href", "e-payroll.html");
        }
    }

    function enhanceUpcomingHolidays() {
        if (!holidayTableBody) return;
        const now = new Date();
        const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const monthMap = {
            jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
            jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
        };

        const rows = Array.from(holidayTableBody.querySelectorAll("tr")).map((tr) => {
            const name = tr.cells[0] ? tr.cells[0].textContent.trim() : "";
            const dateText = tr.cells[1] ? tr.cells[1].textContent.trim() : "";
            const parts = dateText.split(/\s+/);
            const day = parseInt(parts[0], 10);
            const monIdx = parts[1] ? monthMap[parts[1].slice(0, 3).toLowerCase()] : 0;

            let targetDate = new Date(now.getFullYear(), monIdx, day);
            if (targetDate < todayMidnight) {
                targetDate = new Date(now.getFullYear() + 1, monIdx, day);
            }
            const diffDays = Math.round((targetDate - todayMidnight) / 86400000);
            return { name, dateText, diffDays };
        });

        rows.sort((a, b) => a.diffDays - b.diffDays);

        holidayTableBody.innerHTML = "";
        rows.forEach((h, idx) => {
            const tr = document.createElement("tr");
            const badge = idx === 0
                ? `<span class="holiday-badge">${h.diffDays === 0 ? "Today" : `In ${h.diffDays}d`}</span>`
                : "";
            tr.innerHTML = `<td>${h.name}${badge}</td><td>${h.dateText}</td>`;
            holidayTableBody.appendChild(tr);
        });
    }

    // --- 7. Notifications & Profile Dropdown Menus ---
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

    function saveNotifications(list) {
        try {
            localStorage.setItem(NOTIF_KEY, JSON.stringify(list));
        } catch (err) {
            // Ignore
        }
    }

    function pushNotification(notif) {
        const list = loadNotifications();
        list.unshift({
            id: "notif-" + Date.now(),
            read: false,
            ...notif
        });
        saveNotifications(list.slice(0, 20));
        renderNotificationItems();
    }

    function renderNotificationItems() {
        if (!notificationMessageList) return;
        const list = loadNotifications();
        const unreadCount = list.filter((n) => !n.read).length;

        if (notificationStatus && notificationRing) {
            if (unreadCount === 0) {
                notificationRing.style.animation = "none";
                notificationStatus.style.display = "none";
            } else {
                notificationRing.style.animation = "";
                notificationStatus.style.display = "flex";
            }
        }

        if (notificationHeading) {
            notificationHeading.innerHTML = `
                <h3>Notifications ${unreadCount > 0 ? `(${unreadCount})` : ""}</h3>
                ${unreadCount > 0 ? `<button type="button" class="notif-mark-all-btn">Mark all read</button>` : ""}
            `;
            const markBtn = notificationHeading.querySelector(".notif-mark-all-btn");
            if (markBtn) {
                markBtn.addEventListener("click", (e) => {
                    e.stopPropagation();
                    const updated = loadNotifications().map((n) => ({ ...n, read: true }));
                    saveNotifications(updated);
                    renderNotificationItems();
                });
            }
        }

        notificationMessageList.innerHTML = "";
        list.forEach((item) => {
            const div = document.createElement("div");
            div.className = `notification-item ${item.read ? "read" : ""}`;
            div.style.cursor = "pointer";
            div.innerHTML = `
                <div class="timeline-dot ${item.type || "general"}"></div>
                <div class="notification-content">
                    <h4>${item.title}</h4>
                    <p>${item.body}</p>
                    <small>${item.time}</small>
                </div>
                <span class="unread-txt ${item.read ? "read-txt" : ""}">Unread</span>
            `;

            div.addEventListener("click", (e) => {
                e.stopPropagation();
                if (item.read) return;
                const updated = loadNotifications().map((n) => n.id === item.id ? { ...n, read: true } : n);
                saveNotifications(updated);
                renderNotificationItems();
            });

            notificationMessageList.appendChild(div);
        });
    }

    let isNotifOpen = false;
    let isProfileOpen = false;

    function setNotificationOpen(open) {
        isNotifOpen = open;
        if (!notificationBox) return;
        notificationBox.style.opacity = open ? "1" : "0";
        notificationBox.style.visibility = open ? "visible" : "hidden";
    }

    function setProfileOpen(open) {
        isProfileOpen = open;
        if (!profilePage || !profileBtn) return;
        profileBtn.classList.toggle("active", open);
        profilePage.style.opacity = open ? "1" : "0";
        profilePage.style.visibility = open ? "visible" : "hidden";
    }

    function setupDropdownMenus() {
        setNotificationOpen(false);
        setProfileOpen(false);

        if (notificationBtn) {
            notificationBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                setProfileOpen(false);
                setNotificationOpen(!isNotifOpen);
            });
        }

        if (notificationBox) {
            notificationBox.addEventListener("click", (e) => e.stopPropagation());
        }

        if (profileBtn) {
            profileBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                setNotificationOpen(false);
                setProfileOpen(!isProfileOpen);
            });
        }

        if (profilePage) {
            profilePage.addEventListener("click", (e) => e.stopPropagation());
        }

        document.addEventListener("click", () => {
            if (isNotifOpen) setNotificationOpen(false);
            if (isProfileOpen) setProfileOpen(false);
        });

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                setNotificationOpen(false);
                setProfileOpen(false);
            }
        });
    }

    // Refresh dashboard widgets when returning via back/forward cache or storage updates
    window.addEventListener("storage", () => {
        updateLeaveBalanceCard();
        renderWeeklyAttendance();
        renderNotificationItems();
    });

    // --- Initialize ---
    injectStyles();
    updateGreetingAndDate();
    setupEntryDataControls();
    renderWeeklyAttendance();
    updateLeaveBalanceCard();
    fixPayslipLink();
    enhanceUpcomingHolidays();
    renderNotificationItems();
    setupDropdownMenus();
})();
