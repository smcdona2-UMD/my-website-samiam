/**
 * Main JavaScript for samiam.info
 * Panel-based page switching
 */

document.addEventListener('DOMContentLoaded', function() {
    // Sailboat animation
    const sailboat = document.querySelector('.logo-sailboat');
    const track = document.querySelector('.sailboat-track');
    const trail = document.querySelector('.sailboat-trail');

    // Sailboat animation state
    let sailboatAnimationId = null;
    let travelAnimationId = null;
    let wavyTrailContainer = null;

    if (sailboat && track && trail) {
        const duration = 6000; // 6 seconds for full cycle
        const dashSpacing = 12; // pixels between dashes
        let lastDashPos = -1;
        let animationStart = null;
        let isPaused = false;
        let pausedAt = 0;

        // Check for reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        function easeInOut(t) {
            return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        }

        // Beyond page animation (horizontal back and forth)
        function animateBeyond(timestamp) {
            if (prefersReducedMotion) return;

            if (!animationStart) animationStart = timestamp;

            if (isPaused) {
                sailboatAnimationId = requestAnimationFrame(animateBeyond);
                return;
            }

            const elapsed = timestamp - animationStart;
            const cycle = elapsed % duration;
            const halfDuration = duration / 2;
            const trackWidth = track.offsetWidth - sailboat.offsetWidth;

            let progress, position, direction;

            if (cycle < halfDuration) {
                // Moving right
                progress = cycle / halfDuration;
                position = easeInOut(progress) * trackWidth;
                direction = 1;
            } else {
                // Moving left
                progress = (cycle - halfDuration) / halfDuration;
                position = (1 - easeInOut(progress)) * trackWidth;
                direction = -1;
            }

            // Position the sailboat
            sailboat.style.transform = `translateX(${position}px) scaleX(${direction})`;

            // Create dashes behind the boat
            const dashPos = Math.floor(position / dashSpacing) * dashSpacing;
            if (dashPos !== lastDashPos) {
                const dash = document.createElement('span');
                dash.className = 'trail-dash';
                dash.style.left = (direction === 1 ? position - 10 : position + sailboat.offsetWidth + 4) + 'px';
                trail.appendChild(dash);

                // Remove dash after animation completes
                setTimeout(() => dash.remove(), 1500);
                lastDashPos = dashPos;
            }

            sailboatAnimationId = requestAnimationFrame(animateBeyond);
        }

        // Travel page animation - island hopping with tacking
        let travelPhase = 'sailing';
        let phaseStart = null;
        let savedStartPos = null;
        let waypoints = [];
        let currentWaypoint = 0;

        function animateTravel(timestamp) {
            if (prefersReducedMotion) return;

            // Initialize
            if (!animationStart) {
                animationStart = timestamp;
                phaseStart = timestamp;
                travelPhase = 'sailing';
                currentWaypoint = 0;

                const rect = sailboat.getBoundingClientRect();
                savedStartPos = { left: rect.left, top: rect.top };

                // Get island and text positions
                const island = document.querySelector('.travel-island');
                const textBox = document.querySelector('.travel-text');

                if (!island || !textBox) {
                    // Elements not found, can't animate
                    travelAnimationId = null;
                    return;
                }

                const islandRect = island.getBoundingClientRect();
                const textRect = textBox.getBoundingClientRect();

                // Define waypoints relative to start position
                // Route: tack down-left around text, sail to island (bottom-right of text), round it, return home
                waypoints = [
                    // Tack down-left around text box
                    {
                        x: textRect.left - savedStartPos.left - 30,
                        y: textRect.bottom - savedStartPos.top - 20,
                        action: 'sail',
                        duration: 3500
                    },
                    // Sail toward island (bottom-right of text)
                    {
                        x: islandRect.left - savedStartPos.left - 15,
                        y: islandRect.top - savedStartPos.top - 10,
                        action: 'sail',
                        duration: 3500
                    },
                    // Round the island
                    {
                        x: islandRect.left - savedStartPos.left + 45,
                        y: islandRect.top - savedStartPos.top + 20,
                        action: 'round',
                        roundCenter: {
                            x: islandRect.left - savedStartPos.left + 15,
                            y: islandRect.top - savedStartPos.top + 10
                        },
                        roundRadius: 35,
                        duration: 4500
                    },
                    // Sail back upwind toward home
                    {
                        x: 80,
                        y: 40,
                        action: 'sail',
                        duration: 3500
                    },
                    // Return to home port
                    {
                        x: 0,
                        y: 0,
                        action: 'sail',
                        duration: 3000
                    }
                ];
            }

            const elapsed = timestamp - phaseStart;

            sailboat.style.position = 'fixed';
            sailboat.style.left = savedStartPos.left + 'px';
            sailboat.style.top = savedStartPos.top + 'px';
            sailboat.style.zIndex = '1001';
            sailboat.style.opacity = '1';

            if (travelPhase === 'sailing' && currentWaypoint < waypoints.length) {
                const wp = waypoints[currentWaypoint];
                const prevWp = currentWaypoint > 0 ? waypoints[currentWaypoint - 1] : { x: 0, y: 0 };
                const progress = Math.min(elapsed / wp.duration, 1);

                // Smooth easing
                const easedProgress = progress * progress * (3 - 2 * progress);

                let currentX, currentY, rotation;

                if (wp.action === 'round') {
                    // Circular motion around island
                    const startAngle = Math.atan2(prevWp.y - wp.roundCenter.y, prevWp.x - wp.roundCenter.x);
                    const endAngle = startAngle + Math.PI * 1.5; // 3/4 circle
                    const currentAngle = startAngle + (endAngle - startAngle) * easedProgress;

                    currentX = wp.roundCenter.x + Math.cos(currentAngle) * wp.roundRadius;
                    currentY = wp.roundCenter.y + Math.sin(currentAngle) * wp.roundRadius;

                    // Rotation follows the curve
                    rotation = (currentAngle * 180 / Math.PI) + 90;

                } else if (wp.action === 'anchor') {
                    // Gentle bobbing in place
                    currentX = prevWp.x + (wp.x - prevWp.x) * easedProgress;
                    currentY = prevWp.y + (wp.y - prevWp.y) * easedProgress;

                    // Gentle swaying at anchor
                    const sway = Math.sin(elapsed / 400) * 8;
                    rotation = sway;

                    // Small drift
                    currentX += Math.sin(elapsed / 800) * 3;
                    currentY += Math.cos(elapsed / 600) * 2;

                } else {
                    // Sailing with tacking motion
                    const baseX = prevWp.x + (wp.x - prevWp.x) * easedProgress;
                    const baseY = prevWp.y + (wp.y - prevWp.y) * easedProgress;

                    // Add tacking zigzag
                    const tackAmount = Math.sin(progress * Math.PI * 2) * 25;
                    currentX = baseX + tackAmount;
                    currentY = baseY;

                    // Wave bobbing
                    const bob = Math.sin(progress * Math.PI * 8) * 4;
                    currentY += bob;

                    // Rotation based on direction and tacking
                    const dx = wp.x - prevWp.x;
                    const dy = wp.y - prevWp.y;
                    const baseAngle = Math.atan2(dy, dx) * 180 / Math.PI;
                    const tackAngle = Math.cos(progress * Math.PI * 2) * 20;
                    rotation = baseAngle + tackAngle;
                }

                sailboat.style.transform = `translate(${currentX}px, ${currentY}px) rotate(${rotation}deg)`;

                // Create trail (less during anchoring)
                const trailInterval = wp.action === 'anchor' ? 300 : 100;
                if (wavyTrailContainer && elapsed % trailInterval < 20) {
                    const dash = document.createElement('span');
                    dash.className = 'wavy-trail-dash';
                    dash.style.left = (savedStartPos.left + currentX + 10) + 'px';
                    dash.style.top = (savedStartPos.top + currentY + 10) + 'px';
                    wavyTrailContainer.appendChild(dash);
                    setTimeout(() => dash.remove(), 4000);
                }

                if (progress >= 1) {
                    currentWaypoint++;
                    phaseStart = timestamp;

                    if (currentWaypoint >= waypoints.length) {
                        travelPhase = 'docking';
                        phaseStart = timestamp;
                    }
                }

                travelAnimationId = requestAnimationFrame(animateTravel);

            } else if (travelPhase === 'docking') {
                // Smooth transition back to original nav position
                const dockDuration = 1500;
                const progress = Math.min(elapsed / dockDuration, 1);
                const easedProgress = progress * progress * (3 - 2 * progress);

                // Gentle settling motion
                const settle = Math.sin(progress * Math.PI * 2) * (1 - progress) * 5;

                sailboat.style.transform = `translate(${settle}px, 0px) rotate(${settle}deg)`;

                if (progress >= 1) {
                    // Clear trail
                    if (wavyTrailContainer) wavyTrailContainer.innerHTML = '';

                    // Reset to original state
                    sailboat.style.position = '';
                    sailboat.style.left = '';
                    sailboat.style.top = '';
                    sailboat.style.transform = 'translateX(0) scaleX(1)';
                    sailboat.style.zIndex = '';
                    sailboat.style.opacity = '1';

                    travelAnimationId = null;
                    animationStart = null;
                } else {
                    travelAnimationId = requestAnimationFrame(animateTravel);
                }
            }
        }

        sailboat.addEventListener('mouseenter', () => {
            if (sailboatAnimationId) {
                isPaused = true;
                pausedAt = performance.now() - animationStart;
            }
        });

        sailboat.addEventListener('mouseleave', () => {
            if (sailboatAnimationId) {
                isPaused = false;
                animationStart = performance.now() - pausedAt;
            }
        });

        // Functions to start/stop Beyond animation
        window.startSailboatAnimation = function() {
            if (!prefersReducedMotion && !sailboatAnimationId) {
                animationStart = null;
                lastDashPos = -1;
                sailboatAnimationId = requestAnimationFrame(animateBeyond);
            }
        };

        window.stopSailboatAnimation = function() {
            // Cancel any running animations
            if (sailboatAnimationId) {
                cancelAnimationFrame(sailboatAnimationId);
                sailboatAnimationId = null;
            }
            if (travelAnimationId) {
                cancelAnimationFrame(travelAnimationId);
                travelAnimationId = null;
            }

            // Reset animation state
            animationStart = null;
            phaseStart = null;
            travelPhase = 'sailing';
            currentWaypoint = 0;
            waypoints = [];
            savedStartPos = null;
            lastDashPos = -1;
            isPaused = false;
            pausedAt = 0;

            // Reset sailboat styles completely
            sailboat.style.position = '';
            sailboat.style.left = '';
            sailboat.style.top = '';
            sailboat.style.transform = 'translateX(0) scaleX(1)';
            sailboat.style.zIndex = '';
            sailboat.style.opacity = '1';

            // Clear trails
            trail.innerHTML = '';
            if (wavyTrailContainer) {
                wavyTrailContainer.innerHTML = '';
            }
        };

        // Function to start Travel animation
        window.startTravelAnimation = function() {
            if (prefersReducedMotion) return;

            // Stop any existing animation first
            if (travelAnimationId) {
                cancelAnimationFrame(travelAnimationId);
                travelAnimationId = null;
            }

            // Reset state
            animationStart = null;
            phaseStart = null;
            travelPhase = 'sailing';
            currentWaypoint = 0;
            waypoints = [];
            savedStartPos = null;

            // Create wavy trail container if needed
            if (!wavyTrailContainer) {
                wavyTrailContainer = document.createElement('div');
                wavyTrailContainer.className = 'wavy-trail-container';
                document.body.appendChild(wavyTrailContainer);
            }
            wavyTrailContainer.innerHTML = '';

            // Reset sailboat to starting position
            sailboat.style.position = '';
            sailboat.style.left = '';
            sailboat.style.top = '';
            sailboat.style.transform = 'translateX(0) scaleX(1)';
            sailboat.style.zIndex = '';
            sailboat.style.opacity = '1';

            // Small delay to let the page settle
            setTimeout(() => {
                const travelPanel = document.getElementById('travel');
                if (travelPanel && travelPanel.classList.contains('panel-active')) {
                    travelAnimationId = requestAnimationFrame(animateTravel);
                }
            }, 600);
        };
    }
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

                // Start sailboat animation only on travel page
                if (panelId === 'travel' && window.startTravelAnimation) {
                    window.startTravelAnimation();
                } else if (window.stopSailboatAnimation) {
                    window.stopSailboatAnimation();
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
    } else {
        // Stop animation on initial home page load
        if (window.stopSailboatAnimation) {
            window.stopSailboatAnimation();
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
