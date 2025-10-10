export default function navigationFloating() {
    const navigationFloating = document.getElementById('local-navigation-floating');
    const localNavigation = document.getElementById('local-navigation');
    
    if (!navigationFloating || !localNavigation) return;

    let hoverTimeout;
    let activeMenuId = null;
    let focusedElement = null;
    let isDesktopClick = false;
    
    // Cache DOM queries and create event handler references for cleanup
    const menuContainers = navigationFloating.querySelectorAll('.navigation-floating-container');
    const navigationMasterRoutes = localNavigation.querySelectorAll('a[show-menu]');
    
    // Accessibility: Add ARIA attributes
    function setupAccessibility() {
        navigationMasterRoutes.forEach(route => {
            const showMenuId = route.getAttribute('show-menu');
            const targetMenu = document.getElementById(showMenuId);
            
            if (targetMenu) {
                // Set up ARIA attributes
                route.setAttribute('aria-haspopup', 'true');
                route.setAttribute('aria-expanded', 'false');
                route.setAttribute('aria-controls', showMenuId);
                route.setAttribute('role', 'button');
                route.setAttribute('tabindex', '0');
                
                // Ensure target menu has proper ID and role
                targetMenu.setAttribute('role', 'menu');
                targetMenu.setAttribute('aria-labelledby', route.id || `floating-nav-${showMenuId}`);
                
                // Add ID to route if it doesn't have one
                if (!route.id) {
                    route.id = `floating-nav-${showMenuId}`;
                }
            }
        });
    }
    
    function hideAllMenus() {
        menuContainers.forEach(container => {
            container.style.display = 'none';
            container.setAttribute('aria-hidden', 'true');
        });
        
        // Update ARIA states
        navigationMasterRoutes.forEach(route => {
            route.setAttribute('aria-expanded', 'false');
        });
    }
    
    function showMenu(menuId) {
        hideAllMenus();
        const targetMenu = document.getElementById(menuId);
        if (targetMenu) {
            targetMenu.style.display = 'block';
            targetMenu.setAttribute('aria-hidden', 'false');
            
            // Update the triggering element's ARIA state
            const triggeringElement = localNavigation.querySelector(`[aria-controls="${menuId}"]`);
            if (triggeringElement) {
                triggeringElement.setAttribute('aria-expanded', 'true');
            }
        }
    }

    function announceToScreenReader(message) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.style.cssText = `
            position: absolute;
            left: -10000px;
            width: 1px;
            height: 1px;
            overflow: hidden;
        `;
        announcement.textContent = message;
        document.body.appendChild(announcement);
        
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }

    function handleRouteClick(e, showMenuId) {
        e.preventDefault();
        e.stopPropagation();
        
        const isCurrentlyOpen = activeMenuId === showMenuId && navigationFloating.classList.contains('show');
        
        if (isCurrentlyOpen && !isDesktopClick) {
            navigationFloating.classList.remove('show');
            activeMenuId = null;
            announceToScreenReader('Floating menu closed');
        } else {
            showMenu(showMenuId);
            navigationFloating.classList.add('show');
            activeMenuId = showMenuId;
            isDesktopClick = true;
            announceToScreenReader('Floating menu opened');
        }
    }

    function handleHoverStart(showMenuId) {
        if (!activeMenuId && !isDesktopClick) {
            clearTimeout(hoverTimeout);
            showMenu(showMenuId);
            navigationFloating.classList.add('show');
        }
    }

    function handleHoverEnd() {
        if (!activeMenuId && !isDesktopClick) {
            hoverTimeout = setTimeout(() => {
                if (!activeMenuId && !isDesktopClick) {
                    navigationFloating.classList.remove('show');
                    announceToScreenReader('Floating menu closed');
                }
            }, 300);
        }
    }

    function handleKeydown(e, showMenuId) {
        switch (e.key) {
            case 'Enter':
            case ' ':
                e.preventDefault();
                handleRouteClick(e, showMenuId);
                break;
            case 'Escape':
                if (activeMenuId) {
                    e.preventDefault();
                    navigationFloating.classList.remove('show');
                    activeMenuId = null;
                    isDesktopClick = false;
                    announceToScreenReader('Floating menu closed');
                    // Return focus to triggering element
                    const triggeringElement = localNavigation.querySelector(`[aria-controls="${showMenuId}"]`);
                    if (triggeringElement) {
                        triggeringElement.focus();
                    }
                }
                break;
            case 'Tab':
                // Allow normal tab behavior but close menu if focus leaves
                setTimeout(() => {
                    if (!navigationFloating.contains(document.activeElement) && 
                        !localNavigation.contains(document.activeElement)) {
                        navigationFloating.classList.remove('show');
                        activeMenuId = null;
                        isDesktopClick = false;
                    }
                }, 0);
                break;
        }
    }

    function handleOutsideClick(e) {
        // Close navigation if clicking outside floating navigation
        const isFloatingNavClick = navigationFloating.contains(e.target);
        const isFloatingNavTrigger = e.target.closest('[show-menu]')?.hasAttribute('data-floating-nav') || e.target.hasAttribute('show-menu');
        const isMainNavClick = localNavigation.contains(e.target);
        const isMainNavDropdown = e.target.closest('.navigation-sub');
        
        // Don't close floating nav if clicking on main nav dropdowns or floating nav triggers
        if (!isFloatingNavClick && !isFloatingNavTrigger && !isMainNavClick && !isMainNavDropdown) {
            activeMenuId = null;
            isDesktopClick = false;
            navigationFloating.classList.remove('show');
        }
    }

    // Use a single delegated event handler on the document for complete isolation
    const handleFloatingNavClick = (e) => {
        const floatingNavTrigger = e.target.closest('[show-menu]');
        
        // Only handle if this is specifically a floating nav trigger
        // Check if it's a floating nav trigger (has data-floating-nav attribute)
        if (floatingNavTrigger && floatingNavTrigger.hasAttribute('data-floating-nav')) {
            const showMenuId = floatingNavTrigger.getAttribute('show-menu');
            handleRouteClick(e, showMenuId);
        }
    };

    // Attach event listeners with proper accessibility support
    navigationMasterRoutes.forEach(route => {
        const showMenuId = route.getAttribute('show-menu');
        
        // Keyboard handler
        const keydownHandler = e => handleKeydown(e, showMenuId);
        route.addEventListener('keydown', keydownHandler);
        
        // Hover handlers (for mouse users)
        const mouseenterHandler = () => handleHoverStart(showMenuId);
        const mouseleaveHandler = handleHoverEnd;
        route.addEventListener('mouseenter', mouseenterHandler);
        route.addEventListener('mouseleave', mouseleaveHandler);
        
        // Store handlers for cleanup
        route._floatingNavHandlers = {
            keydown: keydownHandler,
            mouseenter: mouseenterHandler,
            mouseleave: mouseleaveHandler
        };
    });

    // Use document-level delegation for click handling to avoid interference
    document.addEventListener('click', handleFloatingNavClick);
    
    // Listen for reset events from main navigation
    const handleResetEvent = () => {
        activeMenuId = null;
        isDesktopClick = false;
        hideAllMenus();
        navigationFloating.classList.remove('show');
    };
    document.addEventListener('resetFloatingNav', handleResetEvent);

    navigationFloating.addEventListener('mouseenter', () => {
        if (!activeMenuId && !isDesktopClick) clearTimeout(hoverTimeout);
    });
    
    navigationFloating.addEventListener('mouseleave', handleHoverEnd);
    
    document.addEventListener('click', handleOutsideClick);

    // Prevent conflicts with main navigation
    function preventNavigationConflicts() {
        // Ensure floating navigation elements don't interfere with main navigation
        navigationMasterRoutes.forEach(route => {
            // Add a data attribute to identify floating navigation elements
            route.setAttribute('data-floating-nav', 'true');
        });
    }

    // Initialize
    hideAllMenus();
    setupAccessibility();
    preventNavigationConflicts();

    // Cleanup function to remove event listeners
    return function cleanup() {
        navigationMasterRoutes.forEach(route => {
            if (route._floatingNavHandlers) {
                route.removeEventListener('keydown', route._floatingNavHandlers.keydown);
                route.removeEventListener('mouseenter', route._floatingNavHandlers.mouseenter);
                route.removeEventListener('mouseleave', route._floatingNavHandlers.mouseleave);
                delete route._floatingNavHandlers;
            }
        });
        
        navigationFloating.removeEventListener('mouseenter', () => {
            if (!activeMenuId && !isDesktopClick) clearTimeout(hoverTimeout);
        });
        navigationFloating.removeEventListener('mouseleave', handleHoverEnd);
        document.removeEventListener('click', handleOutsideClick);
        document.removeEventListener('click', handleFloatingNavClick);
        document.removeEventListener('resetFloatingNav', handleResetEvent);
    };
}