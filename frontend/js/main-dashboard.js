document.addEventListener("DOMContentLoaded", () => {

    // Mobile menu
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

    // Scroll progress bar
    const progressBar = document.querySelector(".scroll-progress");
    if (progressBar) {
        window.addEventListener("scroll", () => {
            const scrolled = window.scrollY;
            const total = document.body.scrollHeight - window.innerHeight;
            progressBar.style.width = `${(scrolled / total) * 100}%`;
        });
    }

    // Animated stat counters
    const animateCounter = (el) => {
        const target = parseInt(el.dataset.count, 10);
        const suffix = el.dataset.suffix || "";
        const duration = 1800;
        const step = target / (duration / 16);
        let current = 0;
        const timer = setInterval(() => {
            current = Math.min(current + step, target);
            el.textContent = Math.floor(current).toLocaleString() + suffix;
            if (current >= target) clearInterval(timer);
        }, 16);
    };

    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.querySelectorAll("[data-count]").forEach(animateCounter);
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.4 });

    const statsSection = document.querySelector(".stats-section");
    if (statsSection) statsObserver.observe(statsSection);

    // Scroll reveal for feature cards and testimonials
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("revealed");
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });

    document.querySelectorAll(".feature-card, .testimonial-card, .stat-box").forEach((el) => {
        el.classList.add("reveal");
        revealObserver.observe(el);
    });

    // Dashboard filter toggle
    const filterButton = document.querySelector(".dash-filter");
    const monthLabel = document.querySelector(".dash-subtitle");
    if (filterButton && monthLabel) {
        const periods = ["This month", "Last month"];
        let periodIndex = 0;
        filterButton.addEventListener("click", () => {
            periodIndex = (periodIndex + 1) % periods.length;
            filterButton.childNodes[0].textContent = `${periods[periodIndex]} `;
            monthLabel.textContent = periodIndex === 0 ? "September 2026" : "August 2026";
        });
    }

    // Prevent default on # links
    document.querySelectorAll('a[href="#"]').forEach((link) => {
        link.addEventListener("click", (e) => e.preventDefault());
    });
});
