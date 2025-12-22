// Import
import '../sass/framework.sass'
import { onReady } from './globalInit.js';
import route from './components/frameworks/route.js';   
import announcementsToggle from './components/frameworks/announcements.js';
import customNavs from './components/frameworks/customNavs.js';
import pageTransition from './components/frameworks/pageTransition.js';
import sideBar from './components/frameworks/sideBar.js';
import popUp from './components/frameworks/popUp.js';
import notifications from './components/frameworks/notifications.js';
import search from './components/frameworks/search.js';
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
    // Ensure we're at the top on initial load
    window.scrollTo({ top: 0, behavior: 'instant' });
    
    route();
    window.mifanReRender();
    // Load console after critical components
    setTimeout(loadConsoleFramework, 100);
};

// Expose re-render hook for route updates
window.mifanReRender = () => {
    announcementsToggle();
    customNavs();
    pageTransition();
    sideBar();
    popUp();
    notifications();
    search();
    footer();
    consoleFramework?.();
    search();
};

// Register for global DOM-ready
onReady(initFramework);