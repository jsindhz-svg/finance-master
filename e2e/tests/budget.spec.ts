import { test, expect } from '@playwright/test';
import { BudgetPage } from '../pages/BudgetPage';

const TEST_EMAIL = 'budget-test@example.com';
const TEST_PASSWORD = 'password123';

test.describe('Budget Management', () => {
  let budgetPage: BudgetPage;

  test.beforeEach(async ({ page }) => {
    budgetPage = new BudgetPage(page);
    await budgetPage.loginAndNavigateToBudget(TEST_EMAIL, TEST_PASSWORD);
  });

  test('should display budget page after login', async ({ page }) => {
    await page.waitForTimeout(2000);
    const heading = await page.locator('h1').textContent();
    expect(heading).toBeTruthy();
  });

  test('should show ready to assign amount', async () => {
    const amount = await budgetPage.getReadyToAssign();
    expect(typeof amount).toBe('number');
  });

  test('should create a new category', async ({ page }) => {
    await budgetPage.createCategory('Groceries');
    await page.waitForTimeout(1000);

    const categories = await budgetPage.getCategoryNames();
    expect(categories).toContain('Groceries');
  });

  test('should assign budget to a category', async ({ page }) => {
    await budgetPage.createCategory('Utilities');
    await budgetPage.assignBudget('Utilities', '150');

    await page.waitForTimeout(1000);
    const text = await page.locator('.tabular-nums').first().textContent();
    expect(text).toBeTruthy();
  });

  test('should set a monthly spending target', async () => {
    await budgetPage.createCategory('Entertainment');
    await budgetPage.setTarget('Entertainment', 'Monthly Spending', '100');
  });

  test('should navigate between months', async () => {
    const initialMonth = await budgetPage.getMonthDisplay();
    await budgetPage.goToNextMonth();
    const newMonth = await budgetPage.getMonthDisplay();
    expect(newMonth).not.toBe(initialMonth);
  });

  test('should check if category is funded', async () => {
    await budgetPage.createCategory('Savings');
    await budgetPage.assignBudget('Savings', '500');

    const funded = await budgetPage.isCategoryFunded('Savings');
    expect(funded).toBe(true);
  });

  test('should verify budget totals', async () => {
    await budgetPage.createCategory('Rent');
    await budgetPage.assignBudget('Rent', '1200');

    await budgetPage.verifyBudgetTotals({
      assigned: '$1,200.00',
      activity: '$0.00',
      available: '$1,200.00',
    });
  });

  test('should archive a category', async ({ page }) => {
    await budgetPage.createCategory('Old Category');
    await page.waitForTimeout(500);

    await budgetPage.archiveCategory('Old Category');
    await page.waitForTimeout(1000);

    const archivedText = await page.locator('body').textContent();
    expect(archivedText).toContain('Archived');
    expect(archivedText).toContain('Old Category');
  });

  test('should display correct table structure', async ({ page }) => {
    await page.waitForTimeout(1500);

    const headerText = await page.locator('table thead tr th').allTextContents();
    expect(headerText.length).toBeGreaterThanOrEqual(4);
  });
});
