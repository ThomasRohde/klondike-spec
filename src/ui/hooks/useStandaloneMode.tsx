import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface StandaloneModeContextType {
    isStandalone: boolean;
    displayMode: string;
}

const StandaloneModeContext = createContext<StandaloneModeContextType>({
    isStandalone: false,
    displayMode: 'browser',
});

// eslint-disable-next-line react-refresh/only-export-components
export function useStandaloneMode() {
    return useContext(StandaloneModeContext);
}

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

interface Props {
    children: ReactNode;
}

export function StandaloneModeProvider({ children }: Props) {
    const [displayMode, setDisplayMode] = useState(getDisplayMode);
    const isStandalone = displayMode === 'standalone' || displayMode === 'fullscreen';

    useEffect(() => {
        // Listen for display mode changes
        const mediaQueryList = window.matchMedia('(display-mode: standalone)');

        const handleChange = () => {
            setDisplayMode(getDisplayMode());
        };

        // Modern browsers use addEventListener
        mediaQueryList.addEventListener('change', handleChange);

        return () => {
            mediaQueryList.removeEventListener('change', handleChange);
        };
    }, []);

    return (
        <StandaloneModeContext.Provider value={{ isStandalone, displayMode }}>
            {children}
        </StandaloneModeContext.Provider>
    );
}
