export default function sectionPartner() {
    const section = document.querySelector('.section--partners');
    if (!section) {
        return;
    }

    const partnersList = section.querySelector('.partners__list');
    if (!partnersList) {
        return;
    }

    const spans = partnersList.querySelectorAll('span');
    if (!spans.length) {
        return;
    }
    
    // Get delay time from data-delay attribute, default to 1000ms
    const delay = parseInt(partnersList.getAttribute('data-delay')) || 1000;
    
    let currentIndex = 0;
    let intervalId = null;
    let isHovering = false;
    let isSectionVisible = false;
    
    // Initialize all images with grayscale except the first one
    spans.forEach((span, index) => {
        const img = span.querySelector('img, svg');
        if (img) {
            img.style.filter = index === 0 ? 'none' : 'grayscale(100%)';
        }
    });
    
    // Check if section is in viewport
    const checkSectionVisibility = () => {
        const rect = section.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
        
        if (isVisible !== isSectionVisible) {
            isSectionVisible = isVisible;
            
            if (!isVisible) {
                // Section is out of view, pause the interval
                if (intervalId) {
                    clearInterval(intervalId);
                    intervalId = null;
                }
            } else {
                // Section is in view, resume the interval if not hovering
                if (!intervalId && !isHovering) {
                    intervalId = setInterval(highlightImage, delay);
                }
            }
        }
    };
    
    // Check if element is visible within its container
    const isElementVisible = (element) => {
        const containerRect = partnersList.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();
        
        return (
            elementRect.left >= containerRect.left &&
            elementRect.right <= containerRect.right &&
            elementRect.top >= containerRect.top &&
            elementRect.bottom <= containerRect.bottom
        );
    };
    
    // Scroll element into view within container without scrolling the page
    const scrollIntoViewIfNeeded = (element) => {
        if (!isElementVisible(element)) {
            // Use scrollLeft for horizontal scrolling within the container
            const containerRect = partnersList.getBoundingClientRect();
            const elementRect = element.getBoundingClientRect();
            const scrollOffset = elementRect.left - containerRect.left - (containerRect.width / 2) + (elementRect.width / 2);
            
            partnersList.scrollBy({
                left: scrollOffset,
                behavior: 'smooth'
            });
        }
    };
    
    const highlightImage = () => {
        // Don't highlight if section is not visible
        if (!isSectionVisible) {
            return;
        }
        
        // Apply grayscale to all images first
        spans.forEach((span) => {
            const img = span.querySelector('img, svg');
            if (img) {
                img.style.filter = 'grayscale(100%)';
            }
        });
        
        // Move to next index
        currentIndex = (currentIndex + 1) % spans.length;
        
        // Remove filter from current image
        const currentSpan = spans[currentIndex];
        const currentImg = currentSpan.querySelector('img, svg');
        
        if (currentImg) {
            currentImg.style.filter = 'none';
        }
        
        // Scroll the highlighted element into view if needed
        scrollIntoViewIfNeeded(currentSpan);
    };
    
    // Add hover event listeners to each span
    spans.forEach((span, index) => {
        span.addEventListener('mouseenter', () => {
            isHovering = true;
            // Pause the automatic rotation
            if (intervalId) {
                clearInterval(intervalId);
                intervalId = null;
            }
            
            // Apply grayscale to all images
            spans.forEach((s) => {
                const img = s.querySelector('img, svg');
                if (img) {
                    img.style.filter = 'grayscale(100%)';
                }
            });
            
            // Remove grayscale from hovered image
            const img = span.querySelector('img, svg');
            if (img) {
                img.style.filter = 'none';
            }
            
            // Update current index to the hovered element
            currentIndex = index;
        });
        
        span.addEventListener('mouseleave', () => {
            isHovering = false;
            
            // Resume automatic rotation only if section is visible
            if (!intervalId && isSectionVisible) {
                intervalId = setInterval(highlightImage, delay);
            }
        });
    });
    
    // Add scroll listener to check section visibility
    window.addEventListener('scroll', checkSectionVisibility);
    window.addEventListener('resize', checkSectionVisibility);
    
    // Initial visibility check
    checkSectionVisibility();
    
    // Clear any existing interval
    if (intervalId) {
        clearInterval(intervalId);
    }
    
    // Start the loop if section is visible
    if (isSectionVisible) {
        intervalId = setInterval(highlightImage, delay);
    }
    
    // Cleanup function (optional, for when section is removed)
    return () => {
        if (intervalId) {
            clearInterval(intervalId);
        }
        window.removeEventListener('scroll', checkSectionVisibility);
        window.removeEventListener('resize', checkSectionVisibility);
    };
}