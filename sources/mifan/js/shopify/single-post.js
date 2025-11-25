import '../../sass/components/single-post.sass'
import singlePostIndexing from '../components/singlePostIndexing.js';
import singlePostSwitch from '../components/singlePostSwitch.js';
import singlePostCode from '../components/singlePostCode.js';
import singlePostSocialShare from '../components/singlePostSocialShare.js';

const initSinglePost = () => {
    singlePostIndexing();
    singlePostSwitch();
    singlePostCode();
    singlePostSocialShare();
};

// Add to re-render hook for SPA route updates
if (window.mifanReRenderApp) {
    const originalReRenderApp = window.mifanReRenderApp;
    window.mifanReRenderApp = function reRenderApp() {
        originalReRenderApp();
        initSinglePost();
    };
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSinglePost);
} else {
    initSinglePost();
}

// Re-initialize on resize
window.addEventListener('resize', initSinglePost);