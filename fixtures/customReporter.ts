// fixtures/customReporter.ts

import { Reporter, TestCase, TestResult, TestStep } from '@playwright/test/reporter';
import { AzureDevOpsReporter } from './azureDevOps';
import fs from 'fs';
import path from 'path';

class CustomReporter implements Reporter {
  private azureDevOpsReporter: AzureDevOpsReporter;
  private testResults: Array<{
    testCaseId: string;
    userStory: string;
    feature: string;
    title: string;
    status: string;
    duration: number;
    errorMessage?: string;
    steps: Array<{ title: string; status: string; duration: number }>;
  }> = [];

  constructor() {
    this.azureDevOpsReporter = new AzureDevOpsReporter();
  }

  /**
   * Called when a test ends
   * @param test - The test case that ended
   * @param result - The result of the test
   */
  onTestEnd(test: TestCase, result: TestResult) {
    // Extract Azure DevOps test case ID from test annotations
    const testCaseId = test.annotations.find(a => a.type === 'azureTestCaseId')?.description || '';
    
    // Extract User Story and Feature from test title
    const userStoryMatch = test.title.match(/@US(\d+)/);
    const featureMatch = test.title.match(/@feature:(\w+)/);
    const userStory = userStoryMatch ? userStoryMatch[1] : '';
    const feature = featureMatch ? featureMatch[1] : '';

    // Map test steps to the format expected by AzureDevOpsReporter
    const steps = result.steps.map(step => ({
      description: step.title,
      outcome: step.error ? 'Failed' : 'Passed',
      errorMessage: step.error?.message
    }));

    // Add test result to Azure DevOps reporter
    if (testCaseId) {
      this.azureDevOpsReporter.addTestResult(
        parseInt(testCaseId),
        result.status,
        steps,
        result.error?.message
      );
    }

    // Store test result for custom reporting
    this.testResults.push({
      testCaseId,
      userStory,
      feature,
      title: test.title,
      status: result.status,
      duration: result.duration,
      errorMessage: result.error?.message,
      steps: result.steps.map(step => ({
        title: step.title,
        status: step.error ? 'failed' : 'passed',
        duration: step.duration
      }))
    });
  }

  /**
   * Called when all tests have finished
   */
  async onEnd() {
    // Report all collected test results to Azure DevOps
    await this.azureDevOpsReporter.reportTestResults();

    // Generate custom HTML report
    this.generateCustomReport();
  }

  /**
   * Generates a custom HTML report
   */
  private generateCustomReport() {
    const reportDir = path.join(process.cwd(), 'test-results');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    const reportPath = path.join(reportDir, 'custom-report.html');
    
    let htmlContent = `
    <html>
      <head>
        <title>Test Results</title>
        <style>
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid black; padding: 8px; text-align: left; }
          .passed { background-color: #90EE90; }
          .failed { background-color: #FFB6C1; }
        </style>
      </head>
      <body>
        <h1>Test Results</h1>
        <table>
          <tr>
            <th>Test Case ID</th>
            <th>User Story</th>
            <th>Feature</th>
            <th>Title</th>
            <th>Status</th>
            <th>Duration (ms)</th>
          </tr>
    `;

    this.testResults.forEach(result => {
      htmlContent += `
        <tr class="${result.status.toLowerCase()}">
          <td>${result.testCaseId}</td>
          <td>${result.userStory}</td>
          <td>${result.feature}</td>
          <td>${result.title}</td>
          <td>${result.status}</td>
          <td>${result.duration}</td>
        </tr>
      `;
    });

    htmlContent += `
        </table>
      </body>
    </html>
    `;

    fs.writeFileSync(reportPath, htmlContent);
    console.log(`Custom HTML report generated at: ${reportPath}`);
  }
}

export default CustomReporter;