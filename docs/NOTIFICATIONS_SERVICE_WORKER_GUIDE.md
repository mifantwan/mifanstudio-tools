# Notifications Service Worker Integration Guide

## Overview
This guide explains how to integrate an API URL with the service worker for the notifications system. The current implementation uses mockup data, and this guide shows you how to replace it with real API integration.

## Current Implementation Status

The notifications system (`sources/mifan/js/components/frameworks/notifications.js`) currently:
- ✅ Uses mockup data (`mockNotifications` array)
- ✅ Has placeholder code for service worker integration
- ✅ Has message listener structure ready (commented out)
- ⏳ Needs API URL configuration
- ⏳ Needs service worker implementation

---

## Step 1: Add API URL Configuration

### Location: `sources/mifan/js/components/frameworks/notifications.js`

**Add this configuration constant at the top of the file (after line 43, before `mockNotifications`):**

```javascript
// ==========================================
// API CONFIGURATION
// ==========================================
const API_CONFIG = {
    // Your API endpoint for fetching notifications
    notificationsEndpoint: 'https://api.example.com/notifications',
    
    // Optional: API headers (for authentication, etc.)
    headers: {
        'Content-Type': 'application/json',
        // 'Authorization': 'Bearer YOUR_TOKEN_HERE',
        // Add other headers as needed
    },
    
    // Cache settings
    cacheStrategy: 'network-first', // Options: 'network-first', 'cache-first', 'network-only'
    cacheName: 'notifications-cache',
    cacheMaxAge: 5 * 60 * 1000, // 5 minutes in milliseconds
};
```

---

## Step 2: Update `fetchNotificationsFromServiceWorker()` Function

### Location: Lines 102-120 in `notifications.js`

**Replace the function with this implementation:**

```javascript
async function fetchNotificationsFromServiceWorker() {
    // Option 1: Fetch via Service Worker (Recommended)
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        return new Promise((resolve, reject) => {
            const messageChannel = new MessageChannel();
            
            // Set timeout for service worker response
            const timeout = setTimeout(() => {
                reject(new Error('Service worker timeout'));
            }, 5000);
            
            messageChannel.port1.onmessage = (event) => {
                clearTimeout(timeout);
                if (event.data.error) {
                    reject(new Error(event.data.error));
                } else {
                    resolve(event.data.notifications || []);
                }
            };
            
            navigator.serviceWorker.controller.postMessage(
                { 
                    type: 'GET_NOTIFICATIONS',
                    config: API_CONFIG 
                },
                [messageChannel.port2]
            );
        });
    }
    
    // Option 2: Direct API fetch (Fallback when service worker not available)
    try {
        const response = await fetch(API_CONFIG.notificationsEndpoint, {
            method: 'GET',
            headers: API_CONFIG.headers,
            cache: 'no-store' // Let service worker handle caching
        });
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        return data.notifications || data || [];
    } catch (error) {
        console.error('Failed to fetch notifications:', error);
        // Fallback to mockup data on error
        return mockNotifications;
    }
}
```

---

## Step 3: Create Service Worker File

### Create: `public/sw.js` (or your service worker location)

```javascript
// Service Worker for Notifications API Integration

const API_CONFIG = {
    notificationsEndpoint: 'https://api.example.com/notifications',
    headers: {
        'Content-Type': 'application/json',
        // Add your authentication headers here
    },
    cacheName: 'notifications-cache',
    cacheMaxAge: 5 * 60 * 1000, // 5 minutes
};

// Install event - cache initial data
self.addEventListener('install', (event) => {
    console.log('Service Worker installing...');
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker activating...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== API_CONFIG.cacheName)
                    .map((name) => caches.delete(name))
            );
        })
    );
    return self.clients.claim();
});

// Handle messages from main thread
self.addEventListener('message', async (event) => {
    if (event.data.type === 'GET_NOTIFICATIONS') {
        const config = event.data.config || API_CONFIG;
        
        try {
            // Try to fetch from network first
            const response = await fetch(config.notificationsEndpoint, {
                method: 'GET',
                headers: config.headers,
            });
            
            if (response.ok) {
                const data = await response.json();
                const notifications = data.notifications || data || [];
                
                // Cache the response
                const cache = await caches.open(config.cacheName);
                const cacheResponse = new Response(JSON.stringify(notifications), {
                    headers: { 'Content-Type': 'application/json' }
                });
                await cache.put(config.notificationsEndpoint, cacheResponse);
                
                // Send notifications back to main thread
                event.ports[0].postMessage({ notifications });
            } else {
                // If network fails, try cache
                const cachedResponse = await caches.match(config.notificationsEndpoint);
                if (cachedResponse) {
                    const cachedData = await cachedResponse.json();
                    event.ports[0].postMessage({ 
                        notifications: cachedData.notifications || cachedData || [] 
                    });
                } else {
                    event.ports[0].postMessage({ 
                        notifications: [],
                        error: 'Failed to fetch notifications'
                    });
                }
            }
        } catch (error) {
            console.error('Service Worker fetch error:', error);
            
            // Fallback to cache
            const cachedResponse = await caches.match(config.notificationsEndpoint);
            if (cachedResponse) {
                const cachedData = await cachedResponse.json();
                event.ports[0].postMessage({ 
                    notifications: cachedData.notifications || cachedData || [] 
                });
            } else {
                event.ports[0].postMessage({ 
                    notifications: [],
                    error: error.message
                });
            }
        }
    }
});

// Background sync for notifications (optional)
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-notifications') {
        event.waitUntil(syncNotifications());
    }
});

async function syncNotifications() {
    try {
        const response = await fetch(API_CONFIG.notificationsEndpoint, {
            headers: API_CONFIG.headers,
        });
        
        if (response.ok) {
            const data = await response.json();
            const notifications = data.notifications || data || [];
            
            // Update cache
            const cache = await caches.open(API_CONFIG.cacheName);
            const cacheResponse = new Response(JSON.stringify(notifications), {
                headers: { 'Content-Type': 'application/json' }
            });
            await cache.put(API_CONFIG.notificationsEndpoint, cacheResponse);
            
            // Notify all clients of new notifications
            const clients = await self.clients.matchAll();
            clients.forEach(client => {
                client.postMessage({
                    type: 'NOTIFICATIONS_SYNCED',
                    notifications
                });
            });
        }
    } catch (error) {
        console.error('Background sync error:', error);
    }
}

// Push notification handler (for browser push notifications)
self.addEventListener('push', (event) => {
    const data = event.data ? event.data.json() : {};
    
    // Show browser notification
    const options = {
        body: data.message || 'New notification',
        icon: data.icon || '/icon.png',
        badge: data.badge || '/badge.png',
        tag: `notification-${data.id}`,
        data: data
    };
    
    event.waitUntil(
        self.registration.showNotification(data.title || 'Notification', options)
    );
    
    // Also send to main thread for in-app notifications
    event.waitUntil(
        self.clients.matchAll().then(clients => {
            clients.forEach(client => {
                client.postMessage({
                    type: 'NEW_NOTIFICATION',
                    notification: data
                });
            });
        })
    );
});
```

---

## Step 4: Register Service Worker in Your Main App

### Location: Your main entry point (e.g., `sources/mifan/js/framework.js` or HTML file)

```javascript
// Register Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('Service Worker registered:', registration);
                
                // Check for updates periodically
                setInterval(() => {
                    registration.update();
                }, 60000); // Check every minute
            })
            .catch((error) => {
                console.error('Service Worker registration failed:', error);
            });
    });
}
```

---

## Step 5: Enable Message Listener in Notifications.js

### Location: Lines 347-367 in `notifications.js`

**Uncomment and update the message listener:**

```javascript
// ==========================================
// Listen for service worker messages
// ==========================================
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'NEW_NOTIFICATION') {
            const containers = document.querySelectorAll('.mifan-notifications');
            containers.forEach(container => {
                addNotification(container, event.data.notification);
            });
        } else if (event.data.type === 'REMOVE_NOTIFICATION') {
            const containers = document.querySelectorAll('.mifan-notifications');
            containers.forEach(container => {
                removeNotificationById(container, event.data.notificationId);
            });
        } else if (event.data.type === 'CLEAR_ALL_NOTIFICATIONS') {
            const containers = document.querySelectorAll('.mifan-notifications');
            containers.forEach(container => {
                clearAllNotifications(container);
            });
        } else if (event.data.type === 'NOTIFICATIONS_SYNCED') {
            // Optionally refresh all notifications when synced
            const containers = document.querySelectorAll('.mifan-notifications');
            containers.forEach(container => {
                renderNotifications(container, event.data.notifications);
                showNotificationsSequentially(container);
            });
        }
    });
}
```

---

## Step 6: API Response Format

### Expected API Response Structure

Your API endpoint should return one of these formats:

**Option 1: Array of notifications**
```json
[
    {
        "id": 1,
        "status": "info",
        "message": "Your notification message",
        "link": "/path/to/resource",
        "timestamp": 1234567890
    },
    {
        "id": 2,
        "status": "success",
        "message": "Another notification",
        "link": "/another/path",
        "timestamp": 1234567891
    }
]
```

**Option 2: Wrapped in object**
```json
{
    "notifications": [
        {
            "id": 1,
            "status": "info",
            "message": "Your notification message",
            "link": "/path/to/resource",
            "timestamp": 1234567890
        }
    ]
}
```

### Notification Object Structure

Each notification object should have:
- `id` (required): Unique identifier
- `status` (optional): One of `"info"`, `"success"`, `"warning"`, `"error"`, or `""`
- `message` (required): The notification text
- `link` (optional): URL to navigate when clicked
- `timestamp` (required): Unix timestamp in milliseconds

---

## Step 7: Environment Variables (Optional)

### For different environments (dev/staging/prod)

**Create a config file or use environment variables:**

```javascript
// config/api.js
const API_ENDPOINTS = {
    development: 'http://localhost:3000/api/notifications',
    staging: 'https://staging-api.example.com/notifications',
    production: 'https://api.example.com/notifications'
};

const currentEnv = process.env.NODE_ENV || 'development';

export const API_CONFIG = {
    notificationsEndpoint: API_ENDPOINTS[currentEnv],
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.API_TOKEN || ''}`
    },
    cacheName: 'notifications-cache',
    cacheMaxAge: 5 * 60 * 1000,
};
```

Then import in `notifications.js`:
```javascript
import { API_CONFIG } from './config/api.js';
```

---

## Testing Checklist

- [ ] Service worker registers successfully
- [ ] API endpoint is accessible
- [ ] Notifications fetch from API (check Network tab)
- [ ] Notifications are cached by service worker
- [ ] Offline mode shows cached notifications
- [ ] New notifications appear when pushed
- [ ] Close button works correctly
- [ ] Stacking animation works with API data

---

## Troubleshooting

### Service Worker Not Registering
- Check browser console for errors
- Ensure service worker file is accessible at the registered path
- Check HTTPS requirement (service workers need HTTPS or localhost)

### API Not Fetching
- Check CORS headers on your API
- Verify API endpoint URL is correct
- Check browser Network tab for failed requests
- Verify authentication headers if required

### Notifications Not Appearing
- Check service worker message passing
- Verify API response format matches expected structure
- Check browser console for JavaScript errors
- Ensure notification containers exist in HTML

### Cache Issues
- Clear browser cache and service worker cache
- Use DevTools > Application > Service Workers > Unregister
- Check Cache Storage in DevTools

---

## Additional Features (Optional)

### Periodic Background Sync
```javascript
// In your main app
if ('serviceWorker' in navigator && 'sync' in self.registration) {
    navigator.serviceWorker.ready.then((registration) => {
        registration.sync.register('sync-notifications');
    });
}
```

### Push Notifications Setup
1. Generate VAPID keys
2. Subscribe to push notifications
3. Send subscription to your backend
4. Backend sends push events to browser

---

## Summary

**Key Changes Needed:**
1. ✅ Add `API_CONFIG` constant with your API endpoint
2. ✅ Update `fetchNotificationsFromServiceWorker()` to use API
3. ✅ Create service worker file (`sw.js`)
4. ✅ Register service worker in main app
5. ✅ Uncomment message listener in `notifications.js`
6. ✅ Ensure API returns correct data format

**Files to Modify:**
- `sources/mifan/js/components/frameworks/notifications.js` (add API config, update fetch function)
- Create `public/sw.js` (service worker file)
- Main app entry point (register service worker)

**Files to Create:**
- `public/sw.js` - Service worker implementation
- Optional: `config/api.js` - Environment-based API config
