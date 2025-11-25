// Track processed images to avoid duplicate listeners
const processedImages = new WeakSet();
const REPLACEMENT_IMAGE = 'assets/images/replacement.jpg';

function handleImage(img) {
    // Skip if already processed
    if (processedImages.has(img)) return;
    processedImages.add(img);
    
    // Single error handler
    img.addEventListener('error', () => {
        // Prevent infinite loop
        if (img.src.includes(REPLACEMENT_IMAGE)) return;
        
        // Clean up and replace
        img.removeAttribute('srcset');
        img.removeAttribute('sizes');
        img.src = REPLACEMENT_IMAGE;
    }, { once: true });
    
    // Handle lazy loading attributes
    const lazySrc = img.dataset.src;
    const lazySrcset = img.dataset.srcset;
    
    if (lazySrc) img.src = lazySrc;
    if (lazySrcset) {
        img.srcset = lazySrcset;
        if (img.dataset.sizes) img.sizes = img.dataset.sizes;
    }
    
    // Check already loaded images that failed
    if (img.complete && img.naturalHeight === 0 && !img.src.includes(REPLACEMENT_IMAGE)) {
        img.removeAttribute('srcset');
        img.removeAttribute('sizes');
        img.src = REPLACEMENT_IMAGE;
    }
}

export default function imageReplacement() {
    // Process existing images
    document.querySelectorAll('img').forEach(handleImage);
    
    // Observe for new images
    const observer = new MutationObserver(mutations => {
        for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
                if (node.nodeType !== 1) continue;
                
                if (node.tagName === 'IMG') {
                    handleImage(node);
                } else if (node.querySelectorAll) {
                    node.querySelectorAll('img').forEach(handleImage);
                }
            }
        }
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    return () => observer.disconnect();
}