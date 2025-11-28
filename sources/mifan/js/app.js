// Import
import '../sass/apps.sass'
import { onReady } from './globalInit.js';
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

// Register for global DOM-ready
onReady(initApp);
