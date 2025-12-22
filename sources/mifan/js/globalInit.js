// Global DOM-ready and re-render helpers

const readyCallbacks = [];
let isReady = false;

const runReadyCallbacks = () => {
    if (isReady) return;
    isReady = true;

    while (readyCallbacks.length) {
        const fn = readyCallbacks.shift();
        try {
            typeof fn === 'function' && fn();
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error(error);
        }
    }
};

export const onReady = (fn) => {
    if (isReady) {
        try {
            fn();
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error(error);
        }
    } else {
        readyCallbacks.push(fn);
    }
};

// Helper to extend SPA re-render hook for app-level code
export const extendReRenderApp = (fn) => {
    if (typeof window === 'undefined' || typeof fn !== 'function') return;

    if (typeof window.mifanReRenderApp === 'function') {
        const originalReRenderApp = window.mifanReRenderApp;
        window.mifanReRenderApp = function reRenderApp() {
            originalReRenderApp();
            fn();
        };
    }
};

if (typeof document !== 'undefined') {
    // Ensure page starts at the very top on initial load
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }
    
    // Force scroll to top before any other code runs
    window.scrollTo(0, 0);
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', runReadyCallbacks);
    } else {
        runReadyCallbacks();
    }
}