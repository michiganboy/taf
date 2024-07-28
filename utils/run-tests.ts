// utils/run-tests.ts

import { spawn } from 'child_process';
import minimist from 'minimist';

// Parse all arguments, including those passed through npm
const allArgs = process.argv.slice(2).concat(
  process.env.npm_config_argv 
    ? JSON.parse(process.env.npm_config_argv).original.slice(2) 
    : []
);

const args = minimist(allArgs);

// Set environment and reporting flag based on arguments or defaults
const env = args.env || 'qa';
const reportToAzure = args.reportToAzure === 'true';
const headless = args.headless !== 'false'; // Default to true if not specified
const testCaseId = args.test;
const userStory = args.userStory;
const feature = args.feature;

// Set environment variables
process.env.TEST_ENV = env;
process.env.REPORT_TO_AZURE = reportToAzure.toString();

console.log(`Running tests in ${env} environment`);
console.log(`Reporting to Azure DevOps: ${reportToAzure}`);
console.log(`Headless mode: ${headless}`);

// Construct the Playwright test command
const playwrightArgs: string[] = ['test'];

// Add headless mode argument
if (!headless) {
  playwrightArgs.push('--headed');
}

// Add specific test case, user story, or feature arguments
if (testCaseId) {
  playwrightArgs.push('-g', `@azureTestCaseId=${testCaseId}`);
} else if (userStory) {
  playwrightArgs.push('-g', `@US${userStory}`);
} else if (feature) {
  playwrightArgs.push('-g', `@feature:${feature}`);
}

// Add any additional arguments passed to the script
Object.keys(args).forEach(key => {
  if (!['env', 'reportToAzure', 'headless', 'test', 'userStory', 'feature', '_'].includes(key)) {
    playwrightArgs.push(`--${key}=${args[key]}`);
  }
});

console.log('Playwright arguments:', playwrightArgs.join(' '));

// Spawn the Playwright test process
const testProcess = spawn('npx', ['playwright', ...playwrightArgs], {
  stdio: 'inherit',
  env: { ...process.env }
});

testProcess.on('exit', (code) => {
  process.exit(code ? code : 0);
});