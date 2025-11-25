import '../sass/framework.sass'
import NavigationTabs from './component/navigation-tabs.js'
import ProductSlider from './component/product-slider.js'
import SubscriptionButton from './component/subscription-button.js'
import ProductDetails from './component/product-details.js'
import VideoWidget from './component/video-widget.js'
import mainRun, { securityCheck } from './component/main-run.js'

// Run security check immediately
securityCheck()

// Store slider instances for proper cleanup
let sliderInstances = []

document.addEventListener('DOMContentLoaded', () => {
    // Additional security check on DOM ready
    securityCheck()
    
    mainRun()
    new NavigationTabs()
    
    // Initialize all ProductSliders with options
    sliderInstances = ProductSlider.initializeAll({
        autoPlay: true,
        autoPlayDelay: parseInt(document.querySelector('.media-slider').getAttribute('data-delay')) || 5000,
        transitionDuration: 300,
        enableKeyboard: true,
        enableTouch: true
    })
    
    new SubscriptionButton()
    new ProductDetails()
    new VideoWidget()
})

window.addEventListener('resize', () => {
    // Additional security check on resize
    securityCheck()
    
    mainRun()
    new NavigationTabs()
    
    // Clean up existing sliders
    ProductSlider.destroyAll(sliderInstances)
    sliderInstances = []
    
    // Re-initialize all ProductSliders on resize
    sliderInstances = ProductSlider.initializeAll({
        autoPlay: true,
        autoPlayDelay: 5000,
        transitionDuration: 300,
        enableKeyboard: true,
        enableTouch: true
    })  
    
    new SubscriptionButton()
    new ProductDetails()
    new VideoWidget()
})

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    ProductSlider.destroyAll(sliderInstances)
})