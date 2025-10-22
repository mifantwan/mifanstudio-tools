export default class NavigationTabs {
    constructor() {
        this.init()
    }

    init() {
        this.initializeActiveTab()
        this.bindEvents()
    }

    initializeActiveTab() {
        const navigationTabs = document.querySelectorAll('.boilerplate-navigation section:last-child ul li')
        if (navigationTabs.length > 0) {
            // Remove any existing active classes
            navigationTabs.forEach(tab => {
                tab.classList.remove('active')
            })
            
            // Add active class to first tab
            navigationTabs[0].classList.add('active')
        }
    }

    bindEvents() {
        const navigationTabs = document.querySelectorAll('.boilerplate-navigation section:last-child ul li')
        
        navigationTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault()
                
                // Remove active class from all tabs
                navigationTabs.forEach(t => t.classList.remove('active'))
                
                // Add active class to clicked tab
                tab.classList.add('active')
            })
        })
    }
}