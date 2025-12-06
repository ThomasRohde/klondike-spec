import { useIsWon, useGameStore, useMoveCount, useElapsedTime } from '@/state/gameStore';
import './WinModal.css';

function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function WinModal() {
    const isWon = useIsWon();
    const moveCount = useMoveCount();
    const elapsedTime = useElapsedTime();
    const newGame = useGameStore((state) => state.newGame);

    if (!isWon) return null;

    return (
        <div className="win-modal__overlay">
            <div className="win-modal">
                <div className="win-modal__celebration">🎉</div>
                <h2 className="win-modal__title">Congratulations!</h2>
                <p className="win-modal__subtitle">You won the game!</p>

                <div className="win-modal__stats">
                    <div className="win-modal__stat">
                        <span className="win-modal__stat-value">{moveCount}</span>
                        <span className="win-modal__stat-label">Moves</span>
                    </div>
                    <div className="win-modal__stat">
                        <span className="win-modal__stat-value">{formatTime(elapsedTime)}</span>
                        <span className="win-modal__stat-label">Time</span>
                    </div>
                </div>

                <button className="win-modal__button" onClick={newGame}>
                    Play Again
                </button>
            </div>
        </div>
    );
}
