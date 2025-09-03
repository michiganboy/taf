# TAF - Test Automation Framework

A BDD-first test automation framework built on Playwright with Cucumber, feature-scoped test data management, and Azure DevOps integration.

## Features

- **Cucumber BDD**: Write tests in Gherkin syntax with feature-scoped organization
- **Test Data Management**: JSON-based data files with scenario-specific overrides
- **Dynamic Data Generation**: Faker integration for realistic test data
- **Cross-Scenario Data Persistence**: Data that flows between test scenarios
- **Azure DevOps Integration**: Automatic test result reporting with test case mapping
- **Custom Reporting**: HTML reports and custom reporter for test analytics
- **Environment Support**: Multiple environment configurations (QA, staging, prod)
- **Page Object Model**: Reusable page objects for maintainable tests
- **BDD-First**: Designed exclusively for behavior-driven development

## Project Structure

```
taf/
├── env/                           # Environment files (credentials & URLs)
│   ├── .qa.env                   # QA environment
│   ├── .staging.env              # Staging environment
│   └── .azure.env                # Azure DevOps config
├── features/                      # Cucumber feature files (WHAT tests verify)
│   ├── login/                     # Login feature module
│   │   ├── data/                  # Test data for login
│   │   │   ├── default.json       # Common test data (all scenarios)
│   │   │   └── scenarios/         # Scenario-specific test data
│   │   │       ├── standard_login.json    # Standard login scenario overrides
│   │   │       ├── admin_login.json       # Admin login scenario overrides
│   │   │       └── premium_login.json     # Premium login scenario overrides
│   │   ├── login.feature          # Gherkin feature file
│   │   └── steps/                 # Step definitions
│   └── checkout/                  # Checkout feature module
│       ├── data/                  # Test data for checkout
│       ├── checkout.feature
│       └── steps/
├── fixtures/                      # Playwright fixtures and page objects
├── utils/                         # Utility functions and test runner
└── test-results/                  # Generated test reports
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Running Tests

#### Run all BDD features
```bash
npm test
```

#### Run with specific environment
```bash
npm test -- --env=staging
```

#### Run specific feature or scenario
```bash
npm test -- --grep="@feature:login"
npm test -- --grep="@US1000"
npm test -- --grep="@azureTestCaseId=1001"
```

## Understanding the Data Systems

Your framework has **two distinct data systems** that serve different purposes:

### **1. Environment Variables (`.env` files)**
**Purpose**: Controls WHERE tests run and HOW they authenticate

**Contains**: URLs, credentials, API keys, database connections, and other sensitive data

**Scope**: Environment-specific configuration

### **2. Test Data System (`/features/{feature}/data` directories)**
**Purpose**: Stores static data used during test execution

**Contains**: Expected messages, form values, validation messages, expected results

**Scope**: Feature-specific and scenario-specific test data

## Environment Files (`.env`)

Environment files contain **sensitive data and environment-specific URLs**:

```bash
# .env.qa
BASE_URL=https://qa.example.com
USERNAME=qa.user@example.com
PASSWORD=QAPass123!

# .env.staging
BASE_URL=https://staging.example.com
USERNAME=staging.user@example.com
PASSWORD=StagingPass123!
```

### **What Goes in Environment Files**
- **URLs** (base URLs for different environments)
- **Credentials** (usernames, passwords, API keys)
- **Database connections** (connection strings, credentials)
- **Service endpoints** (API URLs, service locations)
- **Other sensitive data** (tokens, keys, secrets)

## Test Data System (`/features/{feature}/data`)

### **What Goes in Test Data Files**
Test data files contain **static data used during test execution**:

```json
// features/login/data/default.json (Common for ALL scenarios)
{
  "expectedTitle": "Login - Example App",
  "expectedRedirect": "/dashboard",
  "expectedWelcomeMessage": "Welcome back!",
  "loginErrorMessage": "Invalid credentials",
  "loginSuccessMessage": "Welcome back!",
  "formValidationMessages": {
    "usernameRequired": "Username is required",
    "passwordRequired": "Password is required"
  }
}
```

```json
// features/login/data/scenarios/standard_login.json (Standard login scenario)
{
  "expectedTitle": "Login - Standard User",        // ← OVERRIDES default.json
  "expectedRedirect": "/dashboard",                 // ← SAME as default.json
  "expectedWelcomeMessage": "Welcome back!",        // ← SAME as default.json
  "scenarioType": "standard_login"
}

// features/login/data/scenarios/admin_login.json (Admin login scenario)
{
  "expectedTitle": "Login - Administrator",        // ← OVERRIDES default.json
  "expectedRedirect": "/admin/dashboard",           // ← OVERRIDES default.json
  "expectedWelcomeMessage": "Welcome, Administrator", // ← OVERRIDES default.json
  "expectedPermissions": ["user_management", "system_config"],
  "scenarioType": "admin_login"
}
```

### **Combined Test Data**
```json
// This is what the combined data object looks like when using @data:admin_login
{
  "expectedTitle": "Login - Administrator",
  "expectedRedirect": "/admin/dashboard",
  "expectedWelcomeMessage": "Welcome, Administrator",
  "loginErrorMessage": "Invalid credentials",
  "loginSuccessMessage": "Welcome back!",
  "formValidationMessages": {
    "usernameRequired": "Username is required",
    "passwordRequired": "Password is required"
  },
  "expectedPermissions": ["user_management", "system_config"],
  "scenarioType": "admin_login"
}
```

### **What Goes in Test Data Files**
- **Expected results** (success messages, redirect URLs, page titles)
- **Form validation messages** (error messages, required field messages)
- **User-type-specific expectations** (different behaviors for admin vs standard users)
- **Expected results** (what to verify in each scenario)

## Framework Configuration

### **Playwright Config (`playwright.config.ts`)**
Framework behavior and test execution settings (environment-agnostic):

```typescript
// playwright.config.ts
export default defineConfig({
  timeout: 30000,           // Page load timeout
  retryAttempts: 2,         // Retry failed tests
  headless: true,           // Run browser in headless mode
  workers: 4,               // Parallel test execution
  reporter: 'html'          // Test reporting
});
```

### **What Goes in Playwright Config**
- **Framework behavior** (timeouts, retries, parallel execution)
- **Browser settings** (headless, viewport, slowMo)
- **Test execution configuration** (workers, reporters, global timeouts)

## **📋 Configuration Summary**

| **Configuration Type** | **Purpose** | **File Location** | **What It Controls** |
|------------------------|-------------|-------------------|----------------------|
| **Data System 1** | Environment-specific data | `.env` files | URLs, credentials, environment settings |
| **Data System 2** | Test expectations | `/features/{feature}/data` | What tests verify, expected results |
| **Framework Config** | Framework behavior | `playwright.config.ts` | How tests run (timeouts, browsers, etc.) |

## TestDataManager: Understanding Data Sources

The `TestDataManager` class is the heart of your test data management. It provides **two powerful data sources** that work seamlessly together:

### **Data Source 1: Test Data Files (`/features/{feature}/data`)**
Test data loaded from JSON files with automatic feature detection and scenario-specific overrides.

### **Data Source 2: Dynamic Memory & Cross-Scenario Persistence**
Data created and stored during the current test scenario, plus data that survives across different test scenarios.

## How TestDataManager Works

### **Data Resolution Priority**
When you call `this.get('key')`, TestDataManager checks data sources in this order:

1. **Memory (Current Scenario)** - Fastest access
2. **Test Data Files** - Feature-specific test data with hierarchy:
   - `default.json` → Common expectations (lowest priority)
       - `scenarios/{key}.json` → Scenario-specific expectations (highest priority)
3. **Persistent Storage** - Cross-scenario data from previous scenarios

### **The Magic of `storeData()`**
The `storeData()` method is your **one-stop solution** for data storage:

```typescript
await this.storeData('key', value);
```

This single call:
- ✅ Stores data in **memory** for immediate use (current scenario)
- ✅ Persists data to **file** for cross-scenario access
- ✅ Makes data available via `this.get('key')` everywhere

### **Automatic Feature Detection**
The framework automatically detects which feature you're testing and loads the correct scenario data:

```typescript
// In your feature file: @feature:login
// With scenario tag: @data:standard_login
// Framework automatically looks in: scenarios/standard_login.json
```

**No manual configuration needed** - just follow the naming convention:
- Feature folder: `features/login/`
- Scenarios folder: `scenarios/` (direct scenario files)
- Scenario file: `standard_login.json`



## Example Test Data Files

### **Feature Test Data**
```json
// features/login/data/default.json
{
  "expectedTitle": "Login - Example App",
  "expectedRedirect": "/dashboard",
  "expectedWelcomeMessage": "Welcome back!",
  "loginErrorMessage": "Invalid credentials",
  "loginSuccessMessage": "Welcome back!",
  "formValidationMessages": {
    "usernameRequired": "Username is required",
    "passwordRequired": "Password is required"
  }
}
```

### **Scenario-Specific Test Data**
```json
// features/login/data/scenarios/standard_login.json
{
  "expectedTitle": "Login - Standard User",        // ← OVERRIDES default.json
  "expectedRedirect": "/dashboard",                 // ← SAME as default.json
  "expectedWelcomeMessage": "Welcome back!",        // ← SAME as default.json
  "scenarioType": "standard_login"
}

// features/login/data/scenarios/admin_login.json
{
  "expectedTitle": "Login - Administrator",        // ← OVERRIDES default.json
  "expectedRedirect": "/admin/dashboard",           // ← OVERRIDES default.json
  "expectedWelcomeMessage": "Welcome, Administrator", // ← OVERRIDES default.json
  "expectedPermissions": ["user_management", "system_config"]
}
```

### **Combined Test Data**
```json
// This is what the combined data object looks like when using @data:admin_login
{
  "expectedTitle": "Login - Administrator",
  "expectedRedirect": "/admin/dashboard",
  "expectedWelcomeMessage": "Welcome, Administrator",
  "loginErrorMessage": "Invalid credentials",
  "loginSuccessMessage": "Welcome back!",
  "formValidationMessages": {
    "usernameRequired": "Username is required",
    "passwordRequired": "Password is required"
  },
  "expectedPermissions": ["user_management", "system_config"],
  "scenarioType": "admin_login"
}
```

## Writing Features

### **Feature File Structure**
```gherkin
@feature:login
Feature: User Login
  As a user
  I want to log into the application
  So that I can access my account

  @azureTestCaseId=1001 @US1000
  Scenario: Successful login @data:standard_login
    Given I am on the login page
    When I enter valid username and password
    And I click the login button
    Then I should be successfully logged in
```

### **Step Definitions**
```typescript
import { Given, When, Then } from '../../../bdd.config';
import { TestDataManager } from '../../support/TestDataManager';

Given('I am on the login page', async function(this: TestDataManager, { loginPage }) {
  await loginPage.goto();
});

When('I enter valid username and password', async function(this: TestDataManager, { loginPage }) {
  // This data comes from environment variables (.env files)
  const username = process.env.USERNAME;              // From .env file
  const password = process.env.PASSWORD;              // From .env file
  
  await loginPage.enterUsername(username);
  await loginPage.enterPassword(password);
});
```

## TestDataManager Usage Examples

### **Example 1: Using Environment Variables**
```typescript
When('I navigate to the application', async function(this: TestDataManager, { loginPage }) {
  // This data comes from environment variables (.env files)
  const baseUrl = process.env.BASE_URL;                // From .env file
  const timeout = process.env.TIMEOUT || 30000;        // From .env file with default
  
  await loginPage.goto(baseUrl);
  await loginPage.waitForLoad(timeout);
});
```

### **Example 2: Using Test Data**
```typescript
When('I verify login success message', async function(this: TestDataManager, { loginPage }) {
  // This data comes from test data files (/features/{feature}/data)
  const expectedMessage = await this.get('expectedWelcomeMessage');  // From test data
  
  await loginPage.verifyWelcomeMessage(expectedMessage);
});
```

### **Example 3: Creating Dynamic Data (Current Scenario)**
```typescript
When('I generate and use test data', async function(this: TestDataManager, { loginPage }) {
  // Generate fake data
  const user = await this.generateUser(true);
  
  // Store for immediate use in current scenario (Data Source 2)
  await this.storeData('generatedEmail', user.email);
  await this.storeData('generatedPassword', user.password);
  
  // Use the stored data immediately
  const email = await this.get('generatedEmail');     // From memory
  const password = await this.get('generatedPassword'); // From memory
  
  await loginPage.enterUsername(email);
  await loginPage.enterPassword(password);
});
```

### **Example 4: Cross-Scenario Data Flow**
```typescript
// Scenario 1: Create appointment
When('I create an appointment', async function(this: TestDataManager, { loginPage }) {
  const appointment = await createAppointment();
  
  // Store data that will be available in NEXT scenario
  await this.storeData('appointmentId', appointment.id);
  await this.storeData('customerName', appointment.customerName);
});

// Scenario 2: Use the appointment (different scenario!)
When('I add agent to appointment', async function(this: TestDataManager, { loginPage }) {
  // Retrieve data from PREVIOUS scenario (Data Source 3)
  const appointmentId = await this.get('appointmentId');    // From file
  const customerName = await this.get('customerName');      // From file
  
  await addAgentToAppointment(appointmentId, 'Jane Smith');
});
```

### **Example 5: Complex Data Resolution**
```typescript
When('I process user data', async function(this: TestDataManager, { loginPage }) {
  // Data Source 1: Environment variables
  const baseUrl = process.env.BASE_URL;                     // From .env file
  
  // Data Source 2: Test data (if available)
  const expectedTitle = await this.get('expectedTitle');    // From test data
  
  // Data Source 3: Dynamic memory (current scenario)
  const userId = this.generateString('user');
  await this.storeData('currentUserId', userId);           // Memory + File
  
  // Data Source 4: Cross-scenario (if available)
  const previousOrderId = await this.get('orderId');       // From file (if exists)
  
  // Use all data sources together
  console.log(`Processing user ${userId} at ${baseUrl}`);
  if (previousOrderId) {
    console.log(`Continuing from order ${previousOrderId}`);
  }
});
```

## Data Source Comparison

| Data Source | Directory | Purpose | Access Method | Scope | Performance | Use Case |
|-------------|-----------|---------|---------------|-------|-------------|----------|
| **Environment Variables** | `.env` files | How tests run | `process.env.KEY` | Test run | Fastest | URLs, credentials, settings |
| **Test Data** | `/features/{feature}/data` | What tests verify | `this.get('key')` | Feature | Fast | Expected results, form data, expectations |
| **Dynamic Memory** | In-memory | Current scenario data | `this.get('key')` | Current scenario | Fastest | Temporary data, calculations |
| **Cross-Scenario** | File storage | Between scenarios | `this.get('key')` | Test run | Slower | Resource IDs, shared state |

## Best Practices

### **Naming Conventions for Scenarios**
The framework uses automatic feature detection, so follow these naming rules:

```bash
# ✅ CORRECT Structure
features/
├── login/                     # Feature name
│   └── data/
│       └── scenarios/         # Direct scenario files
│           ├── standard_login.json
│           └── admin_login.json
├── checkout/                  # Feature name
│   └── data/
│       └── scenarios/         # Direct scenario files
│           ├── standard_checkout.json
│           └── premium_checkout.json
```

**Key Rule**: Scenario files are placed directly in the `scenarios/` folder for each feature.

### **When to Use Each Data Source**

1. **Environment Variables (`.env` files)**
   - **Environment-specific data** (URLs, credentials)
   - **Sensitive information** (passwords, database connections)
   - **Configuration that changes per environment** (QA vs staging vs prod)

2. **Test Data Files (`/features/{feature}/data`)**
   - **Test-specific values** (form data, test inputs)
   - **Expected results** (success messages, redirect URLs)
   - **Scenario variations** (different test cases)

3. **Dynamic Memory (`storeData`)**
   - **Generated test data** (fake users, orders, products)
   - **Form inputs and calculations** (temporary values)
   - **Data needed within current scenario**

4. **Cross-Scenario Persistence (`storeData`)**
   - **Resource IDs** (user IDs, order IDs, appointment IDs)
   - **Data that subsequent scenarios need** to reference
   - **Test state that must survive** scenario boundaries

### **Naming Conventions**
```typescript
// Environment variable keys (how tests run)
process.env.BASE_URL;                // ✅ Clear purpose
process.env.TIMEOUT;                 // ✅ Clear purpose
process.env.RETRY_ATTEMPTS;          // ✅ Clear purpose

// Test data keys (what tests verify)
await this.get('expectedTitle');     // ✅ Clear purpose
await this.get('expectedMessage');   // ✅ Clear purpose
await this.get('formData');          // ✅ Clear purpose

// Dynamic data keys (current scenario)
await this.storeData('appointmentId', appointment.id);           // ✅ Clear
await this.storeData('customerEmail', customer.email);           // ✅ Clear
await this.storeData('generatedPassword', password);             // ✅ Clear

// Avoid generic keys
await this.storeData('id', appointment.id);                      // ❌ Unclear
await this.storeData('data', customer.email);                    // ❌ Unclear
```

### **Data Cleanup**
```typescript
// TestDataManager automatically cleans up:
// - Memory data after each scenario
// - File data after test run completion

// Manual cleanup if needed
await this.clearPersistentData();  // Clears all cross-scenario data
```

## Dynamic Data Generation

The framework includes Faker integration for generating realistic test data:

```typescript
// Generate and store user data
const user = this.generateUser(true);

// Generate order data
const order = this.generateOrder(true);

// Generate product data
const product = this.generateProduct(true);

// Custom string/number generation
const customString = this.generateString('prefix', 10);
const randomNumber = this.generateNumber(1, 100);
```

## Azure DevOps Integration

### **Tagging Scenarios**
Use tags to map scenarios to Azure DevOps test cases:

- `@azureTestCaseId=1001` - Maps to specific test case ID
- `@US1000` - Maps to user story
- `@feature:login` - Maps to feature area

### **Reporting**
Test results are automatically reported to Azure DevOps when `REPORT_TO_AZURE=true` is set.

## Environment Configuration

Create environment-specific `.env` files:

```bash
# .env.qa
BASE_URL=https://qa.example.com
USERNAME=qa.user@example.com
PASSWORD=QAPass123!

# .env.staging
BASE_URL=https://staging.example.com
USERNAME=staging.user@example.com
PASSWORD=StagingPass123!
```

## Custom Reporter

The framework generates custom HTML reports at `test-results/custom-report.html` with:

- Test case IDs and user stories
- Feature categorization
- Pass/fail status
- Duration information
- Step-level results

## Contributing

1. Follow the feature-scoped organization pattern
2. Use descriptive scenario names
3. Tag scenarios appropriately for Azure DevOps integration
4. Keep test data in JSON files, not in step definitions
5. Use `storeData()` for all data storage needs
6. Write all tests in Gherkin syntax - this framework is BDD-only
7. **Use `.env` files for credentials and URLs (HOW tests run)**
8. **Use `playwright.config.ts` for framework behavior (HOW tests run)**
9. **Use `/features/{feature}/data` for test expectations (WHAT tests verify)**

## Scalability

### **Adding New Features (Zero Code Changes Required)**
The framework automatically scales to new features without any code modifications:

1. **Create feature structure:**
   ```bash
   features/my_new_feature/
   ├── data/
   │   ├── default.json
   │   └── scenarios/                    # Direct scenario files
   │       ├── scenario1.json
   │       └── scenario2.json
   ├── my_new_feature.feature
   └── steps/
   ```

2. **Use in feature files:**
   ```gherkin
   @feature:my_new_feature
   Scenario: Test scenario @data:scenario1
   ```

3. **Framework automatically:**
   - Detects feature name from `@feature:my_new_feature`
   - Looks in `scenarios/scenario1.json`
   - Loads data without any configuration

**The framework is completely self-organizing and scalable!** 🚀

## License

ISC
