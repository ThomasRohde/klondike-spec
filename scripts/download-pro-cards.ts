/**
 * Download Professional SVG Card Assets
 *
 * Downloads card SVGs from the Vector-Playing-Cards repository
 * (https://github.com/notpeter/Vector-Playing-Cards)
 * License: Public Domain / WTFPL
 *
 * Run with: npx tsx scripts/download-pro-cards.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL =
    'https://raw.githubusercontent.com/notpeter/Vector-Playing-Cards/master/cards-svg';

// Mapping from our naming convention to the Vector-Playing-Cards convention
// Our format: a_of_hearts.svg, 10_of_clubs.svg, etc.
// VPC format: AH.svg, 10C.svg, etc.
const RANK_MAP: Record<string, string> = {
    a: 'A',
    '2': '2',
    '3': '3',
    '4': '4',
    '5': '5',
    '6': '6',
    '7': '7',
    '8': '8',
    '9': '9',
    '10': '10',
    j: 'J',
    q: 'Q',
    k: 'K',
};

const SUIT_MAP: Record<string, string> = {
    hearts: 'H',
    diamonds: 'D',
    clubs: 'C',
    spades: 'S',
};

const SUITS = ['hearts', 'diamonds', 'clubs', 'spades'] as const;
const RANKS = ['a', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'j', 'q', 'k'] as const;

function download(url: string, dest: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https
            .get(url, (response) => {
                if (response.statusCode === 302 || response.statusCode === 301) {
                    // Follow redirect
                    const redirectUrl = response.headers.location;
                    if (redirectUrl) {
                        file.close();
                        fs.unlinkSync(dest);
                        download(redirectUrl, dest).then(resolve).catch(reject);
                        return;
                    }
                }

                if (response.statusCode !== 200) {
                    file.close();
                    fs.unlinkSync(dest);
                    reject(new Error(`Failed to download ${url}: ${String(response.statusCode)}`));
                    return;
                }

                response.pipe(file);
                file.on('finish', () => {
                    file.close();
                    resolve();
                });
            })
            .on('error', (err) => {
                file.close();
                fs.unlink(dest, () => {
                    /* ignore */
                });
                reject(err);
            });
    });
}

async function downloadCards(): Promise<void> {
    const outDir = path.join(__dirname, '..', 'public', 'cards');
    const backupDir = path.join(__dirname, '..', 'public', 'cards-generated-backup');

    // Create output directory if it doesn't exist
    if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
    }

    // Backup existing generated cards
    if (fs.existsSync(outDir) && !fs.existsSync(backupDir)) {
        console.log('Backing up existing generated cards...');
        fs.mkdirSync(backupDir, { recursive: true });
        const existingFiles = fs.readdirSync(outDir);
        for (const file of existingFiles) {
            if (file.endsWith('.svg')) {
                fs.copyFileSync(path.join(outDir, file), path.join(backupDir, file));
            }
        }
        console.log(`Backed up ${String(existingFiles.length)} files to ${backupDir}`);
    }

    console.log('\nDownloading professional card assets from Vector-Playing-Cards...');
    console.log('Source: https://github.com/notpeter/Vector-Playing-Cards');
    console.log('License: Public Domain / WTFPL\n');

    let downloaded = 0;
    let failed = 0;

    // Download all card faces
    for (const suit of SUITS) {
        for (const rank of RANKS) {
            const vpcRank = RANK_MAP[rank];
            const vpcSuit = SUIT_MAP[suit];
            const vpcFilename = `${vpcRank}${vpcSuit}.svg`;
            const ourFilename = `${rank}_of_${suit}.svg`;

            const url = `${BASE_URL}/${vpcFilename}`;
            const destPath = path.join(outDir, ourFilename);

            try {
                await download(url, destPath);
                downloaded++;
                console.log(`✓ Downloaded: ${vpcFilename} → ${ourFilename}`);
            } catch (error) {
                failed++;
                console.error(`✗ Failed: ${vpcFilename} - ${error instanceof Error ? error.message : String(error)}`);
            }
        }
    }

    console.log('\n' + '='.repeat(50));
    console.log('Downloaded: ' + String(downloaded) + ' cards');
    if (failed > 0) {
        console.log('Failed: ' + String(failed) + ' cards');
    }
    console.log('='.repeat(50));

    // Note: Card backs are NOT available from Vector-Playing-Cards
    // We'll keep our generated card backs
    console.log('\nNote: Card back designs retained from generated assets.');
    console.log('The Vector-Playing-Cards repo does not include card backs.');

    if (failed === 0) {
        console.log('\n✓ All professional card assets downloaded successfully!');
        console.log('  Original generated cards backed up to: public/cards-generated-backup/');
    }
}

downloadCards().catch(console.error);
