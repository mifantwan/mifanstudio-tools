import '../../sass/components/blogs.sass'
import { onReady, extendReRenderApp } from '../globalInit.js';

const initBlogs = () => {};

// Add to re-render hook for SPA route updates
extendReRenderApp(initBlogs);

// Initialize on global DOM ready
onReady(initBlogs);

// Re-initialize on resize
window.addEventListener('resize', initBlogs);