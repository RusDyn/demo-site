# Create Feature: $ARGUMENTS

You are implementing a new feature. Follow this exact process:

## 1. Planning Phase (THINK FIRST)
- Understand the requirements completely
- Review similar existing features for patterns
- Identify all affected files and modules
- List potential edge cases and error scenarios

## 2. Type Design Phase
Create all TypeScript interfaces and types FIRST:
- Domain types (use branded types for IDs)
- Request/Response types
- Error types
- State types if applicable

## 3. Implementation Checklist
- [ ] Create types in `src/types/`
- [ ] Implement service logic with Result<T,E> pattern
- [ ] Add input validation with Zod
- [ ] Create unit tests (minimum 80% coverage)
- [ ] Add integration tests for APIs
- [ ] Update OpenAPI documentation
- [ ] Add JSDoc comments for public APIs

## 4. Quality Verification
Run these commands and fix all issues:
1. `npm run typecheck` - Must pass
2. `npm run lint` - Zero warnings
3. `npm run test` - All tests pass
4. `npm run build` - Successful build

## 5. Code Patterns to Follow
```typescript
// Service method pattern
async function createUser(
  data: CreateUserDto
): Promise<Result<User, CreateUserError>> {
  // 1. Validate input
  const validation = createUserSchema.safeParse(data);
  if (!validation.success) {
    return Err(new ValidationError(validation.error));
  }

  // 2. Business logic
  try {
    const user = await userRepository.create(validation.data);
    return Ok(user);
  } catch (error) {
    return Err(new DatabaseError('Failed to create user', error));
  }
}
```

IMPORTANT: Never skip type design phase. Types guide implementation.