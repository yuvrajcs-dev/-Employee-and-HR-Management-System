const attendance = [
    {
        day: "MON",
        status: "present"
    },
    {
        day: "TUE",
        status: "absent"
    },
    {
        day: "WED",
        status: "present"
    },
    {
        day: "THU",
        status: "late"
    },
    {
        day: "FRI",
        status: "weekend"
    },
    // {
    //     day: "SAT",
    //     status: "weekend"
    // },

];

const report = document.querySelector(".attendance-report");
const notification = document.querySelector(".notification");
const notificationStatus = document.querySelector(".notification-status");
const notificationRing = document.querySelector(".notification-ring");
const notificationBox = document.querySelector(".notification-box");
const profile = document.querySelector(".profile");
const profilePage = document.querySelector(".profile-page");

attendance.forEach(day => {

    const card = document.createElement("div");

    card.className = `card-${day.status}`;

    if (day.status === "present") {
        card.innerHTML = `<i class="fa-solid fa-check fa-2xs" style="color: rgb(9, 156, 112);"></i>`;
    }

    if (day.status === "absent") {
        card.innerHTML = `<i class="fa-solid fa-x fa-2xs" style="color: rgb(230, 77, 77);"></i>`;
    }

    if (day.status === "late") {
        card.innerHTML = `<span>!</span>`;
    }

    if (day.status === "weekend") {
        card.innerHTML = `<span></span>`;
    }

    report.appendChild(card);
});

// ----------------------Leave Bar-------------------------
function getleavePercent() {
    
    const leftLeave = Number(document.querySelector(".left-leave").textContent);
    const total = parseInt(document.querySelector(".out-of").textContent);
    
    let leaveUsed = ((total - leftLeave) / total) * 100;

    const bar = document.querySelector(".leave-bar");

    bar.style.setProperty("--leave", `${leaveUsed}%`);

    document.getElementById("remaining").textContent = leftLeave === 0 ? `All Leaves Used`: `${total - leftLeave} days used this year`;

}


// -------------------Notification Box------------------------
let isClicked = true;
notification.addEventListener("click", (e)=>{
    if(isClicked){
        
        notificationBox.style.opacity = 1;
        notificationBox.style.visibility= "visible";
        isClicked = false;
    }   
    else{
        notificationBox.style.opacity = 0;
        notificationBox.style.visibility= "none";
        isClicked = true;
    }
    
})

// -------------------profile Box------------------------
let isClick = true;
profile.addEventListener("click", (e)=>{
    if(isClick){
        profile.classList.toggle("active");
        profilePage.style.opacity = 1;
        profilePage.style.visibility= "visible";
        isClick = false;
    }   
    else{
        profile.classList.toggle("active");
        profilePage.style.opacity = 0;
        profilePage.style.visibility= "none";
        isClick = true;
    }
    
})

const notificationItems = document.querySelectorAll(".notification-item");

notificationItems.forEach(item => {
    const spantext = document.createElement("span");

    spantext.classList.add("unread-txt");
    spantext.innerHTML = "Unread";

    item.append(spantext);

    item.addEventListener("click", () => {


        if (item.classList.contains("read")) {
            return;
        }

        item.classList.add("read");
        spantext.classList.add("read-txt");

        const unreadNotifications = document.querySelectorAll(".notification-item:not(.read)");

        if (unreadNotifications.length === 0) {
            notificationRing.style.animation = "none";
            notificationStatus.style.display = "none";
        }
    });
});



getleavePercent();
























































































































// if (leaveUsed <= 50) {

//     bar.style.setProperty("--bar-color", "rgb(9, 156, 112)");

// } else if (leaveUsed <= 75) {

//     bar.style.setProperty("--bar-color", "rgb(221, 148, 51)");

// } else if (leaveUsed <= 90) {

//     bar.style.setProperty("--bar-color", "rgb(230, 120, 50)");

// } else if (leaveUsed <= 95) {

//     bar.style.setProperty("--bar-color", "rgb(230, 77, 77)");

// } else {

//     bar.style.setProperty("--bar-color", "rgb(180, 30, 30)");
// }