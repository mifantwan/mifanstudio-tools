// Import
import '../sass/framework.sass'
import route from './components/frameworks/route.js';   
import announcementsToggle from './components/frameworks/announcements.js';
import pageTransition from './components/frameworks/pageTransition.js';
import footer from './components/frameworks/footer.js';

// Lazy load console framework
let consoleFramework = null;
const loadConsoleFramework = () => {
    if (!consoleFramework) {
        import('./components/frameworks/console.js').then(module => {
            consoleFramework = module.default;
            consoleFramework();
        });
    }
};

// Initialize once on page load
const initFramework = () => {
    route();
    window.mifanReRender();
    // Load console after critical components
    setTimeout(loadConsoleFramework, 100);
};

// Expose re-render hook for route updates
window.mifanReRender = () => {
    announcementsToggle();
    pageTransition();
    footer();
    consoleFramework?.();
};

// Run on DOM ready
document.readyState === 'loading' 
    ? document.addEventListener('DOMContentLoaded', initFramework)
    : initFramework();