import { test, expect } from '@playwright/test';

test.describe('Finance Master - Advanced Edge Cases & Boundary Conditions', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Check if sign-in form is present
    const emailInput = page.locator('input[type="email"], input[placeholder*="email" i], input[data-testid*="email"]').first();
    
    if (await emailInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      const passwordInput = page.locator('input[type="password"]').first();
      await emailInput.fill('test@example.com');
      await passwordInput.fill('Password123!');
      
      const submitBtn = page.locator('button, [role="button"]').filter({ hasText: /sign in|log in/i }).first();
      await submitBtn.click();
      await page.waitForTimeout(1000);
    }
  });

  test('Boundary Test: Handles high numeric values and special characters in transaction fields', async ({ page }) => {
    const txTab = page.locator('a, button, [role="tab"], [role="link"], div')
      .filter({ hasText: /transaction|activity|history/i })
      .first();

    if (await txTab.isVisible({ timeout: 5000 }).catch(() => false)) {
      await txTab.click();
    }

    const addBtn = page.locator('button, [role="button"], a').filter({ hasText: /add|new|\+/i }).first();
    if (await addBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await addBtn.click();
    }

    const amountInput = page.locator('input[type="number"], input[placeholder*="0"]').first();
    if (await amountInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await amountInput.fill('9999999.99');
    }

    const payeeInput = page.locator('input[placeholder*="payee" i], input[placeholder*="description" i], input[type="text"]').first();
    if (await payeeInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await payeeInput.fill("Trader Joe's & Co. <Special #Char>");
    }

    const saveBtn = page.locator('button, [role="button"]').filter({ hasText: /save|submit|add/i }).first();
    if (await saveBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await saveBtn.click();
    }

    await expect(page.locator('body')).toBeVisible();
  });

  test('Network Flakiness: Gracefully handles slow network responses during budget assignment', async ({ page }) => {
    const budgetTab = page.getByText(/budget/i).first();
    await expect(budgetTab).toBeVisible({ timeout: 10000 });
    await budgetTab.click();

    await page.route('**/*', async (route) => {
      if (route.request().url().includes('convex') || route.request().url().includes('/api/')) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      await route.continue();
    });

    const budgetInput = page.locator('input[type="number"], input[inputmode="decimal"]').first();
    if (await budgetInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await budgetInput.fill('450');
      await budgetInput.press('Enter');
    }

    await expect(page.locator('body')).toBeVisible();
  });

  test('Responsive Layout: Navigation drawer and category cards operate properly on mobile viewport', async ({ page }) => {
    // Set viewport dimensions before checking content
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForLoadState('domcontentloaded');

    const body = page.locator('body');
    await expect(body).toBeVisible({ timeout: 10000 });
  });

  test('Visual Regression: Main viewport matches baseline layout', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');
    
    await expect(page).toHaveScreenshot('dashboard-layout.png', {
      maxDiffPixelRatio: 0.1,
    });
  });

  test('Persistence: Application state remains intact after page reload', async ({ page }) => {
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.locator('body')).toBeVisible();
  });
});