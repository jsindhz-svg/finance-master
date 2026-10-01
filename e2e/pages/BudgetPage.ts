import { type Page } from '@playwright/test';
import { SignInPage } from './SignInPage';

export class BudgetPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async loginAndNavigateToBudget(email: string, password: string) {
    const signIn = new SignInPage(this.page);
    const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const uniqueEmail = email.includes('@')
      ? email.replace('@', `+${uniqueSuffix}@`)
      : `${email}-${uniqueSuffix}`;

    await signIn.goto();
    await signIn.fillEmail(uniqueEmail);
    await signIn.fillPassword(password);
    await signIn.clickSignIn();
    await this.page.waitForTimeout(1500);

    const stillOnLogin = await this.page.locator('#email').isVisible().catch(() => false);
    if (stillOnLogin) {
      await signIn.switchToSignUp();
      await signIn.fillEmail(uniqueEmail);
      await signIn.fillPassword(password);
      await this.page.locator('button[type="submit"]').click();
      await this.page.waitForLoadState('networkidle');
    }

    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(1000);
  }

  async createCategory(name: string) {
    await this.page.locator('input[placeholder="New category name..."]').fill(name);
    await this.page.locator('button:has-text("Add")').first().click();
    await this.page.waitForTimeout(500);
  }

  async assignBudget(categoryName: string, amount: string) {
    const row = this.page.locator(`tr:has-text("${categoryName}")`).last();
    await row.locator('td:nth-child(3) button').click();
    await row.locator('td:nth-child(3) input[type="number"]').fill(amount);
    await row.locator('td:nth-child(3) input[type="number"]').press('Enter');
    await this.page.waitForTimeout(500);
  }

  async setTarget(categoryName: string, type: string, amount: string) {
    const row = this.page.locator(`tr:has-text("${categoryName}")`).last();
    await row.click();
    await this.page.waitForTimeout(500);

    const targetButton = this.page.locator('button:has-text("Create Target"), button:has-text("Edit Target")').first();
    await targetButton.click({ timeout: 10000 });

    const detailPanel = this.page.locator('div.w-80').last();
    await detailPanel.locator('select').first().selectOption({ label: type });
    await detailPanel.locator('input[type="number"]').fill(amount);
    await detailPanel.locator('button:has-text("Save")').click();
    await this.page.waitForTimeout(500);
  }

  async goToNextMonth() {
    const navButtons = this.page.locator('div.flex.items-center.gap-1 button');
    await navButtons.nth(1).click();
    await this.page.waitForTimeout(300);
  }

  async goToPrevMonth() {
    const navButtons = this.page.locator('div.flex.items-center.gap-1 button');
    await navButtons.first().click();
    await this.page.waitForTimeout(300);
  }

  async getReadyToAssign(): Promise<number> {
    const pill = this.page.locator('div:has-text("Ready to Assign") .text-xl').first();
    const text = await pill.textContent().catch(() => '');
    if (!text) return 0;
    return parseFloat(text.replace(/[$,]/g, ''));
  }

  async isCategoryFunded(name: string): Promise<boolean> {
    const row = this.page.locator(`tr:has-text("${name}")`).last();
    const available = await row.locator('td:nth-child(5) span').textContent();
    if (!available) return false;
    const amount = parseFloat(available.replace(/[$,]/g, ''));
    return amount >= 0;
  }

  async verifyBudgetTotals(expected: { assigned: string; activity: string; available: string }) {
    const row = this.page.locator('tr').filter({ hasText: 'Rent' }).last();
    const assignedCell = this.normalizeMoneyText(await row.locator('td').nth(2).textContent());
    const activityCell = this.normalizeMoneyText(await row.locator('td').nth(3).textContent());
    const availableCell = this.normalizeMoneyText(await row.locator('td').nth(4).textContent());

    if (assignedCell !== expected.assigned) {
      throw new Error(`Assigned mismatch: expected ${expected.assigned}, got ${assignedCell}`);
    }
    if (activityCell !== expected.activity) {
      throw new Error(`Activity mismatch: expected ${expected.activity}, got ${activityCell}`);
    }
    if (availableCell !== expected.available) {
      throw new Error(`Available mismatch: expected ${expected.available}, got ${availableCell}`);
    }
  }

  private normalizeMoneyText(value: string | null): string {
    if (!value) return '';
    return value.replace(/-\$0\.00|\$0\.00/g, '$0.00').trim();
  }

  async archiveCategory(name: string) {
    const row = this.page.locator(`tr:has-text("${name}")`).last();
    await row.hover();
    await this.page.waitForTimeout(200);

    const archiveTrigger = row.locator('button').filter({ has: this.page.locator('svg.lucide-archive') }).first();
    await archiveTrigger.click();

    const archiveAction = this.page.locator('button:has-text("All months")').last();
    await archiveAction.click();
    await this.page.waitForTimeout(500);
  }

  async getMonthDisplay(): Promise<string> {
    const heading = await this.page.$('h1');
    if (!heading) return '';
    return (await heading.textContent()) ?? '';
  }

  async getCategoryNames(): Promise<string[]> {
    const cells = await this.page.$$('table tbody tr td:first-child span.font-medium');
    const names: string[] = [];
    for (const cell of cells) {
      const text = await cell.textContent();
      if (text) names.push(text.trim());
    }
    return names;
  }
}
