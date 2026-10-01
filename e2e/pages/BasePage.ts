import { type Page } from '@playwright/test';

export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async navigateTo(path: string) {
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    const url = new URL(path.replace(/^\//, ''), `${baseUrl.replace(/\/$/, '')}/`).toString();
    await this.page.goto(url);
    await this.page.waitForLoadState('networkidle');
  }

  async clickNavLink(selector: string) {
    await this.page.click(selector);
    await this.page.waitForLoadState('networkidle');
  }

  getSidebarLink(name: string) {
    return this.page.locator(`nav a:has-text("${name}")`);
  }

  async clickSidebarLink(linkText: string) {
    await this.clickNavLink(`nav a:has-text("${linkText}")`);
  }

  getHeading() {
    return this.page.locator('h1');
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  async signOut() {
    await this.page.click('button:has-text("Sign out")');
    await this.page.waitForLoadState('networkidle');
  }
}
