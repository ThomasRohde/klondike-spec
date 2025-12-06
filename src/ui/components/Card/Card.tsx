import React, { useEffect, useRef, useState } from 'react';
import { Card as CardType, getCardImagePath, getCardBackPath } from '@/game/types';
import { useGameStore, useSettings, useSelectedCardIds } from '@/state/gameStore';
import './Card.css';

interface CardProps {
    card: CardType;
    pileId: string;
    stackOffset?: number;
    isDragging?: boolean;
    onDragStart?: (e: React.DragEvent) => void;
    onDragEnd?: (e: React.DragEvent) => void;
}

export function Card({
    card,
    pileId,
    stackOffset = 0,
    isDragging = false,
    onDragStart,
    onDragEnd,
}: CardProps) {
    const settings = useSettings();
    const selectedCardIds = useSelectedCardIds();
    const selectCard = useGameStore((state) => state.selectCard);
    const autoMoveToFoundation = useGameStore((state) => state.autoMoveToFoundation);

    // Track flip animation state
    const [isFlipping, setIsFlipping] = useState(false);
    const prevFaceUpRef = useRef(card.faceUp);

    useEffect(() => {
        // Detect when card flips from face-down to face-up
        if (card.faceUp && !prevFaceUpRef.current) {
            setIsFlipping(true);
            const timer = setTimeout(() => {
                setIsFlipping(false);
            }, 400); // Match animation duration
            prevFaceUpRef.current = card.faceUp;
            return () => { clearTimeout(timer); };
        }
        prevFaceUpRef.current = card.faceUp;
    }, [card.faceUp]);

    const isSelected = selectedCardIds.includes(card.id);

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (card.faceUp) {
            selectCard(card.id, pileId);
        }
    };

    const handleDoubleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (card.faceUp) {
            autoMoveToFoundation(card.id);
        }
    };

    const handleDragStart = (e: React.DragEvent) => {
        if (!card.faceUp) {
            e.preventDefault();
            return;
        }
        e.dataTransfer.setData('text/plain', JSON.stringify({ cardId: card.id, pileId }));
        e.dataTransfer.effectAllowed = 'move';
        onDragStart?.(e);
    };

    return (
        <div
            className={`card ${isSelected ? 'card--selected' : ''} ${isDragging ? 'card--dragging' : ''} ${!card.faceUp ? 'card--face-down' : ''} ${isFlipping ? 'card--flipping' : ''}`}
            style={{ '--stack-offset': stackOffset } as React.CSSProperties}
            draggable={card.faceUp}
            onClick={handleClick}
            onDoubleClick={handleDoubleClick}
            onDragStart={handleDragStart}
            onDragEnd={onDragEnd}
            data-testid={`card-${card.id}`}
            data-face-up={card.faceUp}
            data-selected={isSelected}
        >
            <div className="card__inner">
                <div className="card__front">
                    <img
                        src={getCardImagePath(card)}
                        alt={`${card.rank} of ${card.suit}`}
                        draggable={false}
                    />
                </div>
                <div className="card__back">
                    <img
                        src={getCardBackPath(settings.cardBack)}
                        alt="Card back"
                        draggable={false}
                    />
                </div>
            </div>
        </div>
    );
}
