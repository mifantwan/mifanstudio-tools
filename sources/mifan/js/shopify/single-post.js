import '../../sass/components/single-post.sass'
import { onReady, extendReRenderApp } from '../globalInit.js';
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
extendReRenderApp(initSinglePost);

// Initialize on global DOM ready
onReady(initSinglePost);

// Re-initialize on resize
window.addEventListener('resize', initSinglePost);