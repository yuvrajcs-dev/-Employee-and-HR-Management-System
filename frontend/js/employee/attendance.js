/**
 * Employee Attendance Module (attendance.js)
 * Renders interactive monthly attendance calendar with complete multi-month data,
 * syncs approved/awaited leaves from leave.html and today's check-in/out from portal.html,
 * calculates monthly attendance percentage, average check-in time, late arrivals, and status counts,
 * supports interactive legend filtering, quick "Today" navigation, and navbar notifications.
 */

(function () {
    "use strict";

    const LEAVES_KEY = "hrm_employee_leaves_v1";
    const TODAY_SESSION_KEY = "hrm_employee_today_session_v1";
    const NOTIF_KEY = "hrm_employee_notifications_v1";

    const SEED_LEAVES = [
        {
            id: "lv-seed-2",
            type: "Annual",
            leaveKey: "earned",
            from: "2026-11-14",
            to: "2026-11-17",
            days: 3,
            status: "awaited"
        },
        {
            id: "lv-seed-1",
            type: "Sick",
            leaveKey: "sick",
            from: "2026-09-12",
            to: "2026-09-13",
            days: 2,
            status: "approved"
        }
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
            read: true
        }
    ];

    // --- DOM References ---
    const daysContainer = document.getElementById("day-s");
    const dayDateEl = document.getElementById("date");
    const checkInEl = document.getElementById("in");
    const checkOutEl = document.getElementById("out");
    const attendanceStatusEl = document.getElementById("status");
    const detailEmptyMsg = document.querySelector(".empty-message");
    const currentPeriodEl = document.querySelector(".current-period");
    const headingChip = document.querySelector(".heading-chip");
    const monthYearHeading = document.querySelector(".month-year-heading");
    const btnGroup = document.querySelector(".month-year .btn");
    const prevBtn = document.getElementById("prev");
    const nextBtn = document.getElementById("next");
    const navBell = document.querySelector(".nav .notification");
    const navLogo = document.querySelector(".nav .logo");
    const attendanceDetailCard = document.querySelector(".attendance-detail");

    // --- Current Date State ---
    const today = new Date();
    const todayMonth = today.getMonth();
    const todayYear = today.getFullYear();
    const todayDate = today.getDate();

    let year = todayYear;
    let month = todayMonth;
    let highlightedStatus = null;

    // --- Base Attendance Data ---
    const baseAttendance = {
        "2026-08": {
            3: { status: "present", checkIn: "09:02 AM", checkOut: "06:15 PM" },
            4: { status: "present", checkIn: "08:58 AM", checkOut: "06:10 PM" },
            5: { status: "late", checkIn: "09:35 AM", checkOut: "06:20 PM" },
            6: { status: "present", checkIn: "09:01 AM", checkOut: "06:05 PM" },
            7: { status: "present", checkIn: "09:04 AM", checkOut: "06:12 PM" },
            10: { status: "present", checkIn: "08:55 AM", checkOut: "06:08 PM" },
            11: { status: "present", checkIn: "09:00 AM", checkOut: "06:18 PM" },
            12: { status: "absent", checkIn: null, checkOut: null },
            13: { status: "present", checkIn: "09:03 AM", checkOut: "06:11 PM" },
            14: { status: "present", checkIn: "08:57 AM", checkOut: "06:09 PM" },
            17: { status: "late", checkIn: "09:28 AM", checkOut: "06:16 PM" },
            18: { status: "present", checkIn: "09:05 AM", checkOut: "06:13 PM" },
            19: { status: "present", checkIn: "08:59 AM", checkOut: "06:07 PM" },
            20: { status: "present", checkIn: "09:01 AM", checkOut: "06:19 PM" },
            21: { status: "absent", checkIn: null, checkOut: null },
            24: { status: "present", checkIn: "09:02 AM", checkOut: "06:14 PM" },
            25: { status: "present", checkIn: "08:56 AM", checkOut: "06:10 PM" },
            26: { status: "present", checkIn: "09:00 AM", checkOut: "06:12 PM" },
            27: { status: "late", checkIn: "09:32 AM", checkOut: "06:21 PM" },
            28: { status: "present", checkIn: "09:04 AM", checkOut: "06:08 PM" },
            31: { status: "present", checkIn: "08:58 AM", checkOut: "06:17 PM" }
        },
        "2026-09": {
            1: { status: "present", checkIn: "09:02 AM", checkOut: "06:15 PM" },
            2: { status: "present", checkIn: "08:58 AM", checkOut: "06:10 PM" },
            3: { status: "late", checkIn: "09:35 AM", checkOut: "06:20 PM" },
            4: { status: "present", checkIn: "09:01 AM", checkOut: "06:05 PM" },
            7: { status: "present", checkIn: "09:04 AM", checkOut: "06:12 PM" },
            8: { status: "present", checkIn: "08:55 AM", checkOut: "06:08 PM" },
            9: { status: "present", checkIn: "09:00 AM", checkOut: "06:18 PM" },
            10: { status: "absent", checkIn: null, checkOut: null },
            11: { status: "present", checkIn: "09:03 AM", checkOut: "06:11 PM" },
            14: { status: "present", checkIn: "09:00 AM", checkOut: "06:09 PM" },
            15: { status: "present", checkIn: "08:56 AM", checkOut: "08:05 PM" },
            16: { status: "present", checkIn: "09:04 AM", checkOut: "06:12 PM" },
            17: { status: "present", checkIn: "09:01 AM", checkOut: "06:07 PM" },
            18: { status: "leave", checkIn: null, checkOut: null, note: "Casual leave (Approved)" },
            21: { status: "present", checkIn: "08:59 AM", checkOut: "06:14 PM" },
            22: { status: "present", checkIn: "09:02 AM", checkOut: "06:10 PM" },
            23: { status: "late", checkIn: "09:27 AM", checkOut: "06:19 PM" },
            24: { status: "present", checkIn: "09:00 AM", checkOut: "06:06 PM" },
            25: { status: "present", checkIn: "08:57 AM", checkOut: "06:11 PM" },
            28: { status: "present", checkIn: "09:03 AM", checkOut: "06:15 PM" },
            29: { status: "present", checkIn: "08:58 AM", checkOut: "06:08 PM" },
            30: { status: "present", checkIn: "09:01 AM", checkOut: "06:12 PM" }
        },
        "2026-10": {
            1: { status: "present", checkIn: "09:01 AM", checkOut: "06:10 PM" },
            2: { status: "leave", checkIn: null, checkOut: null, note: "Gandhi Jayanti Holiday" },
            5: { status: "late", checkIn: "09:32 AM", checkOut: "06:18 PM" },
            6: { status: "present", checkIn: "09:04 AM", checkOut: "06:09 PM" },
            7: { status: "present", checkIn: "08:59 AM", checkOut: "06:15 PM" },
            8: { status: "absent", checkIn: null, checkOut: null },
            9: { status: "present", checkIn: "09:02 AM", checkOut: "06:11 PM" },
            12: { status: "present", checkIn: "08:56 AM", checkOut: "06:08 PM" },
            13: { status: "present", checkIn: "09:00 AM", checkOut: "06:17 PM" },
            14: { status: "late", checkIn: "09:29 AM", checkOut: "06:20 PM" },
            15: { status: "present", checkIn: "09:03 AM", checkOut: "06:13 PM" },
            16: { status: "present", checkIn: "08:58 AM", checkOut: "06:06 PM" },
            19: { status: "absent", checkIn: null, checkOut: null },
            20: { status: "present", checkIn: "09:01 AM", checkOut: "06:14 PM" },
            21: { status: "present", checkIn: "08:55 AM", checkOut: "06:10 PM" },
            22: { status: "present", checkIn: "09:04 AM", checkOut: "06:16 PM" },
            23: { status: "late", checkIn: "09:34 AM", checkOut: "06:22 PM" },
            26: { status: "present", checkIn: "09:02 AM", checkOut: "06:12 PM" },
            27: { status: "present", checkIn: "08:59 AM", checkOut: "06:09 PM" },
            28: { status: "present", checkIn: "09:00 AM", checkOut: "06:18 PM" },
            29: { status: "absent", checkIn: null, checkOut: null },
            30: { status: "present", checkIn: "09:03 AM", checkOut: "06:11 PM" }
        },
        "2026-11": {
            2: { status: "present", checkIn: "09:01 AM", checkOut: "06:11 PM" },
            3: { status: "present", checkIn: "08:57 AM", checkOut: "06:08 PM" },
            4: { status: "present", checkIn: "09:03 AM", checkOut: "06:14 PM" },
            5: { status: "late", checkIn: "09:26 AM", checkOut: "06:19 PM" },
            6: { status: "present", checkIn: "08:59 AM", checkOut: "06:09 PM" },
            9: { status: "present", checkIn: "09:00 AM", checkOut: "06:12 PM" },
            10: { status: "present", checkIn: "08:56 AM", checkOut: "06:07 PM" },
            11: { status: "present", checkIn: "09:04 AM", checkOut: "06:15 PM" },
            12: { status: "present", checkIn: "09:02 AM", checkOut: "06:10 PM" },
            13: { status: "present", checkIn: "08:58 AM", checkOut: "06:13 PM" },
            16: { status: "leave", checkIn: null, checkOut: null, note: "Annual leave (Awaited)" },
            17: { status: "leave", checkIn: null, checkOut: null, note: "Annual leave (Awaited)" },
            18: { status: "present", checkIn: "09:01 AM", checkOut: "06:10 PM" },
            19: { status: "late", checkIn: "09:31 AM", checkOut: "06:22 PM" },
            20: { status: "present", checkIn: "08:59 AM", checkOut: "06:08 PM" },
            23: { status: "present", checkIn: "09:02 AM", checkOut: "06:50 PM" },
            24: { status: "absent", checkIn: null, checkOut: null },
            25: { status: "present", checkIn: "09:00 AM", checkOut: "06:12 PM" },
            26: { status: "late", checkIn: "09:12 AM", checkOut: "06:05 PM" }
        }
    };

    // --- Scoped Styles for Dynamic Elements ---
    function injectStyles() {
        if (document.getElementById("emp-att-js-styles")) return;
        const style = document.createElement("style");
        style.id = "emp-att-js-styles";
        style.textContent = `
            .heading-chip { cursor: pointer; transition: transform 0.15s ease, box-shadow 0.15s ease; }
            .heading-chip:hover { transform: translateY(-1px); box-shadow: 0 10px 24px rgba(52, 71, 132, 0.14); }
            .today-jump-btn {
                width: auto !important;
                height: 34px !important;
                padding: 0 12px !important;
                border-radius: 999px !important;
                color: #ffffff;
                font-size: 12px;
                font-weight: 600;
            }
            .legend > div {
                cursor: pointer;
                padding: 4px 8px;
                border-radius: 6px;
                transition: background 0.15s ease;
            }
            .legend > div:hover { background: #edf1ff; }
            .legend > div.active-filter {
                background: #dfe7ff;
                color: #26376d;
                font-weight: 700;
            }
            .day.dimmed {
                opacity: 0.28;
                transform: scale(0.96);
            }
            .day.today-marker {
                outline: 2px solid #ecb131;
                outline-offset: -2px;
            }
            #status.badge-present { background: #ddf4ef; color: #087d6d; }
            #status.badge-late { background: #fff1cf; color: #a96f05; }
            #status.badge-absent { background: #ffe4e8; color: #bc304a; }
            #status.badge-leave { background: #e8ecff; color: #344784; }
            .att-mini-breakdown {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 8px;
                padding-top: 6px;
            }
            .att-mini-pill {
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.16);
                border-radius: 8px;
                padding: 8px 10px;
                text-align: center;
            }
            .att-mini-pill strong {
                display: block;
                font-size: 16px;
                color: #ffffff;
            }
            .att-mini-pill span {
                font-size: 11px;
                color: rgba(255, 255, 255, 0.72);
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
            .emp-notif-list { max-height: 300px; overflow-y: auto; padding: 8px 0; }
            .emp-notif-row {
                padding: 10px 16px;
                border-bottom: 1px solid #f1f4f9;
                font-size: 12.5px;
                color: #4b5563;
                cursor: pointer;
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
            .emp-notif-row small { display: block; margin-top: 4px; color: #9ca3af; font-size: 11px; }
        `;
        document.head.appendChild(style);
    }

    // --- Deterministic Fallback for Any Earlier Month + Synced Leaves & Today's Session ---
    function getEffectiveMonthAttendance(targetYear, targetMonth) {
        const monthKey = `${targetYear}-${String(targetMonth + 1).padStart(2, "0")}`;
        const totalDays = new Date(targetYear, targetMonth + 1, 0).getDate();
        const result = {};

        if (baseAttendance[monthKey]) {
            Object.keys(baseAttendance[monthKey]).forEach((d) => {
                result[Number(d)] = { ...baseAttendance[monthKey][d] };
            });
        } else {
            // Generate realistic records for past weekdays so no past month is ever empty or NaN%
            for (let day = 1; day <= totalDays; day++) {
                const isFuture =
                    targetYear > todayYear ||
                    (targetYear === todayYear && targetMonth > todayMonth) ||
                    (targetYear === todayYear && targetMonth === todayMonth && day > todayDate);
                const dow = new Date(targetYear, targetMonth, day).getDay();
                if (isFuture || dow === 0 || dow === 6) continue;

                const seed = (targetYear * 372 + targetMonth * 31 + day * 7) % 20;
                if (seed === 4) {
                    result[day] = { status: "absent", checkIn: null, checkOut: null };
                } else if (seed === 9 || seed === 15) {
                    result[day] = { status: "late", checkIn: `09:${24 + (day % 14)} AM`, checkOut: `06:${12 + (day % 10)} PM` };
                } else {
                    const min = String(55 + (day % 5)).padStart(2, "0");
                    const early = day % 2 === 0;
                    result[day] = {
                        status: "present",
                        checkIn: early ? `08:${min} AM` : `09:0${day % 6} AM`,
                        checkOut: `06:${String(6 + (day % 14)).padStart(2, "0")} PM`
                    };
                }
            }
        }

        // Overlay synced leaves from leave.html
        try {
            const rawLeaves = localStorage.getItem(LEAVES_KEY);
            const leaves = rawLeaves ? JSON.parse(rawLeaves) : SEED_LEAVES;
            if (Array.isArray(leaves)) {
                leaves.forEach((lv) => {
                    if (lv.status === "rejected" || !lv.from || !lv.to) return;
                    const start = new Date(`${lv.from}T00:00:00`);
                    const end = new Date(`${lv.to}T00:00:00`);
                    for (let cur = new Date(start); cur <= end; cur.setDate(cur.getDate() + 1)) {
                        if (cur.getFullYear() === targetYear && cur.getMonth() === targetMonth) {
                            const dow = cur.getDay();
                            if (dow !== 0 && dow !== 6) {
                                const dNum = cur.getDate();
                                const statusLabel = lv.status === "awaited" ? "Awaited" : "Approved";
                                result[dNum] = {
                                    status: "leave",
                                    checkIn: null,
                                    checkOut: null,
                                    note: `${lv.type} leave (${statusLabel})`,
                                    allowFutureClick: true
                                };
                            }
                        }
                    }
                });
            }
        } catch (err) {
            // Ignore malformed storage
        }

        // Overlay today's check-in/out session from portal.html
        if (targetYear === todayYear && targetMonth === todayMonth) {
            try {
                const rawSession = localStorage.getItem(TODAY_SESSION_KEY);
                const session = rawSession ? JSON.parse(rawSession) : null;
                const todayISO = `${todayYear}-${String(todayMonth + 1).padStart(2, "0")}-${String(todayDate).padStart(2, "0")}`;
                if (session && session.dateKey === todayISO && session.checkInLabel) {
                    const mins = parseTimeToMinutes(session.checkInLabel);
                    const status = mins !== null && mins > 9 * 60 + 15 ? "late" : "present";
                    result[todayDate] = {
                        status,
                        checkIn: session.checkInLabel,
                        checkOut: session.checkedOut && session.checkOutLabel ? session.checkOutLabel : "Active shift"
                    };
                }
            } catch (err) {
                // Ignore
            }
        }

        return result;
    }

    // --- Time Parsing Helpers ---
    function parseTimeToMinutes(timeStr) {
        if (!timeStr || typeof timeStr !== "string" || !timeStr.includes(":")) return null;
        const parts = timeStr.trim().split(/\s+/);
        if (parts.length < 2) return null;
        const [hStr, mStr] = parts[0].split(":");
        let hours = Number(hStr);
        const minutes = Number(mStr);
        const period = parts[1].toUpperCase();
        if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;

        if (period === "PM" && hours !== 12) hours += 12;
        if (period === "AM" && hours === 12) hours = 0;
        return hours * 60 + minutes;
    }

    function formatWorkedDuration(inStr, outStr) {
        const inMins = parseTimeToMinutes(inStr);
        const outMins = parseTimeToMinutes(outStr);
        if (inMins === null || outMins === null || outMins <= inMins) return "";
        const diff = outMins - inMins;
        const hrs = Math.floor(diff / 60);
        const mins = diff % 60;
        return ` · ${hrs}h ${String(mins).padStart(2, "0")}m worked`;
    }

    // --- Today Jump Button ---
    let todayBtn = null;
    function ensureTodayButton() {
        if (!btnGroup || todayBtn) return;
        todayBtn = document.createElement("button");
        todayBtn.type = "button";
        todayBtn.className = "today-jump-btn";
        todayBtn.textContent = "Today";
        todayBtn.title = "Jump back to current month";
        btnGroup.insertBefore(todayBtn, prevBtn);

        todayBtn.addEventListener("click", () => {
            year = todayYear;
            month = todayMonth;
            highlightedStatus = null;
            refreshAll();
        });
    }

    // --- Extra Breakdown Inside Monthly Snapshot ---
    let miniBreakdownEl = null;
    function ensureMiniBreakdown() {
        if (!attendanceDetailCard || miniBreakdownEl) return;
        const divider = document.createElement("div");
        divider.className = "checkin-divider";
        miniBreakdownEl = document.createElement("div");
        miniBreakdownEl.className = "att-mini-breakdown";
        attendanceDetailCard.append(divider, miniBreakdownEl);
    }

    // --- Render Calendar ---
    function generateCalendar() {
        if (!daysContainer) return;
        daysContainer.innerHTML = "";

        if (detailEmptyMsg) detailEmptyMsg.style.display = "block";
        if (dayDateEl) dayDateEl.textContent = "";
        if (checkInEl) checkInEl.textContent = "";
        if (checkOutEl) checkOutEl.textContent = "";
        if (attendanceStatusEl) {
            attendanceStatusEl.textContent = "";
            attendanceStatusEl.className = "";
            attendanceStatusEl.style.opacity = 0;
        }

        const viewDate = new Date(year, month, 1);
        const formattedMonthYear = viewDate.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric"
        });

        if (monthYearHeading) monthYearHeading.textContent = formattedMonthYear;
        if (currentPeriodEl) currentPeriodEl.textContent = formattedMonthYear;

        if (todayBtn) {
            todayBtn.style.display = (year === todayYear && month === todayMonth) ? "none" : "inline-flex";
        }

        const totalDays = new Date(year, month + 1, 0).getDate();
        const monthAttendance = getEffectiveMonthAttendance(year, month);

        let firstDay = new Date(year, month, 1).getDay();
        firstDay = firstDay === 0 ? 6 : firstDay - 1; // Monday = 0 ... Sunday = 6

        for (let i = 0; i < firstDay; i++) {
            const emptyBox = document.createElement("div");
            emptyBox.classList.add("empty");
            daysContainer.appendChild(emptyBox);
        }

        let autoSelectTarget = null;

        for (let day = 1; day <= totalDays; day++) {
            const validbox = document.createElement("div");
            validbox.classList.add("day");
            validbox.textContent = day;

            const date = new Date(year, month, day);
            const formattedDate = date.toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric"
            });
            const dayOfWeek = date.getDay();

            const isFuture =
                year > todayYear ||
                (year === todayYear && month > todayMonth) ||
                (year === todayYear && month === todayMonth && day > todayDate);
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
            const attendanceData = monthAttendance[day];

            if (year === todayYear && month === todayMonth && day === todayDate) {
                validbox.classList.add("today-marker");
                validbox.title = "Today";
            }

            if (isWeekend) {
                validbox.classList.add("weekend", "disabled");
                validbox.dataset.statusType = "weekend";
            } else if (attendanceData && attendanceData.status && (!isFuture || attendanceData.allowFutureClick)) {
                validbox.classList.add(attendanceData.status, "clickable");
                validbox.dataset.statusType = attendanceData.status;
                if (year === todayYear && month === todayMonth && day === todayDate) {
                    autoSelectTarget = { box: validbox, data: attendanceData, label: formattedDate };
                }
            } else if (isFuture) {
                validbox.classList.add("future", "disabled");
                validbox.dataset.statusType = "future";
            }

            if (highlightedStatus && validbox.dataset.statusType !== highlightedStatus) {
                validbox.classList.add("dimmed");
            }

            bindDayClick(validbox, isFuture, isWeekend, attendanceData, formattedDate);
            daysContainer.appendChild(validbox);
        }

        if (autoSelectTarget) {
            selectDayBox(autoSelectTarget.box, autoSelectTarget.data, autoSelectTarget.label);
        }
    }

    function selectDayBox(validbox, attendanceData, formattedDate) {
        const prevSelected = document.querySelector(".day.selected");
        if (prevSelected) prevSelected.classList.remove("selected");

        if (detailEmptyMsg) detailEmptyMsg.style.display = "none";
        validbox.classList.add("selected");

        if (dayDateEl) dayDateEl.textContent = formattedDate;

        if (attendanceData.status === "leave") {
            if (checkInEl) checkInEl.textContent = attendanceData.note || "Approved leave — excused for full day";
            if (checkOutEl) checkOutEl.textContent = "";
        } else if (!attendanceData.checkIn && !attendanceData.checkOut) {
            if (checkInEl) checkInEl.textContent = "No check-in recorded";
            if (checkOutEl) checkOutEl.textContent = "";
        } else {
            const worked = formatWorkedDuration(attendanceData.checkIn, attendanceData.checkOut);
            if (checkInEl) checkInEl.textContent = `Checked in ${attendanceData.checkIn}  —  `;
            if (checkOutEl) checkOutEl.textContent = `Out ${attendanceData.checkOut}${worked}`;
        }

        if (attendanceStatusEl) {
            attendanceStatusEl.style.opacity = 1;
            attendanceStatusEl.className = `badge-${attendanceData.status}`;
            attendanceStatusEl.textContent = attendanceData.status === "leave" ? "On leave" : attendanceData.status;
        }
    }

    function bindDayClick(validbox, isFuture, isWeekend, attendanceData, formattedDate) {
        validbox.addEventListener("click", () => {
            if (isWeekend) return;
            if (isFuture && (!attendanceData || !attendanceData.allowFutureClick)) return;
            if (!attendanceData || !attendanceData.status) return;
            selectDayBox(validbox, attendanceData, formattedDate);
        });
    }

    // --- Monthly Metrics & Legend Counts ---
    function updateMonthlyMetrics() {
        let presentDays = 0;
        let lateDays = 0;
        let absentDays = 0;
        let leaveDays = 0;

        const percentEl = document.getElementById("percent");
        const lateEl = document.getElementById("late");
        const monthAttendance = getEffectiveMonthAttendance(year, month);

        Object.keys(monthAttendance).forEach((d) => {
            const dayNum = Number(d);
            const isFuture =
                year > todayYear ||
                (year === todayYear && month > todayMonth) ||
                (year === todayYear && month === todayMonth && dayNum > todayDate);

            const rec = monthAttendance[dayNum];
            if (!rec) return;

            if (rec.status === "leave") {
                leaveDays++;
                return;
            }
            if (isFuture) return;

            if (rec.status === "present") presentDays++;
            else if (rec.status === "late") lateDays++;
            else if (rec.status === "absent") absentDays++;
        });

        const attendedDays = presentDays + lateDays;
        const workingDays = attendedDays + absentDays;

        if (percentEl) {
            percentEl.textContent = workingDays > 0
                ? `${((attendedDays / workingDays) * 100).toFixed(1)}%`
                : "N/A";
        }
        if (lateEl) {
            lateEl.textContent = String(lateDays);
        }

        if (miniBreakdownEl) {
            miniBreakdownEl.innerHTML = `
                <div class="att-mini-pill">
                    <strong>${presentDays}</strong>
                    <span>Present</span>
                </div>
                <div class="att-mini-pill">
                    <strong>${leaveDays}</strong>
                    <span>On Leave</span>
                </div>
                <div class="att-mini-pill">
                    <strong>${absentDays}</strong>
                    <span>Absent</span>
                </div>
            `;
        }

        updateLegendCounts({ present: presentDays, late: lateDays, absent: absentDays, leave: leaveDays });
        updateAverageCheckIn(monthAttendance);
    }

    function updateAverageCheckIn(monthAttendance) {
        const avgCheckInEl = document.getElementById("avg-checkIn");
        if (!avgCheckInEl) return;

        let totalMinutes = 0;
        let checkInDays = 0;

        Object.keys(monthAttendance).forEach((d) => {
            const mins = parseTimeToMinutes(monthAttendance[d].checkIn);
            if (mins !== null) {
                totalMinutes += mins;
                checkInDays++;
            }
        });

        if (checkInDays > 0) {
            const roundedAvg = Math.round(totalMinutes / checkInDays);
            let avgHours = Math.floor(roundedAvg / 60);
            const avgMins = roundedAvg % 60;
            const period = avgHours >= 12 ? "PM" : "AM";
            avgHours = avgHours % 12 || 12;

            avgCheckInEl.textContent = `${String(avgHours).padStart(2, "0")}:${String(avgMins).padStart(2, "0")} ${period}`;
        } else {
            avgCheckInEl.textContent = "N/A";
        }
    }

    // --- Interactive Legend Filtering ---
    const legendMeta = [
        { key: "present", label: "Present", boxClass: "present-box" },
        { key: "late", label: "Late", boxClass: "late-box" },
        { key: "absent", label: "Absent", boxClass: "absent-box" },
        { key: "leave", label: "On leave", boxClass: "leave-box" },
        { key: "weekend", label: "Weekend", boxClass: "weekend-box" }
    ];

    function setupInteractiveLegend() {
        const legendItems = document.querySelectorAll(".legend > div");
        legendItems.forEach((div, idx) => {
            const meta = legendMeta[idx];
            if (!meta) return;
            div.title = `Click to highlight ${meta.label.toLowerCase()} days`;
            div.addEventListener("click", () => {
                highlightedStatus = highlightedStatus === meta.key ? null : meta.key;
                legendItems.forEach((el, i) => {
                    el.classList.toggle("active-filter", legendMeta[i] && legendMeta[i].key === highlightedStatus);
                });
                generateCalendar();
            });
        });
    }

    function updateLegendCounts(counts) {
        const legendItems = document.querySelectorAll(".legend > div");
        legendItems.forEach((div, idx) => {
            const meta = legendMeta[idx];
            if (!meta) return;
            const countVal = counts[meta.key];
            const suffix = typeof countVal === "number" ? ` (${countVal})` : "";
            div.innerHTML = `<span class="legend-box ${meta.boxClass}"></span> ${meta.label}${suffix}`;
        });
    }

    // --- Navbar Notifications ---
    let notifPopover = null;
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
                ${unreadCount > 0 ? `<button type="button" id="att-mark-all-read">Mark all read</button>` : ""}
            </div>
            <div class="emp-notif-list"></div>
        `;

        const listEl = notifPopover.querySelector(".emp-notif-list");
        if (list.length === 0) {
            listEl.innerHTML = `<div class="emp-notif-row">No notifications right now.</div>`;
            return;
        }

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

        const markAllBtn = notifPopover.querySelector("#att-mark-all-read");
        if (markAllBtn) {
            markAllBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                const updated = loadNotifications().map((n) => ({ ...n, read: true }));
                localStorage.setItem(NOTIF_KEY, JSON.stringify(updated));
                renderNavNotifications();
            });
        }
    }

    // --- Month Navigation Controls ---
    function refreshAll() {
        generateCalendar();
        updateMonthlyMetrics();
    }

    if (prevBtn) {
        prevBtn.addEventListener("click", () => {
            month--;
            if (month < 0) {
                month = 11;
                year--;
            }
            refreshAll();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener("click", () => {
            month++;
            if (month > 11) {
                month = 0;
                year++;
            }
            refreshAll();
        });
    }

    if (headingChip) {
        headingChip.title = "Jump to current month";
        headingChip.addEventListener("click", () => {
            year = todayYear;
            month = todayMonth;
            highlightedStatus = null;
            refreshAll();
        });
    }

    if (navLogo) {
        navLogo.style.cursor = "pointer";
        navLogo.addEventListener("click", () => {
            window.location.href = "portal.html";
        });
    }

    // --- Initialize ---
    injectStyles();
    ensureTodayButton();
    ensureMiniBreakdown();
    setupInteractiveLegend();
    setupNavNotifications();
    refreshAll();
})();
