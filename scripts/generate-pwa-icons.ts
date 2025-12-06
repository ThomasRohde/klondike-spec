/**
 * Generate PWA icons as PNG from SVG using sharp
 * Run with: npx tsx scripts/generate-pwa-icons.ts
 */

import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sizes = [192, 512];
const publicDir = path.join(__dirname, '..', 'public');

async function generateIcons() {
    console.log('Generating PWA PNG icons...');

    for (const size of sizes) {
        const svgPath = path.join(publicDir, `pwa-${size}x${size}.svg`);
        const pngPath = path.join(publicDir, `pwa-${size}x${size}.png`);

        await sharp(svgPath)
            .resize(size, size)
            .png()
            .toFile(pngPath);

        console.log(`  Created pwa-${size}x${size}.png`);
    }

    // Also create apple-touch-icon.png
    const appleSvgPath = path.join(publicDir, 'apple-touch-icon.svg');
    const applePngPath = path.join(publicDir, 'apple-touch-icon.png');

    await sharp(appleSvgPath)
        .resize(180, 180)
        .png()
        .toFile(applePngPath);

    console.log('  Created apple-touch-icon.png');

    console.log('\nDone! PNG icons generated successfully.');
}

generateIcons().catch(console.error);
