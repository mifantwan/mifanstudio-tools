// ES2025 standard module export
export default function customSelect() {
    const customSelects = document.querySelectorAll('.custom-select');
    
    customSelects.forEach(select => {
        const trigger = select.querySelector('.select-trigger');
        const options = select.querySelector('.select-options');
        const optionItems = select.querySelectorAll('.select-option');
        
        // Toggle dropdown
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            
            // Close all other open selects first
            customSelects.forEach(otherSelect => {
                if (otherSelect !== select) {
                    otherSelect.classList.remove('open');
                }
            });
            
            select.classList.toggle('open');
        });
        
        // Handle option selection
        optionItems.forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                
                const value = option.dataset.value;
                const text = option.querySelector('span').textContent;
                
                // Update trigger content
                const triggerText = trigger.querySelector('.select-text');
                triggerText.textContent = text;
                
                // Handle flag icon if present (for language selector)
                const flagIcon = option.querySelector('.flag-icon');
                if (flagIcon) {
                    const triggerFlag = trigger.querySelector('.flag-icon');
                    triggerFlag.outerHTML = flagIcon.outerHTML;
                }
                
                // Update data value
                select.dataset.value = value;
                
                // Close dropdown
                select.classList.remove('open');
                
                // Dispatch custom event
                const changeEvent = new CustomEvent('selectChange', {
                    detail: { value, text }
                });
                select.dispatchEvent(changeEvent);
            });
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            select.classList.remove('open');
        });
    });
}
