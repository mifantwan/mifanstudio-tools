export default function sectionExperience() {
    const section = document.querySelector('.section--experience');
    if (!section) return;
    
    const grid = section.querySelector('.grid');
    const slides = grid.querySelectorAll('.col-12');
    if (slides.length === 0) return;
    
    // Constants
    const CONFIG = {
        autoPlayDelay: 3000,
        swipeThreshold: 50,
        tapThreshold: 200,
        tapMoveThreshold: 10,
        moveThreshold: 10,
        edgeResistance: 0.3,
        transitionDuration: '0.3s',
        breakpoint: 1025,
        resizeDebounce: 150
    };
    
    // State
    const state = {
        currentSlide: 0,
        startX: 0,
        endX: 0,
        startTime: 0,
        startTranslateX: 0,
        isDragging: false,
        isMouseDown: false,
        autoPlayInterval: null,
        autoPlayEnabled: true,
        isInitialized: false,
        isResizing: false
    };
    
    // Core Functions
    function goToSlide(index, immediate = false) {
        // Ensure index is valid
        if (index < 0) index = slides.length - 1;
        if (index >= slides.length) index = 0;
        
        state.currentSlide = index;
        
        if (immediate) {
            grid.style.transition = 'none';
        } else {
            grid.style.transition = `transform ${CONFIG.transitionDuration} ease-in-out`;
        }
        
        grid.style.transform = `translateX(${-index * 100}%)`;
        
        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
        });
        
        // Force reflow if immediate
        if (immediate) {
            grid.offsetHeight;
            requestAnimationFrame(() => {
                grid.style.transition = `transform ${CONFIG.transitionDuration} ease-in-out`;
            });
        }
    }
    
    function startAutoPlay() {
        if (!state.autoPlayEnabled || state.isResizing) return;
        stopAutoPlay(); // Clear any existing interval
        state.autoPlayInterval = setInterval(() => {
            if (!state.isResizing && !state.isDragging && !state.isMouseDown) {
                goToSlide(state.currentSlide + 1);
            }
        }, CONFIG.autoPlayDelay);
    }
    
    function stopAutoPlay() {
        if (state.autoPlayInterval) {
            clearInterval(state.autoPlayInterval);
            state.autoPlayInterval = null;
        }
    }
    
    function toggleAutoPlay(enable) {
        state.autoPlayEnabled = enable;
        enable ? startAutoPlay() : stopAutoPlay();
    }
    
    const getCurrentTranslateX = () => {
        // Use currentSlide as source of truth instead of parsing transform
        return -state.currentSlide * 100;
    };
    
    const calculateDragTranslate = (currentX) => {
        const diff = currentX - state.startX;
        const dragPercent = (diff / window.innerWidth) * 100;
        const newTranslateX = state.startTranslateX + dragPercent;
        
        const maxTranslate = 0;
        const minTranslate = -(slides.length - 1) * 100;
        
        if (newTranslateX > maxTranslate) {
            return maxTranslate + (newTranslateX - maxTranslate) * CONFIG.edgeResistance;
        }
        if (newTranslateX < minTranslate) {
            return minTranslate + (newTranslateX - minTranslate) * CONFIG.edgeResistance;
        }
        return newTranslateX;
    };
    
    // Event Handlers
    const handleStart = (x) => {
        // Don't start interaction during resize
        if (state.isResizing) return;
        
        state.startX = x;
        state.endX = x;
        state.startTime = Date.now();
        state.isDragging = false;
        state.startTranslateX = getCurrentTranslateX();
        grid.style.transition = 'none';
    };
    
    const handleMove = (x) => {
        if (!state.startX || state.isResizing) return;
        
        state.endX = x;
        const diff = Math.abs(x - state.startX);
        
        if (diff > CONFIG.moveThreshold) {
            state.isDragging = true;
            grid.style.transform = `translateX(${calculateDragTranslate(x)}%)`;
        }
    };
    
    const handleEnd = () => {
        if (!state.startX || state.isResizing) return;
        
        const duration = Date.now() - state.startTime;
        const diff = state.startX - state.endX;
        const isTap = duration < CONFIG.tapThreshold && Math.abs(diff) < CONFIG.tapMoveThreshold;
        const isSwipe = state.isDragging && Math.abs(diff) > CONFIG.swipeThreshold;
        
        // Calculate target slide based on current position, not state
        let targetSlide = state.currentSlide;
        if (isSwipe) {
            targetSlide = state.currentSlide + (diff > 0 ? 1 : -1);
        }
        
        if (isTap) {
            toggleAutoPlay(false);
            goToSlide(targetSlide);
        } else if (isSwipe) {
            goToSlide(targetSlide);
        } else {
            goToSlide(targetSlide);
        }
        
        // Reset drag state
        state.startX = 0;
        state.endX = 0;
        state.isDragging = false;
        state.isMouseDown = false;
    };
    
    // Event handler references for cleanup
    const handlers = {
        touchstart: (e) => handleStart(e.touches[0].clientX),
        touchmove: (e) => handleMove(e.touches[0].clientX),
        touchend: handleEnd,
        touchcancel: handleEnd,
        mousedown: (e) => {
            state.isMouseDown = true;
            handleStart(e.clientX);
            e.preventDefault();
        },
        mousemove: (e) => {
            if (!state.isMouseDown) return;
            handleMove(e.clientX);
        },
        mouseup: handleEnd,
        mouseleave: () => {
            if (state.isMouseDown) {
                goToSlide(state.currentSlide);
                state.isMouseDown = false;
                state.isDragging = false;
            }
        },
        selectstart: (e) => {
            if (state.isDragging) e.preventDefault();
        },
        outsideInteraction: (e) => {
            if (!grid.contains(e.target) && !state.autoPlayEnabled) {
                toggleAutoPlay(true);
            }
        }
    };
    
    // Initialization and cleanup
    const initializeSlider = () => {
        if (state.isInitialized) return;
        
        grid.classList.add('experience-slider');
        
        // Touch events
        grid.addEventListener('touchstart', handlers.touchstart, { passive: true });
        grid.addEventListener('touchmove', handlers.touchmove, { passive: true });
        grid.addEventListener('touchend', handlers.touchend, { passive: true });
        grid.addEventListener('touchcancel', handlers.touchcancel, { passive: true });
        
        // Mouse events
        grid.addEventListener('mousedown', handlers.mousedown);
        grid.addEventListener('mousemove', handlers.mousemove, { passive: true });
        grid.addEventListener('mouseup', handlers.mouseup);
        grid.addEventListener('mouseleave', handlers.mouseleave);
        grid.addEventListener('selectstart', handlers.selectstart);
        
        // Outside interaction
        document.addEventListener('click', handlers.outsideInteraction, { passive: true });
        document.addEventListener('touchend', handlers.outsideInteraction, { passive: true });
        
        state.isInitialized = true;
        
        // Ensure valid slide index
        if (state.currentSlide < 0 || state.currentSlide >= slides.length) {
            state.currentSlide = 0;
        }
        
        goToSlide(state.currentSlide, true);
        startAutoPlay();
    };
    
    const cleanupSlider = () => {
        if (!state.isInitialized) return;
        
        stopAutoPlay();
        
        // Cancel any ongoing interactions
        state.startX = 0;
        state.endX = 0;
        state.isDragging = false;
        state.isMouseDown = false;
        
        // Remove all event listeners
        grid.removeEventListener('touchstart', handlers.touchstart);
        grid.removeEventListener('touchmove', handlers.touchmove);
        grid.removeEventListener('touchend', handlers.touchend);
        grid.removeEventListener('touchcancel', handlers.touchcancel);
        grid.removeEventListener('mousedown', handlers.mousedown);
        grid.removeEventListener('mousemove', handlers.mousemove);
        grid.removeEventListener('mouseup', handlers.mouseup);
        grid.removeEventListener('mouseleave', handlers.mouseleave);
        grid.removeEventListener('selectstart', handlers.selectstart);
        document.removeEventListener('click', handlers.outsideInteraction);
        document.removeEventListener('touchend', handlers.outsideInteraction);
        
        // Reset styles
        grid.style.transform = '';
        grid.style.transition = '';
        grid.classList.remove('experience-slider');
        slides.forEach(slide => slide.classList.remove('active'));
        
        // Reset state
        state.currentSlide = 0;
        state.autoPlayEnabled = true;
        state.isInitialized = false;
    };
    
    // Resize handler with debouncing
    let resizeTimer;
    const handleResize = () => {
        clearTimeout(resizeTimer);
        
        // Mark as resizing to prevent interactions
        state.isResizing = true;
        
        // Cancel ongoing interactions immediately
        if (state.isDragging || state.isMouseDown) {
            stopAutoPlay();
            grid.style.transition = `transform ${CONFIG.transitionDuration} ease-in-out`;
            // Ensure current slide is valid
            if (state.currentSlide < 0 || state.currentSlide >= slides.length) {
                state.currentSlide = 0;
            }
            goToSlide(state.currentSlide, false);
            state.startX = 0;
            state.endX = 0;
            state.isDragging = false;
            state.isMouseDown = false;
        }
        
        resizeTimer = setTimeout(() => {
            const isMobile = window.innerWidth < CONFIG.breakpoint;
            
            // Handle state transitions
            if (isMobile && !state.isInitialized) {
                // Desktop → Mobile: Initialize slider
                // Ensure valid slide index before initializing
                if (state.currentSlide < 0 || state.currentSlide >= slides.length) {
                    state.currentSlide = 0;
                }
                initializeSlider();
            } else if (!isMobile && state.isInitialized) {
                // Mobile → Desktop: Cleanup slider
                cleanupSlider();
            } else if (isMobile && state.isInitialized) {
                // Mobile resize: Recalculate position
                // Ensure current slide is valid
                if (state.currentSlide < 0 || state.currentSlide >= slides.length) {
                    state.currentSlide = 0;
                }
                goToSlide(state.currentSlide, true);
            }
            
            // Re-enable interactions after resize
            state.isResizing = false;
            
            // Restart autoplay if needed
            if (isMobile && state.isInitialized && state.autoPlayEnabled) {
                startAutoPlay();
            }
        }, CONFIG.resizeDebounce);
    };
    
    // Setup resize listener
    window.addEventListener('resize', handleResize, { passive: true });
    
    // Initialize on mobile
    if (window.innerWidth < CONFIG.breakpoint) {
        initializeSlider();
    }
    
    // Return cleanup function for potential unmounting
    return () => {
        cleanupSlider();
        window.removeEventListener('resize', handleResize);
    };
}