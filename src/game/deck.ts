import { Card, SUITS, RANKS, getCardId } from './types';

/**
 * Creates a fresh, unshuffled deck of 52 cards
 */
export function createDeck(): Card[] {
    const deck: Card[] = [];

    for (const suit of SUITS) {
        for (const rank of RANKS) {
            deck.push({
                id: getCardId(suit, rank),
                suit,
                rank,
                faceUp: false,
            });
        }
    }

    return deck;
}

/**
 * Fisher-Yates shuffle algorithm
 * Shuffles the deck in-place and returns it
 */
export function shuffleDeck(deck: Card[]): Card[] {
    const shuffled = [...deck];

    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = shuffled[i];
        shuffled[i] = shuffled[j] as Card;
        shuffled[j] = temp as Card;
    }

    return shuffled;
}

/**
 * Creates and shuffles a new deck
 */
export function createShuffledDeck(): Card[] {
    return shuffleDeck(createDeck());
}

/**
 * Validates that a deck has exactly 52 unique cards
 */
export function isValidDeck(deck: Card[]): boolean {
    if (deck.length !== 52) {
        return false;
    }

    const ids = new Set(deck.map((card) => card.id));
    return ids.size === 52;
}
