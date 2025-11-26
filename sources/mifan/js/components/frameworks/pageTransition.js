// Store observer globally to allow cleanup on route changes
let pageTransitionObserver = null;

// Cache for excluded selectors (more efficient than multiple checks)
const shouldExcludeSection = (section) => {
    return section.classList.contains('single-post-page') ||
           section.closest('.single-post-page--routing') ||
           section.getAttribute('content-id') === 'content' ||
           window.getComputedStyle(section).position === 'sticky';
};

// Check if element is in viewport with threshold
const isInViewport = (element, threshold = 0.15) => {
    const rect = element.getBoundingClientRect();
    if (rect.height === 0) return false;
    
    const windowHeight = window.innerHeight;
    const visibleHeight = Math.min(rect.bottom, windowHeight) - Math.max(rect.top, 0);
    return visibleHeight / rect.height >= threshold && rect.top < windowHeight - 20;
};

// Main page transition function
export default function pageTransition() {
    // Cleanup previous observer
    pageTransitionObserver?.disconnect();

    // Create new observer
    pageTransitionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                pageTransitionObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -20px 0px' });

    // Process sections with proper timing
    const processSections = () => {
        const sections = document.querySelectorAll('main section');
        if (!sections.length) return;
        
        const isAtTop = window.scrollY < 100;
        
        sections.forEach(section => {
            // Excluded sections are always visible
            if (shouldExcludeSection(section)) {
                section.classList.add('visible');
                return;
            }
            
            // Remove visible class for re-evaluation
            section.classList.remove('visible');
            
            // Immediately show sections at top of page or in viewport
            if (isAtTop || isInViewport(section)) {
                section.classList.add('visible');
            } else {
                // Observe sections below viewport
                pageTransitionObserver.observe(section);
            }
        });
    };

    // Use single RAF since route.js already wraps calls in RAF
    requestAnimationFrame(processSections);

    // Reset header animation
    const header = document.querySelector('header .page-header-container');
    if (header) {
        header.style.animation = 'none';
        void header.offsetHeight;
        header.style.animation = '';
    }
}