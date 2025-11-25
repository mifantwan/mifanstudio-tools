import '../../sass/components/pages.sass'

import headerDefault from './parts/pages/headerDefault.js';
import sectionService from './parts/pages/sectionService.js';
import sectionPartner from './parts/pages/sectionPartner.js';

// Initialize all sections
const initSections = () => {
    headerDefault();
    sectionService();
    sectionPartner();
};

// Add to re-render hook for SPA route updates
if (window.mifanReRenderApp) {
    const originalReRenderApp = window.mifanReRenderApp;
    window.mifanReRenderApp = function reRenderApp() {
        originalReRenderApp();
        initSections();
    };
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSections);
} else {
    initSections();
}

// Re-initialize on resize
window.addEventListener('resize', initSections);