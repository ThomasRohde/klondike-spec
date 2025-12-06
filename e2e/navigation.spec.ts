import { test, expect } from '@playwright/test';

test.describe('Navigation (F023)', () => {
  test('home page loads at root route', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL('/');
    // Should have navigation or game start option
    await expect(page.locator('body')).toBeVisible();
  });

  test('game page loads at /game route', async ({ page }) => {
    await page.goto('/game');
    await expect(page).toHaveURL('/game');
  });

  test('help page loads at /help route', async ({ page }) => {
    await page.goto('/help');
    await expect(page).toHaveURL('/help');
  });

  test('browser back/forward navigation works', async ({ page }) => {
    await page.goto('/');
    await page.goto('/game');
    await page.goto('/help');
    
    await page.goBack();
    await expect(page).toHaveURL('/game');
    
    await page.goBack();
    await expect(page).toHaveURL('/');
    
    await page.goForward();
    await expect(page).toHaveURL('/game');
  });
});
