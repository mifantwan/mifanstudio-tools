export default function sideBar() {
    const sideBars = document.querySelectorAll('.mifan-side');
    const sidebarButtons = document.querySelectorAll('[sidebar-route]');
    
    if (!sideBars.length) return;

    // Function to hide a sidebar
    const hideSidebar = (sidebar) => {
        sidebar.classList.remove('is-visible');
    };

    // Function to show a sidebar
    const showSidebar = (sidebar) => {
        // Hide all other sidebars first
        sideBars.forEach(sb => hideSidebar(sb));
        
        // Show the selected sidebar
        sidebar.classList.add('is-visible');
    };

    // Handle sidebar route buttons
    sidebarButtons.forEach(button => {
        button.addEventListener('click', () => {
            const route = button.getAttribute('sidebar-route');
            const targetSidebar = document.querySelector(`[sidebar-content="${route}"]`);
            
            if (targetSidebar) {
                // Toggle: if already visible, hide it; otherwise show it
                if (targetSidebar.classList.contains('is-visible')) {
                    hideSidebar(targetSidebar);
                } else {
                    showSidebar(targetSidebar);
                }
            }
        });
    });

    // Handle close buttons
    sideBars.forEach(sidebar => {
        const closeButton = sidebar.querySelector('.close');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                hideSidebar(sidebar);
            });
        }
    });
}