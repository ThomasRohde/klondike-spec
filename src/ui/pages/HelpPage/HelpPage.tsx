import { Link } from 'react-router-dom';
import './HelpPage.css';

export function HelpPage() {
    return (
        <div className="help-page">
            <header className="help-page__header">
                <Link to="/" className="help-page__back">← Back</Link>
                <h1>How to Play Klondike Solitaire</h1>
            </header>

            <main className="help-page__content">
                <section className="help-page__section">
                    <h2>🎯 Objective</h2>
                    <p>
                        Move all 52 cards to the four foundation piles, building each pile from
                        Ace to King in the same suit.
                    </p>
                </section>

                <section className="help-page__section">
                    <h2>🃏 The Layout</h2>
                    <ul>
                        <li><strong>Stock Pile:</strong> The face-down pile in the top left. Click to draw cards.</li>
                        <li><strong>Waste Pile:</strong> Cards drawn from the stock go here. The top card is playable.</li>
                        <li><strong>Foundations:</strong> Four piles in the top right. Build each from Ace to King by suit.</li>
                        <li><strong>Tableau:</strong> Seven columns of cards. Build down in alternating colors.</li>
                    </ul>
                </section>

                <section className="help-page__section">
                    <h2>📜 Rules</h2>
                    <ul>
                        <li>Only Kings can be placed on empty tableau columns.</li>
                        <li>Cards in the tableau must be placed on cards of opposite color and one rank higher.</li>
                        <li>Only Aces can start a foundation pile.</li>
                        <li>Foundation cards must match suit and increase in rank.</li>
                        <li>You can move multiple face-up cards between tableau columns.</li>
                        <li>When a face-down card is exposed, it automatically flips face-up.</li>
                    </ul>
                </section>

                <section className="help-page__section">
                    <h2>🎮 Controls</h2>
                    <ul>
                        <li><strong>Click:</strong> Select a card or click a destination to move.</li>
                        <li><strong>Double-click:</strong> Auto-move a card to a foundation if valid.</li>
                        <li><strong>Drag & Drop:</strong> Drag cards to move them between piles.</li>
                        <li><strong>Stock Pile:</strong> Click to draw cards, or click the reset icon to recycle.</li>
                    </ul>
                </section>

                <section className="help-page__section">
                    <h2>⚙️ Settings</h2>
                    <ul>
                        <li><strong>Draw 1/3:</strong> Choose how many cards to draw from the stock at once.</li>
                        <li><strong>Card Back:</strong> Choose between classic and modern card back designs.</li>
                    </ul>
                </section>

                <section className="help-page__section">
                    <h2>💡 Tips</h2>
                    <ul>
                        <li>Try to expose face-down cards as quickly as possible.</li>
                        <li>Don't move cards to foundations too quickly - you might need them on the tableau.</li>
                        <li>Keep tableau columns balanced when possible.</li>
                        <li>Use the undo button if you get stuck!</li>
                    </ul>
                </section>

                <div className="help-page__cta">
                    <Link to="/game" className="help-page__play-button">
                        Start Playing
                    </Link>
                </div>
            </main>
        </div>
    );
}
