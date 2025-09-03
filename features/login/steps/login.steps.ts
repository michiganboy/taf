import { Given, When, Then } from '../../../bdd.config';
import { expect } from '../../../fixtures';
import { TestDataManager } from '../../support/TestDataManager';

Given('I am on the login page', async function(this: TestDataManager, { loginPage }) {
  await loginPage.goto();
});

When('I enter valid username and password', async function(this: TestDataManager, { loginPage }) {
  // Get credentials from environment variables
  const username = process.env.USERNAME;
  const password = process.env.PASSWORD;
  
  await loginPage.enterUsername(username);
  await loginPage.enterPassword(password);
});

When('I enter invalid username and password', async function(this: TestDataManager, { loginPage }) {
  const invalidUsername = process.env.INVALID_USERNAME || 'invalid@example.com';
  const invalidPassword = process.env.INVALID_PASSWORD || 'WrongPass123!';
  
  await loginPage.enterUsername(invalidUsername);
  await loginPage.enterPassword(invalidPassword);
});

When('I click the login button', async function(this: TestDataManager, { loginPage }) {
  await loginPage.clickSubmit();
});

When('I generate a new test user', async function(this: TestDataManager) {
  // Generate fake user data and store it for later steps
  const user = await this.generateUser(true);
  console.log(`Generated test user: ${user.firstName} ${user.lastName} (${user.email})`);
});

When('I enter the generated credentials', async function(this: TestDataManager, { loginPage }) {
  // Use the generated data from the previous step
  const email = await this.get('email');
  const password = this.generateString('password', 12);
  
  // Store the password for later validation using the new storeData method
  await this.storeData('generatedPassword', password);
  
  await loginPage.enterUsername(email);
  await loginPage.enterPassword(password);
});

When('I log in as a {string} user', async function(this: TestDataManager, { loginPage }, userType: string) {
  // Store the user type for later use
  await this.storeData('userType', userType);
  
  // Generate appropriate credentials based on user type
  let username: string;
  let password: string;
  
  switch (userType) {
    case 'admin':
      username = `admin.${this.generateString('user')}@example.com`;
      password = process.env.ADMIN_PASSWORD || 'AdminPass123!';
      break;
    case 'user':
      username = `user.${this.generateString('user')}@example.com`;
      password = process.env.USER_PASSWORD || 'UserPass123!';
      break;
    case 'guest':
      username = `guest.${this.generateString('user')}@example.com`;
      password = process.env.GUEST_PASSWORD || 'GuestPass123!';
      break;
    default:
      username = await this.get('username');
      password = await this.get('password');
  }
  
  await this.storeData('currentUsername', username);
  await this.storeData('currentPassword', password);
  
  await loginPage.enterUsername(username);
  await loginPage.enterPassword(password);
  await loginPage.clickSubmit();
});

Then('I should be successfully logged in', async function(this: TestDataManager, { loginPage }) {
  // Verify successful login
  const successMessage = await this.get('expectedWelcomeMessage');
  const isVisible = await loginPage.isSuccessMessageVisible();
  expect(isVisible).toBe(true);
  
  const actualMessage = await loginPage.getSuccessMessage();
  expect(actualMessage).toBe(successMessage);
});

Then('I should be redirected to the dashboard', async function(this: TestDataManager, { loginPage }) {
  const expectedRedirect = await this.get('expectedRedirect');
  const isUrlMatching = await loginPage.isUrlMatching(expectedRedirect);
  expect(isUrlMatching).toBe(true);
});

Then('I should see an error message', async function(this: TestDataManager, { loginPage }) {
  const errorMessage = await this.get('loginErrorMessage');
  const isVisible = await loginPage.isErrorVisible();
  expect(isVisible).toBe(true);
  
  const actualMessage = await loginPage.getErrorMessage();
  expect(actualMessage).toBe(errorMessage);
});

Then('I should remain on the login page', async function(this: TestDataManager, { loginPage }) {
  const expectedTitle = await this.get('expectedTitle');
  const actualTitle = await loginPage.getPageTitle();
  expect(actualTitle).toBe(expectedTitle);
});

Then('I should see a registration prompt', async function(this: TestDataManager, { loginPage }) {
  const isVisible = await loginPage.isRegistrationPromptVisible();
  expect(isVisible).toBe(true);
});

Then('the generated user data should be stored', async function(this: TestDataManager) {
  // Verify that the generated data is available
  const firstName = await this.get('firstName');
  const lastName = await this.get('lastName');
  const email = await this.get('email');
  
  expect(firstName).toBeTruthy();
  expect(lastName).toBeTruthy();
  expect(email).toBeTruthy();
  
  console.log(`Stored user data: ${firstName} ${lastName} (${email})`);
});

Then('I should see the appropriate {string}', async function(this: TestDataManager, { loginPage }, welcomeMessage: string) {
  // Verify the welcome message matches the user type
  const userType = await this.get('userType');
  const expectedMessage = await this.get('currentUsername') ? 
    `Welcome ${userType.charAt(0).toUpperCase() + userType.slice(1)}` : 
    welcomeMessage;
  
  const actualMessage = await loginPage.getWelcomeMessage();
  expect(actualMessage).toBe(expectedMessage);
});
