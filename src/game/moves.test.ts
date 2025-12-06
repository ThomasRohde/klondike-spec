import { describe, it, expect } from 'vitest';
import {
    canMoveToTableau,
    canMoveToFoundation,
    isValidSequence,
    checkWin,
} from '@/game/moves';
import { Card, Pile } from '@/game/types';

// Helper to create a card
function createCard(
    rank: Card['rank'],
    suit: Card['suit'],
    faceUp = true
): Card {
    return {
        id: `${rank}-${suit}`,
        rank,
        suit,
        faceUp,
    };
}

// Helper to create an empty pile
function createPile(type: Pile['type'], cards: Card[] = []): Pile {
    return {
        id: `${type}-0`,
        type,
        cards,
        index: 0,
    };
}

describe('Tableau Move Validation', () => {
    it('should allow King on empty tableau', () => {
        const king = createCard('K', 'hearts');
        const emptyTableau = createPile('tableau');
        expect(canMoveToTableau([king], emptyTableau)).toBe(true);
    });

    it('should not allow non-King on empty tableau', () => {
        const queen = createCard('Q', 'hearts');
        const emptyTableau = createPile('tableau');
        expect(canMoveToTableau([queen], emptyTableau)).toBe(false);
    });

    it('should allow opposite color card one rank lower', () => {
        const redQueen = createCard('Q', 'hearts');
        const blackKing = createCard('K', 'spades');
        const tableau = createPile('tableau', [blackKing]);
        expect(canMoveToTableau([redQueen], tableau)).toBe(true);
    });

    it('should not allow same color card', () => {
        const redQueen = createCard('Q', 'hearts');
        const redKing = createCard('K', 'diamonds');
        const tableau = createPile('tableau', [redKing]);
        expect(canMoveToTableau([redQueen], tableau)).toBe(false);
    });

    it('should not allow card with wrong rank', () => {
        const redJack = createCard('J', 'hearts');
        const blackKing = createCard('K', 'spades');
        const tableau = createPile('tableau', [blackKing]);
        expect(canMoveToTableau([redJack], tableau)).toBe(false);
    });

    it('should not allow placing on face-down card', () => {
        const redQueen = createCard('Q', 'hearts');
        const blackKing = createCard('K', 'spades', false);
        const tableau = createPile('tableau', [blackKing]);
        expect(canMoveToTableau([redQueen], tableau)).toBe(false);
    });
});

describe('Foundation Move Validation', () => {
    it('should allow Ace on empty foundation', () => {
        const ace = createCard('A', 'hearts');
        const foundation = createPile('foundation');
        expect(canMoveToFoundation(ace, foundation)).toBe(true);
    });

    it('should not allow non-Ace on empty foundation', () => {
        const two = createCard('2', 'hearts');
        const foundation = createPile('foundation');
        expect(canMoveToFoundation(two, foundation)).toBe(false);
    });

    it('should allow next rank of same suit', () => {
        const two = createCard('2', 'hearts');
        const ace = createCard('A', 'hearts');
        const foundation = createPile('foundation', [ace]);
        expect(canMoveToFoundation(two, foundation)).toBe(true);
    });

    it('should not allow wrong suit', () => {
        const twoDiamonds = createCard('2', 'diamonds');
        const aceHearts = createCard('A', 'hearts');
        const foundation = createPile('foundation', [aceHearts]);
        expect(canMoveToFoundation(twoDiamonds, foundation)).toBe(false);
    });

    it('should not allow wrong rank', () => {
        const three = createCard('3', 'hearts');
        const ace = createCard('A', 'hearts');
        const foundation = createPile('foundation', [ace]);
        expect(canMoveToFoundation(three, foundation)).toBe(false);
    });
});

describe('Valid Sequence', () => {
    it('should validate single card', () => {
        const card = createCard('K', 'hearts');
        expect(isValidSequence([card])).toBe(true);
    });

    it('should validate alternating colors descending', () => {
        const king = createCard('K', 'spades');
        const queen = createCard('Q', 'hearts');
        const jack = createCard('J', 'clubs');
        expect(isValidSequence([king, queen, jack])).toBe(true);
    });

    it('should reject same color sequence', () => {
        const king = createCard('K', 'spades');
        const queen = createCard('Q', 'clubs');
        expect(isValidSequence([king, queen])).toBe(false);
    });

    it('should reject non-descending sequence', () => {
        const king = createCard('K', 'spades');
        const jack = createCard('J', 'hearts');
        expect(isValidSequence([king, jack])).toBe(false);
    });
});

describe('Win Condition', () => {
    it('should detect win when all foundations have 13 cards', () => {
        const foundations: Pile[] = [];
        const suits: Card['suit'][] = ['hearts', 'diamonds', 'clubs', 'spades'];
        const ranks: Card['rank'][] = [
            'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K',
        ];

        for (const suit of suits) {
            const cards = ranks.map((rank) => createCard(rank, suit));
            foundations.push(createPile('foundation', cards));
        }

        expect(checkWin(foundations)).toBe(true);
    });

    it('should not detect win with incomplete foundations', () => {
        const foundations: Pile[] = [
            createPile('foundation', [createCard('A', 'hearts')]),
            createPile('foundation'),
            createPile('foundation'),
            createPile('foundation'),
        ];

        expect(checkWin(foundations)).toBe(false);
    });

    it('should not detect win with empty foundations', () => {
        const foundations: Pile[] = [
            createPile('foundation'),
            createPile('foundation'),
            createPile('foundation'),
            createPile('foundation'),
        ];

        expect(checkWin(foundations)).toBe(false);
    });
});
