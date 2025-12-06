import { useState, useEffect } from 'react';
import './OfflineIndicator.css';

export function OfflineIndicator() {
    const [isOffline, setIsOffline] = useState(!navigator.onLine);
    const [showIndicator, setShowIndicator] = useState(false);

    useEffect(() => {
        const handleOnline = () => {
            setIsOffline(false);
            // Show "back online" briefly
            setShowIndicator(true);
            setTimeout(() => {
                setShowIndicator(false);
            }, 3000);
        };

        const handleOffline = () => {
            setIsOffline(true);
            setShowIndicator(true);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Show indicator initially if offline
        if (!navigator.onLine) {
            setShowIndicator(true);
        }

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    if (!showIndicator) {
        return null;
    }

    return (
        <div className={`offline-indicator ${isOffline ? 'offline-indicator--offline' : 'offline-indicator--online'}`}>
            <span className="offline-indicator__icon">
                {isOffline ? '📡' : '✓'}
            </span>
            <span className="offline-indicator__text">
                {isOffline
                    ? 'You\'re offline. Game progress is saved locally.'
                    : 'Back online!'}
            </span>
        </div>
    );
}
