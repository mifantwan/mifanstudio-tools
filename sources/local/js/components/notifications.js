// Constants to avoid repeated object creation
const ANIMATION_DURATION = 400;
const STAGGER_DELAY = 200;
const MAX_VISIBLE = 3;

// Reusable animation styles to avoid repeated string creation
const ANIMATION_STYLES = {
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    hidden: {
        opacity: '0',
        height: '0',
        margin: '0',
        overflow: 'hidden'
    },
    visible: {
        opacity: '1',
        transform: 'translateX(0)',
        marginBlock: 'var(--space-small)',
        overflow: 'visible'
    }
};

export default function notifications() {
    // json array of notifications containing id, text, url, date, time, type
    const notifications = [
        { id: 1, text: 'New product launch! Check out our latest collection of premium handcrafted items.', url: 'https://www.google.com', date: '2025-01-01', time: '12:00:00', type: 'info' },
        { id: 2, text: 'Limited time offer: Get 25% off on all orders above $100. Don\'t miss out!', url: 'https://www.google.com', date: '2025-01-01', time: '12:00:00', type: 'warning' },
        { id: 3, text: 'System maintenance scheduled for tonight from 2 AM - 4 AM EST. Some services may be unavailable.', url: 'https://www.google.com', date: '2025-01-01', time: '12:00:00', type: 'error' },
        { id: 4, text: 'We\'ve updated our privacy policy. Please review the changes at your convenience.', url: 'https://www.google.com', date: '2025-01-01', time: '12:00:00', type: 'info' },
        { id: 5, text: 'High traffic alert: Orders may take longer to process. Thank you for your patience!', url: 'https://www.google.com', date: '2025-01-01', time: '12:00:00', type: 'warning' },
        { id: 6, text: 'Congratulations! You\'ve won a free gift with your purchase. Check your order details for more information.', url: 'https://www.google.com', date: '2025-01-01', time: '12:00:00', type: 'success' },
    ];

    if (!notifications.length) return;

    const notificationContainer = document.getElementById('local-notification');
    if (!notificationContainer) return;

    // Cache frequently accessed values
    const delayShow = parseInt(notificationContainer.getAttribute('delay-show')) || 3000;
    const delayHide = parseInt(notificationContainer.getAttribute('delay-hide')) || 10000;
    const position = getParentPosition(notificationContainer);
    const slideInDirection = getSlideInDirection(position);
    const slideOutDirection = getSlideDirection(position);

    // State management
    let currentBatchStart = 0;
    let visibleCount = 0;
    let isAnimating = false;
    let timeouts = new Set(); // Track timeouts for cleanup

    const showNextBatch = async () => {
        if (currentBatchStart >= notifications.length) return;

        const endIndex = Math.min(currentBatchStart + MAX_VISIBLE, notifications.length);
        const currentBatch = notifications.slice(currentBatchStart, endIndex);

        // Show notifications in current batch
        for (const notification of currentBatch) {
            if (isAnimating) continue;
            isAnimating = true;
            visibleCount++;

            await showNotification(notification, notificationContainer, slideInDirection);
            isAnimating = false;
        }

        // Start hiding with staggered timing
        const hideTimeout = setTimeout(() => {
            hideBatchWithStagger(currentBatch, notificationContainer, slideOutDirection);
        }, delayHide);
        timeouts.add(hideTimeout);
    };

    const hideBatchWithStagger = (batch, container, slideDirection) => {
        batch.forEach((notification, i) => {
            const staggerTimeout = setTimeout(async () => {
                await closeNotification(notification.id, container, slideDirection);
                visibleCount--;

                if (visibleCount === 0 && currentBatchStart + MAX_VISIBLE < notifications.length) {
                    currentBatchStart += MAX_VISIBLE;
                    const nextBatchTimeout = setTimeout(showNextBatch, delayShow);
                    timeouts.add(nextBatchTimeout);
                }
            }, i * STAGGER_DELAY);
            timeouts.add(staggerTimeout);
        });
    };

    // Start showing first batch
    const initialTimeout = setTimeout(showNextBatch, delayShow);
    timeouts.add(initialTimeout);

    // Return cleanup function
    return () => {
        timeouts.forEach(timeout => clearTimeout(timeout));
        timeouts.clear();
        
        // Clear caches to prevent memory leaks
        POSITION_CACHE.clear();
        SLIDE_CACHE.clear();
        DATE_CACHE.clear();
        
        // Remove event listener
        document.removeEventListener('click', handleCloseClick);
    };
}

async function showNotification(notification, container, slideInDirection) {
    const section = createNotificationSection(notification);
    
    // Apply initial hidden state using cached styles
    Object.assign(section.style, ANIMATION_STYLES.hidden);
    section.style.transform = slideInDirection;
    
    container.appendChild(section);
    
    const sectionHeight = section.scrollHeight;
    
    return new Promise(resolve => {
        requestAnimationFrame(() => {
            section.style.transition = ANIMATION_STYLES.transition;
            section.style.height = `${sectionHeight}px`;
            Object.assign(section.style, ANIMATION_STYLES.visible);
            
            setTimeout(() => {
                section.style.height = 'auto';
                section.style.overflow = 'visible';
                resolve();
            }, ANIMATION_DURATION);
        });
        
        addCloseEventListeners();
    });
}

// Cache reusable HTML templates
const CLOSE_BUTTON_SVG = '<path d="M195.2 195.2a64 64 0 0 1 90.496 0L512 421.504 738.304 195.2a64 64 0 0 1 90.496 90.496L602.496 512 828.8 738.304a64 64 0 0 1-90.496 90.496L512 602.496 285.696 828.8a64 64 0 0 1-90.496-90.496L421.504 512 195.2 285.696a64 64 0 0 1 0-90.496z"/>';

function createNotificationSection(notification) {
    const section = document.createElement('section');
    section.setAttribute('data-notification-id', notification.id);
    
    // Build HTML more efficiently
    const dateTime = notification.date ? formatDate(notification.date) + ' ' + notification.time : '';
    
    section.innerHTML = `
        <button class="close-floating-widget close-floating-widget--${notification.type}" aria-label="close notification" data-notification-id="${notification.id}">
            <svg width="0.75rem" height="0.75rem" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
                ${CLOSE_BUTTON_SVG}
            </svg>
        </button>
        <div class="container container__content-space-small container__notification--${notification.type}">
            <p>
                <small>
                    <a href="${notification.url}" target="_blank" rel="noopener noreferrer">${notification.text}</a>
                </small>
            </p>
        </div>`;
    return section;
}

// Use event delegation to avoid multiple event listeners
function addCloseEventListeners() {
    // Remove existing listener to prevent duplicates
    document.removeEventListener('click', handleCloseClick);
    document.addEventListener('click', handleCloseClick);
}

function handleCloseClick(e) {
    const button = e.target.closest('.close-floating-widget[data-notification-id]');
    if (!button) return;
    
    // Prevent event from bubbling to navigation handlers
    e.stopPropagation();
    
    const notificationId = button.getAttribute('data-notification-id');
    const container = document.getElementById('local-notification');
    const slideDirection = getSlideDirection(getParentPosition(container));
    closeNotification(notificationId, container, slideDirection);
}

async function closeNotification(notificationId, container, slideDirection) {
    const section = document.querySelector(`[data-notification-id="${notificationId}"]`);
    if (!section) return Promise.resolve();
    
    return new Promise(resolve => {
        // Calculate current height before animating
        const currentHeight = section.offsetHeight;
        
        // Add hiding class for enhanced CSS transitions
        section.classList.add('hiding');
        
        // Set up the hiding animation using cached styles
        section.style.height = `${currentHeight}px`;
        section.style.overflow = 'hidden';
        
        // Force a reflow to ensure height is set
        section.offsetHeight;
        
        // Start the hiding animation
        requestAnimationFrame(() => {
            section.style.transition = ANIMATION_STYLES.transition;
            section.style.opacity = '0';
            section.style.transform = `${slideDirection} scale(0.95)`;
            section.style.height = '0';
            section.style.margin = '0';
        });
        
        setTimeout(() => {
            section.remove();
            resolve();
        }, ANIMATION_DURATION);
    });
}

// Cache position calculations
const POSITION_CACHE = new Map();

function getParentPosition(container) {
    if (!container) return 'bottom-right';
    
    // Use cache to avoid repeated string operations
    if (POSITION_CACHE.has(container)) {
        return POSITION_CACHE.get(container);
    }
    
    const positionClass = container.className.split(' ').find(cls => cls.startsWith('local-notification__'));
    const position = positionClass ? positionClass.replace('local-notification__', '') : 'bottom-right';
    POSITION_CACHE.set(container, position);
    return position;
}

// Cache slide directions
const SLIDE_CACHE = new Map();

function getSlideInDirection(position) {
    if (SLIDE_CACHE.has(`in-${position}`)) {
        return SLIDE_CACHE.get(`in-${position}`);
    }
    
    const direction = position.includes('right') ? 'translateX(100%)' : 'translateX(-100%)';
    SLIDE_CACHE.set(`in-${position}`, direction);
    return direction;
}

function getSlideDirection(position) {
    if (SLIDE_CACHE.has(`out-${position}`)) {
        return SLIDE_CACHE.get(`out-${position}`);
    }
    
    const direction = position.includes('right') ? 'translateX(100%)' : 'translateX(-100%)';
    SLIDE_CACHE.set(`out-${position}`, direction);
    return direction;
}

// Cache date formatting
const DATE_CACHE = new Map();

function formatDate(dateString) {
    if (DATE_CACHE.has(dateString)) {
        return DATE_CACHE.get(dateString);
    }
    
    const date = new Date(dateString);
    const formatted = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
    DATE_CACHE.set(dateString, formatted);
    return formatted;
}