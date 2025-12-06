import { useState, useEffect, useCallback } from 'react';
import './InstallPrompt.css';

// Extended interface for the beforeinstallprompt event
interface BeforeInstallPromptEvent extends Event {
    prompt(): Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'pwa-install-dismissed';
const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

// Helper to detect current display mode (F038)
function getDisplayMode(): string {
    if (window.matchMedia('(display-mode: standalone)').matches) {
        return 'standalone';
    }
    if (window.matchMedia('(display-mode: fullscreen)').matches) {
        return 'fullscreen';
    }
    if (window.matchMedia('(display-mode: minimal-ui)').matches) {
        return 'minimal-ui';
    }
    return 'browser';
}

// Log PWA analytics event (F038)
function logPWAEvent(event: string, details?: Record<string, unknown>) {
    const logData = {
        event,
        timestamp: new Date().toISOString(),
        displayMode: getDisplayMode(),
        ...details,
    };
    console.log('[PWA Analytics]', logData);
}

export function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);

    // Check if user dismissed recently
    const wasDismissedRecently = useCallback(() => {
        const dismissedAt = localStorage.getItem(DISMISS_KEY);
        if (!dismissedAt) return false;

        const dismissTime = parseInt(dismissedAt, 10);
        return Date.now() - dismissTime < DISMISS_DURATION;
    }, []);

    useEffect(() => {
        // Log initial display mode (F038)
        logPWAEvent('app_loaded', { displayMode: getDisplayMode() });

        // Check if app is already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true);
            logPWAEvent('running_installed');
            return;
        }

        const handleBeforeInstall = (e: Event) => {
            // Prevent Chrome 67+ from automatically showing the prompt
            e.preventDefault();
            // Stash the event so it can be triggered later
            setDeferredPrompt(e as BeforeInstallPromptEvent);

            // Log that install prompt is available (F038)
            logPWAEvent('install_prompt_available');

            // Only show our custom prompt if not recently dismissed
            if (!wasDismissedRecently()) {
                setShowPrompt(true);
                logPWAEvent('install_prompt_shown');
            }
        };

        const handleAppInstalled = () => {
            setIsInstalled(true);
            setShowPrompt(false);
            setDeferredPrompt(null);
            // Clear dismissal on successful install
            localStorage.removeItem(DISMISS_KEY);
            // Log successful installation (F038)
            logPWAEvent('app_installed');
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstall);
        window.addEventListener('appinstalled', handleAppInstalled);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, [wasDismissedRecently]);

    const handleInstall = async () => {
        if (!deferredPrompt) return;

        // Log that user clicked install (F038)
        logPWAEvent('install_button_clicked');

        // Show the native install prompt
        await deferredPrompt.prompt();

        // Wait for the user's response
        const { outcome } = await deferredPrompt.userChoice;

        // Log user's choice (F038)
        logPWAEvent('install_prompt_response', { outcome });

        if (outcome === 'accepted') {
            setShowPrompt(false);
        }

        // Clear the deferred prompt - can only be used once
        setDeferredPrompt(null);
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        // Remember dismissal for 7 days
        localStorage.setItem(DISMISS_KEY, Date.now().toString());
        // Log dismissal (F038)
        logPWAEvent('install_prompt_dismissed');
    };

    // Don't render if installed or not showing
    if (isInstalled || !showPrompt) {
        return null;
    }

    return (
        <div className="install-prompt">
            <div className="install-prompt__content">
                <span className="install-prompt__icon">🎴</span>
                <div className="install-prompt__text">
                    <strong>Install Solitaire</strong>
                    <span>Play anytime, even offline!</span>
                </div>
            </div>
            <div className="install-prompt__actions">
                <button
                    className="install-prompt__button install-prompt__button--dismiss"
                    onClick={handleDismiss}
                    aria-label="Dismiss install prompt"
                >
                    Later
                </button>
                <button
                    className="install-prompt__button install-prompt__button--install"
                    onClick={() => { void handleInstall(); }}
                    aria-label="Install app"
                >
                    Install
                </button>
            </div>
        </div>
    );
}
