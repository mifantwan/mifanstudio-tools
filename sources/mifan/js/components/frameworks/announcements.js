export default function announcementsToggle() {
    const container = document.querySelector('.mifan-announcements');
    const elements = container?.querySelectorAll('small');
    
    if (!elements || elements.length <= 1) return;
    
    // Clean up existing interval
    if (window.mifanAnnouncementsInterval) {
        clearInterval(window.mifanAnnouncementsInterval);
    }
    
    const delay = parseInt(container.dataset.delay) || 4000;
    let currentIndex = 0;
    
    // Initialize elements
    elements.forEach((el, i) => {
        el.style.opacity = i === 0 ? '1' : '0';
        el.style.transform = i === 0 ? 'translateY(0%)' : 'translateY(100%)';
    });
    
    // Optimized transition function
    const switchNext = () => {
        const current = elements[currentIndex];
        const next = elements[(currentIndex + 1) % elements.length];
        
        // Batch DOM updates
        current.style.cssText = 'opacity: 0; transform: translateY(-100%)';
        next.style.cssText = 'opacity: 1; transform: translateY(100%)';
        
        requestAnimationFrame(() => {
            next.style.transform = 'translateY(0%)';
            setTimeout(() => {
                current.style.transform = 'translateY(100%)';
            }, delay);
        });
        
        currentIndex = (currentIndex + 1) % elements.length;
    };
    
    window.mifanAnnouncementsInterval = setInterval(switchNext, delay);
}