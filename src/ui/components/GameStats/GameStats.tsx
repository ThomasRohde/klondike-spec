import { useEffect } from 'react';
import { useGameStore, useMoveCount, useElapsedTime, useIsWon } from '@/state/gameStore';
import './GameStats.css';

function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function GameStats() {
    const moveCount = useMoveCount();
    const elapsedTime = useElapsedTime();
    const isWon = useIsWon();
    const tick = useGameStore((state) => state.tick);

    useEffect(() => {
        const interval = setInterval(() => {
            tick();
        }, 1000);

        return () => { clearInterval(interval); };
    }, [tick]);

    return (
        <div className="game-stats">
            <div className="game-stats__item">
                <span className="game-stats__label">Moves</span>
                <span className="game-stats__value" data-testid="move-counter">{moveCount}</span>
            </div>
            <div className="game-stats__item">
                <span className="game-stats__label">Time</span>
                <span className="game-stats__value" data-testid="timer">{formatTime(elapsedTime)}</span>
            </div>
            {isWon && (
                <div className="game-stats__item game-stats__item--won">
                    <span className="game-stats__value">🎉 You Won!</span>
                </div>
            )}
        </div>
    );
}
