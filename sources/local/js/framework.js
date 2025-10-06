import '../sass/framework.sass'

import announcement from './components/announcement.js'
import customSelect from './components/custom-select.js'
import navigation from './components/navigation.js'
import floatingWidget from './components/floating-widget.js'
import notifications from './components/notifications.js'

// Use readyState check for better performance
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        announcement()
        customSelect()
        navigation()
        floatingWidget()
        notifications()
    })
} else {
    announcement()
    customSelect()
    navigation()
    floatingWidget()
    notifications()
}