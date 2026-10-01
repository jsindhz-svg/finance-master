import { type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class ReportsPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await this.navigateTo('/reports');
  }

  async waitForReportLoad() {
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(1000);
  }

  async navigateToMonth(direction: 'next' | 'prev') {
    if (direction === 'next') {
      const buttons = this.page.locator('div.flex.items-center.justify-center.gap-3 button');
      await buttons.last().click();
    } else {
      const buttons = this.page.locator('div.flex.items-center.justify-center.gap-3 button');
      await buttons.first().click();
    }
    await this.page.waitForTimeout(500);
  }

  async getCurrentMonth(): Promise<string> {
    const monthDisplay = this.page.locator('text=/January|February|March|April|May|June|July|August|September|October|November|December/').first();
    await monthDisplay.waitFor({ state: 'visible', timeout: 10000 }).catch(() => undefined);
    return (await monthDisplay.textContent()) ?? '';
  }

  async getStatValue(label: string): Promise<string> {
    await this.page.waitForTimeout(1000);
    const cards = await this.page.locator('div.rounded-xl.bg-gray-50').all();
    for (const card of cards) {
      const text = await card.textContent();
      if (text && text.includes(label)) {
        const value = await card.locator('div.text-xl.font-bold').textContent();
        return value?.trim() ?? '';
      }
    }
    return '';
  }

  async verifyTargetSummary(expected: {
    totalTarget: string;
    funded: string;
    underfunded: string;
  }) {
    const totalTarget = await this.getStatValue('Total Target Amount');
    const funded = await this.getStatValue('Funded');
    const underfunded = await this.getStatValue('Underfunded');

    const results = {
      totalTarget: totalTarget === expected.totalTarget,
      funded: funded === expected.funded,
      underfunded: underfunded === expected.underfunded,
    };

    return results;
  }

  async getMonthlyOverviewValue(label: string): Promise<string> {
    await this.page.waitForTimeout(500);
    const cards = await this.page.locator('div.rounded-xl.bg-gray-50').all();
    for (const card of cards) {
      const text = await card.textContent();
      if (text && text.includes(label)) {
        const value = await card.locator('div.text-xl.font-bold').textContent();
        return value?.trim() ?? '';
      }
    }
    return '';
  }

  async getCategoryBreakdownRow(categoryName: string) {
    await this.page.waitForTimeout(500);
    const table = this.page.locator('table').last();
    const row = table.locator(`tr:has-text("${categoryName}")`);
    const cells = await row.locator('td').allTextContents();
    return {
      name: cells[0]?.trim() ?? '',
      target: cells[1]?.trim() ?? '',
      assigned: cells[2]?.trim() ?? '',
      activity: cells[3]?.trim() ?? '',
      available: cells[4]?.trim() ?? '',
      status: cells[5]?.trim() ?? '',
    };
  }

  async getCategoryCount(): Promise<number> {
    const table = this.page.locator('table').last();
    const rows = await table.locator('tbody tr').count();
    return rows;
  }
}
