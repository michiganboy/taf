// fixtures/pages/HomePage.ts
import { Page } from '@playwright/test';

export class HomePage {
  private page: Page;
  private baseURL: string;

  constructor(page: Page, baseURL: string) {
    this.page = page;
    this.baseURL = baseURL;
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
    await this.page.click('#login-button');
  }

  // Add more methods as needed
}