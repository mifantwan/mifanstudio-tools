// ES2025 standard module export
export default function navigation() {
    const navigation = document.getElementById('local-navigation');
    if (!navigation) return;

    // Shared closeDropdowns function
    let dropdownItems;
    const closeDropdowns = (except = null) => {
        if (!dropdownItems) return;

        const resetArrow = (element) => {
            const arrow = element.querySelector('a span > svg');
            if (arrow) {
                arrow.style.transform = 'rotate(0deg)';
            }
        };

        dropdownItems.forEach(item => {
            if (item === except) return;

            // Close main dropdown
            item.classList.remove('dropdown-open');
            resetArrow(item);

            // Close nested dropdowns
            const nestedDropdowns = item.querySelectorAll('li.dropdown-open');
            nestedDropdowns.forEach(child => {
                child.classList.remove('dropdown-open');
                resetArrow(child);
            });
        });
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

        const handleDropdownClick = (item, link, isNavigationSub = false) => {
            const toggleDropdown = (e) => {
                e.preventDefault();
                const isOpen = item.classList.contains('dropdown-open');
                closeDropdowns(isOpen ? null : item);
                item.classList.toggle('dropdown-open', !isOpen);
                
                // Toggle arrow rotation for main navigation
                const arrow = link.querySelector('span > svg');
                if (arrow) {
                    arrow.style.transform = item.classList.contains('dropdown-open') ? 'rotate(180deg)' : 'rotate(0deg)';
                    arrow.style.transition = 'transform 0.3s ease';
                }
            };

            if (isNavigationSub) {
                Object.assign(link, {
                    href: null,
                    style: { cursor: 'pointer' },
                    role: 'button',
                    tabIndex: '0'
                });
            }

            link.addEventListener('click', toggleDropdown);
        };

        dropdownItems.forEach(item => {
            const link = item.querySelector('a');
            if (!link) return;

            item.classList.add('has-dropdown');
            handleDropdownClick(item, link, item.classList.contains('navigation-sub'));
        });

        // Global event listeners
        document.addEventListener('click', e => {
            if (!e.target.closest('#local-navigation')) {
                closeDropdowns();
            }
        });

        document.addEventListener('keydown', e => {
            if (e.key === 'Escape') closeDropdowns();
        });

        // Handle regular navigation links
        navigation.querySelectorAll('a:not([role="button"])').forEach(link => {
            link.addEventListener('click', () => closeDropdowns());
        });

        // Handle hover states for main navigation
        const handleMouseEnter = (e) => {
            const link = e.target.closest('a');
            if (!link) return;
            
            const item = link.closest('li');
            if (!item || !item.classList.contains('has-dropdown')) return;
            
            const arrow = link.querySelector('span > svg');
            if (arrow && !item.classList.contains('dropdown-open')) {
                arrow.style.transform = 'rotate(180deg)';
            }
        };

        const handleMouseLeave = (e) => {
            const link = e.target.closest('a');
            if (!link) return;
            
            const item = link.closest('li');
            if (!item || !item.classList.contains('has-dropdown')) return;
            
            const arrow = link.querySelector('span > svg');
            if (arrow && !item.classList.contains('dropdown-open')) {
                arrow.style.transform = 'rotate(0deg)';
            }
        };

        // Add hover event listeners
        navigation.addEventListener('mouseenter', handleMouseEnter, true);
        navigation.addEventListener('mouseleave', handleMouseLeave, true);
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
                    // Reset rotation for sibling arrows
                    const siblingArrow = sibling.querySelector('span > svg');
                    if (siblingArrow) {
                        siblingArrow.style.transform = 'rotate(0deg)';
                    }
                }
            }
            
            // Toggle current menu
            link.classList.toggle('show');
            
            // Toggle arrow rotation
            const arrow = link.querySelector('span > svg');
            if (arrow) {
                arrow.style.transform = link.classList.contains('show') ? 'rotate(180deg)' : 'rotate(0deg)';
                arrow.style.transition = 'transform 0.3s ease';
            }
        };

        // Single event listener for all clicks
        sideNavs.addEventListener('click', handleClick);
    }

    // Cleanup function
    return () => {
        handleSticky();
    };
}
