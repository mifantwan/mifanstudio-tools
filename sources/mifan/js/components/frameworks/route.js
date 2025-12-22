let baseReRenderApp = null;
let baseReRender = null;

const captureBaseReRenders = () => {
    if (!baseReRenderApp && typeof window.mifanReRenderApp === 'function') {
        baseReRenderApp = window.mifanReRenderApp;
    }

    if (!baseReRender && typeof window.mifanReRender === 'function') {
        baseReRender = window.mifanReRender;
    }
};

export default function route() {
    const shell = document.querySelector('.mifan-apps');
    if (!shell) return;

    captureBaseReRenders();

    const currentPageAssets = { styles: new Set(), scripts: new Set() };

    const globalAssets = new Set([
        'mifan-preloader', 'mifan-apps', 'mifan-frameworks', 
        'mifan-library', 'vendors'
    ]);

    const isModifiedClick = (e) => e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0;
    
    const isSameOrigin = (url) => {
        try {
            return new URL(url, window.location.origin).origin === window.location.origin;
        } catch {
            return false;
        }
    };

    const isSameRoute = (url) => {
        try {
            const currentUrl = new URL(window.location.href);
            const targetUrl = new URL(url, window.location.origin);
            return currentUrl.pathname === targetUrl.pathname && 
                   currentUrl.search === targetUrl.search;
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
        currentPageAssets.styles.forEach(href => {
            document.querySelector(`link[href="${href}"]`)?.remove();
        });
        currentPageAssets.scripts.forEach(src => {
            document.querySelector(`script[src="${src}"]`)?.remove();
        });
        
        captureBaseReRenders();
        if (baseReRenderApp) window.mifanReRenderApp = baseReRenderApp;
        if (baseReRender) window.mifanReRender = baseReRender;
        
        currentPageAssets.styles.clear();
        currentPageAssets.scripts.clear();
    };

    const loadAsset = (type, attr, value, collection) => {
        return new Promise((resolve, reject) => {
            const element = document.createElement(type);
            if (type === 'link') {
                element.rel = 'stylesheet';
                element.href = value;
            } else {
                element.src = value;
            }
            element.onload = resolve;
            element.onerror = reject;
            document.head.appendChild(element);
            collection.add(value);
        });
    };

    const loadNewAssets = async (doc) => {
        const promises = [];

        doc.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
            const href = link.getAttribute('href');
            if (href && !isGlobalAsset(href)) {
                promises.push(loadAsset('link', 'href', href, currentPageAssets.styles));
            }
        });

        doc.querySelectorAll('script[src]').forEach(script => {
            const src = script.getAttribute('src');
            if (src && !isGlobalAsset(src)) {
                promises.push(loadAsset('script', 'src', src, currentPageAssets.scripts));
            }
        });

        await Promise.all(promises);
    };

    const loadPath = async (url, replace = false) => {
        try {
            const response = await fetch(url, { headers: { 'X-Requested-With': 'fetch' } });
            if (!response.ok) return window.location.assign(url);
            
            const html = await response.text();
            const doc = new DOMParser().parseFromString(html, 'text/html');
            const newShell = doc.querySelector('.mifan-apps');

            removeOldAssets();
            await loadNewAssets(doc);

            if (newShell) {
                shell.innerHTML = newShell.innerHTML;
            } else {
                document.body.innerHTML = doc.body.innerHTML;
            }

            const newTitle = doc.querySelector('title');
            if (newTitle) document.title = newTitle.textContent;
            
            history[replace ? 'replaceState' : 'pushState']({}, '', url);

            window.scrollTo({ top: 0, behavior: 'instant' });

            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    window.mifanReRender?.();
                    window.mifanReRenderApp?.();
                });
            });
        } catch {
            window.location.assign(url);
        }
    };

    const handleNavigation = (event) => {
        if (isModifiedClick(event)) return;
        
        const anchor = event.target.closest('a');
        if (anchor) {
            const href = anchor.getAttribute('href');
            if (!href || href.startsWith('mailto:') || href.startsWith('tel:') || anchor.target === '_blank') return;
            
            if (href.startsWith('#')) {
                const targetElement = document.getElementById(href.substring(1));
                if (targetElement) {
                    event.preventDefault();
                    targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
                return;
            }
            
            if (isSameOrigin(href)) {
                if (isSameRoute(href)) {
                    return;
                }
                event.preventDefault();
                loadPath(href);
            }
            return;
        }

        const button = event.target.closest('button');
        if (button) {
            const onclick = button.getAttribute('onclick');
            if (onclick?.includes('window.location.href')) {
                const urlMatch = onclick.match(/window\.location\.href\s*=\s*['"]([^'"]+)['"]/);
                if (urlMatch) {
                    const href = urlMatch[1];
                    if (href && !href.startsWith('mailto:') && !href.startsWith('tel:') && isSameOrigin(href)) {
                        if (isSameRoute(href)) {
                            return;
                        }
                        event.preventDefault();
                        loadPath(href);
                    }
                }
            }
        }
    };

    window.addEventListener('popstate', () => loadPath(window.location.href, true));
    document.addEventListener('click', handleNavigation);
}