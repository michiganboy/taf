// fixtures/index.ts
import { test as base } from '@playwright/test';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { AzureDevOpsReporter } from './azureDevOps';

type Pages = {
  homePage: HomePage;
  loginPage: LoginPage;
  azureDevOpsReporter: AzureDevOpsReporter;
};

type Env = {
  baseURL: string;
  username: string;
  password: string;
};

export const test = base.extend<Pages & Env>({
  baseURL: process.env.BASE_URL || '',
  username: process.env.USERNAME || '',
  password: process.env.PASSWORD || '',

  homePage: async ({ page, baseURL }, use) => {
    await use(new HomePage(page, baseURL));
  },
  loginPage: async ({ page, baseURL }, use) => {
    await use(new LoginPage(page, baseURL));
  },
  azureDevOpsReporter: async ({}, use) => {
    await use(new AzureDevOpsReporter());
  },
});

export { expect } from '@playwright/test';