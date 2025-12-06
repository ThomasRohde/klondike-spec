import { useState, useEffect, useCallback } from 'react';
import './UpdateNotification.css';

// Type for the service worker registration with update methods
interface ServiceWorkerRegistrationWithUpdate extends ServiceWorkerRegistration {
    waiting: ServiceWorker | null;
}

export function UpdateNotification() {
    const [showUpdate, setShowUpdate] = useState(false);
    const [registration, setRegistration] = useState<ServiceWorkerRegistrationWithUpdate | null>(null);

    useEffect(() => {
        // Only run in production with service workers
        if (!('serviceWorker' in navigator)) {
            return;
        }

        const handleUpdate = (reg: ServiceWorkerRegistration) => {
            console.log('[PWA] New service worker available');
            setRegistration(reg as ServiceWorkerRegistrationWithUpdate);
            setShowUpdate(true);
        };

        // Listen for vite-plugin-pwa update ready event
        const handleSWUpdate = (event: Event) => {
            const customEvent = event as CustomEvent<ServiceWorkerRegistration>;
            handleUpdate(customEvent.detail);
        };

        // Register for updates from vite-plugin-pwa
        document.addEventListener('swUpdated', handleSWUpdate);

        // Also check for updates manually
        navigator.serviceWorker.ready.then((reg) => {
            // Check for updates periodically (every 60 minutes)
            const checkInterval = setInterval(() => {
                reg.update().catch(console.error);
            }, 60 * 60 * 1000);

            // Listen for state changes on the installing service worker
            reg.addEventListener('updatefound', () => {
                const newWorker = reg.installing;
                if (newWorker) {
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // New service worker is installed but waiting
                            handleUpdate(reg);
                        }
                    });
                }
            });

            // Clean up interval on unmount
            return () => {
                clearInterval(checkInterval);
            };
        }).catch(console.error);

        return () => {
            document.removeEventListener('swUpdated', handleSWUpdate);
        };
    }, []);

    const handleRefresh = useCallback(() => {
        if (registration?.waiting) {
            // Tell the waiting service worker to skip waiting
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }

        // Listen for the controlling service worker changing
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            window.location.reload();
        });

        // Fallback: reload after a short delay
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    }, [registration]);

    const handleDismiss = () => {
        setShowUpdate(false);
        console.log('[PWA] Update dismissed, will apply on next visit');
    };

    if (!showUpdate) {
        return null;
    }

    return (
        <div className="update-notification">
            <div className="update-notification__content">
                <span className="update-notification__icon">🔄</span>
                <div className="update-notification__text">
                    <strong>Update Available</strong>
                    <span>A new version is ready to install</span>
                </div>
            </div>
            <div className="update-notification__actions">
                <button
                    className="update-notification__button update-notification__button--dismiss"
                    onClick={handleDismiss}
                    aria-label="Dismiss update notification"
                >
                    Later
                </button>
                <button
                    className="update-notification__button update-notification__button--refresh"
                    onClick={handleRefresh}
                    aria-label="Refresh to update"
                >
                    Refresh
                </button>
            </div>
        </div>
    );
}
