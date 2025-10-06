// ES2025 standard module export
export default function floatingWidget() {
    // Use event delegation and avoid storing references to DOM nodes
    // Helper: Hide all side sections
    function hideAllSideSections() {
        // Only select when needed, not on init
        document.querySelectorAll('.floating-widget').forEach(section => {
            section.classList.remove('show');
            setTimeout(() => {
                if (!section.classList.contains('show')) {
                    section.style.display = 'none';
                }
            }, 300);
        });
    }

    // Helper: Show a specific side section
    function showSideSection(targetId) {
        const targetSection = document.getElementById(targetId);
        if (!targetSection) return;
        hideAllSideSections();
        setTimeout(() => {
            targetSection.style.display = 'block';
            // Force reflow
            void targetSection.offsetHeight;
            targetSection.classList.add('show');
        }, 50);
    }

    // Use a single delegated event for all route-to buttons
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('button[route-to]');
        const closeBtn = e.target.closest('button.close-floating-widget');

        if (closeBtn) {
            e.preventDefault();
            hideAllSideSections();
            return;
        }

        if (btn) {
            e.preventDefault();
            const routeTo = btn.getAttribute('route-to');
            if (routeTo && (routeTo.startsWith('local-side-') || routeTo.startsWith('local-'))) {
                const targetSection = document.getElementById(routeTo);
                if (targetSection && targetSection.classList.contains('show')) {
                    hideAllSideSections();
                } else {
                    showSideSection(routeTo);
                }
            } else if (routeTo) {
                window.location.href = routeTo;
            }
            return; // Don't trigger outside click close
        }

        // Click outside any side section closes all
        if (!e.target.closest('.floating-widget')) {
            hideAllSideSections();
        }
    });

    // Escape key closes all side sections
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            hideAllSideSections();
        }
    });
}