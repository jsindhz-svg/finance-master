import { type Page } from '@playwright/test';

export class SignInPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    const url = process.env.BASE_URL || 'http://localhost:3000/';
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        await this.page.goto(url, { waitUntil: 'domcontentloaded' });
        await this.page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => undefined);
        await this.page
          .locator('#email, input[name="email"], button:has-text("Sign in"), button:has-text("Continue anonymously")')
          .first()
          .waitFor({ state: 'visible', timeout: 15000 });
        return;
      } catch (error) {
        if (attempt === 2) throw error;
        await this.page.reload({ waitUntil: 'domcontentloaded' }).catch(() => undefined);
      }
    }
  }

  async fillEmail(value: string) {
    const emailInput = await this.page.$('#email');
    if (emailInput) {
      await emailInput.fill(value);
    }
  }

  async fillPassword(value: string) {
    const passwordInput = await this.page.$('div.space-y-2 > input[type="password"]');
    if (passwordInput) {
      await passwordInput.fill(value);
    }
  }

  async clickSignIn() {
    const submitBtn = await this.page.$('button[type="submit"]');
    if (submitBtn) {
      await submitBtn.click();
    }
  }

  async switchToSignUp() {
    await this.page.click('//button[contains(text(), "Sign up")]');
  }

  async switchToSignIn() {
    await this.page.click('//button[contains(text(), "Sign in instead")]');
  }

  async clickAnonymousSignIn() {
    const anonBtn = await this.page.$('button:has-text("Continue anonymously")');
    if (anonBtn) {
      await anonBtn.click();
    }
  }

  async getFormFieldCount(): Promise<number> {
    const inputs = await this.page.$$('form input');
    return inputs.length;
  }

  async getErrorMessage(): Promise<string | null> {
    const errorEl = await this.page.$('[role="alert"], div.text-red-500');
    if (errorEl) {
      return errorEl.textContent();
    }
    return null;
  }
}
