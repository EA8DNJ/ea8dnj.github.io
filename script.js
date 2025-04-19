document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('.header');
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const mainProjectBtn = document.querySelector('.main-project-btn');
    const mainBanner = document.querySelector('.mainbanner');
    const mainBannerContainer = document.querySelector('.mainbanner-container');

    // Parallax effect
    const applyParallax = () => {
        const scrollPosition = window.scrollY;
        mainBannerContainer.style.transform = `translateY(${scrollPosition * 0.3}px)`;
        mainBanner.style.backgroundPositionY = `${-scrollPosition * 0.2}px`;
        if (scrollPosition > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };

    applyParallax();
    window.addEventListener('scroll', applyParallax);

    menuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        mainProjectBtn.classList.toggle('active');
        menuToggle.textContent = navMenu.classList.contains('active') ? '✕' : '☰';
    });

    // Node data with initial positions
    function getInitialNodes(width, height) {
        const padding = 20; // Match CSS padding in #socialtree
        const adjustedWidth = width - 2 * padding;
        const adjustedHeight = height - 2 * padding;
        return [
            { id: 'deltaeco', x: padding + adjustedWidth * 0.5, y: padding + adjustedHeight * 0.2, vx: 0, vy: 0, fixed: false },
            { id: 'ea8dnj', x: padding + adjustedWidth * 0.2, y: padding + adjustedHeight * 0.5, vx: 0, vy: 0, fixed: false },
            { id: 'ea8dnj-web', x: padding + adjustedWidth * 0.1, y: padding + adjustedHeight * 0.8, vx: 0, vy: 0, fixed: false },
            { id: 'ea8dnj-qrz', x: padding + adjustedWidth * 0.3, y: padding + adjustedHeight * 0.8, vx: 0, vy: 0, fixed: false },
            { id: 'nullum', x: padding + adjustedWidth * 0.8, y: padding + adjustedHeight * 0.5, vx: 0, vy: 0, fixed: false },
            { id: 'nullum-web', x: padding + adjustedWidth * 0.7, y: padding + adjustedHeight * 0.8, vx: 0, vy: 0, fixed: false },
            { id: 'nullum-repo', x: padding + adjustedWidth * 0.9, y: padding + adjustedHeight * 0.8, vx: 0, vy: 0, fixed: false },
            { id: 'nullum-discord', x: padding + adjustedWidth * 0.8, y: padding + adjustedHeight * 0.95, vx: 0, vy: 0, fixed: false },
            { id: 'youtube', x: padding + adjustedWidth * 0.5, y: padding + adjustedHeight * 0.6, vx: 0, vy: 0, fixed: false },
            { id: 'youtube-canal', x: padding + adjustedWidth * 0.6, y: padding + adjustedHeight * 0.9, vx: 0, vy: 0, fixed: false },
            { id: 'youtube-x', x: padding + adjustedWidth * 0.7, y: padding + adjustedHeight * 0.9, vx: 0, vy: 0, fixed: false },
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
    const socialTreeBox = document.querySelector('.socialtreebox');
    let socialTreeRect = socialTree.getBoundingClientRect();
    let nodes = getInitialNodes(socialTreeRect.width, socialTreeRect.height);

    // Physics parameters
    let centripetalStrength = 0.0005;
    let repelStrength = 800;
    let linkStrength = 0.01;
    const damping = 0.9;
    const padding = 20;

    // Dragging state
    let draggedNode = null;
    let hasMoved = false;
    let startX, startY;

    function updateLines() {
        const svg = document.getElementById('lines');
        svg.innerHTML = '';
        svg.setAttribute('width', socialTreeRect.width);
        svg.setAttribute('height', socialTreeRect.height);
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
            const nodeWidth = element.offsetWidth || 15;
            const nodeHeight = element.offsetHeight || 15;
            const offsetX = nodeWidth / 2;
            const offsetY = nodeHeight / 2;
            element.style.left = `${node.x - offsetX + padding}px`;
            element.style.top = `${node.y - offsetY + padding}px`;
        });
    }

    function simulateForces() {
        const centerX = socialTreeRect.width / 2;
        const centerY = socialTreeRect.height / 2;
        const scaleFactor = Math.min(socialTreeRect.width / 1000, socialTreeRect.height / 600);

        const scaledRepelStrength = repelStrength * scaleFactor;
        const scaledLinkStrength = linkStrength * scaleFactor;
        const scaledLinkLength = 80 * scaleFactor;

        nodes.forEach(node => {
            if (node.fixed) return;

            const dx = centerX - node.x;
            const dy = centerY - node.y;
            node.vx += dx * centripetalStrength;
            node.vy += dy * centripetalStrength;

            nodes.forEach(otherNode => {
                if (node === otherNode) return;
                const dx = node.x - otherNode.x;
                const dy = node.y - otherNode.y;
                const distance = Math.max(Math.sqrt(dx * dx + dy * dy), 20 * scaleFactor);
                const force = scaledRepelStrength / (distance * distance);
                node.vx += (dx / distance) * force;
                node.vy += (dy / distance) * force;
            });

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

            node.vx *= damping;
            node.vy *= damping;
            node.x += node.vx;
            node.y += node.vy;

            const nodeWidth = document.getElementById(node.id).offsetWidth || 15;
            const nodeHeight = document.getElementById(node.id).offsetHeight || 15;
            node.x = Math.max(nodeWidth / 2 + padding, Math.min(socialTreeRect.width - nodeWidth / 2 - padding, node.x));
            node.y = Math.max(nodeHeight / 2 + padding, Math.min(socialTreeRect.height - nodeHeight / 2 - padding, node.y));
        });

        updateNodePositions();
        updateLines();
    }

    // Dragging handlers
    function startDrag(e, nodeId) {
        e.preventDefault();
        e.stopPropagation();
        draggedNode = nodes.find(n => n.id === nodeId);
        draggedNode.fixed = true;
        document.getElementById(nodeId).classList.add('dragging');
        hasMoved = false;
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
            if (Math.sqrt(dx * dx + dy * dy) > 5) {
                hasMoved = true;
                const rect = socialTree.getBoundingClientRect();
                draggedNode.x = clientX - rect.left - padding;
                draggedNode.y = clientY - rect.top - padding;
                updateNodePositions();
                updateLines();
            }
        }
    }

    function endDrag(e) {
        if (!draggedNode) return;
        document.getElementById(draggedNode.id).classList.remove('dragging');
        draggedNode.fixed = false;
        draggedNode = null;
        hasMoved = false;
    }

    nodes.forEach(node => {
        const element = document.getElementById(node.id);
        element.addEventListener('mousedown', e => startDrag(e, node.id));
        element.addEventListener('touchstart', e => startDrag(e, node.id), { passive: false });
        const link = element.querySelector('a');
        link.addEventListener('click', e => {
            if (hasMoved) {
                e.preventDefault();
                e.stopPropagation();
            } else {
                window.location.href = link.href;
            }
        });
    });

    document.addEventListener('mousemove', drag);
    document.addEventListener('touchmove', e => {
        e.preventDefault();
        drag(e);
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

    // Initialize
    function initialize() {
        socialTreeRect = socialTree.getBoundingClientRect();
        if (socialTreeRect.width === 0 || socialTreeRect.height === 0) {
            socialTreeRect = { width: socialTree.offsetWidth, height: socialTree.offsetHeight };
        }
        nodes = getInitialNodes(socialTreeRect.width, socialTreeRect.height);
        updateNodePositions();
        updateLines();
    }

    window.addEventListener('load', () => {
        setTimeout(initialize, 0);
    });
    window.addEventListener('resize', initialize);

    // Animation loop
    function animate() {
        simulateForces();
        requestAnimationFrame(animate);
    }
    animate();

    // Google Fonts
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;500&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
});
