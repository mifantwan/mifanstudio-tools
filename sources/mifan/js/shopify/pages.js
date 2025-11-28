import '../../sass/components/pages.sass'
import { onReady, extendReRenderApp } from '../globalInit.js';

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
extendReRenderApp(initSections);

// Initialize on global DOM ready
onReady(initSections);

// Re-initialize on resize
window.addEventListener('resize', initSections);