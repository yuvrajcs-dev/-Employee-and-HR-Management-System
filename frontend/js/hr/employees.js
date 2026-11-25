// Shared employee data. Load this file BEFORE people.js / profile.js / add-employee.js.
const COLORS = ['var(--brand)', 'var(--clay)', 'var(--teal)', 'var(--rose)', 'var(--amber)'];
const KEY = 'hrm_new_employees';

const SEED = [
  { id: 'rahul', name: 'Rahul Sharma', role: 'Software Developer', dept: 'IT', location: 'Delhi NCR', phone: '+91 98765 43210', emergency: 'Meera Sharma', empId: 'TRL-1042', since: 'March 2024', attendance: '95%', leave: '12 days', experience: '2.4 yrs' },
  { id: 'priya', name: 'Priya Nair', role: 'UX Designer', dept: 'IT', location: 'Bengaluru', phone: '+91 98111 22001', emergency: 'Suresh Nair', empId: 'TRL-1043', since: 'June 2023', attendance: '97%', leave: '9 days', experience: '4.1 yrs' },
  { id: 'amit', name: 'Amit Verma', role: 'Backend Engineer', dept: 'IT', location: 'Pune', phone: '+91 98111 22002', emergency: 'Sunita Verma', empId: 'TRL-1044', since: 'January 2022', attendance: '93%', leave: '14 days', experience: '5.3 yrs' },
  { id: 'sana', name: 'Sana Iqbal', role: 'Marketing Lead', dept: 'Marketing', location: 'Mumbai', phone: '+91 98111 22003', emergency: 'Imran Iqbal', empId: 'TRL-1045', since: 'August 2021', attendance: '96%', leave: '8 days', experience: '7.0 yrs' },
  { id: 'karan', name: 'Karan Mehta', role: 'Content Strategist', dept: 'Marketing', location: 'Delhi NCR', phone: '+91 98111 22004', emergency: 'Rekha Mehta', empId: 'TRL-1046', since: 'November 2023', attendance: '91%', leave: '11 days', experience: '3.2 yrs' },
  { id: 'divya', name: 'Divya Rao', role: 'Financial Analyst', dept: 'Finance', location: 'Hyderabad', phone: '+91 98111 22005', emergency: 'Mohan Rao', empId: 'TRL-1047', since: 'April 2022', attendance: '98%', leave: '10 days', experience: '4.8 yrs' },
  { id: 'farhan', name: 'Farhan Ali', role: 'Accountant', dept: 'Finance', location: 'Mumbai', phone: '+91 98111 22006', emergency: 'Zoya Ali', empId: 'TRL-1048', since: 'February 2024', attendance: '94%', leave: '13 days', experience: '2.0 yrs' },
  { id: 'neha', name: 'Neha Gupta', role: 'HR Executive', dept: 'HR', location: 'Delhi NCR', phone: '+91 98111 22007', emergency: 'Rajesh Gupta', empId: 'TRL-1049', since: 'July 2023', attendance: '99%', leave: '7 days', experience: '3.5 yrs' },
  { id: 'vikram', name: 'Vikram Singh', role: 'Talent Acquisition', dept: 'HR', location: 'Pune', phone: '+91 98111 22008', emergency: 'Anita Singh', empId: 'TRL-1050', since: 'October 2022', attendance: '92%', leave: '12 days', experience: '4.4 yrs' },
].map((e, i) => ({ color: COLORS[i % COLORS.length], ...e }));

// Logged-in user. profile.html with no (or unknown) ?id= shows this one.
const ME = { id: 'ananya', name: 'Ananya Verma', role: 'HR Manager', dept: 'HR', location: 'Delhi NCR', phone: '+91 98111 22000', emergency: 'Vivek Verma', empId: 'TRL-1001', since: 'May 2019', attendance: '98%', leave: '15 days', experience: '8.2 yrs' };

function loadStored() {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; }
}
function saveStored(list) {
  try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) { /* storage blocked: employee not saved */ }
}

// Fill derived fields (initials, email, defaults) so every consumer sees the same shape.
function fill(e) {
  return {
    type: 'Full-time', manager: 'Arjun Kapoor',
    initials: e.name.split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase(),
    email: e.name.toLowerCase().trim().replace(/\s+/g, '.') + '@HRM.co',
    ...e,
  };
}

function getEmployees() { return [...SEED, ...loadStored()].map(fill); }
function getEmployee(id) { return fill([ME, ...getEmployees()].find(e => e.id === id) || ME); }
