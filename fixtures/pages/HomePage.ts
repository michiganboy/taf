// fixtures/pages/HomePage.ts
import { Page, Locator } from '@playwright/test';

export class HomePage {
  private page: Page;
  private baseURL: string;
  private loginButton: Locator;

  constructor(page: Page, baseURL: string) {
    this.page = page;
    this.baseURL = baseURL;
    this.loginButton = page.locator('#login-button');
  }

  /**
   * Navigates to the home page
   */
  async goto() {
    await this.page.goto(this.baseURL);
  }

  /**
   * Clicks the login button
   */
  async clickLoginButton() {
    await this.loginButton.click();
  }

  /**
   * Checks if the login button is visible
   * @returns Promise<boolean> - True if login button is visible
   */
  async isLoginButtonVisible(): Promise<boolean> {
    return await this.loginButton.isVisible();
  }

  /**
   * Gets the current page title
   * @returns Promise<string> - The page title
   */
  async getPageTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * Gets the current page URL
   * @returns Promise<string> - The current URL
   */
  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  // Add more methods as needed
}