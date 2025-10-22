# Debug Issue: $ARGUMENTS

Systematic debugging approach for production issues:

## 1. Information Gathering
First, collect ALL relevant information:
- Exact error message and stack trace
- User actions that triggered the issue
- Environment (production/staging/local)
- Time of occurrence
- Affected users/scope

## 2. Reproduction Strategy
Create minimal reproduction:
1. Isolate the specific flow
2. Remove unrelated code
3. Create failing test case
4. Verify issue persists

## 3. Investigation Tools
Use these in order:
1. **Type checking**: `npm run typecheck` - Often reveals the issue
2. **Logs analysis**: Check application and error logs
3. **Git bisect**: Find when bug was introduced
4. **Chrome DevTools**: For frontend issues
5. **Node --inspect**: For backend debugging

## 4. Root Cause Analysis
- What changed recently in this area?
- Are there similar issues elsewhere?
- Is this a regression?
- What assumptions were violated?

## 5. Fix Implementation
1. Write failing test that reproduces issue
2. Implement minimal fix
3. Verify test now passes
4. Check for similar issues in codebase
5. Add preventive tests

## 6. Prevention Strategy
- Add type constraints to prevent recurrence
- Improve error messages
- Add monitoring/alerts
- Update documentation

Remember: A bug fixed without a test is not truly fixed.