import { type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class PlanningPage extends BasePage {
  readonly heading = this.page.locator('h1');
  readonly incomeInput = this.page.locator('input[type="number"][step="0.01"][min="0"]').first();

  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await this.navigateTo('/plan');
  }

  async waitForPlannerLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  async simulateIncome(amount: string) {
    const overrideInput = this.page.locator('div:has-text("Simulate income:")').locator('input[type="number"]').first();
    await overrideInput.fill(amount, { force: true });
    await overrideInput.blur();
    await this.page.waitForTimeout(300);
  }

  async clearIncomeOverride() {
    const clearButton = this.page.locator('button:has-text("clear")').last();
    await clearButton.click();
    await this.page.waitForTimeout(300);
  }

  getPlannedInput(index: number) {
    return this.page.locator('table tbody tr')
      .filter({ has: this.page.locator('input[type="number"]') })
      .nth(index)
      .locator('input[type="number"]');
  }

  getCategoryRow(name: string) {
    return this.page.locator('table tbody tr')
      .filter({ has: this.page.locator('input[type="number"]') })
      .filter({ hasText: name })
      .first();
  }

  async setPlannedAmount(categoryName: string, amount: string) {
    const row = this.getCategoryRow(categoryName);
    await row.locator('input[type="number"]').fill(amount, { force: true });
    await this.page.waitForTimeout(300);
  }

  async getSurplusOrShortfall(): Promise<string> {
    return this.getSummaryCardValue('Surplus');
  }

  async getMonthlyIncome(): Promise<string> {
    return this.getSummaryCardValue('Monthly Income');
  }

  async getTotalMonthlyNeed(): Promise<string> {
    return this.getSummaryCardValue('Total Monthly Need');
  }

  private async getSummaryCardValue(label: string): Promise<string> {
    const card = this.page.locator('div').filter({ hasText: label }).first();
    const cardText = await card.textContent();
    const match = cardText?.match(/\$-?\d[\d,]*\.\d{2}|\$-?\d[\d,]*|\-\$\d[\d,]*\.\d{2}/);
    return match ? match[0].trim() : '';
  }

  async getTableTotal(): Promise<string> {
    const footer = this.page.locator('tfoot td').nth(3);
    const value = await footer.textContent();
    return value?.trim() ?? '';
  }

  async getCategoryDelta(categoryName: string): Promise<string> {
    const row = this.getCategoryRow(categoryName);
    const delta = await row.locator('td').last().textContent();
    return delta?.trim() ?? '';
  }
}
