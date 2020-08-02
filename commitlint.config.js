module.exports = {
  extends: ['@commitlint/config-conventional'],
  parserPreset: 'conventional-changelog-atom',
  formatter: '@commitlint/format',
  rules: {
    'type-enum': [0, 'always', ['feat', 'fix', 'chore', 'ci']],
  }
};
