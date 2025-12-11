# Popup System Documentation

## Overview
A comprehensive popup system with three different trigger types, smooth transitions, and intelligent display logic.

## Features Implemented

### 1. **Auto Popups** (`popup-type="auto"`)
Automatically displays after a specified delay when the page loads.

**Attributes:**
- `popup-delay`: Delay in milliseconds before showing (e.g., `5000` = 5 seconds)
- `popup-time`: 
  - `once`: Shows only once ever (stored in localStorage)
  - `each`: Shows on each page load/route change

**Examples in HTML:**
```html
<!-- Shows once after 5 seconds -->
<div class="mifan-popup" popup-id="newsletter-1" popup-type="auto" popup-delay="5000" popup-time="once">
```

### 2. **Trigger Popups** (`popup-type="trigger"`)
Shows when a specific button is clicked.

**How to use:**
1. Add `popup-type="trigger"` to your popup
2. Create a button with `popup-trigger` attribute matching the `popup-id`

**Example:**
```html
<!-- Popup definition -->
<div class="mifan-popup" popup-id="newsletter-3" popup-type="trigger">
    ...
</div>

<!-- Trigger button -->
<button popup-trigger="newsletter-3">Open Popup</button>
```

### 3. **Worker Popups** (`popup-type="worker"`)
Designed to be triggered by service workers or external JavaScript.

**How to trigger programmatically:**
```javascript
// From anywhere in your code or service worker
window.triggerWorkerPopup('newsletter-2');
```

## Popup Structure

### Basic HTML Structure:
```html
<div class="mifan-popup" 
     popup-id="unique-id" 
     popup-type="auto|trigger|worker" 
     popup-delay="5000" 
     popup-time="once|each">
    <div class="container">
        <div>
            <button class="close" aria-label="close">
                <!-- Close icon SVG -->
            </button>
            <!-- Your popup content here -->
            <p>Your message</p>
        </div>
    </div>
</div>
```

## Transitions & Animations

### Smooth Transitions Applied:
- **Opacity fade**: 0.3s cubic-bezier easing
- **Scale animation**: Container scales from 0.95 to 1.0
- **Backdrop blur**: Smooth blur transition
- **Visibility handling**: Proper visibility management for accessibility

## Close Functionality

### Multiple ways to close:
1. **Close button**: Click the `<button class="close">` element
2. **Backdrop click**: Click outside the popup content area
3. **Programmatic**: Call `hidePopup()` on the popup reference

## Storage & Persistence

- **localStorage** is used to track "once" popups
- Storage key format: `mifan-popup-{popup-id}`
- Prevents "once" popups from showing again even after page refresh

## Current Popup Configuration

| Popup ID | Type | Delay | Time | Description |
|----------|------|-------|------|-------------|
| newsletter-1 | auto | 5000ms | once | Shows once after 5 seconds |
| newsletter-2 | worker | - | - | Manual service worker trigger |
| newsletter-3 | trigger | - | - | Button-activated popup |
| newsletter-4 | auto | 7500ms | once | Shows once after 7.5 seconds |
| newsletter-5 | auto | 10000ms | each | Shows every page load after 10 seconds |

## API Reference

### Window Methods:
```javascript
// Trigger a worker popup
window.triggerWorkerPopup(popupId: string): void

// Access popup controls (for worker popups)
window.mifanPopupWorkers[popupId].show(): void
window.mifanPopupWorkers[popupId].hide(): void
```

### Custom Events:
```javascript
// Listen for worker popup events
window.addEventListener('mifan-popup-worker-{popupId}', () => {
    // Handle popup trigger
});
```

## Testing

Test buttons have been added to the page:
1. **Trigger Pop Up 3**: Tests trigger-type popup
2. **Trigger Worker Popup**: Tests worker-type popup via button attribute
3. **Trigger via Service Worker API**: Tests programmatic worker popup trigger

## Browser Compatibility

- Uses modern CSS features (color-mix, backdrop-filter)
- localStorage for persistence
- Custom events for worker communication
- Supports all modern browsers

## Future Enhancements

When implementing service workers:
```javascript
// In your service worker
self.addEventListener('push', (event) => {
    // After showing notification
    clients.matchAll().then(clients => {
        clients.forEach(client => {
            client.postMessage({
                type: 'show-popup',
                popupId: 'newsletter-2'
            });
        });
    });
});

// In your main app
navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data.type === 'show-popup') {
        window.triggerWorkerPopup(event.data.popupId);
    }
});
```

## CSS Classes

- `.mifan-popup`: Main popup wrapper
- `.mifan-popup.show`: Active state (visible)
- `.container`: Content container with border and background
- `button.close`: Close button styling

## Notes

- Initial state: All popups are hidden (opacity: 0, visibility: hidden)
- Popups prevent body scrolling when open (consider adding body scroll lock)
- Click events are properly propagated/stopped to prevent unintended closes
- Smooth animations use GPU-accelerated properties (opacity, transform)
