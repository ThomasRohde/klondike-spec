import { Card, Pile, GameState, GameSettings } from './types';
import { createShuffledDeck } from './deck';

const DEFAULT_SETTINGS: GameSettings = {
    drawCount: 1,
    soundEnabled: false,
    cardBack: 'classic',
};

/**
 * Creates the initial game state with dealt cards
 */
export function createInitialGameState(
    settings: GameSettings = DEFAULT_SETTINGS
): GameState {
    const deck = createShuffledDeck();
    let cardIndex = 0;

    // Create tableau piles (7 piles with 1-7 cards)
    const tableau: Pile[] = [];
    for (let i = 0; i < 7; i++) {
        const cards: Card[] = [];
        for (let j = 0; j <= i; j++) {
            const card = deck[cardIndex];
            if (card) {
                cards.push({
                    ...card,
                    faceUp: j === i, // Only top card is face up
                });
            }
            cardIndex++;
        }
        tableau.push({
            id: `tableau-${i}`,
            type: 'tableau',
            cards,
            index: i,
        });
    }

    // Create foundation piles (4 empty piles)
    const foundations: Pile[] = [];
    for (let i = 0; i < 4; i++) {
        foundations.push({
            id: `foundation-${i}`,
            type: 'foundation',
            cards: [],
            index: i,
        });
    }

    // Remaining cards go to stock (24 cards)
    const stockCards: Card[] = [];
    while (cardIndex < 52) {
        const card = deck[cardIndex];
        if (card) {
            stockCards.push({ ...card, faceUp: false });
        }
        cardIndex++;
    }

    const stock: Pile = {
        id: 'stock',
        type: 'stock',
        cards: stockCards,
        index: 0,
    };

    const waste: Pile = {
        id: 'waste',
        type: 'waste',
        cards: [],
        index: 0,
    };

    return {
        stock,
        waste,
        foundations,
        tableau,
        moves: [],
        moveCount: 0,
        startTime: null,
        elapsedTime: 0,
        isWon: false,
        settings,
        selectedCardIds: [],
        selectedPileId: null,
    };
}

/**
 * Gets all piles in the game state
 */
export function getAllPiles(state: GameState): Pile[] {
    return [state.stock, state.waste, ...state.foundations, ...state.tableau];
}

/**
 * Finds a pile by its ID
 */
export function findPileById(state: GameState, pileId: string): Pile | null {
    return getAllPiles(state).find((p) => p.id === pileId) ?? null;
}

/**
 * Finds which pile contains a specific card
 */
export function findCardPile(state: GameState, cardId: string): Pile | null {
    return getAllPiles(state).find((p) => p.cards.some((c) => c.id === cardId)) ?? null;
}

/**
 * Gets the top card of a pile
 */
export function getTopCard(pile: Pile): Card | null {
    return pile.cards[pile.cards.length - 1] ?? null;
}

/**
 * Counts total cards in the game (for validation)
 */
export function countTotalCards(state: GameState): number {
    return getAllPiles(state).reduce((sum, pile) => sum + pile.cards.length, 0);
}
