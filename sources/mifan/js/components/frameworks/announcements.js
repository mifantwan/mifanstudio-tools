export default function announcementsToggle() {
    const container = document.querySelector('.mifan-announcements');
    const root = document.documentElement;

    if (!container) {
        root.style.setProperty('--announcement-height', '0px');
        return;
    }

    const elements = container.querySelectorAll('small');

    if (!elements || elements.length <= 1) return;

    if (window.mifanAnnouncementsInterval) {
        clearInterval(window.mifanAnnouncementsInterval);
    }

    const delay = parseInt(container.dataset.delay) || 4000;
    let currentIndex = 0;

    elements.forEach((el, i) => {
        el.style.opacity = i === 0 ? '1' : '0';
        el.style.transform = i === 0 ? 'translateY(0%)' : 'translateY(100%)';
    });

    const switchNext = () => {
        const current = elements[currentIndex];
        const next = elements[(currentIndex + 1) % elements.length];

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