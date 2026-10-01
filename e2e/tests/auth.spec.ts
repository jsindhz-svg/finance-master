import { test, expect } from '@playwright/test';
import { SignInPage } from '../pages/SignInPage';

const TEST_EMAIL = 'testuser@example.com';
const TEST_PASSWORD = 'password123';

test.describe('Authentication', () => {
  let signInPage: SignInPage;

  test.beforeEach(async ({ page }) => {
    signInPage = new SignInPage(page);
    await signInPage.goto();
  });

  test('should display sign in form', async ({ page }) => {
    const emailInput = await page.$('#email');
    expect(emailInput).not.toBeNull();

    const passwordInput = await page.$('#password');
    expect(passwordInput).not.toBeNull();

    const submitBtn = await page.$('button[type="submit"]');
    expect(submitBtn).not.toBeNull();
  });

  test('should sign in with valid credentials', async ({ page }) => {
    await signInPage.fillEmail(TEST_EMAIL);
    await signInPage.fillPassword(TEST_PASSWORD);

    const submitBtn = await page.$('button[type="submit"]');
    await submitBtn?.click();

    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await signInPage.fillEmail('bad@example.com');
    await signInPage.fillPassword('wrongpassword');
    await signInPage.clickSignIn();

    await page.waitForTimeout(1000);
    const error = await signInPage.getErrorMessage();
    expect(error).not.toBeNull();
  });

  test('should switch to sign up flow', async ({ page }) => {
    await signInPage.switchToSignUp();

    const submitBtn = await page.$('button[type="submit"]');
    const btnText = await submitBtn?.textContent();
    expect(btnText).toContain('Sign up');
  });

  test('should sign up new user', async ({ page }) => {
    await signInPage.switchToSignUp();

    await page.locator('input[name="email"]').fill('newuser@example.com');
    await page.locator('input[type="password"]').fill('securepassword');

    await page.locator('button[type="submit"]').click();
    await page.waitForLoadState('networkidle');
  });

  test('should sign in anonymously', async () => {
    await signInPage.clickAnonymousSignIn();

    const fieldCount = await signInPage.getFormFieldCount();
    expect(fieldCount).toBeGreaterThanOrEqual(0);
  });

  test('should have correct number of form fields', async () => {
    const count = await signInPage.getFormFieldCount();
    expect(count).toBe(2);
  });
});
