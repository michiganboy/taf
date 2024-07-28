// fixtures/azureDevOps.ts

import axios from 'axios';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from the .azure.env file
dotenv.config({ path: path.resolve(__dirname, '../env/.azure.env') });

export class AzureDevOpsReporter {
  private organizationUrl: string;
  private project: string;
  private personalAccessToken: string;
  private testResults: Array<{
    testCaseId: number,
    outcome: string,
    errorMessage?: string,
    steps: Array<{ description: string, outcome: string, errorMessage?: string }>
  }> = [];
  private reportToAzure: boolean;

  constructor() {
    // Initialize Azure DevOps configuration from environment variables
    this.organizationUrl = process.env.AZURE_DEVOPS_ORG_URL || '';
    this.project = process.env.AZURE_DEVOPS_PROJECT || '';
    this.personalAccessToken = process.env.AZURE_DEVOPS_PAT || '';
    
    // New environment variable to control reporting
    this.reportToAzure = process.env.REPORT_TO_AZURE?.toLowerCase() === 'true';

    // Validate that all required configuration is present if reporting is enabled
    if (this.reportToAzure && (!this.organizationUrl || !this.project || !this.personalAccessToken)) {
      throw new Error('Azure DevOps configuration is incomplete. Please check your .azure.env file.');
    }
  }

  /**
   * Adds a test result to the collection
   * @param testCaseId - The ID of the test case in Azure DevOps
   * @param outcome - The outcome of the test (e.g., 'Passed', 'Failed')
   * @param steps - Array of step results for the test
   * @param errorMessage - The error message if the test failed (optional)
   */
  addTestResult(
    testCaseId: number, 
    outcome: string, 
    steps: Array<{ description: string, outcome: string, errorMessage?: string }>,
    errorMessage?: string
  ) {
    this.testResults.push({ testCaseId, outcome, steps, errorMessage });
  }

  /**
   * Sends all collected test results to Azure DevOps
   * @returns The response data from Azure DevOps API
   */
  async reportTestResults() {
    // Check if reporting to Azure DevOps is enabled
    if (!this.reportToAzure) {
      console.log('Skipping report to Azure DevOps. REPORT_TO_AZURE is not set to true.');
      return;
    }

    const url = `${this.organizationUrl}/${this.project}/_apis/test/Runs?api-version=6.0`;
    
    // Construct the test run object with all collected results
    const testRun = {
      name: `Automated Test Run - ${new Date().toISOString()}`,
      automated: true,
      plan: { id: 1 }, // Replace with your actual test plan ID
      results: this.testResults.map(result => ({
        testCase: { id: result.testCaseId },
        outcome: result.outcome,
        errorMessage: result.errorMessage || '',
        iterationDetails: [
          {
            outcome: result.outcome,
            stepResults: result.steps.map(step => ({
              outcome: step.outcome,
              stepIdentifier: step.description,
              errorMessage: step.errorMessage || ''
            }))
          }
        ]
      }))
    };

    try {
      // Send POST request to Azure DevOps API
      const response = await axios.post(url, testRun, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(`:${this.personalAccessToken}`).toString('base64')}`
        }
      });
      console.log(`Test results reported for ${this.testResults.length} test cases`);
      return response.data;
    } catch (error) {
      console.error('Error reporting test results:', error);
    }
  }
}