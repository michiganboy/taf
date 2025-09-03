// fixtures/pages/LoginPage.ts
import { Page, Locator } from '@playwright/test';

export class LoginPage {
  private page: Page;
  private baseURL: string;
  private loginForm: Locator;
  private usernameInput: Locator;
  private passwordInput: Locator;
  private submitButton: Locator;
  private successMessage: Locator;
  private errorMessage: Locator;
  private pageTitle: Locator;

  constructor(page: Page, baseURL: string) {
    this.page = page;
    this.baseURL = baseURL;
    this.loginForm = page.locator('#login-form');
    this.usernameInput = page.locator('#username');
    this.passwordInput = page.locator('#password');
    this.submitButton = page.locator('#submit-button');
    this.successMessage = page.locator('.success-message');
    this.errorMessage = page.locator('.error-message');
    this.pageTitle = page.locator('title');
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

  /**
   * Checks if the success message is visible
   * @returns Promise<boolean> - True if success message is visible
   */
  async isSuccessMessageVisible(): Promise<boolean> {
    return await this.successMessage.isVisible();
  }

  /**
   * Gets the text content of the success message
   * @returns Promise<string> - The success message text
   */
  async getSuccessMessage(): Promise<string> {
    return await this.successMessage.textContent() ?? '';
  }

  /**
   * Checks if the error message is visible
   * @returns Promise<boolean> - True if error message is visible
   */
  async isErrorVisible(): Promise<boolean> {
    return await this.errorMessage.isVisible();
  }

  /**
   * Gets the text content of the error message
   * @returns Promise<string> - The error message text
   */
  async getErrorMessage(): Promise<string> {
    return await this.errorMessage.textContent() ?? '';
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

  /**
   * Checks if the current URL matches the expected pattern
   * @param expectedPattern - The expected URL pattern
   * @returns Promise<boolean> - True if URL matches pattern
   */
  async isUrlMatching(expectedPattern: string): Promise<boolean> {
    const currentUrl = await this.getCurrentUrl();
    return new RegExp(expectedPattern).test(currentUrl);
  }

  /**
   * Checks if the registration prompt is visible
   * @returns Promise<boolean> - True if registration prompt is visible
   */
  async isRegistrationPromptVisible(): Promise<boolean> {
    return await this.page.locator('.registration-prompt').isVisible();
  }

  /**
   * Gets the welcome message text
   * @returns Promise<string> - The welcome message text
   */
  async getWelcomeMessage(): Promise<string> {
    return await this.page.locator('.welcome-message').textContent() ?? '';
  }
}