#!/usr/bin/env node
// utils/cli.ts

import fs from 'fs';
import path from 'path';
import { Command } from 'commander';
import { prompt } from 'enquirer';

function logInfo(message: string): void {
  console.log(`[taf] ${message}`);
}

function logError(message: string): void {
  console.error(`[taf] ERROR: ${message}`);
}

function getProjectRoot(): string {
  return process.cwd();
}

function ensureDirectoryExists(targetDir: string): void {
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
}

async function confirmOverwrite(targetFile: string): Promise<boolean> {
  const rel = path.relative(getProjectRoot(), targetFile);
  const answer = await prompt<{ ok: boolean }>([{
    name: 'ok',
    type: 'confirm',
    message: `File exists: ${rel}. Overwrite?`,
    initial: false
  }]);
  return answer.ok;
}

async function writeFileSafely(targetFile: string, content: string, allowPrompt = true): Promise<void> {
  if (fs.existsSync(targetFile)) {
    if (!allowPrompt) {
      logInfo(`Skipped existing file: ${path.relative(getProjectRoot(), targetFile)}`);
      return;
    }
    const ok = await confirmOverwrite(targetFile);
    if (!ok) {
      logInfo(`Skipped: ${path.relative(getProjectRoot(), targetFile)}`);
      return;
    }
  }
  ensureDirectoryExists(path.dirname(targetFile));
  fs.writeFileSync(targetFile, content, { encoding: 'utf8' });
  logInfo(`Created: ${path.relative(getProjectRoot(), targetFile)}`);
}

function toPascalCase(name: string): string {
  return name
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join('');
}

async function doctor(): Promise<void> {
    const root = getProjectRoot();
    const qaEnv = path.join(root, 'env', '.qa.env');
    const azureEnv = path.join(root, 'env', '.azure.env');

    logInfo('Doctor: checking environment...');
    logInfo(fs.existsSync(qaEnv) ? 'env/.qa.env found' : 'env/.qa.env missing');
    logInfo(fs.existsSync(azureEnv) ? 'env/.azure.env found' : 'env/.azure.env not required unless reporting to Azure');
    logInfo('Ensure Playwright browsers are installed: npx playwright install');
}

async function featureNew(nameArg?: string): Promise<void> {
    const name = nameArg || (await prompt<{ name: string }>([{ name: 'name', type: 'input', message: 'Feature name:', validate: v => !!v }])).name;
    const root = getProjectRoot();
    const featureDir = path.join(root, 'features', name);
    const dataDir = path.join(featureDir, 'data');
    const scenariosDir = path.join(dataDir, 'scenarios');
    const stepsDir = path.join(featureDir, 'steps');
    const featureFile = path.join(featureDir, `${name}.feature`);
    const defaultJson = path.join(dataDir, 'default.json');
    const stepsFile = path.join(stepsDir, `${name}.steps.ts`);

    ensureDirectoryExists(scenariosDir);
    ensureDirectoryExists(stepsDir);

    await writeFileSafely(
      defaultJson,
      JSON.stringify(
        {
          expectedTitle: `${toPascalCase(name)} - Example`,
          expectedRedirect: `/${name}`,
          expectedWelcomeMessage: 'Welcome!'
        },
        null,
        2
      ) + '\n'
    );

    const featureContent = `@feature:${name}
Feature: ${toPascalCase(name)}
  As a user
  I want to use the ${name} feature
  So that I achieve my goal

  Scenario: Example scenario @data:example
    Given I am on the ${name} page
    When I perform an action
    Then I should see the expected result
`;
    await writeFileSafely(featureFile, featureContent);

    const stepsContent = `import { Given, When, Then } from '../../../bdd.config';
import { TestDataManager } from '../support/TestDataManager';

Given('I am on the ${name} page', async function(this: TestDataManager, { homePage }) {
  await homePage.goto();
});

When('I perform an action', async function(this: TestDataManager) {
  // Implement action here
});

Then('I should see the expected result', async function(this: TestDataManager) {
  const expected = await this.get('expectedWelcomeMessage');
  console.log('Validate:', expected);
});
`;
    await writeFileSafely(stepsFile, stepsContent);

    // Seed example scenario data
    await writeFileSafely(
      path.join(scenariosDir, 'example.json'),
      JSON.stringify({ expectedWelcomeMessage: 'Welcome!' }, null, 2) + '\n'
    );

    logInfo(`Feature scaffolded: features/${name}`);
}

async function dataAdd(featureArg?: string, keyArg?: string): Promise<void> {
    const { feature, key } = await (async () => {
      const f = featureArg || (await prompt<{ feature: string }>([{ name: 'feature', type: 'input', message: 'Feature name:', validate: v => !!v }])).feature;
      const k = keyArg || (await prompt<{ key: string }>([{ name: 'key', type: 'input', message: 'Scenario key:', validate: v => !!v }])).key;
      return { feature: f, key: k };
    })();
    const root = getProjectRoot();
    // Validate feature exists
    const featureDir = path.join(root, 'features', feature);
    if (!fs.existsSync(featureDir)) {
      logError(`Feature not found: features/${feature}`);
      return;
    }
    const scenarioFile = path.join(root, 'features', feature, 'data', 'scenarios', `${key}.json`);
    await writeFileSafely(
      scenarioFile,
      JSON.stringify(
        {
          expectedTitle: `${toPascalCase(feature)} - ${toPascalCase(key)}`,
          expectedRedirect: `/${feature}`,
          expectedWelcomeMessage: 'Welcome!'
        },
        null,
        2
      ) + '\n'
    );
}

async function pageNew(nameArg?: string): Promise<void> {
    const answer = nameArg || (await prompt<{ name: string }>([{ name: 'name', type: 'input', message: 'Page class name (e.g., ProfilePage):', validate: v => !!v }])).name;
    const nameInput = answer;
    const className = /page$/i.test(nameInput) ? nameInput.replace(/$/i, '') : nameInput;
    const finalClassName = toPascalCase(className.endsWith('Page') ? className : `${className}Page`);
    const root = getProjectRoot();
    const file = path.join(root, 'fixtures', 'pages', `${finalClassName}.ts`);
    const content = `import { Page, Locator } from '@playwright/test';

export class ${finalClassName} {
  private page: Page;
  private baseURL: string;

  constructor(page: Page, baseURL: string) {
    this.page = page;
    this.baseURL = baseURL;
  }

  async goto(pathname: string = ''): Promise<void> {
    await this.page.goto(this.baseURL + pathname);
  }
}
`;
    await writeFileSafely(file, content);

    // Wire into fixtures/index.ts (import, Pages type, and fixture registration)
    const fixturesIndex = path.join(root, 'fixtures', 'index.ts');
    if (fs.existsSync(fixturesIndex)) {
      let src = fs.readFileSync(fixturesIndex, 'utf8');

      // 1) Import statement
      const importStmt = `import { ${finalClassName} } from './pages/${finalClassName}';`;
      if (!src.includes(importStmt)) {
        const importAnchor = `import { AzureDevOpsReporter } from './azureDevOps';`;
        if (src.includes(importAnchor)) {
          src = src.replace(importAnchor, `${importAnchor}\nimport { ${finalClassName} } from './pages/${finalClassName}';`);
        } else {
          src = `${importStmt}\n${src}`;
        }
      }

      // 2) Extend Pages type
      const pagesTypeRegex = /type\s+Pages\s*=\s*\{([\s\S]*?)\};/m;
      if (pagesTypeRegex.test(src)) {
        src = src.replace(pagesTypeRegex, (match, body) => {
          if (body.includes(`${finalClassName}`)) return match; // already present
          const insertion = `  ${finalClassName.charAt(0).toLowerCase()}${finalClassName.slice(1)}: ${finalClassName};\n`;
          // Insert before azureDevOpsReporter if present, else append before closing
          let newBody = body;
          if (newBody.includes('azureDevOpsReporter')) {
            newBody = newBody.replace('  azureDevOpsReporter: AzureDevOpsReporter;', `${insertion}  azureDevOpsReporter: AzureDevOpsReporter;`);
          } else {
            newBody = `${newBody}${insertion}`;
          }
          return `type Pages = {\n${newBody}};`;
        });
      }

      // 3) Add fixture factory
      const extendRegex = /export\s+const\s+test\s*=\s*base\.extend<([\s\S]*?)>\(\{([\s\S]*?)\}\);/m;
      if (extendRegex.test(src)) {
        src = src.replace(extendRegex, (match, generic, body) => {
          const fixtureName = `${finalClassName.charAt(0).toLowerCase()}${finalClassName.slice(1)}`;
          if (body.includes(`${fixtureName}: async`)) return match; // already present
          const factory = `  ${fixtureName}: async ({ page, baseURL }, use) => {\n    await use(new ${finalClassName}(page, baseURL));\n  },\n`;
          // place before azureDevOpsReporter if present, else after loginPage/homePage, else append at end
          if (body.includes('azureDevOpsReporter:')) {
            body = body.replace('  azureDevOpsReporter:', `${factory}  azureDevOpsReporter:`);
          } else {
            body = `${body}\n${factory}`;
          }
          return `export const test = base.extend<${generic}>({${body}});`;
        });
      }

      fs.writeFileSync(fixturesIndex, src, 'utf8');
      logInfo(`Wired ${finalClassName} into fixtures/index.ts`);
    } else {
      logInfo('fixtures/index.ts not found; skipping fixture wiring');
    }
}

async function envInit(envNameArg?: string): Promise<void> {
    const envName = envNameArg || (await prompt<{ env: string }>([{ name: 'env', type: 'input', message: 'Environment name:', initial: 'qa' }])).env;
    const root = getProjectRoot();
    const file = path.join(root, 'env', `.${envName}.env`);
    const content = `BASE_URL=https://example.com
USERNAME=user@example.com
PASSWORD=ChangeMe123!
`;
    await writeFileSafely(file, content);
}

async function azureInit(): Promise<void> {
    const root = getProjectRoot();
    const file = path.join(root, 'env', '.azure.env');
    const content = `AZURE_DEVOPS_ORG_URL=https://dev.azure.com/<org>
AZURE_DEVOPS_PROJECT=<project>
AZURE_DEVOPS_PAT=<personal_access_token>
AZURE_TEST_PLAN_ID=1
`;
    await writeFileSafely(file, content);
}

async function main(): Promise<void> {
  const program = new Command();
  program.name('taf').description('TAF CLI').version('1.0.0');

  program
    .command('doctor')
    .description('Check environment setup (env files, Playwright install)')
    .action(async () => { await doctor(); });

  program
    .command('feature')
    .description('Feature related commands')
    .command('new <name>')
    .description('Scaffold a new feature')
    .action(async (name: string) => { await featureNew(name); });

  const data = program.command('data').description('Test data commands');
  data
    .command('add <feature> <key>')
    .description('Add a scenario data file')
    .action(async (feature: string, key: string) => { await dataAdd(feature, key); });

  const page = program.command('page').description('Page object commands');
  page
    .command('new [name]')
    .description('Scaffold a new Page Object and wire fixtures')
    .action(async (name?: string) => { await pageNew(name); });

  const env = program.command('env').description('Environment config commands');
  env
    .command('init [env]')
    .description('Create env/.<env>.env with sample keys')
    .action(async (envName?: string) => { await envInit(envName); });

  program
    .command('azure')
    .description('Azure DevOps config commands')
    .command('init')
    .description('Create env/.azure.env with required keys')
    .action(async () => { await azureInit(); });

  await program.parseAsync(process.argv);
}

main();


