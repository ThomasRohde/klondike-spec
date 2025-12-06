import { Link } from 'react-router-dom';
import './HomePage.css';

export function HomePage() {
    return (
        <div className="home-page">
            <div className="home-page__content">
                <div className="home-page__logo">🃏</div>
                <h1 className="home-page__title">Klondike Solitaire</h1>
                <p className="home-page__subtitle">The classic card game</p>

                <div className="home-page__buttons">
                    <Link to="/game" className="home-page__button home-page__button--primary">
                        Play Game
                    </Link>
                    <Link to="/help" className="home-page__button home-page__button--secondary">
                        How to Play
                    </Link>
                </div>

                <div className="home-page__features">
                    <div className="home-page__feature">
                        <span className="home-page__feature-icon">🎯</span>
                        <span className="home-page__feature-text">Drag & Drop Controls</span>
                    </div>
                    <div className="home-page__feature">
                        <span className="home-page__feature-icon">↩️</span>
                        <span className="home-page__feature-text">Unlimited Undo</span>
                    </div>
                    <div className="home-page__feature">
                        <span className="home-page__feature-icon">📱</span>
                        <span className="home-page__feature-text">Works Offline</span>
                    </div>
                </div>
            </div>

            <footer className="home-page__footer">
                <p>A PWA Solitaire Game</p>
            </footer>
        </div>
    );
}
