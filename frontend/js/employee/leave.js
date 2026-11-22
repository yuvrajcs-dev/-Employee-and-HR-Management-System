const remainingLeave = document.getElementById("used-leave");
const totalLeave = document.getElementById("out-of");
const leaveProgress = document.querySelector(".progress-bar");
const leaveSummary = document.getElementById("remaning-leave");
const leaveForm = document.querySelector(".leave-form");
const requestList = document.querySelector(".leave-request");
const fromDate = document.getElementById("from-date");
const toDate = document.getElementById("to-date");

function updateLeaveBalance() {
    if (!remainingLeave || !totalLeave || !leaveProgress || !leaveSummary) return;

    const remaining = Number(remainingLeave.textContent);
    const total = Number(totalLeave.textContent);
    const used = Math.max(0, total - remaining);
    const percent = total > 0 ? Math.min(100, (used / total) * 100) : 0;

    leaveProgress.style.setProperty("--leave", `${percent}%`);
    leaveSummary.textContent = remaining === 0
        ? "All leave days used"
        : `${used} days used this year`;
}

function formatDate(dateString) {
    return new Date(`${dateString}T00:00:00`).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short"
    });
}

function countDaysInclusive(startString, endString) {
    const start = new Date(`${startString}T00:00:00`);
    const end = new Date(`${endString}T00:00:00`);
    return Math.round((end - start) / 86400000) + 1;
}

function createRequestCard(type, start, end, days) {
    const card = document.createElement("article");
    card.className = "request";

    const summary = document.createElement("div");
    const title = document.createElement("h2");
    title.textContent = `${type} leave`;
    const dates = document.createElement("p");
    dates.textContent = `${formatDate(start)}–${formatDate(end)} · ${days} ${days === 1 ? "day" : "days"}`;
    summary.append(title, dates);

    const status = document.createElement("div");
    status.className = "leave-status awaited";
    status.textContent = "Awaited";
    card.append(summary, status);
    return card;
}

if (fromDate && toDate) {
    fromDate.addEventListener("change", () => {
        toDate.min = fromDate.value;
        if (toDate.value && toDate.value < fromDate.value) toDate.value = fromDate.value;
    });
}

if (leaveForm) {
    ["leave-type", "from-date", "to-date", "reason", "contact"].forEach((id) => {
        const field = document.getElementById(id);
        if (field) field.required = true;
    });

    leaveForm.addEventListener("submit", (event) => {
        event.preventDefault();
        if (!leaveForm.reportValidity()) return;

        if (toDate.value < fromDate.value) {
            toDate.setCustomValidity("The end date must be on or after the start date.");
            toDate.reportValidity();
            toDate.setCustomValidity("");
            return;
        }

        const typeSelect = document.getElementById("leave-type");
        const type = typeSelect.options[typeSelect.selectedIndex].text.replace(/\s+Leave$/i, "");
        const days = countDaysInclusive(fromDate.value, toDate.value);
        requestList.prepend(createRequestCard(type, fromDate.value, toDate.value, days));
        leaveForm.reset();
        toDate.removeAttribute("min");
    });
}

updateLeaveBalance();
