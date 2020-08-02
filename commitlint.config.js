module.exports = {
  extends: ['@commitlint/config-conventional'],
  formatter: '@commitlint/format',
  rules: {
    'type-enum': [0, 'always', ['feat', 'fix', 'chore', 'ci']],
  }
};
