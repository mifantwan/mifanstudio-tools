// Import
import '../sass/apps.sass'
import mainRun from './components/mainRun.js';
import signature from './components/signature.js';
import imageReplacement from './components/imageReplacement.js';

// Initialize once on page load
const initApp = () => {
    mainRun();
    signature();
    imageReplacement();
};

// Expose re-render hook for route updates
window.mifanReRenderApp = () => {
    signature();
};

// Run on DOM ready
document.readyState === 'loading' 
    ? document.addEventListener('DOMContentLoaded', initApp)
    : initApp();
