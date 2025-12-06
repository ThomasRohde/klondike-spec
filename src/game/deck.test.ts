import { describe, it, expect } from 'vitest';
import {
    createDeck,
    shuffleDeck,
    createShuffledDeck,
    isValidDeck,
} from '@/game/deck';

describe('Deck Creation', () => {
    it('should create a deck with 52 cards', () => {
        const deck = createDeck();
        expect(deck.length).toBe(52);
    });

    it('should create cards with all suits and ranks', () => {
        const deck = createDeck();
        const suits = new Set(deck.map((card) => card.suit));
        const ranks = new Set(deck.map((card) => card.rank));

        expect(suits.size).toBe(4);
        expect(ranks.size).toBe(13);
        expect(suits.has('hearts')).toBe(true);
        expect(suits.has('diamonds')).toBe(true);
        expect(suits.has('clubs')).toBe(true);
        expect(suits.has('spades')).toBe(true);
    });

    it('should create all cards face down', () => {
        const deck = createDeck();
        expect(deck.every((card) => !card.faceUp)).toBe(true);
    });

    it('should have unique card IDs', () => {
        const deck = createDeck();
        const ids = new Set(deck.map((card) => card.id));
        expect(ids.size).toBe(52);
    });
});

describe('Deck Shuffling', () => {
    it('should return a deck with 52 cards', () => {
        const deck = createDeck();
        const shuffled = shuffleDeck(deck);
        expect(shuffled.length).toBe(52);
    });

    it('should not have duplicate cards after shuffling', () => {
        const shuffled = createShuffledDeck();
        const ids = new Set(shuffled.map((card) => card.id));
        expect(ids.size).toBe(52);
    });

    it('should produce different orders on multiple shuffles', () => {
        const deck1 = createShuffledDeck();
        const deck2 = createShuffledDeck();
        const deck3 = createShuffledDeck();

        // Check that at least two of the three decks have different orders
        const order1 = deck1.map((c) => c.id).join(',');
        const order2 = deck2.map((c) => c.id).join(',');
        const order3 = deck3.map((c) => c.id).join(',');

        const allSame = order1 === order2 && order2 === order3;
        expect(allSame).toBe(false);
    });

    it('should not modify the original deck', () => {
        const original = createDeck();
        const originalIds = original.map((c) => c.id).join(',');
        shuffleDeck(original);
        const afterIds = original.map((c) => c.id).join(',');
        expect(originalIds).toBe(afterIds);
    });
});

describe('Deck Validation', () => {
    it('should validate a correct deck', () => {
        const deck = createDeck();
        expect(isValidDeck(deck)).toBe(true);
    });

    it('should validate a shuffled deck', () => {
        const deck = createShuffledDeck();
        expect(isValidDeck(deck)).toBe(true);
    });

    it('should reject a deck with missing cards', () => {
        const deck = createDeck().slice(0, 51);
        expect(isValidDeck(deck)).toBe(false);
    });

    it('should reject a deck with duplicate cards', () => {
        const deck = createDeck();
        const firstCard = deck[0];
        if (firstCard) {
            deck[51] = { ...firstCard }; // Duplicate first card
        }
        expect(isValidDeck(deck)).toBe(false);
    });
});
