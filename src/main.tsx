import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';

const container = document.getElementById('root');
if (!container) {
    throw new Error('Root element not found');
}

createRoot(container).render(
    <StrictMode>
        <App />
    </StrictMode>
);

// Service Worker Lifecycle Management (F037)
if ('serviceWorker' in navigator) {
    // Log service worker registration status in development
    if (import.meta.env.DEV) {
        console.log('[PWA] Running in development mode - service worker disabled');
    } else {
        navigator.serviceWorker.ready
            .then((registration) => {
                console.log('[PWA] Service worker registered:', registration.scope);

                // Log when service worker is controlling the page
                if (navigator.serviceWorker.controller) {
                    console.log('[PWA] Page is controlled by service worker');
                }
            })
            .catch((error: unknown) => {
                console.error('[PWA] Service worker registration failed:', error);
            });

        // Listen for service worker updates
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            console.log('[PWA] Service worker controller changed - new version active');
        });
    }
}
