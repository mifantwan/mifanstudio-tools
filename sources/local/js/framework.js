import '../sass/framework.sass'

import announcement from './components/announcement.js'

// Use readyState check for better performance
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        announcement()
    })
} else {
    announcement()
}