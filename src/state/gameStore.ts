import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import {
    GameState,
    GameSettings,
    Card,
    Move,
    Pile,
} from '@/game/types';
import {
    createInitialGameState,
    findPileById,
    findCardPile,
} from '@/game/game';
import {
    canMoveToTableau,
    canMoveToFoundation,
    getMovableCards,
    checkWin,
    findValidFoundation,
} from '@/game/moves';

interface GameStore extends GameState {
    // Actions
    newGame: () => void;
    drawCards: () => void;
    resetStock: () => void;
    moveCards: (cardIds: string[], targetPileId: string) => boolean;
    autoMoveToFoundation: (cardId: string) => boolean;
    selectCard: (cardId: string, pileId: string) => void;
    clearSelection: () => void;
    undo: () => void;
    updateSettings: (settings: Partial<GameSettings>) => void;
    tick: () => void;
}

// Load settings from localStorage
function loadSettings(): GameSettings {
    try {
        const saved = localStorage.getItem('solitaire-settings');
        if (saved) {
            return JSON.parse(saved) as GameSettings;
        }
    } catch {
        // Ignore parse errors
    }
    return {
        drawCount: 1,
        soundEnabled: false,
        cardBack: 'classic',
    };
}

export const useGameStore = create<GameStore>()(
    persist(
        immer((set, get) => ({
            ...createInitialGameState(loadSettings()),

            newGame: () => {
                const settings = get().settings;
                set((state) => {
                    const newState = createInitialGameState(settings);
                    Object.assign(state, newState);
                });
            },

            drawCards: () => {
                set((state) => {
                    if (state.stock.cards.length === 0) return;

                    // Start timer on first move
                    if (state.startTime === null) {
                        state.startTime = Date.now();
                    }

                    const drawCount = state.settings.drawCount;
                    const cardsToDraw = Math.min(drawCount, state.stock.cards.length);
                    const drawnCards: Card[] = [];

                    for (let i = 0; i < cardsToDraw; i++) {
                        const card = state.stock.cards.pop();
                        if (card) {
                            card.faceUp = true;
                            drawnCards.unshift(card);
                        }
                    }

                    state.waste.cards.push(...drawnCards);

                    // Record move
                    const move: Move = {
                        type: 'draw',
                        from: 'stock',
                        to: 'waste',
                        cards: drawnCards,
                        timestamp: Date.now(),
                    };
                    state.moves.push(move);
                    state.moveCount++;
                    state.selectedCardIds = [];
                    state.selectedPileId = null;
                });
            },

            resetStock: () => {
                set((state) => {
                    if (state.stock.cards.length > 0 || state.waste.cards.length === 0) {
                        return;
                    }

                    // Start timer on first move
                    if (state.startTime === null) {
                        state.startTime = Date.now();
                    }

                    const wasteCards = [...state.waste.cards].reverse();
                    wasteCards.forEach((card) => {
                        card.faceUp = false;
                    });

                    state.stock.cards = wasteCards;
                    state.waste.cards = [];

                    // Record move
                    const move: Move = {
                        type: 'reset-stock',
                        from: 'waste',
                        to: 'stock',
                        cards: wasteCards,
                        timestamp: Date.now(),
                    };
                    state.moves.push(move);
                    state.moveCount++;
                    state.selectedCardIds = [];
                    state.selectedPileId = null;
                });
            },

            moveCards: (cardIds: string[], targetPileId: string): boolean => {
                const state = get();

                if (cardIds.length === 0) return false;

                const firstCardId = cardIds[0];
                if (!firstCardId) return false;

                const sourcePile = findCardPile(state, firstCardId);
                const targetPile = findPileById(state, targetPileId);

                if (!sourcePile || !targetPile) return false;
                if (sourcePile.id === targetPile.id) return false;

                // Get the actual cards to move
                let cardsToMove: Card[];
                if (sourcePile.type === 'tableau') {
                    cardsToMove = getMovableCards(sourcePile, firstCardId);
                } else {
                    const card = sourcePile.cards.find((c) => c.id === firstCardId);
                    cardsToMove = card ? [card] : [];
                }

                if (cardsToMove.length === 0) return false;

                // Validate the move
                let isValid = false;
                if (targetPile.type === 'tableau') {
                    isValid = canMoveToTableau(cardsToMove, targetPile);
                } else if (targetPile.type === 'foundation') {
                    const singleCard = cardsToMove[0];
                    isValid = cardsToMove.length === 1 && !!singleCard && canMoveToFoundation(singleCard, targetPile);
                }

                if (!isValid) return false;

                // Execute the move
                set((draft) => {
                    // Start timer on first move
                    if (draft.startTime === null) {
                        draft.startTime = Date.now();
                    }

                    const draftSourcePile =
                        draft.tableau.find((p) => p.id === sourcePile.id) ||
                        (draft.waste.id === sourcePile.id ? draft.waste : null) ||
                        draft.foundations.find((p) => p.id === sourcePile.id);

                    const draftTargetPile =
                        draft.tableau.find((p) => p.id === targetPile.id) ||
                        draft.foundations.find((p) => p.id === targetPile.id);

                    if (!draftSourcePile || !draftTargetPile) return;

                    // Find index of first card to move
                    const startIndex = draftSourcePile.cards.findIndex(
                        (c) => c.id === firstCardId
                    );
                    if (startIndex === -1) return;

                    // Remove cards from source
                    const movedCards = draftSourcePile.cards.splice(startIndex);

                    // Add cards to target
                    draftTargetPile.cards.push(...movedCards);

                    // Flip the new top card of source pile if needed
                    let flippedCard: Card | undefined;
                    if (draftSourcePile.type === 'tableau') {
                        const newTopCard = draftSourcePile.cards[draftSourcePile.cards.length - 1];
                        if (newTopCard && !newTopCard.faceUp) {
                            newTopCard.faceUp = true;
                            flippedCard = { ...newTopCard };
                        }
                    }

                    // Determine move type
                    let moveType: Move['type'];
                    if (sourcePile.type === 'tableau' && targetPile.type === 'tableau') {
                        moveType = 'tableau-to-tableau';
                    } else if (sourcePile.type === 'tableau' && targetPile.type === 'foundation') {
                        moveType = 'tableau-to-foundation';
                    } else if (sourcePile.type === 'waste' && targetPile.type === 'tableau') {
                        moveType = 'waste-to-tableau';
                    } else if (sourcePile.type === 'waste' && targetPile.type === 'foundation') {
                        moveType = 'waste-to-foundation';
                    } else {
                        moveType = 'foundation-to-tableau';
                    }

                    // Record move
                    const move: Move = {
                        type: moveType,
                        from: sourcePile.id,
                        to: targetPile.id,
                        cards: movedCards.map((c) => ({ ...c })),
                        flippedCard,
                        timestamp: Date.now(),
                    };
                    draft.moves.push(move);
                    draft.moveCount++;

                    // Check for win
                    draft.isWon = checkWin(draft.foundations);

                    // Clear selection
                    draft.selectedCardIds = [];
                    draft.selectedPileId = null;
                });

                return true;
            },

            autoMoveToFoundation: (cardId: string): boolean => {
                const state = get();
                const pile = findCardPile(state, cardId);
                if (!pile) return false;

                const card = pile.cards.find((c) => c.id === cardId);
                if (!card || !card.faceUp) return false;

                // Can only auto-move the top card
                if (pile.cards[pile.cards.length - 1]?.id !== cardId) return false;

                const targetFoundation = findValidFoundation(card, state.foundations);
                if (!targetFoundation) return false;

                return get().moveCards([cardId], targetFoundation.id);
            },

            selectCard: (cardId: string, pileId: string) => {
                const state = get();

                // If we already have a selection, try to move
                if (state.selectedCardIds.length > 0 && state.selectedPileId) {
                    // Clicking on a pile - try to move there
                    const targetPile = findPileById(state, pileId);
                    if (targetPile) {
                        const moved = get().moveCards(state.selectedCardIds, pileId);
                        if (moved) return;
                    }
                }

                // Select the new card(s)
                set((draft) => {
                    const pile = findPileById(draft, pileId);
                    if (!pile) return;

                    const card = pile.cards.find((c) => c.id === cardId);
                    if (!card || !card.faceUp) {
                        draft.selectedCardIds = [];
                        draft.selectedPileId = null;
                        return;
                    }

                    if (pile.type === 'tableau') {
                        const movableCards = getMovableCards(pile, cardId);
                        draft.selectedCardIds = movableCards.map((c) => c.id);
                    } else {
                        draft.selectedCardIds = [cardId];
                    }
                    draft.selectedPileId = pileId;
                });
            },

            clearSelection: () => {
                set((state) => {
                    state.selectedCardIds = [];
                    state.selectedPileId = null;
                });
            },

            undo: () => {
                set((state) => {
                    const lastMove = state.moves.pop();
                    if (!lastMove) return;

                    const findPile = (id: string): Pile | undefined => {
                        if (id === 'stock') return state.stock;
                        if (id === 'waste') return state.waste;
                        return (
                            state.foundations.find((p) => p.id === id) ||
                            state.tableau.find((p) => p.id === id)
                        );
                    };

                    const fromPile = findPile(lastMove.from);
                    const toPile = findPile(lastMove.to);

                    if (!fromPile || !toPile) return;

                    switch (lastMove.type) {
                        case 'draw': {
                            // Move cards back from waste to stock
                            const cardsToReturn = toPile.cards.splice(-lastMove.cards.length);
                            cardsToReturn.reverse().forEach((card) => {
                                card.faceUp = false;
                                fromPile.cards.push(card);
                            });
                            break;
                        }
                        case 'reset-stock': {
                            // Move cards back from stock to waste
                            const cardsToReturn = [...toPile.cards].reverse();
                            cardsToReturn.forEach((card) => {
                                card.faceUp = true;
                            });
                            toPile.cards = [];
                            fromPile.cards = cardsToReturn;
                            break;
                        }
                        default: {
                            // Regular card moves
                            const cardsToReturn = toPile.cards.splice(-lastMove.cards.length);

                            // Unflip the card that was auto-flipped
                            if (lastMove.flippedCard) {
                                const flippedCard = fromPile.cards.find(
                                    (c) => c.id === lastMove.flippedCard?.id
                                );
                                if (flippedCard) {
                                    flippedCard.faceUp = false;
                                }
                            }

                            fromPile.cards.push(...cardsToReturn);
                            break;
                        }
                    }

                    state.moveCount = Math.max(0, state.moveCount - 1);
                    state.isWon = false;
                    state.selectedCardIds = [];
                    state.selectedPileId = null;
                });
            },

            updateSettings: (newSettings: Partial<GameSettings>) => {
                set((state) => {
                    Object.assign(state.settings, newSettings);
                });
                // Persist settings separately
                const settings = get().settings;
                localStorage.setItem('solitaire-settings', JSON.stringify(settings));
            },

            tick: () => {
                set((state) => {
                    if (state.startTime && !state.isWon) {
                        state.elapsedTime = Math.floor((Date.now() - state.startTime) / 1000);
                    }
                });
            },
        })),
        {
            name: 'solitaire-game',
            partialize: (state) => ({
                stock: state.stock,
                waste: state.waste,
                foundations: state.foundations,
                tableau: state.tableau,
                moves: state.moves,
                moveCount: state.moveCount,
                startTime: state.startTime,
                elapsedTime: state.elapsedTime,
                isWon: state.isWon,
                settings: state.settings,
            }),
        }
    )
);

// Selector hooks
export const useStock = () => useGameStore((state) => state.stock);
export const useWaste = () => useGameStore((state) => state.waste);
export const useFoundations = () => useGameStore((state) => state.foundations);
export const useTableau = () => useGameStore((state) => state.tableau);
export const useMoveCount = () => useGameStore((state) => state.moveCount);
export const useElapsedTime = () => useGameStore((state) => state.elapsedTime);
export const useIsWon = () => useGameStore((state) => state.isWon);
export const useSettings = () => useGameStore((state) => state.settings);
export const useSelectedCardIds = () => useGameStore((state) => state.selectedCardIds);
