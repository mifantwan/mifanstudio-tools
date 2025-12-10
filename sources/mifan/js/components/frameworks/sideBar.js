export default function sideBar() {
    const sideBars = document.querySelectorAll('.mifan-side');
    const sidebarButtons = document.querySelectorAll('[sidebar-route]');
    
    if (!sideBars.length) return;

    const hideSidebar = (sidebar) => {
        sidebar.classList.remove('is-visible');
    };

    const showSidebar = (sidebar) => {
        sideBars.forEach(sb => hideSidebar(sb));
        sidebar.classList.add('is-visible');
    };

    sidebarButtons.forEach(button => {
        button.addEventListener('click', () => {
            const route = button.getAttribute('sidebar-route');
            const targetSidebar = document.querySelector(`[sidebar-content="${route}"]`);
            
            if (targetSidebar) {
                if (targetSidebar.classList.contains('is-visible')) {
                    hideSidebar(targetSidebar);
                } else {
                    showSidebar(targetSidebar);
                }
            }
        });
    });

    sideBars.forEach(sidebar => {
        const closeButton = sidebar.querySelector('.close');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                hideSidebar(sidebar);
            });
        }
    });
}