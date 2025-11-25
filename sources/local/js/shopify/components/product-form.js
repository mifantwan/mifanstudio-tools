// Helper function to update hidden inputs for form submission
export default function productForm() {
    // Wait for DOM to be fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeProductForm)
        return
    }
    initializeProductForm()
}

function initializeProductForm() {
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

        // custom equals variant selector functionality
        const equalsVariantTypes = document.querySelectorAll('.input-variants[variant-type="equals"] .variant-type')
        
        equalsVariantTypes.forEach(equalsVariantType => {
            const equalsVariantButtons = equalsVariantType.querySelectorAll('.variant-option')
            
            // Set equal width based on widest span content
            setEqualButtonWidths(equalsVariantButtons)
            
            // Add click handlers
            equalsVariantButtons.forEach(button => {
                button.addEventListener('click', () => {
                    // Remove selected state from all buttons
                    equalsVariantButtons.forEach(btn => {
                        btn.setAttribute('aria-pressed', 'false')
                        btn.classList.remove('selected')
                    })
                    
                    // Set clicked button as selected
                    button.setAttribute('aria-pressed', 'true')
                    button.classList.add('selected')
                    
                    const selectedValue = button.getAttribute('data-value')
                    console.log('Selected equals variant:', selectedValue)
                })
            })
        })

        // Function to set equal width for buttons based on widest span content
        function setEqualButtonWidths(buttons) {
            if (buttons.length === 0) return
            
            // Reset width to auto to measure natural width
            buttons.forEach(button => {
                button.style.width = 'auto'
                button.style.minWidth = 'auto'
            })
            
            // Force a reflow to ensure width calculations are accurate
            buttons[0].offsetHeight
            
            // Find the widest button by measuring span content
            let maxWidth = 0
            let widestButton = null
            
            buttons.forEach(button => {
                const span = button.querySelector('span')
                const buttonWidth = button.offsetWidth
                const spanContent = span ? span.textContent : button.textContent
                
                console.log(`Button with span "${spanContent}" width: ${buttonWidth}px`)
                
                if (buttonWidth > maxWidth) {
                    maxWidth = buttonWidth
                    widestButton = spanContent
                }
            })
            
            console.log(`Widest button span: "${widestButton}" with width: ${maxWidth}px`)
            
            // Apply the max width to all buttons
            buttons.forEach(button => {
                button.style.width = `${maxWidth}px`
                button.style.minWidth = `${maxWidth}px`
            })
            
            console.log(`All buttons set to width: ${maxWidth}px`)
        }

        // Handle window resize to recalculate button widths
        window.addEventListener('resize', () => {
            equalsVariantTypes.forEach(equalsVariantType => {
                const equalsVariantButtons = equalsVariantType.querySelectorAll('.variant-option')
                setEqualButtonWidths(equalsVariantButtons)
            })
        })

        // Custom floating selector functionality
        const floatingSelectors = document.querySelectorAll('.floating-selector')
        
        floatingSelectors.forEach(selector => {
            const trigger = selector.querySelector('.selector-trigger')
            const options = selector.querySelector('.selector-options')
            const optionElements = selector.querySelectorAll('.option')
            const arrow = selector.querySelector('.selector-arrow')
            const text = selector.querySelector('.selector-text')
            
            // Toggle dropdown
            trigger.addEventListener('click', (e) => {
                e.stopPropagation()
                const isOpen = options.classList.contains('open')
                
                if (isOpen) {
                    closeSelector()
                } else {
                    openSelector()
                }
            })
            
            // Handle option selection
            optionElements.forEach(option => {
                option.addEventListener('click', () => {
                    selectOption(option)
                    closeSelector()
                })
                
                // Keyboard navigation
                option.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        selectOption(option)
                        closeSelector()
                    }
                })
            })
            
            // Close on outside click
            document.addEventListener('click', (e) => {
                if (!selector.contains(e.target)) {
                    closeSelector()
                }
            })
            
            // Keyboard navigation
            trigger.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
                    e.preventDefault()
                    if (!options.classList.contains('open')) {
                        openSelector()
                    }
                }
            })
            
            function openSelector() {
                options.classList.add('open')
                arrow.classList.add('open')
                trigger.setAttribute('aria-expanded', 'true')
                optionElements[0].focus()
            }
            
            function closeSelector() {
                options.classList.remove('open')
                arrow.classList.remove('open')
                trigger.setAttribute('aria-expanded', 'false')
                trigger.focus()
            }
            
            function selectOption(option) {
                // Remove selected class from all options
                optionElements.forEach(opt => opt.classList.remove('selected'))
                
                // Add selected class to clicked option
                option.classList.add('selected')
                
                // Update trigger text
                text.textContent = option.textContent
                
                // Get selected value
                const selectedValue = option.getAttribute('data-value')
                console.log('Selected floating option:', option.textContent, 'Value:', selectedValue)
            }
        })
        
    }
}