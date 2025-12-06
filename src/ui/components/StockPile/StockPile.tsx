import { useGameStore } from '@/state/gameStore';
import { getCardBackPath } from '@/game/types';
import './StockPile.css';

export function StockPile() {
    const stock = useGameStore((state) => state.stock);
    const drawCards = useGameStore((state) => state.drawCards);
    const resetStock = useGameStore((state) => state.resetStock);
    const settings = useGameStore((state) => state.settings);

    const handleClick = () => {
        if (stock.cards.length > 0) {
            drawCards();
        } else {
            resetStock();
        }
    };

    const isEmpty = stock.cards.length === 0;
    const cardBackPath = getCardBackPath(settings.cardBack);

    return (
        <div className="stock-pile" onClick={handleClick} data-testid="stock-pile">
            {isEmpty ? (
                <div className="stock-pile__reset">
                    <span className="stock-pile__reset-icon">↻</span>
                </div>
            ) : (
                <div className="stock-pile__cards">
                    <img
                        src={cardBackPath}
                        alt={`${stock.cards.length} cards in stock`}
                        className="stock-pile__card"
                    />
                    <span className="stock-pile__count" data-testid="stock-count">{stock.cards.length}</span>
                </div>
            )}
        </div>
    );
}
