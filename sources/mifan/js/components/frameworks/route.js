export default function route() {
    // Cache DOM elements
    const shell = document.querySelector('.mifan-apps');
    if (!shell) return;

    // Store original reRender functions to restore them before loading new page scripts
    const originalReRenderApp = window.mifanReRenderApp;
    const originalReRender = window.mifanReRender;

    // Track currently loaded page-specific assets
    const currentPageAssets = {
        styles: new Set(),
        scripts: new Set()
    };

    // Global assets that should never be removed (as Set for O(1) lookup)
    const globalAssets = new Set([
        'mifan-preloader.css',
        'mifan-preloader.js',
        'mifan-apps.css',
        'mifan-frameworks.css',
        'mifan-library.css',
        'vendors.js',
        'mifan-apps.js',
        'mifan-frameworks.js',
        'mifan-library.js'
    ]);

    const isModifiedClick = (event) => event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
    
    const isSameOrigin = (url) => {
        try {
            return new URL(url, window.location.origin).origin === window.location.origin;
        } catch {
            return false;
        }
    };

    const isGlobalAsset = (href) => {
        for (const asset of globalAssets) {
            if (href.includes(asset)) return true;
        }
        return false;
    };

    const removeOldAssets = () => {
        // Remove old stylesheets
        for (const href of currentPageAssets.styles) {
            const link = document.querySelector(`link[href="${href}"]`);
            if (link) link.remove();
        }

        // Remove old scripts
        for (const src of currentPageAssets.scripts) {
            const script = document.querySelector(`script[src="${src}"]`);
            if (script) script.remove();
        }

        // Reset reRender functions to their original state
        if (originalReRenderApp) window.mifanReRenderApp = originalReRenderApp;
        if (originalReRender) window.mifanReRender = originalReRender;

        // Clear tracking
        currentPageAssets.styles.clear();
        currentPageAssets.scripts.clear();
    };

    const loadNewAssets = async (doc) => {
        const stylePromises = [];
        const scriptPromises = [];

        // Extract and load page-specific stylesheets
        const styleLinks = doc.querySelectorAll('link[rel="stylesheet"]');
        for (let i = 0; i < styleLinks.length; i++) {
            const href = styleLinks[i].getAttribute('href');
            if (href && !isGlobalAsset(href)) {
                stylePromises.push(new Promise((resolve, reject) => {
                    const link = document.createElement('link');
                    link.rel = 'stylesheet';
                    link.href = href;
                    link.onload = resolve;
                    link.onerror = reject;
                    document.head.appendChild(link);
                    currentPageAssets.styles.add(href);
                }));
            }
        }

        // Extract and load page-specific scripts
        const scriptTags = doc.querySelectorAll('script[src]');
        for (let i = 0; i < scriptTags.length; i++) {
            const src = scriptTags[i].getAttribute('src');
            if (src && !isGlobalAsset(src)) {
                scriptPromises.push(new Promise((resolve, reject) => {
                    const script = document.createElement('script');
                    script.src = src;
                    script.onload = resolve;
                    script.onerror = reject;
                    document.head.appendChild(script);
                    currentPageAssets.scripts.add(src);
                }));
            }
        }

        // Wait for all assets to load
        await Promise.all([...stylePromises, ...scriptPromises]);
    };

    const loadPath = async (url, replace = false) => {
        try {
            const response = await fetch(url, { headers: { 'X-Requested-With': 'fetch' } });
            if (!response.ok) return window.location.assign(url);
            
            const html = await response.text();
            const doc = new DOMParser().parseFromString(html, 'text/html');
            const newShell = doc.querySelector('.mifan-apps');

            // Remove old page-specific assets
            removeOldAssets();

            // Load new page-specific assets
            await loadNewAssets(doc);

            if (newShell) {
                shell.innerHTML = newShell.innerHTML;
            } else {
                document.body.innerHTML = doc.body.innerHTML;
            }

            // Update page title
            const newTitle = doc.querySelector('title');
            if (newTitle) document.title = newTitle.textContent;

            if (replace) {
                history.replaceState({}, '', url);
            } else {
                history.pushState({}, '', url);
            }

            // Scroll to top of page
            window.scrollTo(0, 0);

            // Re-run client initializers
            // Use setTimeout to ensure new scripts have executed their setup code
            setTimeout(() => {
                window.mifanReRender?.();
                window.mifanReRenderApp?.();
            }, 0);
        } catch {
            window.location.assign(url);
        }
    };

    const onLinkClick = (event) => {
        if (isModifiedClick(event)) return;
        const anchor = event.target.closest('a');
        if (!anchor) return;
        
        const href = anchor.getAttribute('href');
        if (!href || href.startsWith('mailto:') || href.startsWith('tel:') || anchor.target === '_blank') return;
        
        // Handle hash links (anchor links) - allow default scroll behavior
        if (href.startsWith('#')) {
            const targetId = href.substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                event.preventDefault();
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
            return;
        }
        
        if (!isSameOrigin(href)) return;

        event.preventDefault();
        loadPath(href);
    };

    const onButtonClick = (event) => {
        const button = event.target.closest('button');
        if (!button) return;

        // Check if button has onclick with window.location.href
        const onclickAttr = button.getAttribute('onclick');
        if (!onclickAttr || !onclickAttr.includes('window.location.href')) return;

        // Extract URL from onclick attribute
        const urlMatch = onclickAttr.match(/window\.location\.href\s*=\s*['"]([^'"]+)['"]/);
        if (!urlMatch) return;

        const href = urlMatch[1];
        if (!href || href.startsWith('mailto:') || href.startsWith('tel:')) return;
        if (!isSameOrigin(href)) return;

        event.preventDefault();
        loadPath(href);
    };

    const onPopState = () => loadPath(window.location.href, true);

    // Attach listeners once
    window.removeEventListener('popstate', onPopState);
    document.removeEventListener('click', onLinkClick);
    window.addEventListener('popstate', onPopState);
    document.addEventListener('click', onLinkClick);
    document.addEventListener('click', onButtonClick);
}