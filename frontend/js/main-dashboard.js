document.addEventListener("DOMContentLoaded", () => {
    const menuButton = document.querySelector(".mobile-menu");
    const mainNav = document.querySelector(".main-nav");

    if (menuButton && mainNav) {
        menuButton.setAttribute("aria-expanded", "false");

        menuButton.addEventListener("click", () => {
            const isOpen = mainNav.classList.toggle("open");
            menuButton.setAttribute("aria-expanded", String(isOpen));
            menuButton.querySelector("i")?.classList.toggle("fa-bars", !isOpen);
            menuButton.querySelector("i")?.classList.toggle("fa-xmark", isOpen);
        });

        mainNav.querySelectorAll("a").forEach((link) => {
            link.addEventListener("click", () => {
                mainNav.classList.remove("open");
                menuButton.setAttribute("aria-expanded", "false");
            });
        });
    }

    const filterButton = document.querySelector(".dash-filter");
    const monthLabel = document.querySelector(".dash-subtitle");

    if (filterButton && monthLabel) {
        const periods = ["This month", "Last month"];
        let periodIndex = 0;

        filterButton.addEventListener("click", () => {
            periodIndex = (periodIndex + 1) % periods.length;
            filterButton.childNodes[0].textContent = `${periods[periodIndex]} `;
            monthLabel.textContent =
                periodIndex === 0 ? "September 2026" : "August 2026";
        });
    }

    document.querySelectorAll('a[href="#"]').forEach((link) => {
        link.addEventListener("click", (event) => event.preventDefault());
    });
});
