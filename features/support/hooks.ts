import { Before, After, BeforeAll, AfterAll } from '@cucumber/cucumber';
import { TestDataManager } from './TestDataManager';

BeforeAll(async function() {
  console.log('Starting Cucumber test suite...');
});

Before(async function(this: TestDataManager, { pickle, gherkinDocument }) {
  // Set environment
  this.env = process.env.TEST_ENV || 'qa';
  
  // Extract feature and scenario names
  this.featureName = gherkinDocument.feature?.name || '';
  this.scenarioName = pickle.name || '';
  
  // Extract data tag if present (e.g., @data:standard_login)
  const dataTag = pickle.tags.find(tag => tag.name.startsWith('@data:'));
  const scenarioKey = dataTag ? dataTag.name.replace('@data:', '') : undefined;
  
  // Load test data for this feature/scenario
  this.loadTestData(scenarioKey);
  
  console.log(`Running scenario: ${this.scenarioName} in feature: ${this.featureName}`);
  console.log(`Environment: ${this.env}, Data key: ${scenarioKey || 'default'}`);
});

After(async function(this: TestDataManager) {
  // Clean up dynamic data for next scenario
  this.dynamicData = {};
  
  console.log(`Completed scenario: ${this.scenarioName}`);
});

AfterAll(async function() {
  console.log('Completed Cucumber test suite...');
});
