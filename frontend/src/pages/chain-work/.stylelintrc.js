const { getStylelintConfig } = require('@iceworks/spec');

module.exports = getStylelintConfig('react', {
  rules: {
    'scss/at-rule-no-unknown': null,
    'max-line-length': null,
  },
});
