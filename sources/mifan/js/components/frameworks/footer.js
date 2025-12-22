export default function footer() {
    const footerNavs = document.querySelector('.footer__navs');
    if (!footerNavs) return;

    const navToggles = Array.from(footerNavs.querySelectorAll('h6'));
    if (!navToggles.length) return;

    const footer = footerNavs.closest('footer');
    const hasFooterMain = footer && footer.querySelector('.footer__main');

    if (!hasFooterMain && navToggles[0]) {
        navToggles[0].classList.add('open');
    }

    const MOBILE_WIDTH = 1025;
    const isMobile = () => window.innerWidth < MOBILE_WIDTH;

    navToggles.forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            if (!isMobile()) return;
            
            const clickedLink = e.target.closest('a');
            if (clickedLink) {
                return;
            }
            
            e.stopPropagation();
            e.preventDefault();
            
            navToggles.forEach(t => {
                if (t === toggle) {
                    toggle.classList.toggle('open');
                } else {
                    t.classList.remove('open');
                }
            });
        });
    });

    let lastMobile = isMobile();
    const resizeHandler = () => {
        const mobileNow = isMobile();
        if (lastMobile !== mobileNow && !mobileNow) {
            navToggles.forEach(toggle => toggle.classList.remove('open'));
            if (!hasFooterMain && navToggles[0]) {
                navToggles[0].classList.add('open');
            }
        }
        lastMobile = mobileNow;
    };

    let resizeTimeout;
    window.addEventListener('resize', () => {
        if (resizeTimeout) clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(resizeHandler, 100);
    }, { passive: true });
}