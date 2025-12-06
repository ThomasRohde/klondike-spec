import {
    Card,
    Pile,
    isOppositeColor,
    isOneRankLower,
    isOneRankHigher,
    getRankValue,
} from './types';

/**
 * Check if a card can be placed on a tableau pile
 * Rules:
 * - Empty pile: only Kings can be placed
 * - Non-empty pile: card must be opposite color and one rank lower
 */
export function canMoveToTableau(cards: Card[], targetPile: Pile): boolean {
    if (cards.length === 0) return false;

    const movingCard = cards[0];
    if (!movingCard) return false;

    const topCard = targetPile.cards[targetPile.cards.length - 1];

    // Empty tableau pile - only Kings allowed
    if (!topCard) {
        return movingCard.rank === 'K';
    }

    // Target card must be face up
    if (!topCard.faceUp) {
        return false;
    }

    // Must be opposite color and one rank lower
    return isOppositeColor(movingCard, topCard) && isOneRankLower(movingCard, topCard);
}

/**
 * Check if a card can be placed on a foundation pile
 * Rules:
 * - Only single cards can be moved to foundation
 * - Empty pile: only Aces can be placed
 * - Non-empty pile: card must match suit and be one rank higher
 */
export function canMoveToFoundation(card: Card, targetPile: Pile): boolean {
    const topCard = targetPile.cards[targetPile.cards.length - 1];

    // Empty foundation pile - only Aces allowed
    if (!topCard) {
        return card.rank === 'A';
    }

    // Must match suit and be one rank higher
    return card.suit === topCard.suit && isOneRankHigher(card, topCard);
}

/**
 * Get all face-up cards from a tableau pile starting from a specific card
 */
export function getMovableCards(pile: Pile, fromCardId: string): Card[] {
    const cardIndex = pile.cards.findIndex((c) => c.id === fromCardId);

    if (cardIndex === -1) return [];

    const card = pile.cards[cardIndex];
    if (!card?.faceUp) return [];

    // Return this card and all cards on top of it
    return pile.cards.slice(cardIndex);
}

/**
 * Check if cards form a valid sequence for moving
 * (alternating colors, descending ranks)
 */
export function isValidSequence(cards: Card[]): boolean {
    if (cards.length <= 1) return true;

    for (let i = 0; i < cards.length - 1; i++) {
        const current = cards[i];
        const next = cards[i + 1];

        if (!current || !next) return false;

        if (!isOppositeColor(current, next) || !isOneRankHigher(current, next)) {
            return false;
        }
    }

    return true;
}

/**
 * Find a valid foundation pile for a card (for auto-move)
 */
export function findValidFoundation(
    card: Card,
    foundations: Pile[]
): Pile | null {
    for (const foundation of foundations) {
        if (canMoveToFoundation(card, foundation)) {
            return foundation;
        }
    }
    return null;
}

/**
 * Check if a card can be auto-moved to foundation
 * Only safe to auto-move if it won't block other plays
 */
export function canAutoMoveToFoundation(
    card: Card,
    foundations: Pile[]
): boolean {
    // First check if the move is valid at all
    const targetFoundation = findValidFoundation(card, foundations);
    if (!targetFoundation) return false;

    // For aces and 2s, always safe to auto-move
    if (card.rank === 'A' || card.rank === '2') return true;

    // For other cards, check if both opposite-color foundations
    // have cards of rank-2 or higher (so this card won't be needed)
    const cardValue = getRankValue(card.rank);
    const oppositeColor = card.suit === 'hearts' || card.suit === 'diamonds' ? 'black' : 'red';

    const oppositeFoundations = foundations.filter((f) => {
        const topCard = f.cards[f.cards.length - 1];
        if (!topCard) return false;
        const color = topCard.suit === 'hearts' || topCard.suit === 'diamonds' ? 'red' : 'black';
        return color === oppositeColor;
    });

    // Check if opposite color foundations are high enough
    return oppositeFoundations.every((f) => {
        const topCard = f.cards[f.cards.length - 1];
        if (!topCard) return false;
        return getRankValue(topCard.rank) >= cardValue - 1;
    });
}

/**
 * Check if the game is won
 * (all 4 foundations have 13 cards each)
 */
export function checkWin(foundations: Pile[]): boolean {
    return foundations.every((f) => f.cards.length === 13);
}
