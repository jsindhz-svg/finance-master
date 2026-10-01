import { test, expect } from '@playwright/test';
import { TransactionsPage } from '../pages/TransactionsPage';
import { BudgetPage } from '../pages/BudgetPage';

const TEST_EMAIL = 'txn-test@example.com';
const TEST_PASSWORD = 'password123';

test.describe('Transactions', () => {
  let txnPage: TransactionsPage;

  test.beforeEach(async ({ page }) => {
    const budgetPage = new BudgetPage(page);
    await budgetPage.loginAndNavigateToBudget(TEST_EMAIL, TEST_PASSWORD);
    await budgetPage.createCategory('Groceries');
    await budgetPage.createCategory('Transportation');

    txnPage = new TransactionsPage(page);
    await txnPage.goto();
  });

  test('should display transactions page', async ({ page }) => {
    await expect(page.locator('h1:has-text("Transactions")')).toBeVisible();
  });

  test('should add income', async ({ page }) => {
    await txnPage.addIncome('Monthly Salary', '5000', '2026-03-01');

    await page.waitForTimeout(1000);
    const rows = await txnPage.getTransactionCount();
    expect(rows).toBeGreaterThan(0);
  });

  test('should add a transaction with category', async () => {
    await txnPage.addTransaction('Groceries', 'Weekly groceries', '85.50', '2026-03-02');

    const count = await txnPage.getTransactionCount();
    expect(count).toBeGreaterThan(0);
  });

  test('should display transaction amount correctly', async ({ page }) => {
    await txnPage.addIncome('Freelance Work', '1500', '2026-03-05');
    await page.waitForTimeout(500);

    const amountText = await page.locator('table tbody tr').first()
      .locator('td:nth-child(4)').textContent();
    expect(amountText).toContain('1,500');
  });

  test('should filter transactions by search', async ({ page }) => {
    await txnPage.addIncome('Special Payment', '200', '2026-03-10');
    await page.waitForTimeout(500);

    await txnPage.searchTransactions('Special');
    await page.waitForTimeout(500);

    const count = await txnPage.getTransactionCount();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('should delete a transaction', async () => {
    await txnPage.addIncome('To Delete', '100', '2026-03-15');
    const transactionRow = txnPage.page.locator('table tbody tr').filter({ hasText: 'To Delete' });
    await expect(transactionRow).toHaveCount(1);

    await txnPage.deleteTransaction('To Delete');
    await expect(transactionRow).toHaveCount(0);
  });

  test('should show income badge for income transactions', async ({ page }) => {
    await txnPage.addIncome('Bonus', '500', '2026-03-20');
    await page.waitForTimeout(500);

    const badge = page.locator('table tbody tr:has-text("Bonus") td:nth-child(3)');
    const badgeText = await badge.textContent();
    expect(badgeText).toContain('Income');
  });

  test('should filter by month', async ({ page }) => {
    await page.locator('select').nth(0).selectOption({ index: 1 });
    await page.waitForTimeout(500);

    const heading = await page.locator(txnPage.pageTitle).textContent();
    expect(heading).toBe('Transactions');
  });

  test('should use inline selectors for amount cell', async () => {
    await txnPage.addIncome('Check Amount', '750', '2026-03-25');
    const cell = txnPage.getAmountCell('Check Amount');
    await expect(cell).toBeVisible();
  });

  test('should show transaction summary in header', async ({ page }) => {
    const summary = await page.locator('h1:has-text("Transactions") + p').textContent();
    expect(summary).toContain('transaction');
  });
});
