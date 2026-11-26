# 💼 HRM — Employee & HR Management System (Workforce OS)

> A modern, responsive, and dual-role Workforce Management System designed for seamless HR administration and employee self-service. Built with pure HTML5, CSS3, and modern Vanilla JavaScript with real-time `localStorage` data synchronization.

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
  - [Role-Based Access & Authentication](#1-role-based-access--authentication)
  - [Employee Self-Service Portal](#2-employee-self-service-portal)
  - [HR Management Portal](#3-hr-management-portal)
- [Tech Stack](#-tech-stack)
- [Project Directory Structure](#-project-directory-structure)
- [Getting Started](#-getting-started)
- [Demo Credentials](#-demo-credentials)
- [Cross-Page Data Synchronization](#-cross-page-data-synchronization)

---

## 🌟 Overview

The **Employee and HR Management System (HRM)** bridges the gap between organizational HR operations and employee day-to-day workflow. It provides an intuitive dual-portal experience:

1. **Employee Portal**: For tracking shifts, daily check-ins/check-outs, overtime, leave balance and requests, attendance history, payslips, and holiday calendars.
2. **HR Portal**: For executive oversight—workforce snapshots, department headcounts, real-time attendance tracking, leave request approvals/rejections, employee directory management, and payroll records.

---

## 🚀 Key Features

### 1. Role-Based Access & Authentication
- **Role Switcher**: Seamlessly switch between **HR Manager** and **Employee** roles directly from the sign-in page (`login.html`).
- **Smart Redirection**: Automatically directs users to their dedicated dashboard based on their selected role.

---

### 2. Employee Self-Service Portal

Located in `frontend/html/employee/`:

* **Workspace Dashboard (`portal.html`)**:
  * **Dynamic Greetings**: Time-of-day greeting (`Good morning / afternoon / evening, Rahul`) and live current date.
  * **Live Shift Punch & Timer**: Interactive **Check-In / Check-Out** button with live working hour calculation and overtime detection beyond shift hours (6:05 PM).
  * **Weekly Attendance Strip**: Real-time Monday-to-Friday attendance status with color-coded badges (`Present`, `Late`, `Absent`, `On leave`).
  * **Overtime Logger**: Tracks today's logged overtime and historical monthly records.
  * **Synced Leave Balance Bar**: Live visual progress meter of available vs. used leave days.
  * **Upcoming Holidays**: Real-time countdown badges (`In X days`) for forthcoming national and company holidays.
  * **Notifications & Profile Dropdowns**: Fully functional popover menus with unread indicators, read state management, and outside-click dismissal.

* **Attendance Management (`attendance.html`)**:
  * **Interactive Monthly Calendar**: Complete month-by-month navigation with weekday-aligned day grids.
  * **Cross-Module Sync**: Syncs approved/awaited leaves from `leave.html` and active check-in data from `portal.html`.
  * **Day Details Inspector**: Click on any past, present, or scheduled day to view exact check-in/out timestamps and total hours worked.
  * **Attendance Metrics**: Calculates monthly turnout percentage (`%`), average check-in time (`AM/PM`), and late arrivals.
  * **Interactive Legend Filtering**: Click any legend category (`Present`, `Late`, `Absent`, `On leave`, `Weekend`) to highlight matching days.
  * **Quick Navigation**: Instant **Today** jump button to return to the current month.

* **Leave Management (`leave.html`)**:
  * **Leave Application Form**: Supports multiple leave categories (`Casual`, `Sick`, `Earned`, `Unpaid`).
  * **Live Preview & Validation**: Automatically computes duration, checks against remaining allowance, warns about overlapping dates, and verifies contact information.
  * **Dynamic Balance Tracking**: Automatically deducts approved/requested days from the 18-day annual allowance and updates progress bars.
  * **Interactive Request Tracking**: 3-step progress bar (`Submitted` → `Manager review` → `Confirmed / Declined`) for each request.
  * **Filterable Request History**: Filter by `All`, `Awaited`, `Approved`, or `Rejected`.
  * **Request Withdrawal**: Allows employees to withdraw `Awaited` leave requests with automatic balance reimbursement.

* **Payslips & Payroll (`e-payroll.html`)**:
  * Detailed salary breakdowns including Basic Pay, HRA, Allowances, PF, Professional Tax, and TDS.
  * Dynamic month navigation for historical payslip archives.
  * Print and "Save as PDF" functionality.

* **Profile & Settings (`profiledata.html`, `settings.html`)**:
  * Personal and professional details (Employee ID, reporting manager, department, joining date).
  * Account settings, password & security, and theme preferences.

---

### 3. HR Management Portal

Located in `frontend/html/hr/`:

* **Executive Dashboard (`dashboard.html`)**:
  * **Workforce Snapshot**: Total headcounts, new hires, active today, and employees on leave.
  * **Attendance Pulse**: Live percentage bar breakdown of present, late, absent, and on-leave staff.
  * **Department Distribution**: Headcount and hiring metrics across IT, Marketing, Finance, and HR teams.
  * **Activity Timeline & Focus Strip**: Audit feed of recent employee onboardings, leave submissions, and payroll records.
  * **Search Modal**: Instant search for employees by name, role, or department.

* **People & Employee Management (`people.html`, `add-employee.html`)**:
  * Comprehensive staff directory with search and department filtering.
  * Detailed modal/profile views for each employee.
  * Add new employee workflow with automatic persistence to shared storage.

* **Attendance Oversight (`attendance.html` / `hr-attendance.html`)**:
  * Organization-wide vs. individual employee attendance calendar inspection.
  * Daily check-in table with status filtering (`Present`, `Late`, `Absent`, `On leave`).
  * Manual check-in modal and instant CSV report export.

* **Leave Approvals & Workflow (`leave.html` / `hr-leave.html`)**:
  * Review pending employee leave requests with employee allowance inspection.
  * One-click **Approve** and custom **Reject** reasons modal with toast notifications.

* **Payroll Management (`payroll.html`)**:
  * Salary distribution, deductions, and monthly payroll processing controls.

---

## 🛠 Tech Stack

- **Markup**: HTML5 (Semantic Structure, Accessible ARIA elements)
- **Styling**: CSS3 (Modern Flexbox, CSS Grid, Custom Properties / CSS Variables, Glassmorphism & Responsive Media Queries)
- **Scripting**: Vanilla JavaScript (ES6+, DOM Manipulation, Event Delegation, Custom Validators)
- **Storage**: Browser `localStorage` API for state persistence across sessions and tabs
- **Icons & Typography**:
  - [Font Awesome](https://fontawesome.com/) & [Bootstrap Icons](https://icons.getbootstrap.com/)
  - Google Fonts: *Inter*, *Fraunces*, *DM Sans*, *Playfair Display*

---

## 📁 Project Directory Structure

```text
-Employee-and-HR-Management-System/
├── README.md
├── frontend/
│   ├── index.html                      # Landing page / System index
│   ├── assest/                         # Static assets & profile images
│   │   └── ujjwal.jpg
│   ├── css/                            # Stylesheets
│   │   ├── login.css
│   │   ├── main-dashbaord.css
│   │   ├── employee/                   # Employee portal stylesheets
│   │   │   ├── attendance.css
│   │   │   ├── e-payroll.css
│   │   │   ├── leave.css
│   │   │   ├── portal.css
│   │   │   ├── profiledata.css
│   │   │   └── style.css
│   │   └── hr/                         # HR portal stylesheets
│   │       ├── add-employee.css
│   │       ├── dashboard.css
│   │       ├── hr-attendance.css
│   │       ├── hr-leave.css
│   │       ├── hr-profile.css
│   │       ├── hr-theme.css
│   │       ├── payroll.css
│   │       ├── people.css
│   │       ├── profile.css
│   │       └── style.css
│   ├── html/                           # Web pages
│   │   ├── login.html                  # Unified entry / Sign-in page
│   │   ├── employee/                   # Employee views
│   │   │   ├── portal.html             # Employee Dashboard
│   │   │   ├── attendance.html         # Employee Attendance Calendar
│   │   │   ├── leave.html              # Employee Leave Request & Balance
│   │   │   ├── e-payroll.html          # Employee Payslips
│   │   │   ├── profiledata.html        # Employee Profile
│   │   │   └── settings.html           # Employee Settings
│   │   └── hr/                         # HR Manager views
│   │       ├── dashboard.html          # HR Overview
│   │       ├── people.html             # Employee Directory
│   │       ├── add-employee.html       # Add New Employee Form
│   │       ├── attendance.html         # Organization Attendance Tracking
│   │       ├── leave.html              # Leave Review & Approvals
│   │       ├── payroll.html            # Payroll Administration
│   │       ├── departmnts.html         # Departments Overview
│   │       ├── profile.html            # HR Manager Profile
│   │       └── settings.html           # HR System Settings
│   └── js/                             # JavaScript logic
│       ├── login.js                    # Role selection & authentication
│       ├── main-dashboard.js           # Main landing page controller
│       ├── employee/                   # Employee client scripts
│       │   ├── employee-portal.js      # Dashboard widgets, live punch, overtime
│       │   ├── attendance.js           # Calendar rendering, sync, metrics
│       │   ├── leave.js                # Leave balance, validation, storage
│       │   ├── e-payroll.js            # Payslip month switcher, print
│       │   └── settings.js             # Settings & validation
│       └── hr/                         # HR admin scripts
│           ├── dashboard.js            # Analytics & search
│           ├── employees.js            # Shared employee dataset
│           ├── people.js               # Employee listing & filter
│           ├── add-employee.js         # Employee creation
│           ├── attendance.js           # Attendance grid, CSV export
│           ├── leave.js                # Leave approvals & reviews
│           ├── payroll.js              # Payroll calculation
│           ├── departmnts.js           # Department breakdown
│           ├── profile.js              # Profile editor
│           └── settings.js             # Configuration
```

---

## ⚡ Getting Started

This application requires **no external dependencies or backend build steps** to run.

### Option 1: Direct Browser Launch
1. Clone or download this repository:
   ```bash
   git clone https://github.com/yuvrajcs-dev/-Employee-and-HR-Management-System.git
   ```
2. Navigate to `frontend/html/` in your file explorer.
3. Open `login.html` in any modern web browser (Google Chrome, Microsoft Edge, Mozilla Firefox, Safari).

### Option 2: Using VS Code Live Server
1. Open the project folder in **Visual Studio Code**.
2. Install the **Live Server** extension (by *Ritwick Dey*).
3. Right-click on `frontend/html/login.html` and click **"Open with Live Server"**.

---

## 🔑 Demo Credentials

On the sign-in page (`login.html`), click either role pill to auto-fill credentials:

| Role | Default Email | Password | Target Destination |
| :--- | :--- | :--- | :--- |
| **HR Manager** | `ananya.verma@hrm.co` | `••••••••••` | `frontend/html/hr/dashboard.html` |
| **Employee** | `rahul.sharma@hrm.co` | `••••••••••` | `frontend/html/employee/portal.html` |

---

## 🔄 Cross-Page Data Synchronization

The application utilizes standardized `localStorage` keys to maintain live data synchronization between pages:

- `hrm_employee_leaves_v1`: Keeps leave applications, remaining balance, and approval status synced across `leave.html`, `attendance.html` (calendar badges), and `portal.html` (leave progress meter).
- `hrm_employee_today_session_v1`: Records live check-in and check-out timestamps, syncing today's attendance state from `portal.html` onto `attendance.html`.
- `hrm_employee_overtime_v1`: Stores overtime logs generated upon check-out, rendered in the overtime history table.
- `hrm_employee_notifications_v1`: Synchronizes notifications (leave approvals, meeting alerts, check-out events) across the navbar notification popovers.
- `hrm_new_employees`: Stores newly added employees created via the HR portal.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) — free for educational, personal, and commercial usage.
