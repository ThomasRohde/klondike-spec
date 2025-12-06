import { test, expect } from '@playwright/test';

test.describe('Game Layout and Initial Deal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/game');
  });

  test('F004: initial deal has 7 tableau piles', async ({ page }) => {
    const tableauPiles = page.locator('[data-testid^="tableau-pile"]');
    await expect(tableauPiles).toHaveCount(7);
  });

  test('F004: tableau piles have correct card counts (1-7)', async ({ page }) => {
    for (let i = 0; i < 7; i++) {
      const pile = page.locator(`[data-testid="tableau-pile-${i}"]`);
      const cards = pile.locator('[data-testid^="card"]');
      // Each pile should have i+1 cards (pile 0 has 1, pile 1 has 2, etc.)
      await expect(cards).toHaveCount(i + 1);
    }
  });

  test('F004: only top card of each tableau pile is face up', async ({ page }) => {
    for (let i = 0; i < 7; i++) {
      const pile = page.locator(`[data-testid="tableau-pile-${i}"]`);
      const faceUpCards = pile.locator('[data-testid^="card"][data-face-up="true"]');
      const faceDownCards = pile.locator('[data-testid^="card"][data-face-up="false"]');
      
      // Should have exactly 1 face-up card (the top one)
      await expect(faceUpCards).toHaveCount(1);
      // Should have i face-down cards
      await expect(faceDownCards).toHaveCount(i);
    }
  });

  test('F004: stock pile has 24 cards after deal', async ({ page }) => {
    const stockPile = page.locator('[data-testid="stock-pile"]');
    await expect(stockPile).toBeVisible();
    // Stock should indicate 24 cards remaining
    const stockCount = page.locator('[data-testid="stock-count"]');
    await expect(stockCount).toHaveText('24');
  });

  test('F015: all 4 foundation piles are visible', async ({ page }) => {
    const foundationPiles = page.locator('[data-testid^="foundation-pile"]');
    await expect(foundationPiles).toHaveCount(4);
  });

  test('F015: waste pile area is visible', async ({ page }) => {
    const wastePile = page.locator('[data-testid="waste-pile"]');
    await expect(wastePile).toBeVisible();
  });

  test('F013: cards display with SVG images', async ({ page }) => {
    // Find a face-up card and verify it has an SVG or img
    const faceUpCard = page.locator('[data-testid^="card"][data-face-up="true"]').first();
    await expect(faceUpCard).toBeVisible();
    
    // Card should contain an image element
    const cardImage = faceUpCard.locator('img, svg');
    await expect(cardImage).toBeVisible();
  });
});
