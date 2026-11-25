const monthYear = document.querySelector(".month-year");
const daysContainer = document.getElementById("day-s");
const dayDate = document.getElementById("date");
const checkIn = document.getElementById("in");
const checkOut = document.getElementById("out");
const attendanceStatus = document.getElementById("status");
const detailBox = document.querySelector(".empty-message");
const currentPeriod = document.querySelector(".current-period");

const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");

// ------- We get current year and month ------------
const today = new Date();

const todayMonth = today.getMonth();
const todayYear = today.getFullYear();
const todayDate = today.getDate();

let year = todayYear;
let month = todayMonth;



// -------------Raw data---------------------
const attendance = {
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
    11: { status: "present", checkIn: "09:03 AM", checkOut: "06:11 PM" }
  },

  "2026-10": {
    1: { status: "present", checkIn: "09:01 AM", checkOut: "06:10 PM" },
    2: { status: "present", checkIn: "08:57 AM", checkOut: "06:12 PM" },
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
  }
};
  

// -------------------generateCalendar---------------------------
function generateCalendar() {

    // ---------------Remove old calendar--------------------
    daysContainer.innerHTML = "";

    detailBox.style.display = "block";
    
    dayDate.textContent = "";
    checkIn.textContent = "";
    checkOut.textContent = "";
    attendanceStatus.textContent = "";
    attendanceStatus.style.opacity = 0;

    // -------Show on Html which Month we are ON ---------------
    const getMonth = new Date(year, month);
    const formatedMonthYear = getMonth.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric"
    });
    
    const monthYearHeading = document.querySelector(".month-year-heading"); 
    monthYearHeading.textContent = formatedMonthYear;

    if (currentPeriod) {
        currentPeriod.textContent = formatedMonthYear;
    }

    // -------- Now get total Days its  30/31/28/29 ----------
    const totalDays = new Date(year, month+1, 0).getDate();
    const monthKey = `${year}-${String(month + 1).padStart(2, "0")}`;
    const monthAttendance = attendance[monthKey] || {};
    
    console.log(totalDays);
    console.log(monthKey);
    console.log(monthAttendance);
    

    // -------- We calculate weekOfday ------------------------
    let firstDay = new Date(year,month, 1).getDay();

    
    
    firstDay = firstDay === 0 ? 6 : firstDay - 1;
    console.log(firstDay);
      
    // ------------ Now we great empty box ---------------------
    for(let i=0; i<firstDay; i++){
    
        const emptyBox = document.createElement("div");
    
        emptyBox.classList.add("empty");
    
        daysContainer.appendChild(emptyBox);
    }
    
    //  --------------Now we fill vaild box ---------------
    for (let day = 1; day <= totalDays; day++) {
        
        const validbox = document.createElement("div")
        validbox.classList.add("day");
    
        // ----------Calculate Dates and SUN =0, SAT =6 ------------------------
        const date = new Date(year, month, day);
        const formattedDate = date.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric"
        });
        const dayOfWeek = date.getDay();
    
        // ---------------Check if Date is in the future-------------------
        const isFuture = year > todayYear || (year === todayYear && month > todayMonth) || (year === todayYear && month === todayMonth && day > todayDate);
        
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
        const attendanceData = monthAttendance[day];
    
        if(isFuture){
    
            validbox.classList.add("future", "disabled");
    
        }
        else if (isWeekend) {
    
            validbox.classList.add("weekend", "disabled");
    
        }
        else if(attendanceData && attendanceData.status){
            validbox.classList.add(attendanceData.status, "clickable");
        }
        // -----------------------------
        // -------Click Event-----------
        // -----------------------------
        clickToSelectBox(validbox, isFuture, isWeekend, attendanceData, formattedDate);
        
    
    
        validbox.textContent = day;
        daysContainer.appendChild(validbox);
    
        
    }
}

// --------------------------------Click Function-------------------------------------------
function clickToSelectBox(validbox, isFuture, isWeekend, attendanceData, formattedDate) {
    
    validbox.addEventListener("click", function () {

        // Don't click future or weekend
        if (isFuture || isWeekend) {
            return;
        }

        if (!attendanceData || !attendanceData.status) {
            return;
        }

        const selectedBox = document.querySelector(".selected");

        if (selectedBox) {
            selectedBox.classList.remove("selected");
        }
   
        detailBox.style.display = "none";

        validbox.classList.add("selected");

        dayDate.textContent = formattedDate;


        if(attendanceData.checkIn === null && attendanceData.checkOut === null){

            checkIn.textContent = `No check-in recorded`;

            checkOut.textContent = ``;
        }
        else{

            checkIn.textContent = `Checked in ` + attendanceData.checkIn + `  -  `;

            checkOut.textContent = ` Out ` + attendanceData.checkOut;
        }
        attendanceStatus.style.opacity = 1;
        attendanceStatus.textContent = attendanceData.status;

    });
}


// ----------------Previous Month----------------
prevBtn.addEventListener("click", function () {

    month--;

    if (month < 0) {
        month = 11;
        year--;
    }

    generateCalendar();
    percentageFinder();

});


// ----------------Next Month----------------
nextBtn.addEventListener("click", function () {

    month++;

    if (month > 11) {
        month = 0;
        year++;
    }

    generateCalendar();
    percentageFinder();

});



// -----------------Calculating Percentatge--------------
function percentageFinder() {
    let presentDays = 0;
    let workingDays = 0;
    let lateDays = 0;
    let absentDays = 0;

    const percent = document.getElementById("percent");
    const late = document.getElementById("late");

    const monthKey = `${year}-${String(month + 1).padStart(2, "0")}`;
    const monthAttendance = attendance[monthKey] || {};

    for (let day in monthAttendance) {

        if (monthAttendance[day].status === "present") {
            presentDays++;
        }

        if (monthAttendance[day].status === "late") {
            lateDays++;
        }

        if (monthAttendance[day].status === "absent") {
            absentDays++;
        }

        workingDays = presentDays + lateDays + absentDays;
    }

    percent.textContent = ((presentDays / workingDays) * 100).toFixed(2) + "%";
    late.textContent = lateDays;

    AvgChcekInFinder();
}

// -----------------Average check In time--------------
function AvgChcekInFinder() {
    let totalMinutes = 0;
    let checkInDays = 0;

    const monthKey = `${year}-${String(month + 1).padStart(2, "0")}`;
    const monthAttendance = attendance[monthKey] || {};

    const avgCheckIn = document.getElementById("avg-checkIn");

    for (let day in monthAttendance) {

        if (monthAttendance[day].checkIn !== null) {

            const parts = monthAttendance[day].checkIn.split(" ");
            const timeParts = parts[0].split(":");

            let hours = Number(timeParts[0]);
            let minutes = Number(timeParts[1]);
            const period = parts[1];

            // Convert 12-hour time to 24-hour time
            if (period === "PM" && hours !== 12) {
                hours += 12;
            }

            if (period === "AM" && hours === 12) {
                hours = 0;
            }

            totalMinutes += hours * 60 + minutes;
            checkInDays++;
        }
    }

    if (checkInDays > 0) {

        const averageMinutes = totalMinutes / checkInDays;

        let averageHours = Math.floor(averageMinutes / 60);
        let averageMins = Math.round(averageMinutes % 60);

        let averagePeriod = averageHours >= 12 ? "PM" : "AM";

        if (averageHours > 12) {
            averageHours -= 12;
        }

        if (averageHours === 0) {
            averageHours = 12;
        }

        avgCheckIn.textContent =`${String(averageHours).padStart(2, "0")}:${String(averageMins).padStart(2, "0")} ${averagePeriod}`;

    } else {
        avgCheckIn.textContent = "N/A";
    }
}


// ----------------Initial----------------
generateCalendar();
percentageFinder();
AvgChcekInFinder();