// Helper function to update hidden inputs for form submission
export default function productForm() {
    // form input quantity
    const formInputQuantity = document.querySelector('input[name="quantity"]')
    const decreaseBtn = document.querySelector('.quantity-decrease')
    const increaseBtn = document.querySelector('.quantity-increase')

    if (formInputQuantity && decreaseBtn && increaseBtn) {
        // Helper function to update button states
        const updateButtonStates = () => {
            const currentValue = parseInt(formInputQuantity.value) || 1
            const minValue = parseInt(formInputQuantity.min) || 1
            const maxValue = parseInt(formInputQuantity.max) || 999
            
            decreaseBtn.disabled = currentValue <= minValue
            increaseBtn.disabled = currentValue >= maxValue
        }

        // Initial button state
        updateButtonStates()

        // Decrease quantity
        decreaseBtn.addEventListener('click', () => {
            const currentValue = parseInt(formInputQuantity.value) || 1
            const minValue = parseInt(formInputQuantity.min) || 1
            const newValue = Math.max(currentValue - 1, minValue)
            formInputQuantity.value = newValue
            updateButtonStates()
        })

        // Increase quantity
        increaseBtn.addEventListener('click', () => {
            const currentValue = parseInt(formInputQuantity.value) || 1
            const maxValue = parseInt(formInputQuantity.max) || 999
            const newValue = Math.min(currentValue + 1, maxValue)
            formInputQuantity.value = newValue
            updateButtonStates()
        })

        // Handle direct input changes
        formInputQuantity.addEventListener('input', (e) => {
            const value = parseInt(e.target.value)
            const minValue = parseInt(formInputQuantity.min) || 1
            const maxValue = parseInt(formInputQuantity.max) || 999
            
            if (isNaN(value) || value < minValue) {
                e.target.value = minValue
            } else if (value > maxValue) {
                e.target.value = maxValue
            }
            updateButtonStates()
        })

        // Subscription option buttons (radio button behavior)
        const subscriptionButtons = document.querySelectorAll('.subscription-option-btn')
        const subscriptionContainer = document.querySelector('.radio-option-subscription')
        const subscriptionRadio = document.querySelector('#selling-plan-1')
        const onetimeRadio = document.querySelector('#selling-plan-2')

        // Initial state
        if (subscriptionRadio.checked) {
            subscriptionContainer.classList.remove('hidden')
        } else {
            subscriptionContainer.classList.add('hidden')
        }

        // Handle radio button changes
        subscriptionRadio.addEventListener('change', () => {
            subscriptionContainer.classList.remove('hidden')
        })

        onetimeRadio.addEventListener('change', () => {
            subscriptionContainer.classList.add('hidden')
        })
        
        subscriptionButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Remove aria-pressed from all buttons in the group
                subscriptionButtons.forEach(btn => {
                    btn.setAttribute('aria-pressed', 'false')
                })
                
                // Set the clicked button as selected
                button.setAttribute('aria-pressed', 'true')
                
                const selectedValue = button.getAttribute('data-value')
                console.log('Selected subscription:', selectedValue)
            })
        })

        // Variant selector functionality
        const variantTypes = document.querySelectorAll('.variant-type')
        
        variantTypes.forEach(variantType => {
            const variantButtons = variantType.querySelectorAll('.variant-option')
            const variantTypeName = variantType.getAttribute('type')
            
            // Set first variant as selected by default
            if (variantButtons.length > 0) {
                variantButtons[0].setAttribute('aria-pressed', 'true')
                variantButtons[0].classList.add('selected')
            }
            
            // Add click handlers for each variant button
            variantButtons.forEach(button => {
                button.addEventListener('click', () => {
                    // Remove selected state from all buttons in this variant type
                    variantButtons.forEach(btn => {
                        btn.setAttribute('aria-pressed', 'false')
                        btn.classList.remove('selected')
                    })
                    
                    // Set clicked button as selected
                    button.setAttribute('aria-pressed', 'true')
                    button.classList.add('selected')
                    
                    const selectedValue = button.getAttribute('data-value')
                    console.log(`Selected ${variantTypeName}:`, selectedValue)
                })
            })
        })
    }
}