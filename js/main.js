/**
 * Main JavaScript for samiam.info
 * Panel-based page switching
 */

document.addEventListener('DOMContentLoaded', function() {
    const panels = document.querySelectorAll('.panel');
    const panelLinks = document.querySelectorAll('[data-panel]');

    // Animated counter function
    function animateCounter(element) {
        const target = parseInt(element.dataset.target);
        const duration = 2000;
        const startTime = performance.now();

        function formatWithDigits(num, isFinal) {
            const digits = num.toString().split('');
            let html = digits.map(d => `<span class="digit">${d}</span>`).join('');
            if (isFinal) {
                html += '<span class="plus">+</span>';
            }
            return html;
        }

        function updateCount(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(easeOut * target);

            element.innerHTML = formatWithDigits(current, false);

            if (progress < 1) {
                requestAnimationFrame(updateCount);
            } else {
                element.innerHTML = formatWithDigits(target, true);
            }
        }

        requestAnimationFrame(updateCount);
    }

    function showPanel(panelId) {
        // Hide all panels
        panels.forEach(panel => {
            panel.classList.remove('panel-active');
        });

        // Show the target panel
        const targetPanel = document.getElementById(panelId);
        if (targetPanel) {
            setTimeout(() => {
                targetPanel.classList.add('panel-active');

                // Trigger counter animation on teaching panel
                if (panelId === 'teaching') {
                    const counter = targetPanel.querySelector('.counter-number');
                    if (counter) {
                        counter.innerHTML = '<span class="digit">0</span>';
                        animateCounter(counter);
                    }
                }
            }, 50);
        }

        // Update active state in navigation
        document.querySelectorAll('.nav-links a[data-panel]').forEach(link => {
            link.classList.remove('active');
            if (link.dataset.panel === panelId) {
                link.classList.add('active');
            }
        });

        // Close mobile nav if open
        const navLinks = document.querySelector('.nav-links');
        const navToggle = document.querySelector('.nav-toggle');
        if (navLinks && navToggle) {
            navLinks.classList.remove('active');
            navToggle.classList.remove('active');
            navToggle.setAttribute('aria-expanded', 'false');
        }

        // Update URL hash
        if (panelId !== 'home') {
            history.pushState(null, '', '#' + panelId);
        } else {
            history.pushState(null, '', window.location.pathname);
        }
    }

    // Add click handlers to all panel links
    panelLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const panelId = this.dataset.panel;
            if (panelId) {
                e.preventDefault();
                showPanel(panelId);
            }
        });
    });

    // Mobile navigation toggle
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            navToggle.classList.toggle('active');
            const isExpanded = navLinks.classList.contains('active');
            navToggle.setAttribute('aria-expanded', isExpanded);
        });
    }

    // Handle browser back/forward
    window.addEventListener('popstate', function() {
        const hash = window.location.hash.slice(1);
        if (hash && document.getElementById(hash)) {
            showPanel(hash);
        } else {
            showPanel('home');
        }
    });

    // Check for hash on load
    if (window.location.hash) {
        const hash = window.location.hash.slice(1);
        if (document.getElementById(hash)) {
            showPanel(hash);
        }
    }

    // Keyboard navigation - Escape returns to home
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const activePanel = document.querySelector('.panel-active');
            if (activePanel && activePanel.id !== 'home') {
                showPanel('home');
            }
        }
    });
});
