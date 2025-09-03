@feature:login
Feature: User Login
  As a user
  I want to log into the application
  So that I can access my account

  Background:
    Given I am on the login page

  @azureTestCaseId=1001 @US1000
  Scenario: Successful login with valid credentials @data:standard_login
    When I enter valid username and password
    And I click the login button
    Then I should be successfully logged in
    And I should be redirected to the dashboard

  @azureTestCaseId=1002 @US1001
  Scenario: Failed login with invalid credentials
    When I enter invalid username and password
    And I click the login button
    Then I should see an error message
    And I should remain on the login page

  @azureTestCaseId=1003 @US1002
  Scenario: Login with generated test data
    When I generate a new test user
    And I enter the generated credentials
    And I click the login button
    Then I should see a registration prompt
    And the generated user data should be stored

  @azureTestCaseId=1004 @US1003
  Scenario Outline: Login with different user types
    When I log in as a "<userType>" user
    Then I should see the appropriate "<welcomeMessage>"

    Examples:
      | userType | welcomeMessage        |
      | admin    | Welcome Administrator |
      | user     | Welcome User         |
      | guest    | Welcome Guest        |
