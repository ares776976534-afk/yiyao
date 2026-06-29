const globals = require('@jest/globals')
const extensions = require('@testing-library/jest-dom');

globals.expect.extend(extensions);
