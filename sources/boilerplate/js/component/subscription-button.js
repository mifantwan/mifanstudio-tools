export default class SubscriptionButton {
    constructor() {
        this.buttons = document.querySelectorAll('#product-subscription .options button')
        this.selectedButton = null
        this.init()
    }

    init() {
        // First, clear any existing selected state from HTML
        this.buttons.forEach((button, index) => {
            button.classList.remove('selected')
            button.setAttribute('data-option', index)
            button.setAttribute('role', 'radio')
            button.setAttribute('tabindex', '-1')
            button.setAttribute('aria-checked', 'false')
            
            button.addEventListener('click', (e) => {
                e.preventDefault()
                this.selectButton(button)
            })
            button.addEventListener('keydown', (e) => this.handleKeydown(e, button))
        })

        // Set one-time purchase button as selected by default
        const oneTimeButton = Array.from(this.buttons).find(button => 
            button.getAttribute('data-type') === 'one-time'
        )
        if (oneTimeButton) {
            this.selectButton(oneTimeButton)
        } else if (this.buttons.length > 0) {
            // Fallback to first button if one-time button not found
            this.selectButton(this.buttons[0])
        }
    }

    selectButton(selectedButton) {
        if (!selectedButton || !this.buttons.length) return
        // Remove selected state from all buttons
        this.buttons.forEach(button => {
            button.classList.remove('selected')
            button.setAttribute('aria-checked', 'false')
            button.setAttribute('tabindex', '-1')
        })

        // Add selected state to clicked button
        selectedButton.classList.add('selected')
        selectedButton.setAttribute('aria-checked', 'true')
        selectedButton.setAttribute('tabindex', '0')
        
        // Focus only if not already focused to avoid unnecessary focus changes
        if (document.activeElement !== selectedButton) {
            selectedButton.focus()
        }

        this.selectedButton = selectedButton

        // Dispatch custom event for other components to listen to
        const event = new CustomEvent('subscriptionOptionChanged', {
            detail: {
                selectedOption: selectedButton.getAttribute('data-option'),
                isSubscription: selectedButton.getAttribute('data-option') === '1'
            }
        })
        document.dispatchEvent(event)
    }

    handleKeydown(event, button) {
        if (!button || !this.buttons.length) return
        
        const currentIndex = Array.from(this.buttons).indexOf(button)
        if (currentIndex === -1) return
        
        switch(event.key) {
            case 'ArrowRight':
            case 'ArrowDown':
                event.preventDefault()
                const nextIndex = (currentIndex + 1) % this.buttons.length
                this.selectButton(this.buttons[nextIndex])
                break
            case 'ArrowLeft':
            case 'ArrowUp':
                event.preventDefault()
                const prevIndex = currentIndex === 0 ? this.buttons.length - 1 : currentIndex - 1
                this.selectButton(this.buttons[prevIndex])
                break
            case ' ':
            case 'Enter':
                event.preventDefault()
                this.selectButton(button)
                break
        }
    }

    getSelectedOption() {
        return this.selectedButton ? this.selectedButton.getAttribute('data-option') : null
    }

    isSubscriptionSelected() {
        return this.getSelectedOption() === '1'
    }
}