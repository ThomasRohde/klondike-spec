import { Component, ErrorInfo, ReactNode } from 'react';
import { useGameStore } from '@/state/gameStore';
import './ErrorBoundary.css';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        this.setState({ errorInfo });
    }

    handleNewGame = (): void => {
        // Reset error state
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        });
        // Start a new game
        useGameStore.getState().newGame();
    };

    handleReload = (): void => {
        window.location.reload();
    };

    render(): ReactNode {
        if (this.state.hasError) {
            return (
                <div className="error-boundary">
                    <div className="error-boundary__content">
                        <h1 className="error-boundary__title">🃏 Oops!</h1>
                        <p className="error-boundary__message">
                            Something went wrong with the game.
                        </p>
                        <p className="error-boundary__details">
                            {this.state.error?.message || 'An unexpected error occurred'}
                        </p>
                        <div className="error-boundary__actions">
                            <button
                                className="error-boundary__button error-boundary__button--primary"
                                onClick={this.handleNewGame}
                            >
                                🎮 Start New Game
                            </button>
                            <button
                                className="error-boundary__button error-boundary__button--secondary"
                                onClick={this.handleReload}
                            >
                                🔄 Reload Page
                            </button>
                        </div>
                        {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                            <details className="error-boundary__stack">
                                <summary>Error Details</summary>
                                <pre>{this.state.error?.stack}</pre>
                                <pre>{this.state.errorInfo.componentStack}</pre>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
