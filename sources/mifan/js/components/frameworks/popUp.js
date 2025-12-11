export default function popUp() {
    const popUps = document.querySelectorAll('.mifan-popup');
    
    const state = window.mifanPopupState || (window.mifanPopupState = {
        queue: [],
        current: null,
        pageLoadTime: Date.now(),
        checkInterval: null,
        controls: {},
        workers: {}
    });
    
    const processQueue = () => {
        if (state.current || !state.queue.length) {
            if (!state.queue.length && state.checkInterval) {
                clearInterval(state.checkInterval);
                state.checkInterval = null;
            }
            return;
        }
        
        const elapsed = Date.now() - state.pageLoadTime;
        const readyIndex = state.queue.findIndex(item => elapsed >= item.scheduledTime);
        
        if (readyIndex !== -1) {
            state.queue.splice(readyIndex, 1)[0].show();
        }
    };
    
    const startQueueChecker = () => {
        if (!state.checkInterval && state.queue.length) {
            state.checkInterval = setInterval(processQueue, 100);
        }
    };
    
    const enqueue = (queueItem) => {
        if (state.queue.some(item => item.popupId === queueItem.popupId)) return;
        
        const insertIndex = state.queue.findIndex(item => item.scheduledTime > queueItem.scheduledTime);
        insertIndex === -1 ? state.queue.push(queueItem) : state.queue.splice(insertIndex, 0, queueItem);
        startQueueChecker();
    };
    
    popUps.forEach(popup => {
        const popupId = popup.getAttribute('popup-id');
        const popupType = popup.getAttribute('popup-type');
        const popupDelay = parseInt(popup.getAttribute('popup-delay')) || 0;
        const popupTime = popup.getAttribute('popup-time');
        const storageKey = `mifan-popup-${popupId}`;
        
        const showNow = () => {
            state.current = popup;
            popup.style.visibility = 'visible';
            popup.style.pointerEvents = 'auto';
            popup.offsetHeight;
            popup.style.opacity = '1';
            popup.classList.add('show');
        };
        
        const hide = () => {
            popup.style.opacity = '0';
            setTimeout(() => {
                popup.style.visibility = 'hidden';
                popup.style.pointerEvents = 'none';
                popup.classList.remove('show');
                
                if (state.current === popup) {
                    state.current = null;
                    setTimeout(() => {
                        processQueue();
                        startQueueChecker();
                    }, 100);
                }
            }, 300);
        };
        
        const show = (scheduledTime = null) => {
            const currentTime = Date.now() - state.pageLoadTime;
            const queueItem = {
                show: showNow,
                popup,
                popupId,
                scheduledTime: scheduledTime ?? currentTime
            };
            
            if (scheduledTime || state.current) {
                enqueue(queueItem);
            } else {
                showNow();
            }
        };
        
        state.controls[popupId] = { show, hide };
        if (popupType === 'worker') state.workers[popupId] = { show, hide };
        
        document.querySelectorAll(`[popup-trigger="${popupId}"]`).forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                show();
            });
        });
        
        const closeButton = popup.querySelector('button.close');
        if (closeButton) {
            closeButton.addEventListener('click', (e) => {
                e.stopPropagation();
                hide();
            });
        }
        
        popup.addEventListener('click', (e) => {
            if (e.target === popup) hide();
        });
        
        const container = popup.querySelector('.container');
        if (container) {
            container.addEventListener('click', (e) => e.stopPropagation());
        }
        
        if (popupType === 'auto') {
            const shouldShow = popupTime === 'each' || !localStorage.getItem(storageKey);
            
            if (shouldShow) {
                setTimeout(() => {
                    show(popupDelay);
                    if (popupTime === 'once') localStorage.setItem(storageKey, 'true');
                }, popupDelay);
            }
        }
        
        if (popupType === 'worker') {
            window.addEventListener(`mifan-popup-worker-${popupId}`, () => show());
        }
    });
}

window.triggerWorkerPopup = (popupId) => {
    const state = window.mifanPopupState;
    if (state?.workers?.[popupId]) {
        state.workers[popupId].show();
    } else {
        window.dispatchEvent(new CustomEvent(`mifan-popup-worker-${popupId}`));
    }
};