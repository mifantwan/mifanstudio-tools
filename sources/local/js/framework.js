import '../sass/framework.sass'

import announcement from './components/announcement.js'
import customSelect from './components/custom-select.js'

// Use readyState check for better performance
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        announcement()
        customSelect()
    })
} else {
    announcement()
    customSelect()
}