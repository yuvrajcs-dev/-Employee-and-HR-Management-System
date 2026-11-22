function getleavePercent() {
    
    const leftLeave = Number(document.getElementById("used-leave").textContent);
    const total = parseInt(document.getElementById("out-of").textContent);
    
    let leaveUsed = ((total - leftLeave) / total) * 100;

    const bar = document.querySelector(".progress-bar");

    bar.style.setProperty("--leave", `${leaveUsed}%`);

    document.getElementById("remaning-leave").textContent = leftLeave === 0 ? `All Leaves Used`: `${total - leftLeave} days used this year`;

}

getleavePercent();

