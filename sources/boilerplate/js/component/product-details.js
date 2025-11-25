export default class ProductDetails {
    constructor() {
        this.productDetails = document.getElementById('product-details')
        if (!this.productDetails) return
        
        this.sections = this.productDetails.querySelectorAll('.product-details--description')
        this.activeSection = null
        
        this.init()
    }

    init() {
        this.bindEvents()
    }

    bindEvents() {
        // Use event delegation for better memory efficiency
        this.productDetails.addEventListener('click', this.handleClick.bind(this))
    }

    handleClick(event) {
        const button = event.target.closest('button[aria-label*="dropdown"]')
        if (!button) return

        const section = button.closest('.product-details--description')
        const content = section.querySelector('.product-details--description-content')
        
        this.toggleSection(section, content)
    }

    toggleSection(section, content) {
        const isActive = section.classList.contains('active')
        
        if (isActive) {
            // Close current section
            this.closeSection(section, content)
            this.activeSection = null
        } else {
            // Close previously active section if exists
            if (this.activeSection) {
                const activeContent = this.activeSection.querySelector('.product-details--description-content')
                this.closeSection(this.activeSection, activeContent)
            }
            
            // Open clicked section
            this.openSection(section, content)
            this.activeSection = section
        }
    }

    closeSection(section, content) {
        section.classList.remove('active')
        content.classList.remove('active')
    }

    openSection(section, content) {
        section.classList.add('active')
        content.classList.add('active')
    }

    // Cleanup method for memory management
    destroy() {
        if (this.productDetails) {
            this.productDetails.removeEventListener('click', this.handleClick.bind(this))
        }
        this.productDetails = null
        this.sections = null
        this.activeSection = null
    }
}