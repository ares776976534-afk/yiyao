const { getESLintConfig } = require('@applint/spec');

module.exports = getESLintConfig('react-ts', {
  extends: ['@ali/eslint-config-att/typescript/react'],
  rules: {
    // 关闭引号规则，允许使用单引号或双引号
    quotes: 'off',
    '@typescript-eslint/quotes': 'off',
    // 允许使用 function 表达式，不强制使用箭头函数
    'prefer-arrow-callback': 'off',
    // 关闭 JSX 花括号换行规则
    'react/jsx-curly-newline': 'off',
    // 关闭驼峰命名规则
    camelcase: 'off',
  },
});
