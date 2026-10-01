import { test, expect } from '@playwright/test';
import { SignInPage } from '../pages/SignInPage';
import { BudgetPage } from '../pages/BudgetPage';
import { TransactionsPage } from '../pages/TransactionsPage';
import { ReportsPage } from '../pages/ReportsPage';
import { PlanningPage } from '../pages/PlanningPage';

const TEST_EMAIL = `fullflow-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;
const TEST_PASSWORD = 'testpassword123';

test.describe('Full Application Flow', () => {
 test.setTimeout(60000);
  test('complete budget workflow from sign up to reports', async ({ page }) => {
    // Step 1: Sign up
    const signInPage = new SignInPage(page);
    await signInPage.goto();
    await signInPage.switchToSignUp();

    const emailInput = await page.$('#email');
    await emailInput?.fill(TEST_EMAIL);

    const passwordInput = await page.$('input[type="password"]');
    await passwordInput?.fill(TEST_PASSWORD);

    const submitBtn = await page.$('button[type="submit"]');
    await submitBtn?.click();

    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Step 2: Create budget categories using God POM
    const budgetPage = new BudgetPage(page);
    await budgetPage.createCategory('Rent');
    await budgetPage.createCategory('Groceries');
    await budgetPage.createCategory('Transportation');

    const categories = await budgetPage.getCategoryNames();
    expect(categories.length).toBeGreaterThanOrEqual(3);

    // Step 3: Assign budgets
    await budgetPage.assignBudget('Rent', '1500');
    await budgetPage.assignBudget('Groceries', '400');
    await budgetPage.assignBudget('Transportation', '200');
    await page.waitForTimeout(1000);

    // Step 4: Set a target
    await budgetPage.setTarget('Groceries', 'Monthly Spending', '400');

    // Step 5: Check if funded
    const funded = await budgetPage.isCategoryFunded('Groceries');
    expect(funded).toBe(true);

    // Step 6: Add income via transactions page
    const txnPage = new TransactionsPage(page);
    await txnPage.goto();

    await txnPage.addIncome('March Salary', '5000', '2026-03-01');

    // Verify income shows up using inline locators
    await page.waitForTimeout(1000);
    const incomeRow = page.locator('table tbody tr:has-text("March Salary")');
    const amountText = await incomeRow.locator('td:nth-child(4)').textContent();
    expect(amountText).toContain('5,000');

    // Step 7: Add expenses
    await page.waitForTimeout(1500);
    await txnPage.addTransaction('Groceries', 'Whole Foods', '85.50', '2026-03-05');
    await txnPage.addTransaction('Transportation', 'Gas', '45.00', '2026-03-06');
    await txnPage.addTransaction('Rent', 'March Rent', '1500', '2026-03-01');

    const txnCount = await txnPage.getTransactionCount();
    expect(txnCount).toBeGreaterThanOrEqual(4);

    // Step 8: Check reports
    const reportsPage = new ReportsPage(page);
    await reportsPage.goto();
    await page.waitForTimeout(2000);
    await page.waitForLoadState('networkidle');

    const monthDisplay = await reportsPage.getCurrentMonth();
    expect(monthDisplay).toBeTruthy();

    // Verify report stats using DOM snapshots
    const incomeValue = await reportsPage.getMonthlyOverviewValue('Income');
    expect(incomeValue).toBeTruthy();

    const targetResult = await reportsPage.verifyTargetSummary({
      totalTarget: '$400.00',
      funded: '1',
      underfunded: '0',
    });
    expect(targetResult.totalTarget).toBe(true);

    // Step 9: Use planner
    const planningPage = new PlanningPage(page);
    await planningPage.goto();
    await planningPage.waitForPlannerLoad();

    // Use XPath to access planner inputs
    const firstPlanInput = page.locator('//table//tbody//tr[1]//td[3]//input');
    await firstPlanInput.fill('500');
    await page.waitForTimeout(500);

    await planningPage.simulateIncome('6000');
    await page.waitForTimeout(500);

    const surplus = await planningPage.getSurplusOrShortfall();
    expect(surplus).toBeTruthy();

    // Step 10: Navigate back to budget and verify without re-authenticating the same session.
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
    const readyToAssign = await budgetPage.getReadyToAssign();
    expect(typeof readyToAssign).toBe('number');
  });

  test('anonymous user flow', async ({ page }) => {
    const signInPage = new SignInPage(page);
    await signInPage.goto();

    const anonBtn = await page.$('button:has-text("Continue anonymously")');
    await anonBtn?.click();

    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const heading = await page.$('h1');
    const headingText = await heading?.textContent();
    expect(headingText).toBeTruthy();

    // Create a category
    const budgetPage = new BudgetPage(page);
    await budgetPage.createCategory('Test Category');

    const names = await budgetPage.getCategoryNames();
    expect(names).toContain('Test Category');

    // Navigate to transactions
    await page.getByRole('link', { name: 'Transactions' }).click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    await expect(page.getByText('Transactions', { exact: true }).first()).toBeVisible();
  });

  test('multi-month budget management', async ({ page }) => {
    const budgetPage = new BudgetPage(page);
    await budgetPage.loginAndNavigateToBudget(TEST_EMAIL, TEST_PASSWORD);

    await budgetPage.createCategory('Monthly Bills');
    await budgetPage.assignBudget('Monthly Bills', '500');

    const month1 = await budgetPage.getMonthDisplay();
    await budgetPage.goToNextMonth();
    const month2 = await budgetPage.getMonthDisplay();

    expect(month1).not.toBe(month2);

    await budgetPage.assignBudget('Monthly Bills', '500');
    await page.waitForTimeout(500);

    // Verify via DOM snapshot
    const assignedText = await page.locator(
      'table tbody tr:has-text("Monthly Bills") td:nth-child(3)'
    ).textContent();
    expect(assignedText).toBeTruthy();
  });
});
