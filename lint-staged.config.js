export default {
  // TypeScript files - full validation
  '*.ts': [
    // Type check entire project (catches cross-file issues)
    () => 'tsc --noEmit',
    
    // Lint and fix issues
    'eslint --fix --max-warnings=0',
    
    // Format with prettier
    'prettier --write',
    
    // Run related tests (lint-staged already filters for existing files)
    (filenames) => {
      const tests = filenames
        .map(f => f.replace(/\.ts$/, '.test.ts'));
      return tests.length ? `vitest run ${tests.join(' ')} --reporter=verbose --run` : true;
    }
  ],
  
  // Other files
  '*.{json,md,yml}': ['prettier --write'],
  
  // Package.json changes
  'package.json': [
    'npm audit --audit-level=moderate',
    () => 'npm run typecheck',
  ],
};