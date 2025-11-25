// Store observer globally to allow cleanup on route changes
let pageTransitionObserver = null;

export default function pageTransition() {
    // Cleanup previous observer if it exists
    pageTransitionObserver?.disconnect();

    // Callback function for Intersection Observer
    const handleIntersection = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    };

    // Create the observer with inline config
    pageTransitionObserver = new IntersectionObserver(handleIntersection, {
        threshold: 0.15,
        rootMargin: '0px 0px -20px 0px'
    });

    // Reset and observe all sections within main
    document.querySelectorAll('main section').forEach(section => {
        // Check for sections to exclude from transition
        const hasSinglePostClass = section.classList.contains('single-post-page');
        const hasRoutingClass = section.closest('.single-post-page--routing') !== null;
        const hasContentId = section.hasAttribute('content-id') && section.getAttribute('content-id') === 'content';
        const isSticky = window.getComputedStyle(section).position === 'sticky';
        
        if (hasSinglePostClass || hasRoutingClass || hasContentId || isSticky) {
            // Keep these sections visible without transition
            section.classList.add('visible');
        } else {
            // Apply transition animation to other sections
            section.classList.remove('visible');
            pageTransitionObserver.observe(section);
        }
    });

    // Reset header animation on page load/route change
    const header = document.querySelector('header .page-header-container');
    if (header) {
        header.style.animation = 'none';
        void header.offsetHeight; // Trigger reflow
        header.style.animation = '';
    }
}