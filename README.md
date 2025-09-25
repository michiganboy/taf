# TAF - Test Automation Framework

A BDD-first test automation framework built on Playwright with feature-scoped test data and Azure DevOps integration.

## Overview

TAF provides a complete testing solution with:

- **Cucumber BDD** via `playwright-bdd` for readable test scenarios
- **Feature-scoped test data** with scenario-specific overrides
- **Dynamic data generation** with Faker and cross-scenario persistence
- **Custom HTML reporting** and optional **Azure DevOps** integration
- **Page Object Model** with environment-based execution
- **CLI scaffolding** for rapid test development

## Getting Started

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Install Playwright Browsers

```bash
npx playwright install
```

### Step 3: Create Environment Configuration

Create your first environment file:

```bash
# Create QA environment
npm run cli -- env init qa
```

This creates `env/.qa.env` with sample configuration. Edit it with your actual values:

```bash
# env/.qa.env
BASE_URL=https://qa.example.com
USERNAME=qa.user@example.com
PASSWORD=QAPass123!
```

### Step 4: Run Your First Test

```bash
# Run all tests (uses .qa.env by default)
npm test

# Run specific feature
npm test -- --grep="@feature:login"

# Run with headed browser (see what's happening)
npm test -- --headless=false
```

### Step 5: Set Up Azure DevOps (Optional)

If you want to report test results to Azure DevOps:

```bash
# Create Azure configuration
npm run cli -- azure init
```

Edit `env/.azure.env` with your Azure DevOps details:

```bash
AZURE_DEVOPS_ORG_URL=https://dev.azure.com/your-org
AZURE_DEVOPS_PROJECT=your-project
AZURE_DEVOPS_PAT=your-personal-access-token
AZURE_TEST_PLAN_ID=1
```

### Step 6: Build CLI (Optional but Recommended)

Build the CLI for better performance:

```bash
npm run build
```

Now you can use `npx taf` instead of `npm run cli --`:

```bash
# Check setup
npx taf doctor

# Create new features
npx taf feature new checkout
```

### Step 7: View Results

```bash
# Open the HTML report
npm run open-report
```

## Project Structure

```
taf/
├── env/                    # Environment files (credentials & URLs)
│   ├── .qa.env
│   ├── .staging.env
│   └── .azure.env          # Azure DevOps config
├── features/
│   └── login/
│       ├── data/
│       │   ├── default.json
│       │   └── scenarios/
│       │       ├── standard_login.json
│       │       ├── admin_login.json
│       │       └── premium_login.json
│       ├── login.feature
│       └── steps/
├── fixtures/               # Playwright fixtures, reporter, pages
├── utils/                  # Runner and data loader
└── test-results/           # Generated reports
```

## CLI Usage

### Built CLI (Recommended)

Build and use the production CLI:

```bash
# Build the CLI
npm run build

# Check environment setup
npx taf doctor

# Create new feature
npx taf feature new checkout

# Add new page object
npx taf page new ProfilePage

# Add scenario data
npx taf data add login premium_login

# Create environment files
npx taf env init staging
npx taf azure init
```

### Development CLI (ts-node)

For development or if you prefer not to build:

```bash
# Check environment setup
npm run cli -- doctor

# Create new feature
npm run cli -- feature new checkout

# Add new page object
npm run cli -- page new ProfilePage

# Add scenario data
npm run cli -- data add login premium_login

# Create environment files
npm run cli -- env init staging
npm run cli -- azure init
```

## Writing Tests

### Feature Files

Create readable test scenarios using Gherkin syntax:

```gherkin
@feature:login
Feature: User Login
  Background:
    Given I am on the login page

  @azureTestCaseId=1001 @US1000
  Scenario: Successful login @data:standard_login
    When I enter valid username and password
    And I click the login button
    Then I should be successfully logged in
    And I should be redirected to the dashboard
```

### Step Definitions

Implement step definitions using the TestDataManager:

```ts
import { Given, When, Then } from '../../../bdd.config';
import { TestDataManager } from '../../support/TestDataManager';

When('I enter valid username and password', async function(this: TestDataManager, { loginPage }) {
  const username = process.env.USERNAME;
  const password = process.env.PASSWORD;
  await loginPage.enterUsername(username!);
  await loginPage.enterPassword(password!);
});
```

## Test Data Management

### Environment Configuration

Environment files control where and how tests run:

```bash
# env/.qa.env
BASE_URL=https://qa.example.com
USERNAME=qa.user@example.com
PASSWORD=QAPass123!

# env/.staging.env
BASE_URL=https://staging.example.com
USERNAME=staging.user@example.com
PASSWORD=StagingPass123!
```

### Feature-Scoped Test Data

Test data is organized by feature with scenario-specific overrides:

```json
// features/login/data/default.json
{
  "expectedTitle": "Login - Example App",
  "expectedRedirect": "/dashboard",
  "expectedWelcomeMessage": "Welcome back!",
  "loginErrorMessage": "Invalid credentials"
}
```

```json
// features/login/data/scenarios/admin_login.json
{
  "expectedTitle": "Login - Administrator",
  "expectedRedirect": "/admin/dashboard",
  "expectedWelcomeMessage": "Welcome, Administrator",
  "expectedPermissions": ["user_management", "system_config"]
}
```

**Data Selection**: Tag scenarios with `@data:<key>` to use scenario-specific data that merges with default data.

## Reporting

### HTML Reports

View detailed test results:

```bash
npm run open-report
```

Opens `test-results/custom-report.html` with test results, timing, and error details.

### Azure DevOps Integration

#### Setup

1. Create `env/.azure.env`:
```bash
AZURE_DEVOPS_ORG_URL=https://dev.azure.com/<org>
AZURE_DEVOPS_PROJECT=<project>
AZURE_DEVOPS_PAT=<personal_access_token>
AZURE_TEST_PLAN_ID=1
```

2. Tag scenarios for reporting:
```gherkin
@azureTestCaseId=1001 @US1000
Scenario: Successful login
```

3. Run with Azure reporting:
```bash
npm test -- --reportToAzure=true --grep="@azureTestCaseId"
```

#### Prerequisites
- Personal Access Token with Test Management (Read & Write) scope
- Organization URL and project name

## Advanced Usage

### Running Tests

```bash
# Run all tests
npm test

# Run specific environment
npm test -- --env=staging

# Run specific feature
npm test -- --grep="@feature:login"

# Run specific test case
npm test -- --grep="@azureTestCaseId=1001"

# Run with headed browser
npm test -- --headless=false
```

### Dynamic Data Generation

Use Faker for dynamic test data:

```ts
// Generate and store user data
await this.generateUser(true);

// Store custom data
await this.storeData('customValue', 'test123');

// Retrieve data (searches dynamic → static → persistent)
const value = await this.get('customValue');
```

## Troubleshooting

### Common Issues

- **Missing env file**: Ensure `env/.{TEST_ENV}.env` exists
- **No Azure reports**: Confirm `REPORT_TO_AZURE=true` and `.azure.env` values
- **Data not found**: Check `@data:<key>` matches a JSON under `data/scenarios/`
- **Browser issues**: Run `npx playwright install` to install browsers

### Environment Check

```bash
npm run cli -- doctor
```

## License

ISC
