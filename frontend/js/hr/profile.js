/**
 * Trellis Workforce OS — Interactive HR Profile Module
 * Handles profile editing, avatar theme customizer, stat drilldown inspection modals,
 * responsibility shortcuts, activity logging and category filtering, and toast notifications.
 */

document.addEventListener("DOMContentLoaded", () => {
    // --- State & DOM References ---
    const btnEditProfile = document.getElementById("btn-edit-profile");
    const editModal = document.getElementById("edit-profile-modal");
    const editModalClose = document.getElementById("edit-modal-close");
    const editModalCancel = document.getElementById("edit-modal-cancel");
    const editForm = document.getElementById("edit-profile-form");
    const colorChoices = Array.from(document.querySelectorAll(".color-choice"));

    // Profile Display Elements
    const profileAvatar = document.getElementById("profile-avatar");
    const profileName = document.getElementById("profile-name");
    const profileRole = document.getElementById("profile-role");
    const profileCompany = document.getElementById("profile-company");

    // Sidebar Elements
    const sidebarAvatar = document.getElementById("sidebar-avatar");
    const sidebarName = document.getElementById("sidebar-name");
    const sidebarRole = document.getElementById("sidebar-role");

    // Personal & Professional Fields
    const infoEmail = document.getElementById("info-email");
    const infoPhone = document.getElementById("info-phone");
    const infoLocation = document.getElementById("info-location");
    const infoDob = document.getElementById("info-dob");
    const infoDepartment = document.getElementById("info-department");
    const infoRole = document.getElementById("info-role");

    // Stat Cards & Drilldown Modal
    const statCards = Array.from(document.querySelectorAll(".stat-card"));
    const statModal = document.getElementById("stat-modal");
    const statModalClose = document.getElementById("stat-modal-close");
    const statModalDismiss = document.getElementById("stat-modal-dismiss");
    const statModalTitle = document.getElementById("stat-modal-title");
    const statModalBody = document.getElementById("stat-modal-body");

    // Activity Elements
    const activityFilterPills = Array.from(document.querySelectorAll("#activity-filter-pills .activity-pill"));
    const activityList = document.getElementById("activity-list");
    const btnLogActivity = document.getElementById("btn-log-activity");
    const logActivityModal = document.getElementById("log-activity-modal");
    const logModalClose = document.getElementById("log-modal-close");
    const logModalCancel = document.getElementById("log-modal-cancel");
    const logActivityForm = document.getElementById("log-activity-form");

    // Toast Container
    const toastContainer = document.getElementById("toast-container");

    let selectedAvatarColor = "#2563eb";
    let activeActivityFilter = "all";

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

    // --- Init Profile from LocalStorage ---
    function loadSavedProfile() {
        const saved = localStorage.getItem("trellis_hr_profile");
        if (!saved) return;
        try {
            const data = JSON.parse(saved);
            if (data.name) {
                profileName.textContent = data.name;
                sidebarName.textContent = data.name;
            }
            if (data.role) {
                profileRole.textContent = data.role;
                infoRole.textContent = data.role;
                sidebarRole.textContent = data.role;
            }
            if (data.dept) {
                infoDepartment.textContent = data.dept;
                profileCompany.textContent = `${data.dept} · Trellis Technologies Pvt. Ltd.`;
            }
            if (data.email) infoEmail.textContent = data.email;
            if (data.phone) infoPhone.textContent = data.phone;
            if (data.location) infoLocation.textContent = data.location;
            if (data.dob) infoDob.textContent = data.dob;

            if (data.color) {
                selectedAvatarColor = data.color;
                if (profileAvatar) profileAvatar.style.background = data.color;
                if (sidebarAvatar) {
                    sidebarAvatar.style.background = "#eff6ff";
                    sidebarAvatar.style.color = data.color;
                }
            }

            // Init initials
            if (data.name) {
                const initials = data.name.split(" ").map(n => n[0]).join("");
                if (profileAvatar) profileAvatar.textContent = initials;
                if (sidebarAvatar) sidebarAvatar.textContent = initials;
            }
        } catch (e) {
            console.error("Error loading profile from localStorage", e);
        }
    }

    // --- Edit Profile Flow ---
    function openEditModal() {
        if (!editModal) return;

        // Populate fields from current display
        document.getElementById("edit-name").value = profileName.textContent.trim();
        document.getElementById("edit-role").value = profileRole.textContent.trim();
        document.getElementById("edit-dept").value = infoDepartment.textContent.trim();
        document.getElementById("edit-email").value = infoEmail.textContent.trim();
        document.getElementById("edit-phone").value = infoPhone.textContent.trim();
        document.getElementById("edit-location").value = infoLocation.textContent.trim();
        document.getElementById("edit-dob").value = infoDob.textContent.trim();

        // Highlight selected color
        colorChoices.forEach((choice) => {
            choice.classList.toggle("selected", choice.getAttribute("data-color") === selectedAvatarColor);
        });

        editModal.classList.add("open");
        editModal.setAttribute("aria-hidden", "false");
    }

    function closeEditModal() {
        if (!editModal) return;
        editModal.classList.remove("open");
        editModal.setAttribute("aria-hidden", "true");
    }

    if (btnEditProfile) btnEditProfile.addEventListener("click", openEditModal);
    if (profileAvatar) profileAvatar.addEventListener("click", openEditModal);
    if (editModalClose) editModalClose.addEventListener("click", closeEditModal);
    if (editModalCancel) editModalCancel.addEventListener("click", closeEditModal);

    colorChoices.forEach((choice) => {
        choice.addEventListener("click", () => {
            colorChoices.forEach(c => c.classList.remove("selected"));
            choice.classList.add("selected");
            selectedAvatarColor = choice.getAttribute("data-color");
        });
    });

    if (editForm) {
        editForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const name = document.getElementById("edit-name").value.trim();
            const role = document.getElementById("edit-role").value.trim();
            const dept = document.getElementById("edit-dept").value.trim();
            const email = document.getElementById("edit-email").value.trim();
            const phone = document.getElementById("edit-phone").value.trim();
            const location = document.getElementById("edit-location").value.trim();
            const dob = document.getElementById("edit-dob").value.trim();

            if (!name) return;

            const initials = name.split(" ").map(n => n[0]).join("");

            // Update DOM
            profileName.textContent = name;
            profileRole.textContent = role;
            profileCompany.textContent = `${dept} · Trellis Technologies Pvt. Ltd.`;
            profileAvatar.textContent = initials;
            profileAvatar.style.background = selectedAvatarColor;

            sidebarName.textContent = name;
            sidebarRole.textContent = role;
            sidebarAvatar.textContent = initials;
            sidebarAvatar.style.color = selectedAvatarColor;

            infoEmail.textContent = email;
            infoPhone.textContent = phone;
            infoLocation.textContent = location;
            infoDob.textContent = dob;
            infoDepartment.textContent = dept;
            infoRole.textContent = role;

            // Save to localStorage
            const profileData = { name, role, dept, email, phone, location, dob, color: selectedAvatarColor };
            localStorage.setItem("trellis_hr_profile", JSON.stringify(profileData));

            // Log activity to feed
            addActivityItem("employee", "Updated personal and professional profile details", "Just now", "green");

            closeEditModal();
            showToast("Profile updated successfully!", "success");
        });
    }

    // --- Stat Drilldown Modals ---
    const statData = {
        employees: {
            title: "Total Employees Breakdown (124 Headcount)",
            content: `
                <p style="font-size:12px; color:#64748b; margin-bottom:14px;">Active employee workforce distribution across operating departments:</p>
                <div class="breakdown-row">
                    <span class="breakdown-dept">Engineering & Product</span>
                    <span class="breakdown-count">58 members (46.8%)</span>
                </div>
                <div class="breakdown-row">
                    <span class="breakdown-dept">Marketing & Brand</span>
                    <span class="breakdown-count">22 members (17.7%)</span>
                </div>
                <div class="breakdown-row">
                    <span class="breakdown-dept">Operations & Support</span>
                    <span class="breakdown-count">18 members (14.5%)</span>
                </div>
                <div class="breakdown-row">
                    <span class="breakdown-dept">Finance & Accounts</span>
                    <span class="breakdown-count">14 members (11.3%)</span>
                </div>
                <div class="breakdown-row">
                    <span class="breakdown-dept">People & Culture (HR)</span>
                    <span class="breakdown-count">8 members (6.5%)</span>
                </div>
                <div class="breakdown-row">
                    <span class="breakdown-dept">Sales & Expansion</span>
                    <span class="breakdown-count">4 members (3.2%)</span>
                </div>
            `
        },
        requests: {
            title: "Pending Requests (8 Actions Required)",
            content: `
                <p style="font-size:12px; color:#64748b; margin-bottom:14px;">Current queue of items pending review and sign-off:</p>
                <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:12px; margin-bottom:10px;">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <strong>Leave Requests (2 pending)</strong>
                        <a href="leave.html" style="font-size:12px; color:#2563eb; text-decoration:none; font-weight:600;">Review in Leave &rarr;</a>
                    </div>
                    <p style="font-size:11px; color:#64748b; margin-top:4px;">Priya Nair (Sick leave, 2 days), Karan Mehta (Casual leave, 1 day)</p>
                </div>
                <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:12px; margin-bottom:10px;">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <strong>New Hire Document Verification (3)</strong>
                        <span style="font-size:11px; background:#eff6ff; color:#1d4ed8; padding:2px 8px; border-radius:10px; font-weight:600;">Onboarding</span>
                    </div>
                    <p style="font-size:11px; color:#64748b; margin-top:4px;">Awaiting background check verification for upcoming engineering recruits.</p>
                </div>
                <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:12px;">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <strong>Employee Expense Claims (3)</strong>
                        <span style="font-size:11px; background:#fef3c7; color:#92400e; padding:2px 8px; border-radius:10px; font-weight:600;">Payroll Ops</span>
                    </div>
                    <p style="font-size:11px; color:#64748b; margin-top:4px;">Q3 travel and home-office equipment reimbursement submissions.</p>
                </div>
            `
        },
        reviews: {
            title: "Performance Reviews Cycle (3 Scheduled)",
            content: `
                <p style="font-size:12px; color:#64748b; margin-bottom:14px;">Q3 Talent Growth & Review timeline for this quarter:</p>
                <div class="breakdown-row">
                    <div>
                        <div class="breakdown-dept">Senior Frontend Engineer — Promotion Review</div>
                        <div style="font-size:11px; color:#64748b;">Candidate: Rahul Sharma · Reviewer: Tech Lead & Ananya Verma</div>
                    </div>
                    <span class="breakdown-count" style="background:#fef3c7; color:#92400e;">Due Sep 25</span>
                </div>
                <div class="breakdown-row">
                    <div>
                        <div class="breakdown-dept">Probation Period Evaluation</div>
                        <div style="font-size:11px; color:#64748b;">Candidate: Sana Iqbal · Marketing Department</div>
                    </div>
                    <span class="breakdown-count">Due Sep 28</span>
                </div>
                <div class="breakdown-row">
                    <div>
                        <div class="breakdown-dept">Mid-Year Management 360 Feedback</div>
                        <div style="font-size:11px; color:#64748b;">Operations Leadership Team</div>
                    </div>
                    <span class="breakdown-count">Due Oct 5</span>
                </div>
            `
        },
        tenure: {
            title: "Ananya's Career Journey at Trellis",
            content: `
                <p style="font-size:12px; color:#64748b; margin-bottom:14px;">2.4 years of service building culture and workforce operations:</p>
                <div style="position:relative; padding-left:20px; border-left:2px solid #2563eb; display:flex; flex-direction:column; gap:14px;">
                    <div>
                        <div style="font-size:11px; color:#2563eb; font-weight:700;">JANUARY 2025 – PRESENT</div>
                        <div style="font-weight:600; font-size:13px; color:#18324f;">Promoted to HR Manager</div>
                        <div style="font-size:12px; color:#64748b;">Leading talent onboarding, attendance policies, and employee wellness initiatives.</div>
                    </div>
                    <div>
                        <div style="font-size:11px; color:#64748b; font-weight:700;">MARCH 2024</div>
                        <div style="font-weight:600; font-size:13px; color:#18324f;">Joined Trellis Technologies</div>
                        <div style="font-size:12px; color:#64748b;">Joined as People Operations Specialist in the People & Culture team.</div>
                    </div>
                </div>
            `
        }
    };

    statCards.forEach((card) => {
        card.addEventListener("click", () => {
            const statKey = card.getAttribute("data-stat");
            const data = statData[statKey];
            if (!data || !statModal || !statModalBody) return;

            statModalTitle.textContent = data.title;
            statModalBody.innerHTML = data.content;
            statModal.classList.add("open");
            statModal.setAttribute("aria-hidden", "false");
        });
    });

    function closeStatModal() {
        if (!statModal) return;
        statModal.classList.remove("open");
        statModal.setAttribute("aria-hidden", "true");
    }

    if (statModalClose) statModalClose.addEventListener("click", closeStatModal);
    if (statModalDismiss) statModalDismiss.addEventListener("click", closeStatModal);

    // --- Interactive Responsibilities Modal Trigger ---
    document.querySelectorAll(".responsibility-card[data-responsibility]").forEach((card) => {
        card.addEventListener("click", () => {
            const resp = card.getAttribute("data-responsibility");
            if (resp === "employees") {
                statModalTitle.textContent = "Employee Management Hub";
                statModalBody.innerHTML = `
                    <p style="font-size:12px; color:#64748b; margin-bottom:14px;">Direct employee management tools:</p>
                    <div style="display:flex; flex-direction:column; gap:8px;">
                        <a href="people.html" style="padding:10px 14px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; text-decoration:none; color:#18324f; font-weight:600; font-size:13px;">
                            👥 View All 124 Employee Profiles &rarr;
                        </a>
                        <button onclick="alert('Exporting full employee directory CSV...');" class="btn-ghost" style="text-align:left;">
                            📥 Export Employee Directory CSV
                        </button>
                    </div>
                `;
                statModal.classList.add("open");
            } else if (resp === "payroll") {
                statModalTitle.textContent = "Payroll Overview";
                statModalBody.innerHTML = `
                    <p style="font-size:12px; color:#64748b; margin-bottom:14px;">Monthly employee compensation & disbursement status:</p>
                    <div style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:8px; padding:12px; margin-bottom:10px;">
                        <div style="font-weight:700; color:#1d4ed8; font-size:13px;">✓ August 2026 Payroll Completed</div>
                        <div style="font-size:11px; color:#475569; margin-top:2px;">Disbursed 124 payslips successfully on Aug 31.</div>
                    </div>
                    <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:12px;">
                        <div style="font-weight:600; color:#18324f; font-size:13px;">⏳ September 2026 Payroll Cutoff</div>
                        <div style="font-size:11px; color:#64748b; margin-top:2px;">Attendance sync and tax deductions finalize on Sep 28.</div>
                    </div>
                `;
                statModal.classList.add("open");
            }
        });
    });

    // --- Activity Feed Management ---
    function addActivityItem(category, text, time = "Just now", dotColor = "green") {
        if (!activityList) return;
        const div = document.createElement("div");
        div.className = "activity";
        div.setAttribute("data-category", category);
        div.innerHTML = `
            <div class="activity-dot ${dotColor}"></div>
            <div>
                <div class="activity-time">${time}</div>
                <div class="activity-text">${text}</div>
            </div>
            <button class="activity-delete-btn" title="Remove activity log">&times;</button>
        `;
        activityList.prepend(div);
        filterActivities();
    }

    function filterActivities() {
        if (!activityList) return;
        const items = Array.from(activityList.querySelectorAll(".activity"));
        items.forEach((item) => {
            const cat = item.getAttribute("data-category") || "";
            if (activeActivityFilter === "all" || cat === activeActivityFilter) {
                item.style.display = "flex";
            } else {
                item.style.display = "none";
            }
        });
    }

    activityFilterPills.forEach((pill) => {
        pill.addEventListener("click", () => {
            activityFilterPills.forEach(p => p.classList.remove("active"));
            pill.classList.add("active");
            activeActivityFilter = pill.getAttribute("data-filter") || "all";
            filterActivities();
        });
    });

    // Delete individual activity
    if (activityList) {
        activityList.addEventListener("click", (e) => {
            if (e.target.classList.contains("activity-delete-btn")) {
                const item = e.target.closest(".activity");
                if (item) {
                    item.style.opacity = "0";
                    item.style.transform = "translateX(10px)";
                    setTimeout(() => {
                        item.remove();
                        showToast("Activity record removed.", "info");
                    }, 180);
                }
            }
        });
    }

    // Log Activity Modal
    function openLogModal() {
        if (!logActivityModal) return;
        logActivityModal.classList.add("open");
        logActivityModal.setAttribute("aria-hidden", "false");
        const textarea = document.getElementById("activity-text-input");
        if (textarea) textarea.focus();
    }

    function closeLogModal() {
        if (!logActivityModal) return;
        logActivityModal.classList.remove("open");
        logActivityModal.setAttribute("aria-hidden", "true");
        if (logActivityForm) logActivityForm.reset();
    }

    if (btnLogActivity) btnLogActivity.addEventListener("click", openLogModal);
    if (logModalClose) logModalClose.addEventListener("click", closeLogModal);
    if (logModalCancel) logModalCancel.addEventListener("click", closeLogModal);

    if (logActivityForm) {
        logActivityForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const category = document.getElementById("activity-category-select").value;
            const text = document.getElementById("activity-text-input").value.trim();
            if (!text) return;

            let dotColor = "green";
            if (category === "leave") dotColor = "green";
            else if (category === "employee") dotColor = "yellow";
            else if (category === "payroll") dotColor = "blue";
            else if (category === "attendance") dotColor = "green";

            addActivityItem(category, text, "Just now", dotColor);
            closeLogModal();
            showToast("Activity logged to feed!", "success");
        });
    }

    // Modal click outside & ESC
    [editModal, statModal, logActivityModal].forEach((modal) => {
        if (!modal) return;
        modal.addEventListener("click", (e) => {
            if (e.target === modal) {
                modal.classList.remove("open");
                modal.setAttribute("aria-hidden", "true");
            }
        });
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            closeEditModal();
            closeStatModal();
            closeLogModal();
        }
    });

    // --- Init on Page Load ---
    loadSavedProfile();
    filterActivities();
});
