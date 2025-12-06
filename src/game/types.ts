// Card suits and ranks with strong typing
export const SUITS = ['hearts', 'diamonds', 'clubs', 'spades'] as const;
export const RANKS = [
    'A',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '10',
    'J',
    'Q',
    'K',
] as const;

export type Suit = (typeof SUITS)[number];
export type Rank = (typeof RANKS)[number];

export interface Card {
    id: string;
    suit: Suit;
    rank: Rank;
    faceUp: boolean;
}

export type PileType =
    | 'stock'
    | 'waste'
    | 'foundation'
    | 'tableau';

export interface Pile {
    id: string;
    type: PileType;
    cards: Card[];
    index: number; // 0-3 for foundations, 0-6 for tableau
}

// Move types for history tracking
export type MoveType =
    | 'draw'
    | 'tableau-to-tableau'
    | 'tableau-to-foundation'
    | 'waste-to-tableau'
    | 'waste-to-foundation'
    | 'foundation-to-tableau'
    | 'reset-stock';

export interface Move {
    type: MoveType;
    from: string; // pile id
    to: string; // pile id
    cards: Card[];
    flippedCard?: Card; // card that was flipped face up after the move
    timestamp: number;
}

// Game settings
export interface GameSettings {
    drawCount: 1 | 3;
    soundEnabled: boolean;
    cardBack: 'classic' | 'modern';
}

// Complete game state
export interface GameState {
    stock: Pile;
    waste: Pile;
    foundations: Pile[]; // 4 piles
    tableau: Pile[]; // 7 piles
    moves: Move[];
    moveCount: number;
    startTime: number | null;
    elapsedTime: number;
    isWon: boolean;
    settings: GameSettings;
    selectedCardIds: string[];
    selectedPileId: string | null;
}

// Color helpers
export function getSuitColor(suit: Suit): 'red' | 'black' {
    return suit === 'hearts' || suit === 'diamonds' ? 'red' : 'black';
}

export function isOppositeColor(card1: Card, card2: Card): boolean {
    return getSuitColor(card1.suit) !== getSuitColor(card2.suit);
}

// Rank value helpers
export function getRankValue(rank: Rank): number {
    const index = RANKS.indexOf(rank);
    return index + 1; // A=1, 2=2, ..., K=13
}

export function isOneRankHigher(higher: Card, lower: Card): boolean {
    return getRankValue(higher.rank) === getRankValue(lower.rank) + 1;
}

export function isOneRankLower(lower: Card, higher: Card): boolean {
    return getRankValue(lower.rank) === getRankValue(higher.rank) - 1;
}

// Card ID generation
export function getCardId(suit: Suit, rank: Rank): string {
    return `${rank}-${suit}`;
}

// Get card image path
export function getCardImagePath(card: Card): string {
    const base = import.meta.env.BASE_URL || '/';
    return `${base}cards/${card.rank.toLowerCase()}_of_${card.suit}.svg`;
}

export function getCardBackPath(back: 'classic' | 'modern'): string {
    const base = import.meta.env.BASE_URL || '/';
    return `${base}cards/back_${back}.svg`;
}
