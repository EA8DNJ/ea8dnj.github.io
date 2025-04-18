document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('.header');
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const mainProjectBtn = document.querySelector('.main-project-btn');
    const mainBanner = document.querySelector('.mainbanner');
    const mainBannerContainer = document.querySelector('.mainbanner-container');

    // Función para aplicar efectos parallax
    const applyParallax = () => {
        const scrollPosition = window.scrollY;
        // Parallax para el texto
        mainBannerContainer.style.transform = `translateY(${scrollPosition * 0.3}px)`;
        // Parallax inverso para el fondo
        mainBanner.style.backgroundPositionY = `${-scrollPosition * 0.2}px`;
        // Efecto de transparencia del header
        if (scrollPosition > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };

    // Aplica parallax al cargar la página
    applyParallax();

    // Actualiza parallax durante el scroll
    window.addEventListener('scroll', applyParallax);

    // Mobile menu toggle
    menuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        mainProjectBtn.classList.toggle('active');
        menuToggle.textContent = navMenu.classList.contains('active') ? '✕' : '☰';
    });
});
