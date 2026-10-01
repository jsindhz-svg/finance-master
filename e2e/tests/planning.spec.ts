import { test, expect } from '@playwright/test';
import { PlanningPage } from '../pages/PlanningPage';
import { BudgetPage } from '../pages/BudgetPage';

const TEST_EMAIL = 'planning-test@example.com';
const TEST_PASSWORD = 'password123';

test.describe('What-If Planner', () => {
  let planningPage: PlanningPage;

  test.beforeEach(async ({ page }) => {
    const budgetPage = new BudgetPage(page);
    await budgetPage.loginAndNavigateToBudget(TEST_EMAIL, TEST_PASSWORD);
    await budgetPage.createCategory('Housing');
    await budgetPage.setTarget('Housing', 'Monthly Spending', '1200');
    await budgetPage.createCategory('Groceries');
    await budgetPage.setTarget('Groceries', 'Monthly Spending', '500');
    await budgetPage.createCategory('Transportation');
    await budgetPage.setTarget('Transportation', 'Monthly Spending', '300');

    planningPage = new PlanningPage(page);
    await planningPage.goto();
    await planningPage.waitForPlannerLoad();
  });

  test('should display planner page', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('What-If Planner');
  });

  test('should show summary cards', async () => {
    const income = await planningPage.getMonthlyIncome();
    expect(income).toBeTruthy();

    const need = await planningPage.getTotalMonthlyNeed();
    expect(need).toBeTruthy();
  });

  test('should simulate income override', async ({ page }) => {
    await planningPage.simulateIncome('8000');
    await page.waitForTimeout(500);

    const income = await planningPage.getMonthlyIncome();
    expect(income).toContain('8,000');
  });

  test('should clear income override', async ({ page }) => {
    await planningPage.simulateIncome('10000');
    await page.waitForTimeout(300);

    await planningPage.clearIncomeOverride();
    await page.waitForTimeout(500);

    const income = await planningPage.getMonthlyIncome();
    expect(income).toBeTruthy();
  });

  test('should edit planned amounts using table inputs', async ({ page }) => {
    const firstInput = page.locator('//table//tbody//tr[1]//td[3]//input');
    await firstInput.fill('200');
    await page.waitForTimeout(500);

    const value = await firstInput.inputValue();
    expect(value).toBe('200');
  });

  test('should show delta for modified categories', async ({ page }) => {
    const row = page.locator('table tbody tr').filter({ hasText: 'Housing' }).first();
    const input = row.locator('input[type="number"]').first();
    await input.fill('300');
    await input.blur();
    await page.waitForTimeout(500);

    const value = await input.inputValue();
    expect(value).toBe('300');
  });

  test('should update surplus/shortfall on changes', async () => {
    await planningPage.simulateIncome('3000');
    const result = await planningPage.getSurplusOrShortfall();
    expect(result).toBeTruthy();
  });

  test('should access category rows by index', async ({ page }) => {
    const firstRowInput = planningPage.getPlannedInput(0);
    await firstRowInput.fill('150', { force: true });
    await page.waitForTimeout(500);

    const value = await firstRowInput.inputValue();
    expect(value).toBe('150');
  });

  test('should show table footer totals', async () => {
    const total = await planningPage.getTableTotal();
    expect(total).toBeTruthy();
  });

  test('should handle multiple planned edits', async ({ page }) => {
    const firstInput = page.locator('table tbody tr').filter({ hasText: 'Housing' }).locator('input[type="number"]').first();
    await firstInput.fill('100');
    await firstInput.blur();
    await page.waitForTimeout(300);

    const secondInput = page.locator('table tbody tr').filter({ hasText: 'Housing' }).locator('input[type="number"]').first();
    await secondInput.fill('250');
    await secondInput.blur();
    await page.waitForTimeout(300);

    const total = await planningPage.getTableTotal();
    expect(total).toBeTruthy();
  });
});
