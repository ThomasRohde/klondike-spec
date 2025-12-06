import { useState } from 'react';
import { useGameStore } from '@/state/gameStore';
import './GameControls.css';

export function GameControls() {
    const [showNewGameConfirm, setShowNewGameConfirm] = useState(false);
    const newGame = useGameStore((state) => state.newGame);
    const undo = useGameStore((state) => state.undo);
    const moves = useGameStore((state) => state.moves);

    const handleNewGame = () => {
        if (moves.length > 0) {
            setShowNewGameConfirm(true);
        } else {
            newGame();
        }
    };

    const confirmNewGame = () => {
        newGame();
        setShowNewGameConfirm(false);
    };

    const cancelNewGame = () => {
        setShowNewGameConfirm(false);
    };

    return (
        <div className="game-controls">
            <button
                className="game-controls__button"
                onClick={handleNewGame}
                title="Start a new game"
                data-testid="new-game-button"
            >
                <span className="game-controls__icon">🃏</span>
                <span className="game-controls__label">New Game</span>
            </button>

            <button
                className="game-controls__button"
                onClick={undo}
                disabled={moves.length === 0}
                title="Undo last move"
            >
                <span className="game-controls__icon">↩️</span>
                <span className="game-controls__label">Undo</span>
            </button>

            {showNewGameConfirm && (
                <div className="game-controls__modal-overlay" onClick={cancelNewGame}>
                    <div className="game-controls__modal" onClick={(e) => { e.stopPropagation(); }}>
                        <h3>Start New Game?</h3>
                        <p>Your current progress will be lost.</p>
                        <div className="game-controls__modal-buttons">
                            <button onClick={confirmNewGame} className="game-controls__confirm" data-testid="confirm-new-game">
                                Yes, Start New
                            </button>
                            <button onClick={cancelNewGame} className="game-controls__cancel">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
