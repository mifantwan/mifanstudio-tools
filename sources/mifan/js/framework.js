// Import
import '../sass/framework.sass'
import route from './components/frameworks/route.js';   
import announcementsToggle from './components/frameworks/announcements.js';
import pageTransition from './components/frameworks/pageTransition.js';
import footer from './components/frameworks/footer.js';

// Lazy load console framework only when needed
let consoleFramework = null;
const loadConsoleFramework = () => {
    if (!consoleFramework) {
        import('./components/frameworks/console.js').then(module => {
            consoleFramework = module.default;
            consoleFramework();
        });
    }
};

// Components that run on init only
const initOnlyList = [route];

// Components that run on both init and re-render
const reRenderList = [
    announcementsToggle,
    pageTransition,
    footer
];

// Expose a re-render hook for SPA route updates
window.mifanReRender = function reRender() {
    if (consoleFramework) consoleFramework();
    reRenderList.forEach(func => func());
};

// DOM Ready listener
const onDOMContentLoaded = () => {
    initOnlyList.forEach(func => func());
    reRenderList.forEach(func => func());
    // Load console framework after critical components
    setTimeout(loadConsoleFramework, 100);
};

document.readyState === 'loading' 
    ? document.addEventListener('DOMContentLoaded', onDOMContentLoaded)
    : onDOMContentLoaded();