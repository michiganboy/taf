// tests/example.spec.ts
import { test, expect } from '../fixtures';

test('has title @azureTestCaseId=1001 @US1000 @feature:homepage', async ({ homePage, page }) => {
  // Associate this test with Azure DevOps test case ID 1001
  test.info().annotations.push({ type: 'azureTestCaseId', description: '1001' });
  
  await test.step('Navigate to home page', async () => {
    // Use the homePage fixture to navigate to the home page
    await homePage.goto();
  });

  await test.step('Verify page title', async () => {
    // Check if the page title contains 'Example'
    await expect(page).toHaveTitle(/Example/);
  });
});

test('login functionality @azureTestCaseId=1002 @US1001 @feature:login', async ({ loginPage, username, password }) => {
  // Associate this test with Azure DevOps test case ID 1002
  test.info().annotations.push({ type: 'azureTestCaseId', description: '1002' });

  await test.step('Navigate to login page', async () => {
    // Use the loginPage fixture to navigate to the login page
    await loginPage.goto();
  });

  await test.step('Perform login', async () => {
    // Use the loginPage fixture to perform the login action
    await loginPage.login(username, password);
  });

  await test.step('Verify successful login', async () => {
    // Add assertions for successful login
    // For example:
    // await expect(page.locator('.user-profile')).toBeVisible();
  });
});

// You can add more test cases here with appropriate annotations
test('user registration @azureTestCaseId=1003 @US1002 @feature:registration', async ({ page }) => {
  // Associate this test with Azure DevOps test case ID 1003
  test.info().annotations.push({ type: 'azureTestCaseId', description: '1003' });

  // Test implementation goes here
  // ...
});