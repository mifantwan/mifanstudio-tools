// ES2025 standard module export
export default function navigation() {
    const navigation = document.getElementById('local-navigation');
    
    if (!navigation) return;

    let isStuck = false;
    
    const observer = new IntersectionObserver(
        ([entry]) => {
            const shouldBeStuck = !entry.isIntersecting;
            
            if (shouldBeStuck !== isStuck) {
                isStuck = shouldBeStuck;
                navigation.classList.toggle('is-stuck', isStuck);
            }
        },
        {
            // Use a small root margin to trigger slightly before the element would stick
            rootMargin: '-1px 0px 0px 0px',
            threshold: 0
        }
    );

    // Create a sentinel element to observe
    const sentinel = document.createElement('div');
    sentinel.style.height = '1px';
    sentinel.style.width = '100%';
    sentinel.style.position = 'absolute';
    sentinel.style.top = '0';
    sentinel.style.pointerEvents = 'none';
    
    // Insert the sentinel before the navigation
    navigation.parentNode.insertBefore(sentinel, navigation);
    
    observer.observe(sentinel);
    
    // Cleanup function
    return () => {
        observer.disconnect();
        if (sentinel.parentNode) {
            sentinel.parentNode.removeChild(sentinel);
        }
    };
}
