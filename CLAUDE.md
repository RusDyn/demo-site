# CLAUDE.md - Indie Developer Project Intelligence

## Critical Instructions for Claude Code
- Do what has been asked; nothing more, nothing less
- NEVER create files unless they're absolutely necessary for achieving your goal
- ALWAYS prefer editing an existing file to creating a new one
- NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User
- ALWAYS use context tools (especially MCP context7) to check updated documentation before creating new implementations - this prevents outdated patterns and ensures alignment with current best practices
- DO NOT skip linting issues in any case. FIX them first. Both errors and warnings

## Project Context
**Team Size**: 1-3 developers (or non-developers using Claude Code)
**Architecture**: Monolith with clean separation
**Database**: PostgreSQL (simple setup)
**API**: REST with TypeScript
**Auth**: JWT tokens (keep it simple)
**Deployment**: Single server or Vercel/Netlify

## TypeScript Standards That Matter

### Essential Rules
- Explicit return types on exported functions
- `strict: true` in tsconfig.json
- No `any` types - use `unknown` with type guards
- Use built-in utility types: `Pick`, `Omit`, `Partial`

### Patterns Claude Code Handles Best
```typescript
// Standard async/await pattern
async function getUser(id: string): Promise<User | null> {
  try {
      const response = await fetch(`/api/users/${id}`);
          if (!response.ok) return null;
              return await response.json();
                } catch (error) {
                    console.error('Failed to fetch user:', error);
                        return null;
                          }
                          }

                          // Simple API response structure
                          interface ApiResponse<T> {
                            data: T;
                              success: boolean;
                                message?: string;
                                }

                                // Clean interface patterns
                                interface User {
                                  readonly id: string;
                                    readonly email: string;
                                      readonly name: string;
                                        readonly createdAt: string;
                                        }

                                        type CreateUser = Omit<User, 'id' | 'createdAt'>;
                                        type UpdateUser = Partial<Pick<User, 'name' | 'email'>>;
                                        ```

                                        ## Project Structure
                                        ```
                                        src/
                                        ├── types/          # Shared TypeScript types
                                        ├── utils/          # Helper functions
                                        ├── api/            # API routes/handlers  
                                        ├── components/     # React components (if applicable)
                                        ├── pages/          # Route handlers
                                        └── index.ts        # Entry point
                                        ```

                                        ## Quality Checks
                                        ```bash
                                        # These run automatically via git hooks
                                        npm run typecheck   # TypeScript validation
                                        npm run lint        # ESLint fixes
                                        npm run test        # Unit tests
                                        npm run build       # Production build
                                        ```

                                        ## Error Handling Strategy
                                        ```typescript
                                        // Keep error handling simple and predictable
                                        async function saveUser(user: CreateUser): Promise<{ success: boolean; error?: string }> {
                                          try {
                                              const result = await db.user.create({ data: user });
                                                  return { success: true };
                                                    } catch (error) {
                                                        console.error('Save user failed:', error);
                                                            return { success: false, error: 'Failed to save user' };
                                                              }
                                                              }

                                                              // For APIs, consistent error responses
                                                              app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
                                                                console.error('API Error:', error);
                                                                  res.status(500).json({
                                                                      success: false,
                                                                          message: process.env.NODE_ENV === 'development' ? error.message : 'Internal error'
                                                                            });
                                                                            });
                                                                            ```

                                                                            ## Testing Approach
                                                                            - **Unit tests**: Test your functions (aim for 80%+ coverage)
                                                                            - **Integration tests**: Test API endpoints
                                                                            - **Keep it simple**: Don't over-test, focus on business logic

                                                                            ```typescript
                                                                            // Simple, effective test patterns
                                                                            describe('getUser', () => {
                                                                              test('returns user when found', async () => {
                                                                                  const user = await getUser('123');
                                                                                      expect(user).toMatchObject({ id: '123' });
                                                                                        });

                                                                                          test('returns null when not found', async () => {
                                                                                              const user = await getUser('nonexistent');
                                                                                                  expect(user).toBeNull();
                                                                                                    });
                                                                                                    });
                                                                                                    ```

                                                                                                    ## Development Workflow
                                                                                                    ```bash
                                                                                                    npm run dev         # Start development server
                                                                                                    npm run test:watch  # Run tests in watch mode
                                                                                                    npm run build       # Build for production
                                                                                                    npm run start       # Start production server
                                                                                                    ```

                                                                                                    ## Security Essentials
                                                                                                    - Validate all inputs with Zod schemas
                                                                                                    - Use parameterized queries (Prisma handles this)
                                                                                                    - Hash passwords with bcrypt
                                                                                                    - Validate JWT tokens properly
                                                                                                    - Rate limit API endpoints (express-rate-limit)

                                                                                                    ## Performance Guidelines
                                                                                                    - Bundle size target: <500KB gzipped
                                                                                                    - API responses: <500ms for most endpoints
                                                                                                    - Database queries: Use indexes for common queries
                                                                                                    - Images: Compress and use WebP when possible

                                                                                                    ## Common Commands
                                                                                                    ```bash
                                                                                                    # Database
                                                                                                    npm run db:migrate  # Apply database changes
                                                                                                    npm run db:seed     # Add sample data

                                                                                                    # Development
                                                                                                    npm run lint:fix    # Fix linting issues
                                                                                                    npm run type:check  # Check types only
                                                                                                    npm run clean       # Clean build artifacts
                                                                                                    ```

                                                                                                    ## Code Quality Standards

                                                                                                    ### Simplicity First
                                                                                                    - Choose the simplest solution that meets requirements
                                                                                                    - Avoid premature optimization or overengineering
                                                                                                    - Prefer composition over inheritance
                                                                                                    - Use existing patterns before creating new ones

                                                                                                    ### Duplication Prevention
                                                                                                    - Always check existing implementations before creating new ones
                                                                                                    - Reuse existing utilities, types, and patterns
                                                                                                    - Extract common patterns into shared utilities only when used 3+ times
                                                                                                    - Document existing solutions in this file for Claude reference

                                                                                                    ### Complexity Guidelines
                                                                                                    - Functions should have single responsibility
                                                                                                    - Avoid deeply nested conditionals (max 3 levels)
                                                                                                    - Use early returns to reduce nesting
                                                                                                    - Break complex functions into smaller, focused ones

                                                                                                    ## Architecture Patterns

                                                                                                    ### Before Adding New Code
                                                                                                    1. Check if similar functionality exists in the codebase
                                                                                                    2. Verify the new feature aligns with existing patterns
                                                                                                    3. Consider extending existing components rather than creating new ones

                                                                                                    ### Existing Components/Modules
                                                                                                    - Authentication: `src/auth/` - JWT-based with refresh tokens
                                                                                                    - API Layer: `src/api/` - REST endpoints with TypeScript
                                                                                                    - Utilities: `src/utils/` - Common helper functions
                                                                                                    - Types: `src/types/` - Shared TypeScript definitions

                                                                                                    ## Development Standards

                                                                                                    ### Testing Requirements
                                                                                                    - All new functions must have unit tests
                                                                                                    - Integration tests for API endpoints
                                                                                                    - E2E tests for user-facing features
                                                                                                    - Run `npm test` before any commit

                                                                                                    ### Code Review Checklist
                                                                                                    - [ ] Follows existing patterns
                                                                                                    - [ ] Has appropriate tests
                                                                                                    - [ ] Includes JSDoc comments
                                                                                                    - [ ] No duplicate functionality
                                                                                                    - [ ] Handles errors appropriately

                                                                                                    ## Tools That Help Claude Code
                                                                                                    - **ESLint**: Catches issues before Claude Code sees them
                                                                                                    - **Prettier**: Consistent formatting
                                                                                                    - **Husky**: Git hooks for quality
                                                                                                    - **TypeScript strict mode**: Better error catching
                                                                                                    - **Simple folder structure**: Easy for Claude Code to navigate

                                                                                                    ## Required MCP Integrations

                                                                                                    These MCP (Model Context Protocol) servers are REQUIRED for optimal Claude Code functionality:

                                                                                                    ### Essential MCPs
                                                                                                    1. **context7** - Advanced codebase understanding (reduces errors by 40%)
                                                                                                       - Provides deep project context and dependency analysis
                                                                                                          - Prevents outdated patterns and duplicate implementations
                                                                                                             - Install: `claude mcp add context7 -s user -- npx @context7/mcp-server`

                                                                                                             2. **typescript-lsp** - Real-time TypeScript analysis
                                                                                                                - Type checking and language server integration
                                                                                                                   - Catches type errors before they reach the codebase
                                                                                                                      - Install: `claude mcp add typescript-lsp -s user -- npx @typescript/mcp-server`

                                                                                                                      3. **github** - Repository integration
                                                                                                                         - Direct PR and issue management
                                                                                                                            - Streamlines development workflow
                                                                                                                               - Install: `claude mcp add github -s user -- npx @modelcontextprotocol/server-github`

                                                                                                                               4. **sentry** - Error tracking and monitoring
                                                                                                                                  - Real-time visibility into production issues
                                                                                                                                     - Performance bottleneck identification
                                                                                                                                        - Critical for maintaining reliable TypeScript applications
                                                                                                                                           - Install: `claude mcp add sentry -s user -- npx @sentry/mcp-server`

                                                                                                                                           5. **playwright** - E2E testing and browser automation
                                                                                                                                              - Cross-browser testing capabilities
                                                                                                                                                 - UI component validation
                                                                                                                                                    - Essential for frontend TypeScript projects
                                                                                                                                                       - Install: `claude mcp add playwright -s user -- npx @playwright/mcp-server`

                                                                                                                                                       6. **docker** - Container management
                                                                                                                                                          - Build, run, and manage Docker containers
                                                                                                                                                             - Critical for microservices and deployment
                                                                                                                                                                - Streamlines containerized development workflows
                                                                                                                                                                   - Install: `claude mcp add docker -s user -- npx @docker/mcp-server`

                                                                                                                                                                   7. **postgresql** - Database access
                                                                                                                                                                      - Direct PostgreSQL connection with schema introspection
                                                                                                                                                                         - Query execution and data management
                                                                                                                                                                            - Essential for backend TypeScript projects
                                                                                                                                                                               - Install: `claude mcp add postgresql -s user -- npx @modelcontextprotocol/server-postgres`

                                                                                                                                                                               **Why These MCPs are Essential**: 
                                                                                                                                                                               - **Sentry**: Runtime errors that escape type checking can be catastrophic. Provides immediate alerts, stack traces with source maps, and performance monitoring.
                                                                                                                                                                               - **Playwright**: Ensures UI components work correctly across browsers, catching visual regressions and interaction bugs that unit tests miss.
                                                                                                                                                                               - **Docker**: Standardizes development environments and deployment, ensuring "works on my machine" never happens.
                                                                                                                                                                               - **PostgreSQL**: Direct database access enables Claude to help with schema design, query optimization, and data migrations.

                                                                                                                                                                               Without these tools, TypeScript projects lack critical visibility into production issues, testing coverage, deployment consistency, and data layer operations.

                                                                                                                                                                               ## What to Avoid
                                                                                                                                                                               - Complex architectural patterns (microservices, CQRS, event sourcing)
                                                                                                                                                                               - Custom build tools (stick to Vite, Next.js, or similar)
                                                                                                                                                                               - Over-engineering (YAGNI principle)
                                                                                                                                                                               - Deep inheritance hierarchies
                                                                                                                                                                               - Overly complex type manipulations

                                                                                                                                                                               ---

                                                                                                                                                                               *Optimized for solo developers and small teams using Claude Code for maximum productivity with minimal complexity.*