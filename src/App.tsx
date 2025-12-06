import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage, GamePage, HelpPage } from '@/ui/pages';
import { ErrorBoundary, OfflineIndicator, InstallPrompt, UpdateNotification } from '@/ui/components';
import { StandaloneModeProvider } from '@/ui/hooks';
import './App.css';

// Base path for GitHub Pages deployment
const basename = import.meta.env.BASE_URL;

export function App() {
    return (
        <ErrorBoundary>
            <StandaloneModeProvider>
                <BrowserRouter basename={basename}>
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/game" element={<GamePage />} />
                        <Route path="/help" element={<HelpPage />} />
                    </Routes>
                    <OfflineIndicator />
                    <InstallPrompt />
                    <UpdateNotification />
                </BrowserRouter>
            </StandaloneModeProvider>
        </ErrorBoundary>
    );
}
