import { defineBddConfig } from 'playwright-bdd';

export default defineBddConfig({
  paths: ['features/**/*.feature'],
  require: ['features/**/*.ts'],
  format: ['@cucumber/pretty-formatter'],
  formatOptions: {
    snippetInterface: 'async-await'
  }
});
