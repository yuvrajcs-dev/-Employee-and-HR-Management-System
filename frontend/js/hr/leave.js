/**
 * Trellis Workforce OS — Interactive Leave Management Module
 * Handles leave review approvals, rejections, custom reason modal, new leave requests,
 * card details inspection, filtering, search, and toast notifications.
 */

document.addEventListener("DOMContentLoaded", () => {
    // --- State & DOM References ---
    const filterChips = Array.from(document.querySelectorAll("#leave-filter-chips .chip"));
    const pendingContainer = document.getElementById("pending-cards-container");
    const decidedContainer = document.getElementById("decided-cards-container");
    const pendingSectionHeading = document.getElementById("pending-section-heading");
    const decidedSectionHeading = document.getElementById("decided-section-heading");
    const pendingEmptyState = document.getElementById("pending-empty-state");
    const pendingBadge = document.getElementById("pending-count-badge");
    const summaryText = document.getElementById("leave-summary-text");
    const searchInput = document.getElementById("leave-search-input");
    const typeFilter = document.getElementById("leave-type-filter");
    const btnNewLeave = document.getElementById("btn-new-leave");
    const toastContainer = document.getElementById("toast-container");

    // Modals
    const rejectModal = document.getElementById("reject-modal");
    const rejectModalClose = document.getElementById("reject-modal-close");
    const rejectModalCancel = document.getElementById("reject-modal-cancel");
    const rejectForm = document.getElementById("reject-form");
    const rejectReasonSelect = document.getElementById("reject-reason-select");
    const customReasonGroup = document.getElementById("custom-reason-group");
    const rejectCustomReason = document.getElementById("reject-custom-reason");
    const rejectEmployeeName = document.getElementById("reject-employee-name");

    const newLeaveModal = document.getElementById("new-leave-modal");
    const newLeaveModalClose = document.getElementById("new-leave-modal-close");
    const newLeaveModalCancel = document.getElementById("new-leave-modal-cancel");
    const newLeaveForm = document.getElementById("new-leave-form");

    const detailsModal = document.getElementById("details-modal");
    const detailsModalClose = document.getElementById("details-modal-close");
    const detailsModalDismiss = document.getElementById("details-modal-dismiss");
    const detailsModalContent = document.getElementById("details-modal-content");

    let activeFilter = "all";
    let activeType = "all";
    let searchQuery = "";
    let targetCardToReject = null;

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

    // --- Counter Updates ---
    function updateCounts() {
        const allCards = Array.from(document.querySelectorAll(".leave-card"));
        let pending = 0;
        let approved = 0;
        let rejected = 0;

        allCards.forEach((card) => {
            const status = card.getAttribute("data-status");
            if (status === "pending") pending++;
            else if (status === "approved") approved++;
            else if (status === "rejected") rejected++;
        });

        const total = allCards.length;

        const chipAll = document.getElementById("chip-count-all");
        const chipPending = document.getElementById("chip-count-pending");
        const chipApproved = document.getElementById("chip-count-approved");
        const chipRejected = document.getElementById("chip-count-rejected");

        if (chipAll) chipAll.textContent = total;
        if (chipPending) chipPending.textContent = pending;
        if (chipApproved) chipApproved.textContent = approved;
        if (chipRejected) chipRejected.textContent = rejected;

        if (pendingBadge) pendingBadge.textContent = pending;
        if (summaryText) {
            summaryText.textContent = pending === 1
                ? "1 request needs your review"
                : `${pending} requests need your review`;
        }

        if (pendingEmptyState) {
            pendingEmptyState.style.display = pending === 0 ? "block" : "none";
        }
    }

    // --- Filter & Search Application ---
    function applyFilters() {
        const allCards = Array.from(document.querySelectorAll(".leave-card"));

        allCards.forEach((card) => {
            const status = card.getAttribute("data-status");
            const name = (card.getAttribute("data-name") || "").toLowerCase();
            const type = (card.getAttribute("data-type") || "").toLowerCase();
            const reason = (card.getAttribute("data-reason") || "").toLowerCase();

            // Status filter matching
            let matchesStatus = false;
            if (activeFilter === "all") matchesStatus = true;
            else if (activeFilter === "pending" && status === "pending") matchesStatus = true;
            else if (activeFilter === "approved" && status === "approved") matchesStatus = true;
            else if (activeFilter === "rejected" && status === "rejected") matchesStatus = true;

            // Type filter matching
            let matchesType = (activeType === "all" || type.includes(activeType.toLowerCase()));

            // Search query matching
            let matchesSearch = !searchQuery || name.includes(searchQuery) || type.includes(searchQuery) || reason.includes(searchQuery);

            if (matchesStatus && matchesType && matchesSearch) {
                card.style.display = "";
            } else {
                card.style.display = "none";
            }
        });

        // Hide section headers if no children visible under that filter
        if (pendingSectionHeading && pendingContainer) {
            const hasVisiblePending = Array.from(pendingContainer.querySelectorAll(".leave-card")).some(c => c.style.display !== "none");
            pendingSectionHeading.style.display = (activeFilter === "approved" || activeFilter === "rejected" || (!hasVisiblePending && pendingContainer.children.length === 0)) ? "none" : "";
        }

        if (decidedSectionHeading && decidedContainer) {
            const hasVisibleDecided = Array.from(decidedContainer.querySelectorAll(".leave-card")).some(c => c.style.display !== "none");
            decidedSectionHeading.style.display = (activeFilter === "pending" || (!hasVisibleDecided && decidedContainer.children.length === 0)) ? "none" : "";
        }
    }

    // Filter Chips Event
    filterChips.forEach((chip) => {
        chip.addEventListener("click", () => {
            filterChips.forEach((c) => c.classList.remove("active"));
            chip.classList.add("active");
            activeFilter = chip.getAttribute("data-filter") || "all";
            applyFilters();
        });
    });

    // Search Input Event
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            searchQuery = e.target.value.trim().toLowerCase();
            applyFilters();
        });
    }

    // Leave Type Select Event
    if (typeFilter) {
        typeFilter.addEventListener("change", (e) => {
            activeType = e.target.value;
            applyFilters();
        });
    }

    // --- Action: Approve Leave Request ---
    function approveLeaveCard(card) {
        const empName = card.getAttribute("data-name") || "Employee";

        card.setAttribute("data-status", "approved");
        card.classList.add("decided");

        // Update status pill to Confirmed (teal)
        const topSection = card.querySelector(".leave-top");
        if (topSection) {
            const existingPill = topSection.querySelector(".status-pill");
            if (existingPill) {
                existingPill.className = "status-pill teal";
                existingPill.innerHTML = `<span class="status-square"></span> Confirmed`;
            }
        }

        // Update Stepper to step 4 completed
        const stepper = card.querySelector(".stepper");
        if (stepper) {
            const steps = Array.from(stepper.querySelectorAll(".step"));
            steps.forEach((step) => {
                step.className = "step done";
                const dot = step.querySelector(".step-dot");
                if (dot) dot.textContent = "✓";
            });
        }

        // Replace action buttons with approval note & details button
        const actionsRow = card.querySelector(".leave-actions");
        if (actionsRow) {
            actionsRow.className = "";
            actionsRow.style.cssText = "display:flex; justify-content:space-between; align-items:center; margin-top:12px; padding-top:12px; border-top:1px solid #f1f5f9;";
            actionsRow.innerHTML = `
                <span class="status-timestamp">Approved by Ananya Verma · Just now</span>
                <button class="details-button" data-action="view-details" style="margin:0;">View Details</button>
            `;
        }

        // Smoothly move to decided container
        if (decidedContainer) {
            card.style.transform = "scale(0.98)";
            card.style.opacity = "0.6";
            setTimeout(() => {
                decidedContainer.prepend(card);
                card.style.transform = "";
                card.style.opacity = "";
                updateCounts();
                applyFilters();
            }, 180);
        } else {
            updateCounts();
            applyFilters();
        }

        showToast(`Leave request for ${empName} approved!`, "success");
    }

    // --- Action: Reject Leave Request Flow ---
    function openRejectModal(card) {
        targetCardToReject = card;
        const empName = card.getAttribute("data-name") || "Employee";
        if (rejectEmployeeName) rejectEmployeeName.textContent = empName;
        if (rejectReasonSelect) rejectReasonSelect.value = "overlaps with a team deadline";
        if (customReasonGroup) customReasonGroup.style.display = "none";
        if (rejectCustomReason) rejectCustomReason.value = "";

        if (rejectModal) {
            rejectModal.classList.add("open");
            rejectModal.setAttribute("aria-hidden", "false");
        }
    }

    function closeRejectModal() {
        if (!rejectModal) return;
        rejectModal.classList.remove("open");
        rejectModal.setAttribute("aria-hidden", "true");
        targetCardToReject = null;
    }

    if (rejectReasonSelect) {
        rejectReasonSelect.addEventListener("change", (e) => {
            if (customReasonGroup) {
                customReasonGroup.style.display = e.target.value === "custom" ? "block" : "none";
                if (e.target.value === "custom" && rejectCustomReason) {
                    rejectCustomReason.focus();
                }
            }
        });
    }

    if (rejectModalClose) rejectModalClose.addEventListener("click", closeRejectModal);
    if (rejectModalCancel) rejectModalCancel.addEventListener("click", closeRejectModal);

    if (rejectForm) {
        rejectForm.addEventListener("submit", (e) => {
            e.preventDefault();
            if (!targetCardToReject) return;

            const card = targetCardToReject;
            const empName = card.getAttribute("data-name") || "Employee";
            let reasonText = rejectReasonSelect.value;
            if (reasonText === "custom" && rejectCustomReason && rejectCustomReason.value.trim()) {
                reasonText = rejectCustomReason.value.trim();
            }

            card.setAttribute("data-status", "rejected");
            card.classList.add("decided");

            // Update status pill to Rejected (rose)
            const topSection = card.querySelector(".leave-top");
            if (topSection) {
                const existingPill = topSection.querySelector(".status-pill");
                if (existingPill) {
                    existingPill.className = "status-pill rose";
                    existingPill.innerHTML = `<span class="status-square"></span> Rejected`;
                }
            }

            // Remove stepper & actions, append rejection message
            const stepper = card.querySelector(".stepper");
            if (stepper) stepper.remove();

            const actionsRow = card.querySelector(".leave-actions");
            if (actionsRow) actionsRow.remove();

            const messageDiv = document.createElement("div");
            messageDiv.className = "rejection-message";
            messageDiv.textContent = `Rejected by Ananya Verma · ${reasonText}`;
            card.appendChild(messageDiv);

            const detailsFoot = document.createElement("div");
            detailsFoot.style.cssText = "display:flex; justify-content:flex-end; margin-top:10px;";
            detailsFoot.innerHTML = `<button class="details-button" data-action="view-details" style="margin:0;">View Details</button>`;
            card.appendChild(detailsFoot);

            // Move to decided container
            if (decidedContainer) {
                card.style.transform = "scale(0.98)";
                card.style.opacity = "0.6";
                setTimeout(() => {
                    decidedContainer.prepend(card);
                    card.style.transform = "";
                    card.style.opacity = "";
                    updateCounts();
                    applyFilters();
                }, 180);
            } else {
                updateCounts();
                applyFilters();
            }

            closeRejectModal();
            showToast(`Leave request for ${empName} rejected.`, "warning");
        });
    }

    // --- Action: View Details Modal ---
    function openDetailsModal(card) {
        if (!detailsModal || !detailsModalContent) return;

        const name = card.getAttribute("data-name") || "Employee";
        const dept = card.getAttribute("data-dept") || "Operations";
        const type = card.getAttribute("data-type") || "Leave";
        const days = card.getAttribute("data-days") || "1";
        const dates = card.getAttribute("data-dates") || "Upcoming";
        const reason = card.getAttribute("data-reason") || "Personal reason submitted by employee.";
        const status = card.getAttribute("data-status") || "pending";
        const initials = name.split(" ").map(n => n[0]).join("");

        let statusBadgeHtml = "";
        if (status === "approved") {
            statusBadgeHtml = `<span class="status-pill teal"><span class="status-square"></span> Approved & Confirmed</span>`;
        } else if (status === "rejected") {
            statusBadgeHtml = `<span class="status-pill rose"><span class="status-square"></span> Request Rejected</span>`;
        } else {
            statusBadgeHtml = `<span class="status-pill amber"><span class="status-square"></span> Awaiting HR Approval</span>`;
        }

        detailsModalContent.innerHTML = `
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:16px;">
                <div style="display:flex; align-items:center; gap:12px;">
                    <div class="avatar-sm" style="width:42px; height:42px; font-size:14px;">${initials}</div>
                    <div>
                        <div style="font-weight:700; font-size:15px; color:#18324f;">${name}</div>
                        <div style="font-size:12px; color:#64748b;">${dept} Department</div>
                    </div>
                </div>
                ${statusBadgeHtml}
            </div>

            <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:14px; margin-bottom:16px;">
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
                    <div>
                        <div style="font-size:11px; color:#64748b; margin-bottom:2px;">LEAVE TYPE</div>
                        <div style="font-size:13px; font-weight:600; color:#18324f;">${type}</div>
                    </div>
                    <div>
                        <div style="font-size:11px; color:#64748b; margin-bottom:2px;">DURATION</div>
                        <div style="font-size:13px; font-weight:600; color:#18324f;">${days} day(s) · ${dates}</div>
                    </div>
                </div>
                <div style="margin-top:12px; padding-top:10px; border-top:1px solid #e2e8f0;">
                    <div style="font-size:11px; color:#64748b; margin-bottom:4px;">REASON GIVEN</div>
                    <div style="font-size:13px; color:#334155; line-height:1.5;">"${reason}"</div>
                </div>
            </div>

            <div class="balance-card">
                <div class="balance-card-title">Employee Leave Allowance Balance</div>
                
                <div class="balance-row">
                    <span>Annual Leave</span>
                    <strong>12 / 18 days left</strong>
                </div>
                <div class="balance-meter">
                    <div class="balance-fill" style="width: 66%;"></div>
                </div>

                <div class="balance-row">
                    <span>Sick Leave</span>
                    <strong>8 / 12 days left</strong>
                </div>
                <div class="balance-meter">
                    <div class="balance-fill" style="width: 66%; background:#10b981;"></div>
                </div>

                <div class="balance-row">
                    <span>Casual Leave</span>
                    <strong>5 / 7 days left</strong>
                </div>
                <div class="balance-meter">
                    <div class="balance-fill" style="width: 71%; background:#f59e0b;"></div>
                </div>
            </div>

            <div style="margin-top:16px;">
                <div style="font-size:12px; font-weight:600; color:#1e293b; margin-bottom:6px;">Attached Supporting Document</div>
                <a class="doc-pill" href="#" onclick="alert('Viewing document preview for ${name}'); return false;">
                    📄 ${type.toLowerCase().includes("sick") ? "medical_fit_note.pdf" : "leave_request_statement.pdf"}
                </a>
            </div>
        `;

        detailsModal.classList.add("open");
        detailsModal.setAttribute("aria-hidden", "false");
    }

    function closeDetailsModal() {
        if (!detailsModal) return;
        detailsModal.classList.remove("open");
        detailsModal.setAttribute("aria-hidden", "true");
    }

    if (detailsModalClose) detailsModalClose.addEventListener("click", closeDetailsModal);
    if (detailsModalDismiss) detailsModalDismiss.addEventListener("click", closeDetailsModal);

    // --- Action: New Leave Application Flow ---
    function openNewLeaveModal() {
        if (!newLeaveModal) return;
        newLeaveModal.classList.add("open");
        newLeaveModal.setAttribute("aria-hidden", "false");

        // Set default dates to tomorrow & day after
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dayAfter = new Date();
        dayAfter.setDate(dayAfter.getDate() + 2);

        const fromInput = document.getElementById("leave-from-date");
        const toInput = document.getElementById("leave-to-date");
        if (fromInput && !fromInput.value) fromInput.value = tomorrow.toISOString().split("T")[0];
        if (toInput && !toInput.value) toInput.value = dayAfter.toISOString().split("T")[0];
    }

    function closeNewLeaveModal() {
        if (!newLeaveModal) return;
        newLeaveModal.classList.remove("open");
        newLeaveModal.setAttribute("aria-hidden", "true");
        if (newLeaveForm) newLeaveForm.reset();
    }

    if (btnNewLeave) btnNewLeave.addEventListener("click", openNewLeaveModal);
    if (newLeaveModalClose) newLeaveModalClose.addEventListener("click", closeNewLeaveModal);
    if (newLeaveModalCancel) newLeaveModalCancel.addEventListener("click", closeNewLeaveModal);

    if (newLeaveForm) {
        newLeaveForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const name = document.getElementById("leave-emp-name").value.trim();
            const dept = document.getElementById("leave-dept").value;
            const type = document.getElementById("leave-type-select").value;
            const fromDateStr = document.getElementById("leave-from-date").value;
            const toDateStr = document.getElementById("leave-to-date").value;
            const reason = document.getElementById("leave-reason-text").value.trim();

            if (!name) return;

            // Calculate days
            let dayCount = 1;
            if (fromDateStr && toDateStr) {
                const diffTime = Math.abs(new Date(toDateStr) - new Date(fromDateStr));
                dayCount = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
            }

            // Format date text
            const formatDate = (dStr) => {
                const d = new Date(dStr);
                return d.toLocaleDateString("en-US", { day: "numeric", month: "short" });
            };
            const datesText = fromDateStr === toDateStr ? formatDate(fromDateStr) : `${formatDate(fromDateStr)} – ${formatDate(toDateStr)}`;

            // Build new card
            const newCard = document.createElement("div");
            newCard.className = "leave-card";
            newCard.setAttribute("data-id", `leave-${Date.now()}`);
            newCard.setAttribute("data-name", name);
            newCard.setAttribute("data-dept", dept);
            newCard.setAttribute("data-type", type);
            newCard.setAttribute("data-status", "pending");
            newCard.setAttribute("data-days", String(dayCount));
            newCard.setAttribute("data-dates", datesText);
            newCard.setAttribute("data-reason", reason);

            newCard.innerHTML = `
                <div class="leave-top">
                    <div>
                        <div class="leave-name">${name}</div>
                        <div class="leave-type">${type} · ${datesText} · ${dayCount} day${dayCount > 1 ? "s" : ""}</div>
                    </div>
                    <span class="status-pill amber">
                        <span class="status-square"></span> Awaiting HR
                    </span>
                </div>

                <div class="stepper">
                    <div class="step done">
                        <div class="step-line"></div>
                        <div class="step-dot">✓</div>
                        <div class="step-label">Submitted</div>
                    </div>
                    <div class="step done">
                        <div class="step-line"></div>
                        <div class="step-dot">✓</div>
                        <div class="step-label">Manager review</div>
                    </div>
                    <div class="step current">
                        <div class="step-line"></div>
                        <div class="step-dot">3</div>
                        <div class="step-label">HR approval</div>
                    </div>
                    <div class="step">
                        <div class="step-line"></div>
                        <div class="step-dot">4</div>
                        <div class="step-label">Confirmed</div>
                    </div>
                </div>

                <div class="leave-actions">
                    <button class="details-button" data-action="view-details">🔍 &nbsp; View Details</button>
                    <button class="approve-button" data-action="approve">✓ &nbsp; Approve</button>
                    <button class="reject-button" data-action="reject">× &nbsp; Reject</button>
                </div>
            `;

            if (pendingContainer) {
                pendingContainer.prepend(newCard);
            }

            closeNewLeaveModal();
            updateCounts();
            applyFilters();
            showToast(`Leave request submitted for ${name}!`, "success");
        });
    }

    // --- Delegate Clicks on Cards ---
    document.addEventListener("click", (e) => {
        const actionBtn = e.target.closest("[data-action]");
        if (!actionBtn) return;

        const card = actionBtn.closest(".leave-card");
        if (!card) return;

        const action = actionBtn.getAttribute("data-action");
        if (action === "approve") {
            approveLeaveCard(card);
        } else if (action === "reject") {
            openRejectModal(card);
        } else if (action === "view-details") {
            openDetailsModal(card);
        }
    });

    // Close modals on clicking outside or ESC
    [rejectModal, newLeaveModal, detailsModal].forEach((modal) => {
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
            closeRejectModal();
            closeNewLeaveModal();
            closeDetailsModal();
        }
    });

    // --- Initial Count & Filter Setup ---
    updateCounts();
    applyFilters();
});
