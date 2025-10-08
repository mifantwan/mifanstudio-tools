// ES2025 standard module export
export default function navigation() {
    const navigation = document.getElementById('local-navigation');
    const navigationFloating = document.getElementById('local-navigation-floating');
    if (!navigation) return;

    // Handle clicks on all <a> elements without attribute show-menu
    navigation.querySelectorAll('a:not([show-menu])').forEach(link => {
        ['click', 'mouseenter'].forEach(eventType => {
            link.addEventListener(eventType, (e) => {
                if (navigationFloating && navigationFloating.classList.contains('show')) {
                    navigationFloating.classList.remove('show');
                }
            });
        });
    });

    // Handle clicks on navigation elements to close floating navigation
    // Use a single delegated handler for better performance
    const handleNavigationClick = (e) => {
        if (navigationFloating && navigationFloating.classList.contains('show')) {
            // Only close if this is not a floating nav trigger
            const isFloatingNavTrigger = e.target.closest('[show-menu]');
            if (!isFloatingNavTrigger) {
                // Close floating navigation immediately and reset state
                navigationFloating.classList.remove('show');
                
                // Reset floating navigation state by dispatching a custom event
                const resetEvent = new CustomEvent('resetFloatingNav');
                document.dispatchEvent(resetEvent);
            }
        }
    };
    
    // Add single delegated handler to the navigation container with high priority
    navigation.addEventListener('click', handleNavigationClick, true);
    
    // Store for cleanup
    navigation._closeFloatingNavHandler = handleNavigationClick;

    // Shared closeDropdowns function
    let dropdownItems;
    const closeDropdowns = (except = null) => {
        if (!dropdownItems) return;

        const resetArrow = (element) => {
            const arrow = element.querySelector('a span > svg');
            if (arrow) {
                arrow.style.transform = '';
            }
        };

        dropdownItems.forEach(item => {
            if (item === except) return;

            // Close main dropdown
            item.classList.remove('dropdown-open');
            resetArrow(item);
            
            // Update ARIA attributes
            const link = item.querySelector('a');
            if (link) {
                link.setAttribute('aria-expanded', 'false');
            }

            // Close nested dropdowns immediately
            const nestedDropdowns = item.querySelectorAll('li.dropdown-open');
            nestedDropdowns.forEach(child => {
                child.classList.remove('dropdown-open');
                resetArrow(child);
                
                // Update ARIA attributes for nested items
                const childLink = child.querySelector('a');
                if (childLink) {
                    childLink.setAttribute('aria-expanded', 'false');
                }
            });
        });
    };

    // Screen reader announcement function
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
    };

    // Sticky navigation handling
    const handleSticky = (() => {
        let isStuck = false;
        let observer = null;
        let sentinel = null;

        const setupObserver = () => {
            // Only setup observer if navigation is visible
            if (window.getComputedStyle(navigation).display === 'none') {
                return;
            }

            observer = new IntersectionObserver(
                ([entry]) => {
                    const shouldBeStuck = !entry.isIntersecting;
                    if (shouldBeStuck !== isStuck) {
                        isStuck = shouldBeStuck;
                        navigation.classList.toggle('is-stuck', isStuck);
                    }
                },
                { rootMargin: '-1px 0px 0px 0px', threshold: 0 }
            );

            sentinel = document.createElement('div');
            Object.assign(sentinel.style, {
                height: '1px',
                width: '100%',
                position: 'absolute',
                top: '0',
                pointerEvents: 'none'
            });

            navigation.parentNode.insertBefore(sentinel, navigation);
            observer.observe(sentinel);
        };

        const cleanup = () => {
            if (observer) {
                observer.disconnect();
                observer = null;
            }
            if (sentinel) {
                sentinel.remove();
                sentinel = null;
            }
        };

        // Initial setup
        setupObserver();

        // Handle resize events
        const resizeObserver = new ResizeObserver(() => {
            cleanup();
            setupObserver();
        });

        resizeObserver.observe(navigation);

        return () => {
            cleanup();
            resizeObserver.disconnect();
        };
    })();

    // Dropdown handling
    const handleDropdowns = (() => {
        dropdownItems = navigation.querySelectorAll('li:has(ul)');
        let hoverTimeouts = new Map();
        let clickHandlers = new Map();
        let hoverHandlers = new Map();

        const updateArrowRotation = (item, link, isOpen) => {
            const arrow = link.querySelector('span > svg');
            if (arrow) {
                arrow.style.transform = isOpen ? 'rotate(180deg)' : '';
            }
        };

        const handleDropdownClick = (item, link, isNavigationSub = false) => {
            const toggleDropdown = (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                // Clear any pending hover timeouts for this item
                if (hoverTimeouts.has(item)) {
                    clearTimeout(hoverTimeouts.get(item));
                    hoverTimeouts.delete(item);
                }
                
                const isOpen = item.classList.contains('dropdown-open');
                closeDropdowns(isOpen ? null : item);
                item.classList.toggle('dropdown-open', !isOpen);
                
                // Update arrow rotation
                updateArrowRotation(item, link, !isOpen);
                
                // Update ARIA attributes
                link.setAttribute('aria-expanded', !isOpen);
                
                // Announce state change to screen readers
                announceToScreenReader(!isOpen ? 'Dropdown opened' : 'Dropdown closed');
            };

            // Set up accessibility attributes
            const dropdownId = `dropdown-${Math.random().toString(36).substr(2, 9)}`;
            const dropdown = item.querySelector('ul');
            
            if (dropdown) {
                dropdown.id = dropdownId;
                dropdown.setAttribute('role', 'menu');
                dropdown.setAttribute('aria-labelledby', link.id || `nav-link-${Math.random().toString(36).substr(2, 9)}`);
            }
            
            // Set up link attributes
            link.setAttribute('aria-haspopup', 'true');
            link.setAttribute('aria-expanded', 'false');
            if (dropdown) {
                link.setAttribute('aria-controls', dropdownId);
            }
            
            if (!link.id) {
                link.id = `nav-link-${Math.random().toString(36).substr(2, 9)}`;
            }

            if (isNavigationSub) {
                Object.assign(link, {
                    href: null,
                    style: { cursor: 'pointer' },
                    role: 'button',
                    tabIndex: '0'
                });
            }

            const clickHandler = toggleDropdown;
            link.addEventListener('click', clickHandler);
            
            // Add keyboard support
            const keydownHandler = (e) => {
                switch (e.key) {
                    case 'Enter':
                    case ' ':
                        e.preventDefault();
                        toggleDropdown(e);
                        break;
                    case 'Escape':
                        if (item.classList.contains('dropdown-open')) {
                            e.preventDefault();
                            item.classList.remove('dropdown-open');
                            updateArrowRotation(item, link, false);
                            link.setAttribute('aria-expanded', 'false');
                            announceToScreenReader('Dropdown closed');
                        }
                        break;
                    case 'ArrowDown':
                        e.preventDefault();
                        if (!item.classList.contains('dropdown-open')) {
                            item.classList.add('dropdown-open');
                            updateArrowRotation(item, link, true);
                            link.setAttribute('aria-expanded', 'true');
                            announceToScreenReader('Dropdown opened');
                        }
                        // Focus first menu item
                        const firstMenuItem = item.querySelector('ul li:first-child a');
                        if (firstMenuItem) {
                            firstMenuItem.focus();
                        }
                        break;
                }
            };
            
            link.addEventListener('keydown', keydownHandler);
            clickHandlers.set(item, { link, handler: clickHandler, keydown: keydownHandler });
        };

        const handleDropdownHover = (item, link) => {
            const handleMouseEnter = () => {
                // Clear any existing timeout
                if (hoverTimeouts.has(item)) {
                    clearTimeout(hoverTimeouts.get(item));
                    hoverTimeouts.delete(item);
                }
                
                // Only show hover state if dropdown is not already open
                if (!item.classList.contains('dropdown-open')) {
                    updateArrowRotation(item, link, true);
                }
            };

            const handleMouseLeave = () => {
                // Clear timeout and close dropdown after delay
                if (hoverTimeouts.has(item)) {
                    clearTimeout(hoverTimeouts.get(item));
                    hoverTimeouts.delete(item);
                }
                
                const timeout = setTimeout(() => {
                    if (!item.matches(':hover')) {
                        item.classList.remove('dropdown-open');
                        updateArrowRotation(item, link, false);
                        link.setAttribute('aria-expanded', 'false');
                        closeDropdowns();
                    }
                }, 300);
                
                hoverTimeouts.set(item, timeout);
            };

            item.addEventListener('mouseenter', handleMouseEnter);
            item.addEventListener('mouseleave', handleMouseLeave);
            
            hoverHandlers.set(item, {
                mouseenter: handleMouseEnter,
                mouseleave: handleMouseLeave
            });
        };

        dropdownItems.forEach(item => {
            const link = item.querySelector('a');
            if (!link) return;

            item.classList.add('has-dropdown');
            handleDropdownClick(item, link, item.classList.contains('navigation-sub'));
            
            // Only add hover for main navigation (not mobile/sub navigation)
            if (!item.classList.contains('navigation-sub')) {
                handleDropdownHover(item, link);
            }
        });

        // Global event listeners
        const globalClickHandler = (e) => {
            // Don't close if clicking on floating navigation elements or main navigation
            const isMainNavClick = e.target.closest('#local-navigation');
            const isFloatingNavClick = e.target.closest('#local-navigation-floating');
            const isFloatingNavTrigger = e.target.closest('[data-floating-nav]');
            
            if (!isMainNavClick && !isFloatingNavClick && !isFloatingNavTrigger) {
                closeDropdowns();
            }
        };

        const globalKeydownHandler = (e) => {
            if (e.key === 'Escape') {
                closeDropdowns();
                announceToScreenReader('All dropdowns closed');
            }
        };

        document.addEventListener('click', globalClickHandler);
        document.addEventListener('keydown', globalKeydownHandler);

        // Handle regular navigation links
        const regularLinks = navigation.querySelectorAll('a:not([role="button"])');
        const regularLinkHandlers = [];
        
        regularLinks.forEach(link => {
            const handler = () => closeDropdowns();
            link.addEventListener('click', handler);
            regularLinkHandlers.push({ link, handler });
        });

        // Return cleanup function
        return () => {
            // Clean up click and keydown handlers
            clickHandlers.forEach(({ link, handler, keydown }) => {
                link.removeEventListener('click', handler);
                if (keydown) {
                    link.removeEventListener('keydown', keydown);
                }
            });
            
            // Clean up hover handlers
            hoverHandlers.forEach(({ mouseenter, mouseleave }, item) => {
                item.removeEventListener('mouseenter', mouseenter);
                item.removeEventListener('mouseleave', mouseleave);
            });
            
            // Clean up regular link handlers
            regularLinkHandlers.forEach(({ link, handler }) => {
                link.removeEventListener('click', handler);
            });
            
            // Clean up floating nav close handler
            if (navigation._closeFloatingNavHandler) {
                navigation.removeEventListener('click', navigation._closeFloatingNavHandler, true);
                delete navigation._closeFloatingNavHandler;
            }
            
            // Clean up global handlers
            document.removeEventListener('click', globalClickHandler);
            document.removeEventListener('keydown', globalKeydownHandler);
            
            // Clear all timeouts
            hoverTimeouts.forEach(timeout => clearTimeout(timeout));
            hoverTimeouts.clear();
            
            // Clear maps
            clickHandlers.clear();
            hoverHandlers.clear();
        };
    })();

    // Handle mobile navigation menu
    const sideNavs = document.getElementById('local-side-navs');
    if (sideNavs) {
        const handleClick = (e) => {
            const link = e.target.closest('a');
            if (!link?.nextElementSibling?.matches('ul')) return;
            
            e.preventDefault();
            
            // Close sibling menus
            const siblingLinks = link.closest('ul').querySelectorAll('a.show');
            for (const sibling of siblingLinks) {
                if (sibling !== link) {
                    sibling.classList.remove('show');
                    sibling.classList.remove('dropdown-active');
                }
            }
            
            // Toggle current menu
            link.classList.toggle('show');
            link.classList.toggle('dropdown-active');
        };

        // Single event listener for all clicks
        sideNavs.addEventListener('click', handleClick);
    }

    // Cleanup function
    return () => {
        handleSticky();
        handleDropdowns();
    };
}
