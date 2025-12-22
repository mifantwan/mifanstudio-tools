export default function sectionExperience() {
    const section = document.querySelector('.section--experience');
    if (!section) return;
    
    const grid = section.querySelector('.grid');
    const slides = grid.querySelectorAll('.col-12');
    if (slides.length === 0) return;
    
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
        wasMobile: window.innerWidth < 1025
    };
    
    // Constants
    const CONFIG = {
        autoPlayDelay: 3000,
        swipeThreshold: 50,
        tapThreshold: 200,
        tapMoveThreshold: 10,
        moveThreshold: 10,
        edgeResistance: 0.3,
        transitionDuration: '0.3s',
        breakpoint: 1025
    };
    
    // Core Functions
    function goToSlide(index) {
        if (index < 0) index = slides.length - 1;
        if (index >= slides.length) index = 0;
        
        state.currentSlide = index;
        grid.style.transition = `transform ${CONFIG.transitionDuration} ease-in-out`;
        grid.style.transform = `translateX(${-index * 100}%)`;
        
        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
        });
    }
    
    function startAutoPlay() {
        if (!state.autoPlayEnabled) return;
        state.autoPlayInterval = setInterval(() => {
            goToSlide(state.currentSlide + 1);
        }, CONFIG.autoPlayDelay);
    }
    
    function stopAutoPlay() {
        clearInterval(state.autoPlayInterval);
    }
    
    function toggleAutoPlay(enable) {
        state.autoPlayEnabled = enable;
        enable ? startAutoPlay() : stopAutoPlay();
    }
    
    function getCurrentTranslateX() {
        const match = grid.style.transform.match(/translateX\((-?\d+(?:\.\d+)?)%?\)/);
        return match ? parseFloat(match[1]) : 0;
    }
    
    function calculateDragTranslate(currentX) {
        const diff = currentX - state.startX;
        const dragPercent = (diff / window.innerWidth) * 100;
        const newTranslateX = state.startTranslateX + dragPercent;
        
        // Apply edge resistance
        const maxTranslate = 0;
        const minTranslate = -(slides.length - 1) * 100;
        
        if (newTranslateX > maxTranslate) {
            return maxTranslate + (newTranslateX - maxTranslate) * CONFIG.edgeResistance;
        } else if (newTranslateX < minTranslate) {
            return minTranslate + (newTranslateX - minTranslate) * CONFIG.edgeResistance;
        }
        return newTranslateX;
    }
    
    // Event Handlers
    function handleStart(x) {
        state.startX = x;
        state.endX = x;
        state.startTime = Date.now();
        state.isDragging = false;
        state.startTranslateX = getCurrentTranslateX();
        grid.style.transition = 'none';
    }
    
    function handleMove(x) {
        if (!state.startX) return;
        
        state.endX = x;
        const diff = Math.abs(x - state.startX);
        
        if (diff > CONFIG.moveThreshold) {
            state.isDragging = true;
            grid.style.transform = `translateX(${calculateDragTranslate(x)}%)`;
        }
    }
    
    function handleEnd() {
        if (!state.startX) return;
        
        const duration = Date.now() - state.startTime;
        const diff = state.startX - state.endX;
        const isTap = duration < CONFIG.tapThreshold && Math.abs(diff) < CONFIG.tapMoveThreshold;
        const isSwipe = state.isDragging && Math.abs(diff) > CONFIG.swipeThreshold;
        
        if (isTap) {
            toggleAutoPlay(false);
            goToSlide(state.currentSlide);
        } else if (isSwipe) {
            goToSlide(state.currentSlide + (diff > 0 ? 1 : -1));
        } else {
            goToSlide(state.currentSlide);
        }
        
        // Reset state
        Object.assign(state, {
            startX: 0,
            endX: 0,
            isDragging: false,
            isMouseDown: false
        });
    }
    
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
    
    // Initialization and cleanup functions
    function initializeSlider() {
        if (state.isInitialized) return;
        
        grid.classList.add('experience-slider');
        
        // Touch Events
        grid.addEventListener('touchstart', handlers.touchstart, { passive: true });
        grid.addEventListener('touchmove', handlers.touchmove, { passive: true });
        grid.addEventListener('touchend', handlers.touchend);
        grid.addEventListener('touchcancel', handlers.touchcancel);
        
        // Mouse Events
        grid.addEventListener('mousedown', handlers.mousedown);
        grid.addEventListener('mousemove', handlers.mousemove);
        grid.addEventListener('mouseup', handlers.mouseup);
        grid.addEventListener('mouseleave', handlers.mouseleave);
        grid.addEventListener('selectstart', handlers.selectstart);
        
        // Outside interaction
        document.addEventListener('click', handlers.outsideInteraction);
        document.addEventListener('touchend', handlers.outsideInteraction, { passive: true });
        
        state.isInitialized = true;
        goToSlide(state.currentSlide);
        startAutoPlay();
    }
    
    function cleanupSlider() {
        if (!state.isInitialized) return;
        
        stopAutoPlay();
        
        // Remove event listeners
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
        
        // Reset styles and classes
        grid.style.transform = '';
        grid.style.transition = '';
        grid.classList.remove('experience-slider');
        slides.forEach(slide => slide.classList.remove('active'));
        
        // Reset drag state
        Object.assign(state, {
            startX: 0,
            endX: 0,
            isDragging: false,
            isMouseDown: false,
            isInitialized: false
        });
    }
    
    // Window resize handler with improved responsiveness
    let resizeTimer;
    const handleResize = () => {
        clearTimeout(resizeTimer);
        
        // Cancel any ongoing drag immediately
        if (state.isDragging || state.isMouseDown) {
            grid.style.transition = `transform ${CONFIG.transitionDuration} ease-in-out`;
            goToSlide(state.currentSlide);
            Object.assign(state, {
                startX: 0,
                endX: 0,
                isDragging: false,
                isMouseDown: false
            });
        }
        
        resizeTimer = setTimeout(() => {
            const isMobile = window.innerWidth < CONFIG.breakpoint;
            const wasInitialized = state.isInitialized;
            
            // Handle mobile → desktop transition
            if (!isMobile && state.wasMobile && wasInitialized) {
                cleanupSlider();
                state.wasMobile = false;
            }
            // Handle desktop → mobile transition
            else if (isMobile && !state.wasMobile) {
                state.wasMobile = true;
                initializeSlider();
            }
            // Handle resize within mobile range
            else if (isMobile && wasInitialized) {
                // Recalculate position to maintain current slide
                grid.style.transition = 'none';
                grid.style.transform = `translateX(${-state.currentSlide * 100}%)`;
                
                // Force reflow
                grid.offsetHeight;
                
                // Re-enable transition
                setTimeout(() => {
                    grid.style.transition = `transform ${CONFIG.transitionDuration} ease-in-out`;
                }, 10);
            }
        }, 250);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Initialize if on mobile
    if (window.innerWidth < CONFIG.breakpoint) {
        initializeSlider();
    }
}