import { test, expect } from '@playwright/test';

test.describe('Stock and Waste Pile Mechanics (F005)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/game');
  });

  test('clicking stock draws card(s) to waste pile', async ({ page }) => {
    const stockPile = page.locator('[data-testid="stock-pile"]');
    const wastePile = page.locator('[data-testid="waste-pile"]');
    
    // Initially waste should be empty
    const initialWasteCards = await wastePile.locator('[data-testid^="card"]').count();
    expect(initialWasteCards).toBe(0);
    
    // Click stock to draw
    await stockPile.click();
    
    // Wait for animation/state update
    await page.waitForTimeout(300);
    
    // Waste should now have card(s)
    const wasteCards = await wastePile.locator('[data-testid^="card"]').count();
    expect(wasteCards).toBeGreaterThan(0);
  });

  test('stock count decreases after draw', async ({ page }) => {
    const stockPile = page.locator('[data-testid="stock-pile"]');
    const stockCount = page.locator('[data-testid="stock-count"]');
    
    const initialCount = parseInt(await stockCount.textContent() || '0');
    expect(initialCount).toBe(24);
    
    await stockPile.click();
    await page.waitForTimeout(300);
    
    const newCount = parseInt(await stockCount.textContent() || '0');
    expect(newCount).toBeLessThan(initialCount);
  });

  test('empty stock can be reset from waste pile', async ({ page }) => {
    const stockPile = page.locator('[data-testid="stock-pile"]');
    const stockCount = page.locator('[data-testid="stock-count"]');
    
    // Draw all cards from stock - keep clicking until stock is exhausted
    // The count element disappears when stock is empty (shows reset icon instead)
    for (let i = 0; i < 30; i++) {
      const isVisible = await stockCount.isVisible().catch(() => false);
      if (!isVisible) break;
      
      const count = parseInt(await stockCount.textContent() || '0');
      if (count === 0) break;
      
      await stockPile.click();
      await page.waitForTimeout(50);
    }
    
    // Stock should be empty - the count element should not be visible (replaced by reset icon)
    await expect(stockCount).not.toBeVisible();
    
    // Click empty stock to reset
    await stockPile.click();
    await page.waitForTimeout(300);
    
    // Stock should have cards again (recycled from waste) - count should be visible
    await expect(stockCount).toBeVisible();
    const resetCount = parseInt(await stockCount.textContent() || '0');
    expect(resetCount).toBeGreaterThan(0);
  });
});
