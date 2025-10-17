import '../../sass/products.sass'

import productsSlide from './components/products-slide.js'
import productForm from './components/product-form.js'

// Use readyState check for better performance
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        productsSlide()
        productForm()
    })
} else {
    productsSlide()
    productForm()
}