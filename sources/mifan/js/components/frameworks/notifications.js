/**
 * ==========================================
 * MIFAN NOTIFICATIONS SYSTEM
 * ==========================================
 * 
 * This notification system is designed to work with Service Worker
 * for real-time notification delivery, but currently uses mockup data.
 * 
 * SERVICE WORKER INTEGRATION (TODO):
 * ----------------------------------
 * When service worker is available, it should:
 * 1. Cache notification data from API
 * 2. Send messages to this component via postMessage()
 * 3. Handle push notifications
 * 4. Sync notifications when online
 * 
 * MESSAGE TYPES from Service Worker:
 * - NEW_NOTIFICATION: Add a new notification
 * - REMOVE_NOTIFICATION: Remove notification by ID
 * - CLEAR_ALL_NOTIFICATIONS: Clear all notifications
 * 
 * CURRENT STATUS: Using mockup data only
 */

// ==========================================
// MOCKUP DATA - Service Worker Integration
// ==========================================
// TODO: Replace this with service worker when available
// Service worker should provide notifications via:
// - navigator.serviceWorker.controller.postMessage()
// - Or fetch from API endpoint cached by service worker

// ==========================================
// STACKING CONFIGURATION
// ==========================================
// Customize the notification stacking behavior
const STACKING_CONFIG = {
    offsetIncrement: 4,      // Pixels to offset each notification (default: 4px)
    scaleDecrement: 0.02,    // Scale reduction per notification (default: 0.02 = 2%)
    maxScale: 1.0,           // Maximum scale for front notification
    minScale: 0.80,          // Minimum scale for back notifications (optional limit)
    baseZIndex: 1000         // Base z-index for notifications
};

const mockNotifications = [
    {
        id: 1,
        status: "",
        message: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Obcaecati, doloremque odio sequi aut quo architecto aliquam molestias tempore voluptatibus est delectus non nesciunt sunt blanditiis vitae eaque ipsum ea laboriosam!",
        link: "#",
        timestamp: Date.now()
    },
    {
        id: 2,
        status: "info",
        message: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Obcaecati, doloremque odio sequi aut quo architecto aliquam molestias tempore voluptatibus est delectus non nesciunt sunt blanditiis vitae eaque ipsum ea laboriosam!",
        link: "#",
        timestamp: Date.now()
    },
    {
        id: 3,
        status: "warning",
        message: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Obcaecati, doloremque odio sequi aut quo architecto aliquam molestias tempore voluptatibus est delectus non nesciunt sunt blanditiis vitae eaque ipsum ea laboriosam!",
        link: "#",
        timestamp: Date.now()
    },
    {
        id: 4,
        status: "error",
        message: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Obcaecati, doloremque odio sequi aut quo architecto aliquam molestias tempore voluptatibus est delectus non nesciunt sunt blanditiis vitae eaque ipsum ea laboriosam!",
        link: "#",
        timestamp: Date.now()
    },
    {
        id: 5,
        status: "success",
        message: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Obcaecati, doloremque odio sequi aut quo architecto aliquam molestias tempore voluptatibus est delectus non nesciunt sunt blanditiis vitae eaque ipsum ea laboriosam!",
        link: "#",
        timestamp: Date.now()
    },
    {
        id: 6,
        status: "info",
        message: "Sixth notification - Testing dynamic stacking! This proves the system works with more than 5 notifications.",
        link: "#",
        timestamp: Date.now()
    },
    {
        id: 7,
        status: "warning",
        message: "Seventh notification - Dynamic stacking in action!",
        link: "#",
        timestamp: Date.now()
    }
];

// ==========================================
// Service Worker Data Fetcher
// ==========================================
// This function simulates fetching data from service worker
// Replace implementation when service worker is available
async function fetchNotificationsFromServiceWorker() {
    // TODO: When service worker is ready, replace with:
    // 
    // if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    //     return new Promise((resolve) => {
    //         const messageChannel = new MessageChannel();
    //         messageChannel.port1.onmessage = (event) => {
    //             resolve(event.data.notifications || []);
    //         };
    //         navigator.serviceWorker.controller.postMessage(
    //             { type: 'GET_NOTIFICATIONS' },
    //             [messageChannel.port2]
    //         );
    //     });
    // }
    
    // For now, return mockup data
    return Promise.resolve(mockNotifications);
}

const closeIconSVG = `<svg width="1rem" height="1rem" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M13.06 12L17.48 7.57996C17.5537 7.5113 17.6128 7.4285 17.6538 7.3365C17.6948 7.2445 17.7168 7.14518 17.7186 7.04448C17.7204 6.94378 17.7018 6.84375 17.6641 6.75036C17.6264 6.65697 17.5703 6.57214 17.499 6.50092C17.4278 6.4297 17.343 6.37356 17.2496 6.33584C17.1562 6.29811 17.0562 6.27959 16.9555 6.28137C16.8548 6.28314 16.7555 6.30519 16.6635 6.34618C16.5715 6.38717 16.4887 6.44627 16.42 6.51996L12 10.94L7.58 6.51996C7.43782 6.38748 7.24978 6.31535 7.05548 6.31878C6.86118 6.32221 6.67579 6.40092 6.53838 6.53834C6.40096 6.67575 6.32225 6.86113 6.31882 7.05544C6.3154 7.24974 6.38752 7.43778 6.52 7.57996L10.94 12L6.52 16.42C6.37955 16.5606 6.30066 16.7512 6.30066 16.95C6.30066 17.1487 6.37955 17.3393 6.52 17.48C6.66062 17.6204 6.85125 17.6993 7.05 17.6993C7.24875 17.6993 7.43937 17.6204 7.58 17.48L12 13.06L16.42 17.48C16.5606 17.6204 16.7512 17.6993 16.95 17.6993C17.1488 17.6993 17.3394 17.6204 17.48 17.48C17.6204 17.3393 17.6993 17.1487 17.6993 16.95C17.6993 16.7512 17.6204 16.5606 17.48 16.42L13.06 12Z" fill="#000000"/>
</svg>`;

// ==========================================
// Dynamic Stacking Calculator
// ==========================================
// Calculate stacking properties for a notification based on its index
function calculateStackingStyles(index, totalCount) {
    const { offsetIncrement, scaleDecrement, maxScale, minScale, baseZIndex } = STACKING_CONFIG;
    
    // Z-index: higher values for items closer to front (reverse index)
    const zIndex = baseZIndex + (totalCount - index);
    
    // Offset: increase offset for each item back in stack
    // Negative offset for positioning (CSS uses negative values)
    const offset = index === 0 ? '0px' : `-${index * offsetIncrement}px`;
    
    // Scale: decrease scale for each item back in stack
    let scale = maxScale - (index * scaleDecrement);
    
    // Apply minimum scale limit if set
    if (minScale && scale < minScale) {
        scale = minScale;
    }
    
    return {
        zIndex,
        offset,
        scale
    };
}

// ==========================================
// Apply Dynamic Stacking to Notification Items
// ==========================================
// Apply calculated stacking styles to all notifications in a container
function applyDynamicStacking(container) {
    const notificationItems = container.querySelectorAll('.notification-items');
    const totalCount = notificationItems.length;
    
    notificationItems.forEach((item, index) => {
        const { zIndex, offset, scale } = calculateStackingStyles(index, totalCount);
        
        // Apply CSS custom properties for dynamic styling
        item.style.setProperty('--stack-index', zIndex);
        item.style.setProperty('--stack-offset', offset);
        item.style.setProperty('--stack-scale', scale);
    });
}

function createNotificationItem(notification) {
    const notificationItem = document.createElement('div');
    notificationItem.className = 'notification-items';
    notificationItem.setAttribute('item-status', notification.status);
    
    // Add data attributes for tracking (useful for service worker integration)
    if (notification.id) {
        notificationItem.setAttribute('data-notification-id', notification.id);
    }
    if (notification.timestamp) {
        notificationItem.setAttribute('data-timestamp', notification.timestamp);
    }
    
    notificationItem.innerHTML = `
        <button class="close" aria-label="close popup">
            <span>${closeIconSVG}</span>
        </button>
        <div>
            <a href="${notification.link}">
                <small>${notification.message}</small>
            </a>
        </div>
        <div>
            <small>${new Date(notification.timestamp).toLocaleString()}</small>
        </div>
    `;
    
    return notificationItem;
}

function renderNotifications(container, notifications) {
    const wrapper = container.querySelector('div');
    wrapper.innerHTML = '';
    
    notifications.forEach(notification => {
        const notificationItem = createNotificationItem(notification);
        wrapper.appendChild(notificationItem);
    });
    
    // Apply dynamic stacking after all notifications are rendered
    applyDynamicStacking(container);
}

function showNotificationsSequentially(container) {
    const initialDelay = parseInt(container.getAttribute('notif-delay')) || 3000;
    const betweenDelay = 100; // 0.1s between each notification
    const notificationItems = container.querySelectorAll('.notification-items');
    
    notificationItems.forEach((item, index) => {
        const totalDelay = initialDelay + (betweenDelay * index);
        setTimeout(() => {
            item.classList.add('show');
        }, totalDelay);
    });
}

function attachCloseHandlers(container) {
    const closeButtons = container.querySelectorAll('.notification-items button.close');
    
    closeButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const notificationItem = button.closest('.notification-items');
            
            // Add fade out animation
            notificationItem.classList.remove('show');
            notificationItem.style.transform = 'translateY(20px) scale(0.9)';
            
            // Remove after animation completes and recalculate stacking
            setTimeout(() => {
                notificationItem.remove();
                // Recalculate stacking for remaining notifications
                applyDynamicStacking(container);
            }, 500);
        });
    });
}

export default async function notifications() {
    const notificationContainers = document.querySelectorAll('.mifan-notifications');
    
    // Fetch notifications data (from service worker when available, mockup for now)
    const notificationsData = await fetchNotificationsFromServiceWorker();
    
    notificationContainers.forEach(container => {
        // Render notifications from data source (hidden initially)
        renderNotifications(container, notificationsData);
        
        // Attach close button handlers
        attachCloseHandlers(container);
        
        // Show notifications sequentially with delay
        showNotificationsSequentially(container);
    });
}

// ==========================================
// Public API for adding notifications dynamically
// ==========================================
// Use this to add new notifications after initial load
// This will be useful when service worker pushes new notifications
function addNotification(container, notification) {
    const wrapper = container.querySelector('div');
    const notificationItem = createNotificationItem(notification);
    wrapper.insertBefore(notificationItem, wrapper.firstChild);
    
    // Recalculate stacking for all notifications (including the new one)
    applyDynamicStacking(container);
    
    // Show immediately with animation
    setTimeout(() => {
        notificationItem.classList.add('show');
    }, 10);
    
    // Attach close handler to new notification
    const closeButton = notificationItem.querySelector('button.close');
    closeButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        notificationItem.classList.remove('show');
        notificationItem.style.transform = 'translateY(20px) scale(0.9)';
        setTimeout(() => {
            notificationItem.remove();
            // Recalculate stacking after removal
            applyDynamicStacking(container);
        }, 500);
    });
    
    return notificationItem;
}

// ==========================================
// Utility functions for notification management
// ==========================================
// Clear all notifications from a container
function clearAllNotifications(container) {
    const wrapper = container.querySelector('div');
    const notificationItems = wrapper.querySelectorAll('.notification-items');
    
    notificationItems.forEach(item => {
        item.classList.remove('show');
        item.style.transform = 'translateY(20px) scale(0.9)';
    });
    
    setTimeout(() => {
        wrapper.innerHTML = '';
    }, 500);
}

// Remove specific notification by ID
function removeNotificationById(container, notificationId) {
    const notificationItem = container.querySelector(`[data-notification-id="${notificationId}"]`);
    if (notificationItem) {
        notificationItem.classList.remove('show');
        notificationItem.style.transform = 'translateY(20px) scale(0.9)';
        setTimeout(() => {
            notificationItem.remove();
            // Recalculate stacking after removal
            applyDynamicStacking(container);
        }, 500);
    }
}

// Get all notification IDs currently displayed
function getDisplayedNotificationIds(container) {
    const notificationItems = container.querySelectorAll('.notification-items[data-notification-id]');
    return Array.from(notificationItems).map(item => item.getAttribute('data-notification-id'));
}

// ==========================================
// Listen for service worker messages (for future use)
// ==========================================
// Uncomment when service worker is ready
// if ('serviceWorker' in navigator) {
//     navigator.serviceWorker.addEventListener('message', (event) => {
//         if (event.data.type === 'NEW_NOTIFICATION') {
//             const containers = document.querySelectorAll('.mifan-notifications');
//             containers.forEach(container => {
//                 addNotification(container, event.data.notification);
//             });
//         } else if (event.data.type === 'REMOVE_NOTIFICATION') {
//             const containers = document.querySelectorAll('.mifan-notifications');
//             containers.forEach(container => {
//                 removeNotificationById(container, event.data.notificationId);
//             });
//         } else if (event.data.type === 'CLEAR_ALL_NOTIFICATIONS') {
//             const containers = document.querySelectorAll('.mifan-notifications');
//             containers.forEach(container => {
//                 clearAllNotifications(container);
//             });
//         }
//     });
// }

// ==========================================
// Exports for external use
// ==========================================
export { 
    // Configuration
    STACKING_CONFIG,
    
    // Data
    mockNotifications,
    
    // Core functions
    createNotificationItem, 
    renderNotifications, 
    showNotificationsSequentially,
    
    // Dynamic stacking
    calculateStackingStyles,
    applyDynamicStacking,
    
    // Dynamic notification management
    addNotification,
    clearAllNotifications,
    removeNotificationById,
    getDisplayedNotificationIds,
    
    // Data fetcher
    fetchNotificationsFromServiceWorker
};