export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', [
      'feat',     // New feature
      'fix',      // Bug fix
      'perf',     // Performance improvement
      'refactor', // Code change that neither fixes a bug nor adds a feature
      'style',    // Code style changes
      'test',     // Adding missing tests
      'docs',     // Documentation only
      'build',    // Build system
      'ci',       // CI configuration
      'chore',    // Other changes that don't modify src or test
      'revert',   // Reverts a previous commit
    ]],
    'scope-case': [2, 'always', 'kebab-case'],
    'subject-case': [2, 'never', ['upper-case', 'pascal-case', 'start-case']],
    'header-max-length': [2, 'always', 72],
    'body-max-line-length': [2, 'always', 100],
  },
};