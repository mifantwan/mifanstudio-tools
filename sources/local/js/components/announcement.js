// ES2025 standard module export
export default function announcement() {
    const list = document.querySelector('.announcement-content ul');
    
    if (!list) return;

    const items = list.children; // Use children instead of querySelectorAll
    const len = items.length;
    
    if (len <= 1) {
        if (len === 1) items[0].classList.add('active');
        return;
    }

    // Get delay from data attribute, default to 3000ms
    const delay = +list.dataset.delay || 3000;
    
    let current = 0;
    items[0].classList.add('active');

    // Start rotation
    setInterval(() => {
        items[current].classList.remove('active');
        current = (current + 1) % len;
        items[current].classList.add('active');
    }, delay);
}
