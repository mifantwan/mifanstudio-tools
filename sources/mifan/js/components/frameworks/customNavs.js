export default function customNavs() {
    // If mifan-top-navigation isn't ready, set navigation height to 0px
    const navReady = document.querySelector('.mifan-top-navigation');
    if (!navReady) {
        document.documentElement.style.setProperty('--navigation-height', '0px');
    }

    // Constants
    const TRANSITION_DURATION = 200;
    const SCREEN_PADDING = 20;
    
    // Find all nav elements
    const navs = document.querySelectorAll('nav');
    
    // Store handlers to prevent duplicates
    if (!window._customNavsHandlers) {
        window._customNavsHandlers = {
            outsideClick: null,
            searchClick: null,
            resize: null,
            initialized: new Set()
        };
    }
    
    // Utility: Reset dropdown styles and state
    const resetDropdown = (div) => {
        div.style.display = 'none';
        div.style.left = '';
        div.style.transform = '';
        div.style.maxWidth = '';
        div.removeAttribute('data-aligned');
    };
    
    // Utility: Rotate icon for a route
    const rotateIcon = (routeValue, rotation, navElement) => {
        const buttons = navElement.querySelectorAll(`button[menu-trigger="${routeValue}"]`);
        buttons.forEach(btn => {
            const svg = btn.querySelector('svg');
            if (svg) {
                svg.style.transform = `rotate(${rotation}deg)`;
            }
        });
    };
    
    // Utility: Set alignment attribute
    const setAlignment = (div, alignment) => {
        if (alignment) {
            div.setAttribute('data-aligned', alignment);
        } else {
            div.removeAttribute('data-aligned');
        }
    };
    
    // Utility: Close a single dropdown
    const closeDropdown = (div, navElement) => {
        div.setAttribute('data-visible', 'false');
        const routeValue = div.getAttribute('parent-content');
        rotateIcon(routeValue, 0, navElement);
        
        setTimeout(() => {
            if (div.getAttribute('data-visible') === 'false') {
                resetDropdown(div);
            }
        }, TRANSITION_DURATION);
    };
    
    // Utility: Calculate optimal position for dropdown
    const calculatePosition = (dropdownWidth, parentRect, screenWidth, padding) => {
        const maxWidth = screenWidth - padding * 2;
        let finalLeft = '';
        let finalTransform = '';
        let alignment = null;
        
        // If dropdown width exceeds or equals screen width, align to left
        if (dropdownWidth >= maxWidth) {
            const leftOffset = padding - parentRect.left;
            finalLeft = `${leftOffset}px`;
            finalTransform = 'translate(0, 0)';
            alignment = 'left';
        } else {
            // Center the dropdown
            const parentCenterX = parentRect.left + parentRect.width / 2;
            const dropdownLeft = parentCenterX - dropdownWidth / 2;
            const dropdownRight = parentCenterX + dropdownWidth / 2;
            
            // Check if centered position would overflow
            if (dropdownLeft < padding) {
                const leftOffset = padding - parentRect.left;
                finalLeft = `${leftOffset}px`;
                finalTransform = 'translate(0, 0)';
                alignment = 'left';
            } else if (dropdownRight > screenWidth - padding) {
                const rightOffset = (screenWidth - padding - dropdownWidth) - parentRect.left;
                finalLeft = `${rightOffset}px`;
                finalTransform = 'translate(0, 0)';
                alignment = 'right';
            } else {
                finalLeft = '50%';
                finalTransform = 'translate(-50%, 0)';
                alignment = null;
            }
        }
        
        return { finalLeft, finalTransform, alignment };
    };
    
    // Utility: Apply position to dropdown
    const applyPosition = (dropdownDiv, parentLi, isInitialShow = false) => {
        const screenWidth = window.innerWidth;
        const parentRect = parentLi.getBoundingClientRect();
        const maxWidth = screenWidth - SCREEN_PADDING * 2;
        
        // Get current dropdown width and set maxWidth if needed
        let rect = dropdownDiv.getBoundingClientRect();
        if (rect.width > maxWidth) {
            dropdownDiv.style.maxWidth = `${maxWidth}px`;
        } else {
            dropdownDiv.style.maxWidth = '';
        }
        
        // Recalculate after maxWidth change
        requestAnimationFrame(() => {
            rect = dropdownDiv.getBoundingClientRect();
            const dropdownWidth = rect.width;
            const { finalLeft, finalTransform, alignment } = calculatePosition(
                dropdownWidth,
                parentRect,
                screenWidth,
                SCREEN_PADDING
            );
            
            if (isInitialShow) {
                // Set initial transform for transition (hidden state)
                dropdownDiv.style.left = '';
                dropdownDiv.style.transform = 'translate(-50%, -10px)';
                
                // Set final position and make visible
                requestAnimationFrame(() => {
                    dropdownDiv.style.left = finalLeft;
                    dropdownDiv.style.transform = finalTransform;
                    setAlignment(dropdownDiv, alignment);
                    dropdownDiv.setAttribute('data-visible', 'true');
                });
            } else {
                // Apply position directly (for resize)
                dropdownDiv.style.left = finalLeft;
                dropdownDiv.style.transform = finalTransform;
                setAlignment(dropdownDiv, alignment);
            }
        });
    };
    
    // Shared function to close all dropdowns
    const closeAllDropdowns = () => {
        navs.forEach(nav => {
            const parentContentDivs = nav.querySelectorAll('[parent-content]');
            parentContentDivs.forEach(div => {
                closeDropdown(div, nav);
            });
        });
    };
    
    navs.forEach(nav => {
        // Skip if already initialized
        if (window._customNavsHandlers.initialized.has(nav)) {
            return;
        }
        window._customNavsHandlers.initialized.add(nav);
        
        // 1. Initialize: Hide all parent-content divs
        const parentContentDivs = nav.querySelectorAll('[parent-content]');
        parentContentDivs.forEach(div => {
            div.setAttribute('data-visible', 'false');
            div.style.display = 'none';
        });

        // 2. Disable parent links that have children
        const parentLinks = nav.querySelectorAll('li.parent > a');
        parentLinks.forEach(link => {
            const hasButton = link.querySelector('button[menu-trigger]');
            if (hasButton && !link.dataset.navInitialized) {
                link.dataset.navInitialized = 'true';
                link.setAttribute('data-has-children', 'true');
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                });
            }
        });

        // Function to toggle dropdown with smooth transitions
        const toggleDropdown = (routeValue) => {
            const targetDiv = nav.querySelector(`[parent-content="${routeValue}"]`);
            if (!targetDiv) return;

            const isVisible = targetDiv.getAttribute('data-visible') === 'true';
            
            // Close all other dropdowns first
            parentContentDivs.forEach(div => {
                if (div !== targetDiv) {
                    closeDropdown(div, nav);
                }
            });

            // Toggle current dropdown
            if (isVisible) {
                closeDropdown(targetDiv, nav);
            } else {
                // Show the dropdown with smooth transition
                targetDiv.style.display = 'flex';
                targetDiv.offsetHeight; // Trigger reflow
                
                // Rotate icon
                rotateIcon(routeValue, 180, nav);
                
                // Calculate and apply position
                const parentLi = targetDiv.closest('li.parent');
                if (parentLi) {
                    applyPosition(targetDiv, parentLi, true);
                }
            }
        };

        // 3. Add click handlers to buttons with menu-trigger attribute
        const menuTriggerButtons = nav.querySelectorAll('button[menu-trigger]');
        menuTriggerButtons.forEach(button => {
            if (!button.dataset.navInitialized) {
                button.dataset.navInitialized = 'true';
                button.addEventListener('click', (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    toggleDropdown(button.getAttribute('menu-trigger'));
                });
            }
        });

        // 3. Add click handlers to li elements with parent-route attribute
        const parentLiElements = nav.querySelectorAll('li.parent[parent-route]');
        parentLiElements.forEach(li => {
            if (!li.dataset.navInitialized) {
                li.dataset.navInitialized = 'true';
                li.addEventListener('click', (e) => {
                    if (e.target.closest('button[menu-trigger]')) {
                        return;
                    }
                    toggleDropdown(li.getAttribute('parent-route'));
                });
            }
        });
    });
    
    // Close dropdowns when clicking outside (shared handler - only add once)
    if (!window._customNavsHandlers.outsideClick) {
        const handleOutsideClick = (e) => {
            const clickedInsideNav = Array.from(navs).some(nav => nav.contains(e.target));
            if (!clickedInsideNav) {
                closeAllDropdowns();
            }
        };
        
        window._customNavsHandlers.outsideClick = handleOutsideClick;
        document.addEventListener('click', handleOutsideClick);
    }

    // Close dropdowns when search button is clicked (shared handler - only add once)
    if (!window._customNavsHandlers.searchClick) {
        const handleSearchClick = (e) => {
            const searchButton = e.target.closest('[trigger-route="search"]');
            if (searchButton) {
                closeAllDropdowns();
            }
        };
        
        window._customNavsHandlers.searchClick = handleSearchClick;
        document.addEventListener('click', handleSearchClick);
    }

    // Handle window resize to recalculate dropdown width and position (shared handler - only add once)
    if (!window._customNavsHandlers.resize) {
        const handleResize = () => {
            navs.forEach(nav => {
                const parentContentDivs = nav.querySelectorAll('[parent-content]');
                parentContentDivs.forEach(div => {
                    if (div.getAttribute('data-visible') === 'true') {
                        const parentLi = div.closest('li.parent');
                        if (parentLi) {
                            applyPosition(div, parentLi, false);
                        }
                    }
                });
            });
        };
        
        window._customNavsHandlers.resize = handleResize;
        window.addEventListener('resize', handleResize);
    }
}
