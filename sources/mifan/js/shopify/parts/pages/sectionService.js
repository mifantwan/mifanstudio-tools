export default function sectionService() {
    const section = document.querySelector('.section--services-pricing');
    if (!section) {
        return;
    }

    const buttons = section.querySelectorAll('button[route-to]');
    if (buttons.length === 0) {
        return;
    }

    const contentDivs = section.querySelectorAll('.content--services-pricing[content-route]');
    if (contentDivs.length === 0) {
        return;
    }

    if (section.dataset.serviceInitialized === 'true') {
        return;
    }
    section.dataset.serviceInitialized = 'true';

    contentDivs.forEach(div => {
        div.style.display = 'none';
    });

    const showContent = (route, skipTransition = false) => {
        contentDivs.forEach(div => {
            div.classList.remove('is-active');
            div.style.display = 'none';
        });

        const targetContent = section.querySelector(`.content--services-pricing[content-route="${route}"]`);
        if (targetContent) {
            if (skipTransition) {
                targetContent.style.transition = 'none';
                targetContent.style.display = 'flex';
                targetContent.classList.add('is-active');
                
                targetContent.offsetHeight;
                targetContent.style.transition = '';
            } else {
                targetContent.style.display = 'flex';
                
                targetContent.offsetHeight;
                
                requestAnimationFrame(() => {
                    targetContent.classList.add('is-active');
                });
            }
        }

        buttons.forEach(button => button.removeAttribute('popular'));
        
        const activeButton = section.querySelector(`button[route-to="${route}"]`);
        if (activeButton) {
            activeButton.setAttribute('popular', '');
        }
    };

    const popularButton = section.querySelector('button[route-to][popular]');
    const defaultRoute = popularButton?.getAttribute('route-to') || buttons[0]?.getAttribute('route-to');

    if (defaultRoute) {
        showContent(defaultRoute, true);
    }

    section.addEventListener('click', (e) => {
        const button = e.target.closest('button[route-to]');
        if (button) {
            e.stopPropagation();
            const route = button.getAttribute('route-to');
            if (route) {
                showContent(route, false);
            }
        }
    });
}
