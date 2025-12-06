/**
 * Card SVG Generator
 * Run with: npx tsx scripts/generate-cards.ts
 */

import * as fs from 'fs';
import * as path from 'path';

const SUITS = ['hearts', 'diamonds', 'clubs', 'spades'] as const;
const RANKS = ['a', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'j', 'q', 'k'] as const;

type Suit = typeof SUITS[number];
type Rank = typeof RANKS[number];

const SUIT_SYMBOLS: Record<Suit, string> = {
    hearts: '♥',
    diamonds: '♦',
    clubs: '♣',
    spades: '♠'
};

const SUIT_COLORS: Record<Suit, string> = {
    hearts: '#dc2626',
    diamonds: '#dc2626',
    clubs: '#1a1a1a',
    spades: '#1a1a1a'
};

const RANK_DISPLAY: Record<Rank, string> = {
    'a': 'A', '2': '2', '3': '3', '4': '4', '5': '5',
    '6': '6', '7': '7', '8': '8', '9': '9', '10': '10',
    'j': 'J', 'q': 'Q', 'k': 'K'
};

function generatePips(rank: Rank, symbol: string, color: string): string {
    const pip = (x: number, y: number, flip = false) =>
        `<text x="${x}" y="${y}" font-size="16" fill="${color}" text-anchor="middle" ${flip ? `transform="rotate(180,${String(x)},${String(y)})"` : ''}>${symbol}</text>`;

    const layouts: Record<Rank, [number, number, boolean?][]> = {
        'a': [[40, 60]],
        '2': [[40, 35], [40, 82, true]],
        '3': [[40, 35], [40, 58], [40, 82, true]],
        '4': [[28, 35], [52, 35], [28, 82, true], [52, 82, true]],
        '5': [[28, 35], [52, 35], [40, 58], [28, 82, true], [52, 82, true]],
        '6': [[28, 35], [52, 35], [28, 58], [52, 58], [28, 82, true], [52, 82, true]],
        '7': [[28, 35], [52, 35], [40, 46], [28, 58], [52, 58], [28, 82, true], [52, 82, true]],
        '8': [[28, 35], [52, 35], [40, 46], [28, 58], [52, 58], [40, 70, true], [28, 82, true], [52, 82, true]],
        '9': [[28, 32], [52, 32], [28, 48], [52, 48], [40, 56], [28, 68, true], [52, 68, true], [28, 84, true], [52, 84, true]],
        '10': [[28, 30], [52, 30], [40, 40], [28, 50], [52, 50], [28, 66, true], [52, 66, true], [40, 76, true], [28, 86, true], [52, 86, true]],
        'j': [], 'q': [], 'k': []
    };

    return layouts[rank].map(([x, y, flip]) => pip(x, y, flip)).join('\n  ');
}

function generateFaceCard(rank: Rank, suit: Suit): string {
    const color = SUIT_COLORS[suit];
    const symbol = SUIT_SYMBOLS[suit];
    const letter = RANK_DISPLAY[rank];

    const faceColors = {
        'j': { primary: '#3b82f6', secondary: '#1e40af' },
        'q': { primary: '#ec4899', secondary: '#be185d' },
        'k': { primary: '#f59e0b', secondary: '#d97706' }
    };

    const colors = faceColors[rank as 'j' | 'q' | 'k'];

    return `
  <rect x="20" y="28" width="40" height="56" rx="2" fill="${colors.primary}"/>
  <rect x="22" y="30" width="36" height="52" rx="1" fill="${colors.secondary}"/>
  <text x="40" y="62" font-family="Georgia, serif" font-size="24" fill="white" text-anchor="middle" font-weight="bold">${letter}</text>
  <text x="32" y="46" font-size="12" fill="${color}">${symbol}</text>
  <text x="48" y="78" font-size="12" fill="${color}" transform="rotate(180,48,72)">${symbol}</text>`;
}

function generateCardSVG(rank: Rank, suit: Suit): string {
    const color = SUIT_COLORS[suit];
    const symbol = SUIT_SYMBOLS[suit];
    const display = RANK_DISPLAY[rank];

    const isFaceCard = ['j', 'q', 'k'].includes(rank);
    const centerContent = isFaceCard
        ? generateFaceCard(rank, suit)
        : generatePips(rank, symbol, color);

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 112">
  <defs>
    <filter id="shadow" x="-2%" y="-2%" width="104%" height="104%">
      <feDropShadow dx="0" dy="1" stdDeviation="1" flood-opacity="0.1"/>
    </filter>
  </defs>
  <rect x="1" y="1" width="78" height="110" rx="6" ry="6" fill="#fffef7" stroke="#d4d4d4" stroke-width="1" filter="url(#shadow)"/>
  <text x="6" y="16" font-family="Georgia, serif" font-size="12" font-weight="bold" fill="${color}">${display}</text>
  <text x="6" y="28" font-size="10" fill="${color}">${symbol}</text>
  <g transform="rotate(180, 40, 56)">
    <text x="6" y="16" font-family="Georgia, serif" font-size="12" font-weight="bold" fill="${color}">${display}</text>
    <text x="6" y="28" font-size="10" fill="${color}">${symbol}</text>
  </g>
  ${centerContent}
</svg>`;
}

function generateBackClassic(): string {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 112">
  <defs>
    <pattern id="diamonds" width="10" height="10" patternUnits="userSpaceOnUse">
      <path d="M5 0 L10 5 L5 10 L0 5 Z" fill="#1e3a8a" stroke="#1e40af" stroke-width="0.5"/>
    </pattern>
  </defs>
  <rect x="1" y="1" width="78" height="110" rx="6" ry="6" fill="#1e40af"/>
  <rect x="4" y="4" width="72" height="104" rx="4" ry="4" fill="url(#diamonds)"/>
  <rect x="8" y="8" width="64" height="96" rx="3" ry="3" fill="none" stroke="#93c5fd" stroke-width="2"/>
  <rect x="12" y="12" width="56" height="88" rx="2" ry="2" fill="none" stroke="#1e3a8a" stroke-width="1"/>
</svg>`;
}

function generateBackModern(): string {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 112">
  <defs>
    <pattern id="hexagons" width="12" height="10" patternUnits="userSpaceOnUse">
      <path d="M6 0 L12 3 L12 7 L6 10 L0 7 L0 3 Z" fill="none" stroke="#22c55e" stroke-width="0.5"/>
    </pattern>
    <linearGradient id="greenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#166534"/>
      <stop offset="100%" style="stop-color:#14532d"/>
    </linearGradient>
  </defs>
  <rect x="1" y="1" width="78" height="110" rx="6" ry="6" fill="url(#greenGrad)"/>
  <rect x="4" y="4" width="72" height="104" rx="4" ry="4" fill="url(#hexagons)"/>
  <circle cx="40" cy="56" r="20" fill="none" stroke="#22c55e" stroke-width="2"/>
  <circle cx="40" cy="56" r="12" fill="none" stroke="#4ade80" stroke-width="1"/>
  <path d="M40 36 L40 76 M20 56 L60 56" stroke="#22c55e" stroke-width="1"/>
</svg>`;
}

// Main execution
const outDir = path.join(__dirname, '..', 'public', 'cards');

if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
}

// Generate all card faces
for (const suit of SUITS) {
    for (const rank of RANKS) {
        const filename = `${rank}_of_${suit}.svg`;
        const filepath = path.join(outDir, filename);
        fs.writeFileSync(filepath, generateCardSVG(rank, suit));
        console.log(`Generated: ${filename}`);
    }
}

// Generate card backs
fs.writeFileSync(path.join(outDir, 'back_classic.svg'), generateBackClassic());
console.log('Generated: back_classic.svg');

fs.writeFileSync(path.join(outDir, 'back_modern.svg'), generateBackModern());
console.log('Generated: back_modern.svg');

console.log('\nDone! Generated 54 card assets.');
