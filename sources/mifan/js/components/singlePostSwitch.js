export default function singlePostSwitch() {
    const buttons = document.querySelectorAll('[content-index]');
    const sections = document.querySelectorAll('[content-id]');
    const grid = document.querySelector('.single-post-page .grid');
    
    if (buttons.length === 0 || sections.length === 0 || !grid) return;

    let isActive = false;
    let clickHandlers = [];
    
    // Touch tracking to distinguish tap from scroll
    let touchStartY = 0;
    let touchStartX = 0;
    let isTouchMoving = false;

    // Check if viewport is mobile/tablet (<= 1023px)
    const isMobileView = () => window.innerWidth <= 1023;

    // Reset to desktop state: show all sections
    const setDesktopState = () => {
        sections.forEach(section => {
            section.style.display = '';
            section.classList.remove('is-active', 'is-hidden');
        });

        buttons.forEach(button => {
            button.classList.remove('is-active');
        });
    };

    // Set mobile state: show content-id="content", hide others
    const setMobileState = () => {
        sections.forEach(section => {
            const contentId = section.getAttribute('content-id');
            if (contentId === 'content') {
                section.style.display = 'block';
                section.classList.add('is-active');
                section.classList.remove('is-hidden');
            } else {
                section.style.display = 'none';
                section.classList.remove('is-active');
                section.classList.add('is-hidden');
            }
        });

        // Set default active button: content-index="content"
        buttons.forEach(button => {
            const contentIndex = button.getAttribute('content-index');
            if (contentIndex === 'content') {
                button.classList.add('is-active');
            } else {
                button.classList.remove('is-active');
            }
        });
    };

    // Switch to content section and scroll to target
    const switchToContentAndScroll = (targetId) => {
        if (!isMobileView()) return;

        // Find the index section
        const indexSection = Array.from(sections).find(section => 
            section.getAttribute('content-id') === 'index'
        );

        // Only proceed if index section is currently active
        if (!indexSection || !indexSection.classList.contains('is-active')) return;

        // Switch to content section
        sections.forEach(section => {
            const contentId = section.getAttribute('content-id');
            if (contentId === 'content') {
                section.classList.remove('is-hidden');
                section.style.display = 'block';
                section.offsetHeight;
                requestAnimationFrame(() => {
                    section.classList.add('is-active');
                });
            } else {
                section.classList.remove('is-active');
                section.classList.add('is-hidden');
                setTimeout(() => {
                    if (!section.classList.contains('is-active')) {
                        section.style.display = 'none';
                    }
                }, 300);
            }
        });

        // Update button states
        buttons.forEach(button => {
            const contentIndex = button.getAttribute('content-index');
            if (contentIndex === 'content') {
                button.classList.add('is-active');
            } else {
                button.classList.remove('is-active');
            }
        });

        // Scroll to target after transition
        setTimeout(() => {
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 350);
    };

    // Toggle visibility based on button click
    const handleButtonClick = (event) => {
        if (!isMobileView()) return;

        // Ignore if user was scrolling
        if (isTouchMoving) {
            isTouchMoving = false;
            return;
        }

        const button = event.target.closest('[content-index]');
        if (!button) return;

        const targetContentId = button.getAttribute('content-index');
        
        // Update button states
        buttons.forEach(btn => {
            if (btn === button) {
                btn.classList.add('is-active');
            } else {
                btn.classList.remove('is-active');
            }
        });

        // Update section visibility with smooth transition
        sections.forEach(section => {
            const contentId = section.getAttribute('content-id');
            if (contentId === targetContentId) {
                // Show section: first set display, then trigger transition
                section.classList.remove('is-hidden');
                section.style.display = 'block';
                // Force reflow to ensure display is applied
                section.offsetHeight;
                // Then add active class to trigger transition
                requestAnimationFrame(() => {
                    section.classList.add('is-active');
                });
            } else {
                // Hide section: first trigger transition, then hide
                section.classList.remove('is-active');
                section.classList.add('is-hidden');
                // Wait for opacity transition to complete, then set display none
                setTimeout(() => {
                    if (!section.classList.contains('is-active')) {
                        section.style.display = 'none';
                    }
                }, 300);
            }
        });
    };

    // Track touch start position
    const handleTouchStart = (event) => {
        if (!isMobileView()) return;
        const touch = event.touches[0];
        touchStartY = touch.clientY;
        touchStartX = touch.clientX;
        isTouchMoving = false;
    };

    // Track if user is scrolling
    const handleTouchMove = (event) => {
        if (!isMobileView()) return;
        const touch = event.touches[0];
        const deltaY = Math.abs(touch.clientY - touchStartY);
        const deltaX = Math.abs(touch.clientX - touchStartX);
        
        // If moved more than 10px, consider it a scroll/swipe
        if (deltaY > 10 || deltaX > 10) {
            isTouchMoving = true;
        }
    };

    // Handle anchor link clicks within index section
    const handleAnchorClick = (event) => {
        if (!isMobileView()) return;

        // Ignore if user was scrolling
        if (isTouchMoving) {
            isTouchMoving = false;
            return;
        }

        const link = event.target.closest('a[href^="#"]');
        if (!link) return;

        const href = link.getAttribute('href');
        if (!href || href === '#') return;

        const targetId = href.substring(1);
        
        event.preventDefault();
        switchToContentAndScroll(targetId);
    };

    // Enable toggle functionality
    const enableToggle = () => {
        if (isActive) return;
        isActive = true;
        setMobileState();
        
        // Attach event listeners for buttons
        buttons.forEach(button => {
            button.addEventListener('touchstart', handleTouchStart, { passive: true });
            button.addEventListener('touchmove', handleTouchMove, { passive: true });
            const handler = handleButtonClick.bind(this);
            button.addEventListener('click', handler);
            clickHandlers.push({ button, handler });
        });

        // Attach event listeners for anchor links in index section
        const indexSection = Array.from(sections).find(section => 
            section.getAttribute('content-id') === 'index'
        );
        if (indexSection) {
            indexSection.addEventListener('touchstart', handleTouchStart, { passive: true });
            indexSection.addEventListener('touchmove', handleTouchMove, { passive: true });
            indexSection.addEventListener('click', handleAnchorClick);
        }
    };

    // Disable toggle functionality
    const disableToggle = () => {
        if (!isActive) return;
        isActive = false;
        
        // Remove event listeners
        clickHandlers.forEach(({ button, handler }) => {
            button.removeEventListener('touchstart', handleTouchStart);
            button.removeEventListener('touchmove', handleTouchMove);
            button.removeEventListener('click', handler);
        });
        clickHandlers = [];
        
        // Remove anchor link listeners
        const indexSection = Array.from(sections).find(section => 
            section.getAttribute('content-id') === 'index'
        );
        if (indexSection) {
            indexSection.removeEventListener('touchstart', handleTouchStart);
            indexSection.removeEventListener('touchmove', handleTouchMove);
            indexSection.removeEventListener('click', handleAnchorClick);
        }
        
        // Reset to desktop state
        setDesktopState();
    };

    // Handle resize events
    const handleResize = () => {
        if (isMobileView()) {
            enableToggle();
        } else {
            disableToggle();
        }
    };

    // Initialize based on current viewport size
    if (isMobileView()) {
        enableToggle();
    } else {
        disableToggle();
    }

    // Listen for resize events
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(handleResize, 150);
    });
}