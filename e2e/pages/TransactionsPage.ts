import { type Page, type Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class TransactionsPage extends BasePage {
  readonly pageTitle = 'h1:has-text("Transactions")';
  readonly searchInput = 'input[placeholder="Search transactions..."]';

  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await this.navigateTo('/transactions');
  }

  async addIncome(description: string, amount: string, date: string) {
    // Target form explicitly by its unique input placeholder
    const incomeForm = this.page.locator('form').filter({
      has: this.page.locator('input[placeholder*="Salary"]')
    }).first();

    await incomeForm.locator('input[placeholder*="Salary"]').fill(description);
    await incomeForm.locator('input[type="number"]').fill(amount);
    await incomeForm.locator('input[type="date"]').fill(date);
    await incomeForm.locator('button[type="submit"]').click();
    await this.page.waitForTimeout(500);
  }

  async fillTransactionForm(description: string, amount: string, date: string) {
    // Target form explicitly by expense input placeholder
    const expenseForm = this.page.locator('form').filter({
      has: this.page.locator('input[placeholder*="What was this for?"]')
    }).first();

    const descInput = expenseForm.locator('input[placeholder*="What was this for?"]');
    const amountInput = expenseForm.locator('input[type="number"]');
    const dateInput = expenseForm.locator('input[type="date"]');

    await descInput.fill(description);
    await amountInput.fill(amount);
    await dateInput.fill(date);
  }

  async selectCategory(categoryName: string) {
    // 1. Wait for the category option to exist in ANY select tag on the page
    await this.page.waitForSelector(`select option:has-text("${categoryName}")`, {
      state: 'attached',
      timeout: 10000
    });

    // 2. Find the exact select dropdown that contains this category option
    const categorySelect = this.page.locator('select').filter({
      has: this.page.locator(`option:has-text("${categoryName}")`)
    }).first();

    await categorySelect.scrollIntoViewIfNeeded();

    // 3. Dispatch change events directly to guarantee React state updates
    await categorySelect.evaluate((select: HTMLSelectElement, optionText: string) => {
      const option = Array.from(select.options).find(
        (opt) => opt.text.trim() === optionText || opt.value === optionText
      );
      if (option) {
        select.value = option.value;
        select.dispatchEvent(new Event('change', { bubbles: true }));
        select.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }, categoryName);
  }

  async submitTransaction() {
    // Click submit inside the expense form
    const expenseForm = this.page.locator('form').filter({
      has: this.page.locator('input[placeholder*="What was this for?"]')
    }).first();

    await expenseForm.locator('button[type="submit"]').click();
    await this.page.waitForTimeout(500);
  }

  async addTransaction(category: string, description: string, amount: string, date: string) {
    await this.selectCategory(category);
    await this.fillTransactionForm(description, amount, date);
    await this.submitTransaction();
  }

  getTransactionRow(selector: string) {
    return this.page.locator(selector);
  }

  async getTransactionCount(): Promise<number> {
    const rows = this.page.locator('table tbody tr');
    return rows.count();
  }

  async deleteTransaction(description: string) {
    const row = this.page.locator(`table tbody tr:has-text("${description}")`);
    await row.hover();
    await row.locator('button').last().click();
    await row.waitFor({ state: 'detached' });
  }

  async filterByMonth(monthLabel: string) {
    const monthSelect = this.page.locator('select').filter({
      has: this.page.locator(`option:has-text("${monthLabel}")`)
    }).first();
    await monthSelect.selectOption({ label: monthLabel });
  }

  async filterByCategory(categoryName: string) {
    const catSelect = this.page.locator('select').filter({
      has: this.page.locator(`option:has-text("${categoryName}")`)
    }).first();
    await catSelect.selectOption({ label: categoryName });
  }

  async searchTransactions(query: string) {
    await this.page.fill(this.searchInput, query);
  }

  getAmountCell(description: string): Locator {
    return this.page.locator(`table tbody tr:has-text("${description}") td:nth-child(4)`);
  }
}