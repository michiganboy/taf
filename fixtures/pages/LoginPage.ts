// fixtures/pages/LoginPage.ts
import { Page, Locator } from '@playwright/test';

export class LoginPage {
  private page: Page;
  private baseURL: string;
  private loginForm: Locator;
  private usernameInput: Locator;
  private passwordInput: Locator;
  private submitButton: Locator;

  constructor(page: Page, baseURL: string) {
    this.page = page;
    this.baseURL = baseURL;
    this.loginForm = page.locator('#login-form');
    this.usernameInput = page.locator('#username');
    this.passwordInput = page.locator('#password');
    this.submitButton = page.locator('#submit-button');
  }

  /**
   * Navigates to the login page
   */
  async goto() {
    await this.page.goto(`${this.baseURL}/login`);
  }

  /**
   * Returns the login form locator
   * @returns Locator for the login form
   */
  getLoginForm(): Locator {
    return this.loginForm;
  }

  /**
   * Enters the username into the username input field
   * @param username - The username to enter
   */
  async enterUsername(username: string) {
    await this.usernameInput.fill(username);
  }

  /**
   * Enters the password into the password input field
   * @param password - The password to enter
   */
  async enterPassword(password: string) {
    await this.passwordInput.fill(password);
  }

  /**
   * Clicks the submit button to log in
   */
  async clickSubmit() {
    await this.submitButton.click();
  }

  /**
   * Performs the login action with the provided credentials
   * @param username - The username to use for login
   * @param password - The password to use for login
   */
  async login(username: string, password: string) {
    await this.enterUsername(username);
    await this.enterPassword(password);
    await this.clickSubmit();
  }
}