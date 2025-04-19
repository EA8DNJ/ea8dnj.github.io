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

    // Node data with initial positions (relative to container width/height)
    function getInitialNodes(width, height) {
        return [
            { id: 'deltaeco', x: width * 0.5, y: height * 0.2, vx: 0, vy: 0, fixed: false },
            { id: 'ea8dnj', x: width * 0.2, y: height * 0.5, vx: 0, vy: 0, fixed: false },
            { id: 'ea8dnj-web', x: width * 0.1, y: height * 0.8, vx: 0, vy: 0, fixed: false },
            { id: 'ea8dnj-qrz', x: width * 0.3, y: height * 0.8, vx: 0, vy: 0, fixed: false },
            { id: 'nullum', x: width * 0.8, y: height * 0.5, vx: 0, vy: 0, fixed: false },
            { id: 'nullum-web', x: width * 0.7, y: height * 0.8, vx: 0, vy: 0, fixed: false },
            { id: 'nullum-repo', x: width * 0.9, y: height * 0.8, vx: 0, vy: 0, fixed: false },
            { id: 'nullum-discord', x: width * 0.8, y: height * 0.95, vx: 0, vy: 0, fixed: false },
            { id: 'youtube', x: width * 0.5, y: height * 0.6, vx: 0, vy: 0, fixed: false },
            { id: 'youtube-canal', x: width * 0.6, y: height * 0.9, vx: 0, vy: 0, fixed: false },
            { id: 'youtube-x', x: width * 0.7, y: height * 0.9, vx: 0, vy: 0, fixed: false },
        ];
    }

    const links = [
        { source: 'deltaeco', target: 'ea8dnj' },
        { source: 'ea8dnj', target: 'ea8dnj-web' },
        { source: 'ea8dnj', target: 'ea8dnj-qrz' },
        { source: 'deltaeco', target: 'nullum' },
        { source: 'nullum', target: 'nullum-web' },
        { source: 'nullum', target: 'nullum-repo' },
        { source: 'nullum', target: 'nullum-discord' },
        { source: 'deltaeco', target: 'youtube' },
        { source: 'youtube', target: 'youtube-canal' },
        { source: 'youtube', target: 'youtube-x' },
        { source: 'youtube-canal', target: 'nullum-web' },
        { source: 'youtube-canal', target: 'nullum-discord' },
    ];

    const socialTree = document.getElementById('socialtree');
    const svg = document.getElementById('lines');
    let socialTreeRect = socialTree.getBoundingClientRect();
    let nodes = getInitialNodes(socialTreeRect.width, socialTreeRect.height);

    // Physics parameters
    let centripetalStrength = 0.0005;
    let repelStrength = 800;
    let linkStrength = 0.01;
    const damping = 0.9;

    // Dragging state
    let draggedNode = null;
    let isDragging = false;
    let startX, startY;

    function updateLines() {
        svg.innerHTML = '';
        svg.setAttribute('viewBox', `0 0 ${socialTreeRect.width} ${socialTreeRect.height}`);
        svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

        links.forEach(link => {
            const lineElement = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            lineElement.setAttribute('class', 'line');
            lineElement.setAttribute('id', `line-${link.source}-${link.target}`);

            const sourceNode = nodes.find(n => n.id === link.source);
            const targetNode = nodes.find(n => n.id === link.target);

            lineElement.setAttribute('x1', sourceNode.x);
            lineElement.setAttribute('y1', sourceNode.y);
            lineElement.setAttribute('x2', targetNode.x);
            lineElement.setAttribute('y2', targetNode.y);
            svg.appendChild(lineElement);
        });
    }

    function updateNodePositions() {
        nodes.forEach(node => {
            const element = document.getElementById(node.id);
            // Centrar el nodo ajustando por su tamaño (15px / 2)
            const offsetX = element.offsetWidth / 2;
            const offsetY = element.offsetHeight / 2;
            element.style.left = `${node.x - offsetX}px`;
            element.style.top = `${node.y - offsetY}px`;
        });
    }

    function simulateForces() {
        const centerX = socialTreeRect.width / 2;
        const centerY = socialTreeRect.height / 2;
        const scaleFactor = Math.min(socialTreeRect.width / 1000, socialTreeRect.height / 400);

        // Scale physics parameters based on container size
        const scaledRepelStrength = repelStrength * scaleFactor;
        const scaledLinkStrength = linkStrength * scaleFactor;
        const scaledLinkLength = 80 * scaleFactor;

        nodes.forEach(node => {
            if (node.fixed) return;

            // Centripetal force
            const dx = centerX - node.x;
            const dy = centerY - node.y;
            node.vx += dx * centripetalStrength;
            node.vy += dy * centripetalStrength;

            // Repel force
            nodes.forEach(otherNode => {
                if (node === otherNode) return;
                const dx = node.x - otherNode.x;
                const dy = node.y - otherNode.y;
                const distance = Math.max(Math.sqrt(dx * dx + dy * dy), 20 * scaleFactor);
                const force = scaledRepelStrength / (distance * distance);
                node.vx += (dx / distance) * force;
                node.vy += (dy / distance) * force;
            });

            // Link force
            links.forEach(link => {
                if (link.source === node.id) {
                    const targetNode = nodes.find(n => n.id === link.target);
                    const dx = targetNode.x - node.x;
                    const dy = targetNode.y - node.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    const force = (distance - scaledLinkLength) * scaledLinkStrength;
                    node.vx += (dx / distance) * force;
                    node.vy += (dy / distance) * force;
                } else if (link.target === node.id) {
                    const sourceNode = nodes.find(n => n.id === link.source);
                    const dx = sourceNode.x - node.x;
                    const dy = sourceNode.y - node.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    const force = (distance - scaledLinkLength) * scaledLinkStrength;
                    node.vx += (dx / distance) * force;
                    node.vy += (dy / distance) * force;
                }
            });

            // Apply velocity with damping
            node.vx *= damping;
            node.vy *= damping;
            node.x += node.vx;
            node.y += node.vy;

            // Constrain to bounds
            node.x = Math.max(7.5, Math.min(socialTreeRect.width - 7.5, node.x));
            node.y = Math.max(7.5, Math.min(socialTreeRect.height - 7.5, node.y));
        });

        updateNodePositions();
        updateLines();
    }

    // Dragging handlers
    function startDrag(e, nodeId) {
        e.preventDefault();
        draggedNode = nodes.find(n => n.id === nodeId);
        draggedNode.fixed = true;
        document.getElementById(nodeId).classList.add('dragging');
        isDragging = false;
        startX = e.clientX || (e.touches && e.touches[0].clientX);
        startY = e.clientY || (e.touches && e.touches[0].clientY);
    }

    function drag(e) {
        if (!draggedNode) return;
        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        const clientY = e.clientY || (e.touches && e.touches[0].clientY);
        if (clientX && clientY) {
            const dx = clientX - startX;
            const dy = clientY - startY;
            // Considerar arrastre si el movimiento excede 5px
            if (Math.sqrt(dx * dx + dy * dy) > 5) {
                isDragging = true;
                const rect = socialTree.getBoundingClientRect();
                draggedNode.x = clientX - rect.left;
                draggedNode.y = clientY - rect.top;
                updateNodePositions();
                updateLines();
            }
        }
    }

    function endDrag(e) {
        if (!draggedNode) return;
        document.getElementById(draggedNode.id).classList.remove('dragging');
        draggedNode.fixed = false;
        
        // Solo abrir el enlace si NO se detectó arrastre
        if (!isDragging) {
            const link = document.getElementById(draggedNode.id).querySelector('a');
            if (link && link.href && link.href !== '#') {
                window.location.href = link.href;
            }
        }
        
        draggedNode = null;
        isDragging = false;
    }

    nodes.forEach(node => {
        const element = document.getElementById(node.id);
        element.addEventListener('mousedown', e => startDrag(e, node.id));
        element.addEventListener('touchstart', e => startDrag(e, node.id), { passive: false });
    });

    document.addEventListener('mousemove', drag);
    document.addEventListener('touchmove', e => {
        e.preventDefault();
        drag(e.touches[0]);
    }, { passive: false });
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchend', endDrag);

    // Glow effect
    document.addEventListener('mousemove', (e) => {
        const nodes = document.querySelectorAll('.node.glow');
        nodes.forEach(node => {
            const rect = node.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const dx = e.clientX - centerX;
            const dy = e.clientY - centerY;
            const angle = Math.atan2(dy, dx);
            const distance = Math.min(Math.sqrt(dx * dx + dy * dy), 40);
            const glowX = -Math.cos(angle) * distance * 0.15;
            const glowY = -Math.sin(angle) * distance * 0.15;
            node.style.boxShadow = `0 0 6px rgba(0, 255, 153, 0.3), ${glowX}px ${glowY}px 8px rgba(0, 255, 153, 0.4)`;
        });
    });

    // Animation loop
    function animate() {
        simulateForces();
        requestAnimationFrame(animate);
    }

    // Initialize
    window.addEventListener('load', () => {
        socialTreeRect = socialTree.getBoundingClientRect();
        nodes = getInitialNodes(socialTreeRect.width, socialTreeRect.height);
        updateNodePositions();
        updateLines();
        animate();
    });

    window.addEventListener('resize', () => {
        socialTreeRect = socialTree.getBoundingClientRect();
        nodes = getInitialNodes(socialTreeRect.width, socialTreeRect.height);
        updateNodePositions();
        updateLines();
    });

    // Google Fonts
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;500&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
});
