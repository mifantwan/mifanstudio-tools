// ES2025 standard module export
export default function customSelect() {
    const customSelects = document.querySelectorAll('.custom-select');
    const closeAllDropdowns = (except) => {
        customSelects.forEach(select => {
            if (select !== except) {
                select.classList.remove('open');
            }
        });
    };

    // Single global click handler instead of one per select
    document.addEventListener('click', () => closeAllDropdowns());

    customSelects.forEach(select => {
        const trigger = select.querySelector('.select-trigger');
        const optionItems = select.querySelectorAll('.select-option');

        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            closeAllDropdowns(select);
            select.classList.toggle('open');
        });

        // Use event delegation for options
        select.querySelector('.select-options').addEventListener('click', (e) => {
            const option = e.target.closest('.select-option');
            if (!option) return;
            
            e.stopPropagation();
            
            const value = option.dataset.value;
            const text = option.querySelector('span').textContent;
            
            // Update trigger content
            trigger.querySelector('.select-text').textContent = text;
            
            // Handle flag icon if present
            const flagIcon = option.querySelector('.flag-icon');
            if (flagIcon) {
                trigger.querySelector('.flag-icon').outerHTML = flagIcon.outerHTML;
            }
            
            select.dataset.value = value;
            select.classList.remove('open');
            
            select.dispatchEvent(new CustomEvent('selectChange', {
                detail: { value, text }
            }));
        });
    });
}
