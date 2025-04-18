document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('.header');
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const mainProjectBtn = document.querySelector('.main-project-btn');
    const mainBanner = document.querySelector('.mainbanner');
    const mainBannerContainer = document.querySelector('.mainbanner-container');

    // Header scroll effect and parallax
    window.addEventListener('scroll', () => {
        // Header transparency
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // Parallax effect for main banner text
        const scrollPosition = window.scrollY;
        mainBannerContainer.style.transform = `translateY(${scrollPosition * 0.3}px)`;

        // Inverse parallax effect for main banner background
        mainBanner.style.backgroundPositionY = `${-scrollPosition * 0.2}px`;
    });

    // Mobile menu toggle
    menuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        mainProjectBtn.classList.toggle('active');
        menuToggle.textContent = navMenu.classList.contains('active') ? '✕' : '☰';
    });
});
