// Side navigation handler
function handleSideNavigation() {
    const sideNavs = document.getElementById('local-side-navs');
    if (!sideNavs) return;

    // Helper function to toggle SVG rotation
    const toggleSvgRotation = (link, show) => {
        const svg = link.querySelector('span svg');
        if (svg) {
            svg.style.transform = show ? 'rotate(180deg)' : '';
        }
    };

    // Event delegation for side navigation clicks
    sideNavs.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (!link) return;

        const hasChildNavs = link.nextElementSibling?.tagName === 'UL';
        
        if (hasChildNavs) {
            e.preventDefault();
            link.classList.toggle('show');
            toggleSvgRotation(link, link.classList.contains('show'));
            
            // Close sibling dropdowns
            const siblings = link.parentElement.parentElement.querySelectorAll('a.show');
            siblings.forEach(sibling => {
                if (sibling !== link) {
                    sibling.classList.remove('show');
                    toggleSvgRotation(sibling, false);
                }
            });
        } else {
            // Close all dropdowns for leaf items
            sideNavs.querySelectorAll('a.show').forEach(open => {
                open.classList.remove('show');
                toggleSvgRotation(open, false);
            });
        }
    });

    // Close dropdowns on outside click
    document.addEventListener('click', (e) => {
        if (!sideNavs.contains(e.target)) {
            sideNavs.querySelectorAll('a.show').forEach(open => {
                open.classList.remove('show');
                toggleSvgRotation(open, false);
            });
        }
    });

    // Close dropdowns when side nav closes
    const closeButton = sideNavs.querySelector('.close-floating-widget');
    closeButton?.addEventListener('click', () => {
        sideNavs.querySelectorAll('a.show').forEach(open => {
            open.classList.remove('show');
            toggleSvgRotation(open, false);
        });
    });
}

// Main navigation handler with nested child nav support
function handleMainNavigation() {
    const navigation = document.getElementById('local-navigation');
    const floatingNav = document.getElementById('local-navigation-floating');
    
    if (!navigation) return;

    // Find the main navigation nav element
    const mainNav = navigation.querySelector('nav.navigation-main');
    if (!mainNav) return;

    // Initialize all dropdown states recursively
    const initializeDropdowns = (container) => {
        container.querySelectorAll('li').forEach(li => {
            const link = li.querySelector('a');
            const submenu = li.querySelector('ul');
            
            if (submenu) {
                link.classList.add('has-dropdown');
                // Hide submenu initially
                submenu.style.visibility = 'hidden';
                submenu.style.opacity = '0';
                
                // Recursively initialize nested dropdowns
                initializeDropdowns(submenu);
            }
        });
    };

    // Check if any child dropdowns are open
    const hasOpenChildren = (li) => {
        return li.querySelectorAll('li.dropdown-open').length > 0;
    };

    // Toggle SVG rotation based on dropdown state and child visibility
    const toggleSvgRotation = (link, show) => {
        const svg = link.querySelector('span svg');
        if (!svg) return;

        const li = link.parentElement;
        const isNestedDropdown = link.closest('ul.navigation-sub');
        
        if (isNestedDropdown) {
            // For nested dropdowns, force transform style directly
            svg.style.transform = (show || hasOpenChildren(li)) ? 'rotate(90deg)' : 'none';
            // Ensure transform is applied immediately
            svg.style.transition = 'none';
            requestAnimationFrame(() => {
                svg.style.transition = 'transform 0.3s ease';
            });
        } else {
            // For top-level dropdowns, force transform style directly
            svg.style.transform = (show || hasOpenChildren(li)) ? 'rotate(180deg)' : 'none';
            // Ensure transform is applied immediately
            svg.style.transition = 'none';
            requestAnimationFrame(() => {
                svg.style.transition = 'transform 0.3s ease';
            });
        }
    };

    // Show dropdown with proper positioning
    const showDropdown = (link) => {
        const li = link.parentElement;
        const submenu = li.querySelector('ul');
        
        if (submenu) {
            li.classList.add('dropdown-open');
            submenu.style.visibility = 'visible';
            submenu.style.opacity = '1';
            
            // Update SVG rotation for current and parent items
            toggleSvgRotation(link, true);
            
            // Update parent SVG rotations
            let parent = li.parentElement.closest('li');
            while (parent) {
                const parentLink = parent.querySelector('a');
                toggleSvgRotation(parentLink, true);
                parent = parent.parentElement.closest('li');
            }
        }
    };

    // Hide dropdown
    const hideDropdown = (link) => {
        const li = link.parentElement;
        const submenu = li.querySelector('ul');
        
        if (submenu) {
            li.classList.remove('dropdown-open');
            submenu.style.visibility = 'hidden';
            submenu.style.opacity = '0';
            
            // Update SVG rotation considering child states
            toggleSvgRotation(link, false);
            
            // Update parent SVG rotations
            let parent = li.parentElement.closest('li');
            while (parent) {
                const parentLink = parent.querySelector('a');
                toggleSvgRotation(parentLink, hasOpenChildren(parent));
                parent = parent.parentElement.closest('li');
            }
        }
    };

    // Hide all dropdowns at a specific level
    const hideSiblingDropdowns = (currentLi) => {
        const parent = currentLi.parentElement;
        if (parent) {
            parent.querySelectorAll('li.dropdown-open').forEach(sibling => {
                if (sibling !== currentLi) {
                    const siblingLink = sibling.querySelector('a');
                    hideDropdown(siblingLink);
                }
            });
        }
    };

    // Hide all dropdowns in the entire navigation
    const hideAllDropdowns = () => {
        mainNav.querySelectorAll('li.dropdown-open').forEach(li => {
            const link = li.querySelector('a');
            hideDropdown(link);
        });
    };

    // Handle nested dropdown positioning
    const positionNestedDropdowns = () => {
        mainNav.querySelectorAll('ul.navigation-sub ul').forEach(nestedUl => {
            const parentLi = nestedUl.parentElement;
            const parentRect = parentLi.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            
            // Check if dropdown would go off-screen to the right
            if (parentRect.right + 200 > viewportWidth) {
                // Position to the left instead
                nestedUl.style.left = 'auto';
                nestedUl.style.right = 'calc(100% + var(--space-normal))';
            } else {
                // Default right positioning
                nestedUl.style.left = 'calc(100% + var(--space-normal))';
                nestedUl.style.right = 'auto';
            }
        });
    };

    // Event delegation for main navigation clicks
    mainNav.addEventListener('click', (e) => {
        const link = e.target.closest('li > a');
        if (!link) return;

        const hasDropdown = link.classList.contains('has-dropdown');
        
        if (hasDropdown) {
            e.stopPropagation();
            e.preventDefault();
            const li = link.parentElement;
            const isOpen = li.classList.contains('dropdown-open');
            
            hideSiblingDropdowns(li);
            
            if (!isOpen) {
                showDropdown(link);
                // Rotate SVG based on menu level
                const svg = link.querySelector('span svg');
                if (svg) {
                    if (li.closest('ul.navigation-sub')) {
                        svg.style.transform = 'rotate(90deg)';
                    } else {
                        svg.style.transform = 'rotate(180deg)';
                    }
                }
                setTimeout(positionNestedDropdowns, 10);
            } else {
                hideDropdown(link);
                // Reset SVG rotation
                const svg = link.querySelector('span svg');
                if (svg) {
                    svg.style.transform = 'rotate(0deg)';
                }
            }
        } else {
            hideAllDropdowns();
        }

        floatingNav?.classList.remove('show');
        document.dispatchEvent(new CustomEvent('resetFloatingNav'));
    });

    // Handle hover events for desktop with improved accessibility
    mainNav.addEventListener('mouseenter', (e) => {
        const link = e.target.closest('li > a');
        if (!link) return;

        const hasDropdown = link.classList.contains('has-dropdown');
        
        if (hasDropdown) {
            e.stopPropagation();
            
            const li = link.parentElement;
            
            if (hoverTimeout) {
                clearTimeout(hoverTimeout);
                hoverTimeout = null;
            }
            
            hideSiblingDropdowns(li);
            
            hoverTimeout = setTimeout(() => {
                showDropdown(link);
                // Rotate SVG based on menu level
                const svg = link.querySelector('span svg');
                if (svg) {
                    if (li.closest('ul.navigation-sub')) {
                        svg.style.transform = 'rotate(90deg)';
                    } else {
                        svg.style.transform = 'rotate(180deg)';
                    }
                }
                setTimeout(positionNestedDropdowns, 10);
            }, 50);
        }

        floatingNav?.classList.remove('show');
        document.dispatchEvent(new CustomEvent('resetFloatingNav'));
    }, true);

    // Handle mouse leave on individual dropdown items
    mainNav.addEventListener('mouseleave', (e) => {
        const li = e.target.closest('li');
        if (!li) return;
        
        const submenu = li.querySelector('ul');
        if (submenu) {
            e.stopPropagation();
            
            setTimeout(() => {
                if (!li.matches(':hover') && !submenu.matches(':hover')) {
                    hideDropdown(li.querySelector('a'));
                    // Reset SVG rotation
                    const svg = li.querySelector('a span svg');
                    if (svg) {
                        svg.style.transform = 'rotate(0deg)';
                    }
                }
            }, 200);
        }
    }, true);

    // Add hover delay timers
    let hoverTimeout = null;
    let leaveTimeout = null;

    // Hide dropdowns when mouse leaves the navigation with delay
    mainNav.addEventListener('mouseleave', () => {
        if (hoverTimeout) {
            clearTimeout(hoverTimeout);
            hoverTimeout = null;
        }
        
        leaveTimeout = setTimeout(() => {
            hideAllDropdowns();
            // Reset all SVG rotations
            mainNav.querySelectorAll('a span svg').forEach(svg => {
                svg.style.transform = 'rotate(0deg)';
            });
        }, 150);
    });

    // Clear leave timeout when mouse enters navigation
    mainNav.addEventListener('mouseenter', () => {
        if (leaveTimeout) {
            clearTimeout(leaveTimeout);
            leaveTimeout = null;
        }
    });

    // Hide dropdowns when clicking outside
    document.addEventListener('click', (e) => {
        if (!mainNav.contains(e.target)) {
            hideAllDropdowns();
            // Reset all SVG rotations
            mainNav.querySelectorAll('a span svg').forEach(svg => {
                svg.style.transform = 'rotate(0deg)';
            });
        }
    });

    // Handle window resize for dropdown positioning
    window.addEventListener('resize', () => {
        positionNestedDropdowns();
    });

    // Initialize dropdowns
    initializeDropdowns(mainNav);
}


// Main export
export default function navigation() {
    handleMainNavigation();
    handleSideNavigation();
}