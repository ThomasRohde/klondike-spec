import React, { useState } from 'react';
import { Pile as PileType } from '@/game/types';
import { useGameStore, useSelectedCardIds } from '@/state/gameStore';
import { getMovableCards } from '@/game/moves';
import { Card } from '../Card';
import './Pile.css';

interface PileProps {
    pile: PileType;
    spread?: boolean;
    maxVisible?: number;
}

export function Pile({ pile, spread = false, maxVisible }: PileProps) {
    const [isDragOver, setIsDragOver] = useState(false);
    const moveCards = useGameStore((state) => state.moveCards);
    const clearSelection = useGameStore((state) => state.clearSelection);
    const selectedCardIds = useSelectedCardIds();

    const cards = maxVisible
        ? pile.cards.slice(-maxVisible)
        : pile.cards;

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setIsDragOver(true);
    };

    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);

        try {
            const data = JSON.parse(e.dataTransfer.getData('text/plain')) as {
                cardId: string;
                pileId: string;
            };

            // Get all cards that should be moved (for tableau stacks)
            const sourcePile = useGameStore.getState().tableau.find(
                (p) => p.id === data.pileId
            ) || useGameStore.getState().waste;

            let cardIds: string[];
            if (sourcePile.type === 'tableau') {
                cardIds = getMovableCards(sourcePile, data.cardId).map((c) => c.id);
            } else {
                cardIds = [data.cardId];
            }

            moveCards(cardIds, pile.id);
        } catch {
            // Invalid drop data
        }
    };

    const handleClick = () => {
        // If clicking on pile with selection, try to move there
        if (selectedCardIds.length > 0) {
            const moved = moveCards(selectedCardIds, pile.id);
            if (!moved) {
                clearSelection();
            }
        }
    };

    const isEmpty = cards.length === 0;

    // Calculate cumulative offsets for each card
    // Each card's position is the sum of all previous cards' offsets
    const cardOffsets = spread
        ? cards.reduce<number[]>((offsets, _, index) => {
            if (index === 0) {
                offsets.push(0);
            } else {
                // Add previous card's offset contribution to cumulative total
                const prevCard = cards[index - 1];
                const prevOffset = offsets[index - 1];
                if (prevCard && prevOffset !== undefined) {
                    offsets.push(prevOffset + (prevCard.faceUp ? 25 : 10));
                }
            }
            return offsets;
        }, [])
        : [];

    return (
        <div
            className={`pile pile--${pile.type} ${spread ? 'pile--spread' : ''} ${isDragOver ? 'pile--drag-over' : ''} ${isEmpty ? 'pile--empty' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleClick}
            data-testid={`${pile.type}-pile-${pile.id.split('-').pop()}`}
        >
            {isEmpty && <div className="pile__placeholder" />}
            {cards.map((card, index) => (
                <Card
                    key={card.id}
                    card={card}
                    pileId={pile.id}
                    stackOffset={spread ? cardOffsets[index] : 0}
                />
            ))}
        </div>
    );
}
