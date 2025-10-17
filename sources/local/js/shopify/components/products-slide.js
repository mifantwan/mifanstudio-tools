export default function productsSlide() {
    const container = document.querySelector('.product-gallery-item-container');
    const leftButton = document.querySelector('.product-gallery-left');
    const rightButton = document.querySelector('.product-gallery-right');
    const thumbnails = document.querySelectorAll('.product-thumbnail');
    
    if (!container || !leftButton || !rightButton) return;
    
    const slides = container.querySelectorAll('div[index]');
    const totalSlides = slides.length;
    let currentIndex = 0;
    let isTransitioning = false;
    let autoSlideInterval;
    let isHovered = false;
    
    // Get delay from container attribute
    const delay = parseInt(container.getAttribute('delay')) || 5000;
    
    // Initialize first slide and thumbnails
    if (totalSlides > 0) {
        slides[0].classList.add('active');
        updateThumbnails();
    }
    
    // Clean up classes and set active slide
    function resetSlides() {
        slides.forEach((slide, index) => {
            slide.className = index === currentIndex ? 'active' : '';
        });
    }
    
    // Update thumbnail states based on current slide
    function updateThumbnails() {
        thumbnails.forEach((thumbnail, index) => {
            if (index === currentIndex) {
                thumbnail.classList.add('active');
            } else {
                thumbnail.classList.remove('active');
            }
        });
        
        // Scroll to active thumbnail
        scrollToActiveThumbnail();
    }
    
    // Scroll thumbnail container to show active thumbnail
    function scrollToActiveThumbnail() {
        // Small delay to ensure DOM updates are complete
        setTimeout(() => {
            const thumbnailContainer = document.querySelector('.product-gallery-controls-container');
            const activeThumbnail = thumbnails[currentIndex];
            
            if (!thumbnailContainer || !activeThumbnail) return;
            
            const containerRect = thumbnailContainer.getBoundingClientRect();
            const thumbnailRect = activeThumbnail.getBoundingClientRect();
            
            // Calculate if thumbnail is visible in container
            const isVisible = thumbnailRect.left >= containerRect.left && 
                             thumbnailRect.right <= containerRect.right;
            
            if (!isVisible) {
                // Calculate scroll position to center the active thumbnail
                const containerWidth = containerRect.width;
                const thumbnailWidth = thumbnailRect.width;
                const thumbnailOffset = activeThumbnail.offsetLeft;
                
                // Center the thumbnail in the container
                const scrollPosition = thumbnailOffset - (containerWidth / 2) + (thumbnailWidth / 2);
                
                thumbnailContainer.scrollTo({
                    left: scrollPosition,
                    behavior: 'smooth'
                });
            }
        }, 50);
    }
    
    // Transition to slide with direction
    function goToSlide(direction) {
        if (totalSlides <= 1 || isTransitioning) return;
        
        isTransitioning = true;
        const previousIndex = currentIndex;
        
        if (direction === 'next') {
            currentIndex = (currentIndex + 1) % totalSlides;
            slides[previousIndex].classList.add('slide-out-right');
            slides[currentIndex].classList.add('slide-in-right');
        } else {
            currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
            slides[previousIndex].classList.add('slide-out-left');
            slides[currentIndex].classList.add('slide-in-left');
        }
        
        setTimeout(() => {
            resetSlides();
            updateThumbnails();
            isTransitioning = false;
        }, 600);

        // Reset auto slide timer if not hovered
        if (!isHovered) {
            resetAutoSlide();
        }
    }
    
    // Go to specific slide by index
    function goToSlideIndex(index) {
        if (totalSlides <= 1 || isTransitioning || index === currentIndex) return;
        
        isTransitioning = true;
        const previousIndex = currentIndex;
        currentIndex = index;
        
        // Determine slide direction based on index difference
        const direction = index > previousIndex ? 'right' : 'left';
        
        if (direction === 'right') {
            slides[previousIndex].classList.add('slide-out-right');
            slides[currentIndex].classList.add('slide-in-right');
        } else {
            slides[previousIndex].classList.add('slide-out-left');
            slides[currentIndex].classList.add('slide-in-left');
        }
        
        setTimeout(() => {
            resetSlides();
            updateThumbnails();
            isTransitioning = false;
        }, 600);

        // Reset auto slide timer if not hovered
        if (!isHovered) {
            resetAutoSlide();
        }
    }
    
    // Start auto slide
    function startAutoSlide() {
        if (!isHovered) {
            autoSlideInterval = setInterval(() => {
                goToSlide('next');
            }, delay);
        }
    }

    // Reset auto slide
    function resetAutoSlide() {
        clearInterval(autoSlideInterval);
        startAutoSlide();
    }

    // Pause on hover
    container.addEventListener('mouseenter', () => {
        isHovered = true;
        clearInterval(autoSlideInterval);
    });

    // Resume on mouse leave
    container.addEventListener('mouseleave', () => {
        isHovered = false;
        startAutoSlide();
    });
    
    // Event listeners
    leftButton.addEventListener('click', () => goToSlide('prev'));
    rightButton.addEventListener('click', () => goToSlide('next'));

    // Thumbnail click event listeners
    thumbnails.forEach((thumbnail, index) => {
        thumbnail.addEventListener('click', () => {
            goToSlideIndex(index);
        });
    });

    // Start auto slide on init
    startAutoSlide();

    // function thumbnail control slide
    function thumbnailControl() {
        // This function is now integrated into the main functionality above
        // Thumbnails are automatically updated when slides change
    }
}