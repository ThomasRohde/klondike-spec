import { describe, it, expect } from 'vitest';
import { createInitialGameState, countTotalCards } from '@/game/game';

describe('Initial Game State', () => {
    it('should create a valid initial state', () => {
        const state = createInitialGameState();

        // Check all piles exist
        expect(state.stock).toBeDefined();
        expect(state.waste).toBeDefined();
        expect(state.foundations.length).toBe(4);
        expect(state.tableau.length).toBe(7);
    });

    it('should have 52 cards total', () => {
        const state = createInitialGameState();
        expect(countTotalCards(state)).toBe(52);
    });

    it('should have correct tableau layout', () => {
        const state = createInitialGameState();

        state.tableau.forEach((pile, index) => {
            // Each tableau pile should have index+1 cards
            expect(pile.cards.length).toBe(index + 1);

            // Only top card should be face up
            pile.cards.forEach((card, cardIndex) => {
                if (cardIndex === pile.cards.length - 1) {
                    expect(card.faceUp).toBe(true);
                } else {
                    expect(card.faceUp).toBe(false);
                }
            });
        });
    });

    it('should have 24 cards in stock', () => {
        const state = createInitialGameState();
        // 52 total - (1+2+3+4+5+6+7) in tableau = 52 - 28 = 24
        expect(state.stock.cards.length).toBe(24);
    });

    it('should have empty waste pile', () => {
        const state = createInitialGameState();
        expect(state.waste.cards.length).toBe(0);
    });

    it('should have empty foundation piles', () => {
        const state = createInitialGameState();
        state.foundations.forEach((pile) => {
            expect(pile.cards.length).toBe(0);
        });
    });

    it('should have all stock cards face down', () => {
        const state = createInitialGameState();
        state.stock.cards.forEach((card) => {
            expect(card.faceUp).toBe(false);
        });
    });

    it('should start with 0 moves', () => {
        const state = createInitialGameState();
        expect(state.moveCount).toBe(0);
        expect(state.moves.length).toBe(0);
    });

    it('should start not won', () => {
        const state = createInitialGameState();
        expect(state.isWon).toBe(false);
    });

    it('should start with no selection', () => {
        const state = createInitialGameState();
        expect(state.selectedCardIds.length).toBe(0);
        expect(state.selectedPileId).toBe(null);
    });

    it('should have default settings', () => {
        const state = createInitialGameState();
        expect(state.settings.drawCount).toBe(1);
        expect(state.settings.soundEnabled).toBe(false);
        expect(state.settings.cardBack).toBe('classic');
    });
});
