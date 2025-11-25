// Import
import '../sass/apps.sass'
import mainRun from './components/mainRun.js';
import signature from './components/signature.js';
import imageReplacement from './components/imageReplacement.js';
// Start of Selection
const initAppList = [
    mainRun,
    signature,
    imageReplacement
];

// Components that need to re-render after route changes
const reRenderAppList = [
    signature
];

// DOM Ready listener
const onDOMContentLoaded = () => initAppList.length && initAppList.forEach(func => func());

// Expose a re-render hook for SPA route updates
window.mifanReRenderApp = function reRenderApp() {
    if (reRenderAppList.length) reRenderAppList.forEach(func => func());
};

document.readyState === 'loading' 
    ? document.addEventListener('DOMContentLoaded', onDOMContentLoaded)
    : onDOMContentLoaded();
