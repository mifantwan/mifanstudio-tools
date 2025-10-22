export default class ProductSlider {
    constructor(element, options = {}) {
        this.element = element
        this.options = { autoPlay: false, autoPlayDelay: 3000, transitionDuration: 300, enableKeyboard: true, enableTouch: true, ...options }
        this.state = { currentIndex: 0, isTransitioning: false, autoPlayInterval: null, totalSlides: 0 }
        
        if (!this.initializeElements()) return
        this.init()
    }
    
    initializeElements() {
        const highlightContainer = this.element.querySelector('.media-slider--highlight-lists')
        const controlContainer = this.element.querySelector('.media-slider--control')
        
        if (!highlightContainer || !controlContainer) return false
        
        this.elements = {
            highlightContainer,
            controlContainer,
            controlItems: controlContainer.querySelectorAll('div[index]'),
            highlightItems: highlightContainer.querySelectorAll('div[index]')
        }
        return true
    }
    
    init() {
        this.state.totalSlides = this.elements.highlightItems.length
        
        // Initial setup - only set first slide visible
        this.elements.highlightItems.forEach((slide, i) => {
            slide.style.cssText = `visibility:${i?'hidden':'visible'};opacity:${i?0:1};transition:opacity ${this.options.transitionDuration}ms ease-in-out`
        })
        
        // Event delegation
        this.elements.controlContainer.addEventListener('click', this.handleControlClick.bind(this))
        
        if (this.options.enableKeyboard) {
            this.element.addEventListener('keydown', this.handleKeyboard.bind(this))
            this.element.tabIndex = 0
        }
        
        if (this.options.enableTouch) this.setupTouchEvents()
        if (this.options.autoPlay) {
            this.setupAutoPlay()
            this.setupScrollPause()
        }
        this.setupZoom()
        this.updateActiveState()
    }
    
    handleControlClick(e) {
        const control = e.target.closest('div[index]')
        if (control) this.goToSlide(+control.getAttribute('index'))
    }
    
    setupAutoPlay() {
        this.startAutoPlay()
        this.element.addEventListener('mouseenter', this.pauseAutoPlay.bind(this))
        this.element.addEventListener('mouseleave', this.resumeAutoPlay.bind(this))
    }

    setupScrollPause() {
        // Create IntersectionObserver to detect when slider is out of view
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.resumeAutoPlay()
                } else {
                    this.pauseAutoPlay()
                }
            })
        }, { threshold: 0.1 }) // Trigger when 10% of element is visible

        observer.observe(this.element)
    }
    
    setupTouchEvents() {
        let startX, startY
        
        this.element.addEventListener('touchstart', e => {
            startX = e.touches[0].clientX
            startY = e.touches[0].clientY
        }, {passive: true})
        
        this.element.addEventListener('touchend', e => {
            if (!startX || !startY) return
            const diffX = startX - e.changedTouches[0].clientX
            const diffY = startY - e.changedTouches[0].clientY
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
                diffX > 0 ? this.nextSlide() : this.previousSlide()
            }
            startX = startY = null
        }, {passive: true})
    }
    
    setupZoom() {
        this.zoomState = { isZoomed: false, zoomLevel: 1, maxZoom: 3, minZoom: 1, zoomStep: 0.5 }
        this.zoomButton = this.element.querySelector('button[data-action="zoom-in"]')
        if (!this.zoomButton) return
        
        this.zoomButton.addEventListener('click', e => {
            e.preventDefault()
            this.toggleZoom()
        })
        
        this.element.addEventListener('keydown', e => {
            if (e.key === 'z' || e.key === 'Z') {
                e.preventDefault()
                this.toggleZoom()
            }
        })
        
        this.element.addEventListener('wheel', e => {
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault()
                this.zoom(e.deltaY > 0 ? -this.zoomState.zoomStep : this.zoomState.zoomStep)
            }
        })
    }
    
    toggleZoom() {
        this.zoomState.isZoomed ? this.resetZoom() : this.zoomIn()
    }
    
    zoomIn() {
        const currentImage = this.elements.highlightItems[this.state.currentIndex].querySelector('img')
        if (!currentImage) return
        
        this.zoomState.isZoomed = true
        this.zoomState.zoomLevel = 2
        
        currentImage.style.cssText = `transform:scale(${this.zoomState.zoomLevel});transform-origin:center center;cursor:grab;transition:transform 0.3s ease;user-select:none`
        this.zoomButton.setAttribute('data-action', 'zoom-out')
        this.zoomButton.setAttribute('aria-label', 'zoom out')
        this.setupPan(currentImage)
        this.dispatchZoomEvent()
    }
    
    resetZoom() {
        const currentImage = this.elements.highlightItems[this.state.currentIndex].querySelector('img')
        if (!currentImage) return
        
        this.zoomState.isZoomed = false
        this.zoomState.zoomLevel = 1
        
        this.removePan(currentImage)
        currentImage.style.cssText = `transform:scale(1);cursor:default;transition:transform 0.3s ease;user-select:none`
        this.zoomButton.setAttribute('data-action', 'zoom-in')
        this.zoomButton.setAttribute('aria-label', 'zoom in')
        this.dispatchZoomEvent()
    }
    
    dispatchZoomEvent() {
        this.element.dispatchEvent(new CustomEvent('zoomChanged', {
            detail: { isZoomed: this.zoomState.isZoomed, zoomLevel: this.zoomState.zoomLevel }
        }))
    }
    
    zoom(delta) {
        const currentImage = this.elements.highlightItems[this.state.currentIndex].querySelector('img')
        if (!currentImage) return
        
        const newZoomLevel = Math.max(this.zoomState.minZoom, Math.min(this.zoomState.maxZoom, this.zoomState.zoomLevel + delta))
        if (newZoomLevel === this.zoomState.zoomLevel) return
        
        this.zoomState.zoomLevel = newZoomLevel
        this.zoomState.isZoomed = newZoomLevel > 1
        
        // Preserve current pan position
        const currentTransform = currentImage.style.transform
        const translateMatch = currentTransform.match(/translate\(([^,]+),\s*([^)]+)\)/)
        const currentX = translateMatch ? parseFloat(translateMatch[1]) : 0
        const currentY = translateMatch ? parseFloat(translateMatch[2]) : 0
        
        currentImage.style.transform = `scale(${this.zoomState.zoomLevel}) translate(${currentX}px, ${currentY}px)`
        
        if (this.zoomState.isZoomed) {
            this.zoomButton.setAttribute('data-action', 'zoom-out')
            this.zoomButton.setAttribute('aria-label', 'zoom out')
            this.setupPan(currentImage)
        } else {
            this.zoomButton.setAttribute('data-action', 'zoom-in')
            this.zoomButton.setAttribute('aria-label', 'zoom in')
            this.removePan(currentImage)
        }
        
        this.dispatchZoomEvent()
    }
    
    setupPan(image) {
        let isDragging = false, startX = 0, startY = 0, currentX = 0, currentY = 0
        
        const calculateBounds = () => {
            const container = image.parentElement.getBoundingClientRect()
            const originalTransform = image.style.transform
            image.style.transform = 'scale(1)'
            const imageRect = image.getBoundingClientRect()
            const baseWidth = imageRect.width, baseHeight = imageRect.height
            image.style.transform = originalTransform
            
            const scaledWidth = baseWidth * this.zoomState.zoomLevel
            const scaledHeight = baseHeight * this.zoomState.zoomLevel
            const overflowX = Math.max(0, (scaledWidth - container.width) / 2)
            const overflowY = Math.max(0, (scaledHeight - container.height) / 2)
            
            return { minX: -overflowX, maxX: overflowX, minY: -overflowY, maxY: overflowY }
        }
        
        const constrainPosition = (x, y) => {
            const bounds = calculateBounds()
            return {
                x: Math.max(bounds.minX, Math.min(bounds.maxX, x)),
                y: Math.max(bounds.minY, Math.min(bounds.maxY, y))
            }
        }
        
        const handleMouseDown = e => {
            e.preventDefault()
            isDragging = true
            startX = e.clientX
            startY = e.clientY
            image.style.cursor = 'grabbing'
        }
        
        const handleMouseMove = e => {
            if (!isDragging) return
            e.preventDefault()
            
            currentX += e.clientX - startX
            currentY += e.clientY - startY
            startX = e.clientX
            startY = e.clientY
            
            const constrained = constrainPosition(currentX, currentY)
            currentX = constrained.x
            currentY = constrained.y
            
            image.style.transform = `scale(${this.zoomState.zoomLevel}) translate(${currentX}px, ${currentY}px)`
        }
        
        const handleMouseUp = () => {
            if (!isDragging) return
            isDragging = false
            image.style.cursor = 'grab'
        }
        
        image._panHandlers = { mousedown: handleMouseDown, mousemove: handleMouseMove, mouseup: handleMouseUp }
        image.addEventListener('mousedown', handleMouseDown)
        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)
    }
    
    removePan(image) {
        if (image._panHandlers) {
            image.removeEventListener('mousedown', image._panHandlers.mousedown)
            document.removeEventListener('mousemove', image._panHandlers.mousemove)
            document.removeEventListener('mouseup', image._panHandlers.mouseup)
            delete image._panHandlers
        }
        image.style.transform = `scale(${this.zoomState.zoomLevel})`
        image.style.cursor = 'default'
    }
    
    handleKeyboard(e) {
        const actions = { ArrowLeft: this.previousSlide, ArrowRight: this.nextSlide, Home: () => this.goToSlide(0), End: () => this.goToSlide(this.state.totalSlides - 1) }
        const action = actions[e.key]
        if (action) { e.preventDefault(); action.call(this) }
    }
    
    goToSlide(index) {
        const targetIndex = Math.max(0, Math.min(index, this.state.totalSlides - 1))
        if (this.state.isTransitioning || targetIndex === this.state.currentIndex) return
        
        this.state.isTransitioning = true
        if (this.zoomState?.isZoomed) this.resetZoom()
        
        const currentSlide = this.elements.highlightItems[this.state.currentIndex]
        const targetSlide = this.elements.highlightItems[targetIndex]
        
        currentSlide.style.opacity = '0'
        
        setTimeout(() => {
            currentSlide.style.visibility = 'hidden'
            targetSlide.style.visibility = 'visible'
            targetSlide.style.opacity = '1'
            
            this.state.currentIndex = targetIndex
            this.state.isTransitioning = false
            this.updateActiveState()
            
            this.elements.controlItems[targetIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
            this.element.dispatchEvent(new CustomEvent('slideChanged', { detail: { currentIndex: targetIndex } }))
        }, this.options.transitionDuration)
    }
    
    nextSlide() { this.goToSlide((this.state.currentIndex + 1) % this.state.totalSlides) }
    previousSlide() { this.goToSlide(this.state.currentIndex === 0 ? this.state.totalSlides - 1 : this.state.currentIndex - 1) }
    
    updateActiveState() {
        this.elements.controlItems.forEach((item, i) => {
            const isActive = i === this.state.currentIndex
            item.classList.toggle('active', isActive)
            item.setAttribute('aria-selected', isActive)
        })
    }
    
    startAutoPlay() { this.state.autoPlayInterval = setInterval(() => this.nextSlide(), this.options.autoPlayDelay) }
    pauseAutoPlay() { clearInterval(this.state.autoPlayInterval); this.state.autoPlayInterval = null }
    resumeAutoPlay() { if (this.options.autoPlay && !this.state.autoPlayInterval) this.startAutoPlay() }
    
    destroy() {
        this.pauseAutoPlay()
        this.element.removeEventListener('keydown', this.handleKeyboard)
        if (this.zoomState?.isZoomed) this.resetZoom()
        if (this.zoomButton) this.zoomButton.removeEventListener('click', this.toggleZoom)
        
        this.elements.highlightItems.forEach(slide => {
            const img = slide.querySelector('img')
            if (img) { this.removePan(img); img.style.cssText = '' }
            slide.style.cssText = ''
        })
        
        this.elements.controlItems.forEach(item => {
            item.classList.remove('active')
            item.removeAttribute('aria-selected')
        })
    }
    
    static initializeAll(options = {}) {
        return Array.from(document.querySelectorAll('.media-slider')).map(slider => {
            const instance = new ProductSlider(slider, options)
            if (options.autoPlay) {
                slider.addEventListener('mouseenter', instance.pauseAutoPlay.bind(instance))
                slider.addEventListener('mouseleave', instance.resumeAutoPlay.bind(instance))
            }
            return instance
        })
    }
    
    static destroyAll(instances) { instances.forEach(slider => slider.destroy()) }
}