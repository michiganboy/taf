import { createBdd } from 'playwright-bdd';
import { test } from './fixtures/index';

// Create BDD step definitions that use our extended test fixtures
export const { Given, When, Then } = createBdd(test);
