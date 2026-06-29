const config = require('kcd-scripts/jest')

module.exports = {
  ...config,
  testMatch: ['<rootDir>/tests/**/*.test.+(js|jsx|ts|tsx)'],
  roots: ['<rootDir>'],
}
