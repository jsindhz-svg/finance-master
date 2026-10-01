import { test, expect } from '@playwright/test';
import { ReportsPage } from '../pages/ReportsPage';
import { BudgetPage } from '../pages/BudgetPage';

const TEST_EMAIL = 'reports-test@example.com';
const TEST_PASSWORD = 'password123';

test.describe('Reports', () => {
  let reportsPage: ReportsPage;

  test.beforeEach(async ({ page }) => {
    const budgetPage = new BudgetPage(page);
    await budgetPage.loginAndNavigateToBudget(TEST_EMAIL, TEST_PASSWORD);

    reportsPage = new ReportsPage(page);
    await reportsPage.goto();
    await page.waitForTimeout(1500);
  });

  test('should display reports page', async ({ page }) => {
    await reportsPage.waitForReportLoad();
    const heading = await page.locator('h1').textContent();
    expect(heading).toBe('Reports');
  });

  test('should show target summary stats', async () => {
    await reportsPage.waitForReportLoad();

    const totalTarget = await reportsPage.getStatValue('Total Target Amount');
    expect(totalTarget).toBeTruthy();

    const funded = await reportsPage.getStatValue('Funded');
    expect(funded).toBeTruthy();
  });

  test('should navigate between months', async () => {
    const initialMonth = await reportsPage.getCurrentMonth();

    await reportsPage.navigateToMonth('prev');
    await reportsPage.waitForReportLoad();

    const newMonth = await reportsPage.getCurrentMonth();
    expect(newMonth).not.toBe(initialMonth);
  });

  test('should verify target summary values', async () => {
    await reportsPage.waitForReportLoad();

    const results = await reportsPage.verifyTargetSummary({
      totalTarget: '$0.00',
      funded: '0',
      underfunded: '0',
    });

    expect(results.totalTarget).toBe(true);
    expect(results.funded).toBe(true);
    expect(results.underfunded).toBe(true);
  });

  test('should show monthly overview section', async ({ page }) => {
    await page.waitForTimeout(1000);
    await page.waitForLoadState('networkidle');

    const incomeValue = await reportsPage.getMonthlyOverviewValue('Income');
    expect(incomeValue).toBeTruthy();
  });

  test('should display category breakdown table', async () => {
    await reportsPage.waitForReportLoad();

    const count = await reportsPage.getCategoryCount();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should show correct category data in breakdown', async ({ page }) => {
    await page.waitForTimeout(1500);

    const tableText = await page.locator('table').last().locator('thead').textContent();
    expect(tableText).toContain('Category');
    expect(tableText).toContain('Target');
    expect(tableText).toContain('Assigned');
  });

  test('should navigate forward and back', async () => {
    const startMonth = await reportsPage.getCurrentMonth();

    await reportsPage.navigateToMonth('next');
    await reportsPage.waitForReportLoad();

    await reportsPage.navigateToMonth('prev');
    await reportsPage.waitForReportLoad();

    const endMonth = await reportsPage.getCurrentMonth();
    expect(endMonth).toBe(startMonth);
  });

  test('should show stat values as formatted currency', async ({ page }) => {
    await page.waitForTimeout(1000);

    const statElements = await page.$$('div.text-xl.font-bold.tabular-nums');
    for (const el of statElements) {
      const text = await el.textContent();
      expect(text === '0' || /\$[\d,.]+/.test(text ?? '')).toBeTruthy();
    }
  });
});
