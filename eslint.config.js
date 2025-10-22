import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import unicorn from 'eslint-plugin-unicorn';
import sonarjs from 'eslint-plugin-sonarjs';
import security from 'eslint-plugin-security';

export default [
  // Base configuration with ignores
  {
    ignores: [
      'node_modules/',
      'dist/',
      'coverage/**/*',
      'html/**/*',
      'reports/**/*',
      'test-patterns/**/*',
      '.tsbuildinfo',
      '*.config.js',
      'lint-staged.config.*',
      'commitlint.config.*',
    ],
  },
  
  // JavaScript files configuration
  {
    files: ['**/*.{js,mjs,cjs}'],
    ...js.configs.recommended,
    plugins: {
      unicorn,
      sonarjs,
      security,
    },
    rules: {
      // Basic rules for JS files
      'unicorn/no-null': 'off',
      'unicorn/prefer-module': 'off',
      'sonarjs/no-duplicate-string': 'off',
      'security/detect-object-injection': 'warn',
    },
  },
  
  // TypeScript files configuration
  ...tseslint.config(
    {
      files: ['**/*.{ts,tsx}'],
      extends: [
        ...tseslint.configs.strict,
        ...tseslint.configs.stylistic,
      ],
      languageOptions: {
        parser: tseslint.parser,
        parserOptions: {
          project: './tsconfig.json',
          ecmaVersion: 'latest',
          sourceType: 'module',
        },
      },
      plugins: {
        '@typescript-eslint': tseslint.plugin,
        unicorn,
        sonarjs,
        security,
      },
      rules: {
        // TypeScript strict rules
        '@typescript-eslint/explicit-function-return-type': 'error',
        '@typescript-eslint/no-explicit-any': 'error',
        '@typescript-eslint/no-unsafe-assignment': 'error',
        '@typescript-eslint/no-unsafe-member-access': 'error',
        '@typescript-eslint/no-unsafe-call': 'error',
        '@typescript-eslint/no-unsafe-return': 'error',
        '@typescript-eslint/strict-boolean-expressions': 'off',
        '@typescript-eslint/no-floating-promises': 'error',
        '@typescript-eslint/no-misused-promises': 'error',
        '@typescript-eslint/await-thenable': 'error',
        '@typescript-eslint/no-unnecessary-condition': 'error',
        '@typescript-eslint/prefer-readonly': 'error',
        '@typescript-eslint/switch-exhaustiveness-check': 'error',
        '@typescript-eslint/prefer-nullish-coalescing': 'error',
        '@typescript-eslint/prefer-optional-chain': 'error',
        '@typescript-eslint/no-non-null-assertion': 'error',
        '@typescript-eslint/restrict-template-expressions': 'error',
        
        // Additional strict TypeScript rules
        '@typescript-eslint/no-unused-vars': [
          'error',
          {
            argsIgnorePattern: '^_',
            varsIgnorePattern: '^_',
            caughtErrorsIgnorePattern: '^_',
          },
        ],
        
        // Naming conventions
        '@typescript-eslint/naming-convention': [
          'error',
          {
            selector: 'interface',
            format: ['PascalCase'],
            custom: { regex: '^I[A-Z]', match: false },
          },
          {
            selector: 'typeParameter',
            format: ['PascalCase'],
          },
          {
            selector: 'enum',
            format: ['PascalCase'],
          },
        ],
        
        // Unicorn strict rules
        'unicorn/no-null': 'off',
        'unicorn/better-regex': 'warn',
        'unicorn/catch-error-name': 'error',
        'unicorn/consistent-function-scoping': 'error',
        'unicorn/explicit-length-check': 'error',
        'unicorn/filename-case': ['error', { case: 'kebabCase' }],
        'unicorn/new-for-builtins': 'error',
        'unicorn/no-array-for-each': 'warn',
        'unicorn/no-array-push-push': 'error',
        'unicorn/no-console-spaces': 'error',
        'unicorn/no-for-loop': 'error',
        'unicorn/no-lonely-if': 'error',
        'unicorn/no-useless-spread': 'error',
        'unicorn/prefer-array-find': 'error',
        'unicorn/prefer-array-flat': 'error',
        'unicorn/prefer-array-flat-map': 'error',
        'unicorn/prefer-includes': 'error',
        'unicorn/prefer-logical-operator-over-ternary': 'error',
        'unicorn/prefer-math-trunc': 'error',
        'unicorn/prefer-module': 'off',
        'unicorn/prefer-node-protocol': 'error',
        'unicorn/prefer-number-properties': 'error',
        'unicorn/prefer-optional-catch-binding': 'error',
        'unicorn/prefer-regexp-test': 'error',
        'unicorn/prefer-set-has': 'error',
        'unicorn/prefer-string-slice': 'error',
        'unicorn/prefer-string-starts-ends-with': 'error',
        'unicorn/prefer-ternary': 'warn',
        'unicorn/prefer-top-level-await': 'warn',
        'unicorn/throw-new-error': 'error',
        'unicorn/escape-case': 'error',
        'unicorn/number-literal-case': 'error',
        
        // SonarJS code quality rules
        'sonarjs/cognitive-complexity': ['error', 15],
        'sonarjs/no-duplicate-string': ['error', { threshold: 6 }],
        'sonarjs/no-identical-functions': 'error',
        'sonarjs/no-collapsible-if': 'error',
        'sonarjs/no-duplicated-branches': 'error',
        'sonarjs/no-redundant-boolean': 'error',
        'sonarjs/no-redundant-jump': 'error',
        'sonarjs/no-same-line-conditional': 'error',
        'sonarjs/no-small-switch': 'error',
        'sonarjs/no-useless-catch': 'error',
        'sonarjs/prefer-immediate-return': 'error',
        'sonarjs/prefer-object-literal': 'error',
        'sonarjs/prefer-single-boolean-return': 'error',
        'sonarjs/prefer-while': 'error',
        
        // Security rules
        'security/detect-object-injection': 'off',
        'security/detect-non-literal-regexp': 'warn',
        'security/detect-possible-timing-attacks': 'warn',
        'security/detect-eval-with-expression': 'error',
        'security/detect-no-csrf-before-method-override': 'error',
        'security/detect-buffer-noassert': 'error',
        'security/detect-child-process': 'warn',
        'security/detect-disable-mustache-escape': 'error',
        'security/detect-new-buffer': 'error',
        'security/detect-unsafe-regex': 'error',
        
        // File length limit
        'max-lines': ['error', 250],
      },
    }
  ),
  
  // Config files overrides (JS and TypeScript)
  {
    files: ['*.js', '*.config.js', '*.config.mjs', '*.config.cjs', '*.config.ts'],
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/await-thenable': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
      '@typescript-eslint/prefer-readonly': 'off',
      '@typescript-eslint/switch-exhaustiveness-check': 'off',
      '@typescript-eslint/prefer-optional-chain': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/naming-convention': 'off',
      'unicorn/prefer-module': 'off',
      'unicorn/filename-case': 'off',
      'sonarjs/no-duplicate-string': 'off',
      'max-lines': 'off',
    },
  },
  
  // React components and pages - disable explicit return types
  {
    files: ['app/**/page.tsx', 'app/**/layout.tsx', 'components/**/*.tsx'],
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
    },
  },
  
  // Components - 400 line limit
  {
    files: ['components/**/*.ts', 'components/**/*.tsx'],
    rules: {
      'max-lines': ['error', 400],
    },
  },
  
  // App route files - 250 line limit (default, but explicit for clarity)
  {
    files: ['app/**/*.ts', 'app/**/*.tsx'],
    rules: {
      'max-lines': ['error', 250],
    },
  },
  
  // App page and layout files - 300 line limit
  {
    files: ['app/**/page.tsx', 'app/**/layout.tsx'],
    rules: {
      'max-lines': ['error', 300],
    },
  },
  
  // UI Components - relaxed rules
  {
    files: ['components/ui/**/*'],
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
      'sonarjs/cognitive-complexity': ['error', 25],
      'sonarjs/no-duplicate-string': ['warn', { threshold: 10 }],
    },
  },
  
  // Test files override
  {
    files: [
      '**/*.test.ts',
      '**/*.spec.ts',
      '**/*.test.tsx',
      '**/*.spec.tsx',
      '**/test-setup.ts',
      'test-patterns/**/*.ts',
    ],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/strict-boolean-expressions': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-misused-promises': 'off',
      '@typescript-eslint/await-thenable': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/no-unsafe-construction': 'off',
      'sonarjs/no-duplicate-string': 'off',
      'sonarjs/cognitive-complexity': ['error', 25],
      'unicorn/no-null': 'off',
      'security/detect-object-injection': 'off',
    },
  },
  
  // Type definition files override
  {
    files: ['next-env.d.ts', '*.d.ts'],
    rules: {
      'unicorn/prevent-abbreviations': 'off',
    },
  },
  
  // API and library files - warnings instead of errors
  {
    files: ['app/api/**/*.ts', 'hooks/**/*.ts', 'lib/**/*.ts'],
    ignores: ['**/*.test.ts', '**/*.spec.ts', '**/*.test.tsx', '**/*.spec.tsx'],
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn',
      '@typescript-eslint/no-unsafe-return': 'warn',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/await-thenable': 'warn',
      '@typescript-eslint/no-unnecessary-condition': 'warn',
      '@typescript-eslint/prefer-readonly': 'warn',
      'sonarjs/no-duplicate-string': 'warn',
      'security/detect-unsafe-regex': 'warn',
    },
  },
  
  // E2E tests configuration
  {
    files: ['e2e/**/*.ts', 'playwright.config.ts'],
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/await-thenable': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
      '@typescript-eslint/prefer-readonly': 'off',
      '@typescript-eslint/switch-exhaustiveness-check': 'off',
      '@typescript-eslint/prefer-optional-chain': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/naming-convention': 'off',
      'unicorn/prefer-module': 'off',
      'unicorn/filename-case': 'off',
      'sonarjs/no-duplicate-string': 'off',
      'max-lines': 'off',
    },
  },
];