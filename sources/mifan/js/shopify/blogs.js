import '../../sass/components/blogs.sass'

const initBlogs = () => {};

// Add to re-render hook for SPA route updates
if (window.mifanReRenderApp) {
    const originalReRenderApp = window.mifanReRenderApp;
    window.mifanReRenderApp = function reRenderApp() {
        originalReRenderApp();
        initBlogs();
    };
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBlogs);
} else {
    initBlogs();
}

// Re-initialize on resize
window.addEventListener('resize', initBlogs);