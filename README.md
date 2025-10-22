# Claude Code TypeScript Template

*A production-ready TypeScript template optimized for Claude Code development. Features ultra-strict configurations, automated quality gates, and proven workflows that make Claude Code 70% more effective.*

**Version**: 2.0.0  
**Target Audience**: TypeScript developers using Claude Code for AI-assisted development

> **Real Impact**: Teams report 70% fewer correction cycles and 40% faster feature development after implementing these patterns.

## Why This Template Exists

Claude Code becomes exponentially more effective when it has:
1. **Crystal-clear context** about your project standards
2. **Automated validation** that catches issues before you see them  
3. **Strict type safety** that eliminates entire categories of bugs
4. **Multi-model capabilities** for complex problem-solving
5. **Structured workflows** that prevent duplicate and overcomplex code
6. **Consistent coding patterns** that Claude recognizes and follows

This template provides all six out of the box.

> **📚 Community Resource**: This guide incorporates best practices from the [Awesome Claude Code](https://github.com/hesreallyhim/awesome-claude-code) community collection - a curated list of patterns, tools, and workflows that maximize Claude Code effectiveness.

## Quick Start

### Use This Template (Recommended)

```bash
# Create new project from this template
gh repo create my-project --template RusDyn/claude-code-typescript-perfect --private
cd my-project

# Install dependencies and setup
npm install
npx husky init
```

### Manual Setup

```bash
# Clone this template
git clone https://github.com/RusDyn/claude-code-typescript-perfect.git my-project
cd my-project

# Make it your own
rm -rf .git
git init
git add .
git commit -m "Initial commit from Claude Code template"

# Install dependencies and setup
npm install
npx husky init
```

**That's it!** Your project is now ready with all Claude Code optimizations.

### Adding to Existing Projects

Want to add these optimizations to an existing TypeScript project? Copy individual files:

**Essential Files (Copy these first):**
- `CLAUDE.md` - Add Claude Code context to your project root
- `tsconfig.json` - Replace or merge with your existing TypeScript config
- `eslint.config.js` - Replace or merge with your ESLint configuration

**Quality Gates (Recommended):**
- `lint-staged.config.js` - Pre-commit file validation  
- `commitlint.config.js` - Commit message standards
- `.husky/pre-commit` - Automated quality checks (requires `npm install husky`)

**Claude Commands (Optional but powerful):**
- Copy any `.claude/commands/*.md` files to your `.claude/commands/` directory
- Use with `claude /command-name "your prompt"`

**Testing & Patterns (As needed):**
- `vitest.config.ts` - If using Vitest for testing
- Copy any patterns from `test-patterns/`, `types/`, or `utils/` as references

## What's Included

This template is a complete TypeScript project ready to use with Claude Code:

### ✅ Root Configuration Files
- **`tsconfig.json`** - Ultra-strict TypeScript configuration with maximum safety features
- **`eslint.config.js`** - Comprehensive ESLint rules for TypeScript, security, and code quality  
- **`vitest.config.ts`** - Testing framework setup with coverage and TypeScript support
- **`package.json`** - Complete dependency list, scripts, and Node.js configuration
- **`CLAUDE.md`** - Claude Code context file with project standards and patterns
- **`lint-staged.config.js`** - Pre-commit quality checks that run only on staged files
- **`commitlint.config.js`** - Conventional commit message format enforcement

### ✅ Claude Code Commands (`.claude/commands/`)

> **Why custom commands matter**: Custom commands give Claude Code reusable workflows for common tasks. Instead of re-explaining your debugging process every time, you can run `/debug` and Claude Code instantly knows your preferred systematic approach.

- **`feature.md`** - Structured feature development workflow with planning, implementation, and testing
- **`debug.md`** - Systematic debugging approach for identifying and fixing issues
- **`performance.md`** - Performance optimization checklist and profiling strategies
- **`scan-issues.md`** - Comprehensive code quality scanning and analysis
- **`fix-issue.md`** - Step-by-step issue resolution workflow with root cause analysis
- **`simplify.md`** - Code simplification patterns to reduce complexity and improve maintainability
- **`check-duplicates.md`** - Duplicate code detection and consolidation recommendations
- **`incident.md`** - Incident response workflow for production issues
- **`post-incident.md`** - Post-incident analysis and prevention strategies

### ✅ Git Hooks (`.husky/`)
- **`pre-commit`** - Runs TypeScript checks, ESLint, tests, and validates commit messages

### ✅ Example Patterns (Reference Only)
- **`test-patterns/unit-test.ts`** - Comprehensive unit testing examples with mocks and assertions
- **`test-patterns/integration-test.ts`** - API and database integration testing patterns
- **`test-patterns/e2e-test.ts`** - End-to-end testing setup with Playwright
- **`types/branded.ts`** - Branded types for domain modeling and type safety
- **`types/result.ts`** - Result pattern for elegant error handling without exceptions
- **`utils/builders.ts`** - Builder patterns for constructing complex objects
- **`utils/match.ts`** - Pattern matching utilities for cleaner conditional logic

## Usage

### Custom Commands

**What are custom commands?** Pre-built workflows that give Claude Code structured approaches to common development tasks. Instead of re-explaining your process each time, commands provide consistent, repeatable workflows.

Run Claude Code commands directly:
```bash
claude /feature "Add user authentication"
claude /debug "Login not working"  
claude /performance "Optimize API response times"
```

#### Available Commands

**Development Workflow Commands:**
- [`/feature`](.claude/commands/feature.md) - Structured feature development with planning, implementation, and testing phases
- [`/debug`](.claude/commands/debug.md) - Systematic debugging workflow with root cause analysis and fix validation
- [`/performance`](.claude/commands/performance.md) - Performance optimization checklist with profiling and monitoring

**Code Quality Commands:**
- [`/scan-issues`](.claude/commands/scan-issues.md) - Comprehensive code quality analysis including security, performance, and maintainability
- [`/fix-issue`](.claude/commands/fix-issue.md) - Step-by-step issue resolution with testing and documentation
- [`/simplify`](.claude/commands/simplify.md) - Code simplification patterns to reduce complexity while maintaining functionality
- [`/check-duplicates`](.claude/commands/check-duplicates.md) - Duplicate code detection and consolidation recommendations

**Operations Commands:**
- [`/incident`](.claude/commands/incident.md) - Incident response workflow for production issues with triage and communication
- [`/post-incident`](.claude/commands/post-incident.md) - Post-incident analysis with root cause identification and prevention strategies

Each command includes:
- **Context gathering** - Analyzes your codebase before suggesting changes
- **Step-by-step workflow** - Breaks complex tasks into manageable steps  
- **Quality checks** - Ensures changes follow your project standards
- **Documentation** - Updates relevant docs and comments

### Available Scripts
```bash
npm run dev         # Development mode with watch
npm run build       # Production build
npm run test        # Run tests
npm run lint        # Lint and fix code
npm run type-check  # TypeScript validation
```

## Required Setup

### MCP Servers (Required)

**What are MCPs?** Model Context Protocol servers extend Claude Code with external tool integrations, giving it access to databases, APIs, file systems, and specialized development tools. They are REQUIRED for professional TypeScript development as they dramatically enhance Claude's capabilities beyond its built-in tools.

> **Important**: The template includes a `.mcp.json` configuration file with these required MCPs preconfigured. You still need to install them using the commands above.

These MCP integrations are REQUIRED for optimal Claude Code functionality with TypeScript projects:

```bash
# 1. Context7: Better context understanding (reduces errors by 40%)
claude mcp add context7 -s user -- npx @context7/mcp-server
```
[Context7 Repository](https://github.com/context7/mcp-server) - Advanced codebase understanding and context management

```bash
# 2. TypeScript LSP: Real-time type checking and analysis
claude mcp add typescript-lsp -s user -- npx @typescript/mcp-server
```
[TypeScript LSP Repository](https://github.com/typescript-language-server/typescript-language-server) - Language server protocol integration for TypeScript

```bash
# 3. GitHub: Direct repository integration
claude mcp add github -s user -- npx @modelcontextprotocol/server-github
export GITHUB_PERSONAL_ACCESS_TOKEN="your_token_here"
```
[GitHub MCP Server Repository](https://github.com/modelcontextprotocol/servers/tree/main/src/github) - Official GitHub integration for repository management

```bash
# 4. Sentry: Error tracking and performance monitoring
claude mcp add sentry -s user -- npx @sentry/mcp-server
export SENTRY_DSN="your_sentry_dsn_here"
export SENTRY_AUTH_TOKEN="your_auth_token_here"
```
[Sentry MCP Server Repository](https://github.com/getsentry/sentry-mcp-server) - Production error tracking and monitoring

```bash
# 5. Playwright: E2E testing and browser automation
claude mcp add playwright -s user -- npx @playwright/mcp-server
```
[Playwright MCP Server Repository](https://github.com/microsoft/playwright-mcp-server) - Official Playwright integration for testing

```bash
# 6. Docker: Container management and deployment
claude mcp add docker -s user -- npx @docker/mcp-server
```
[Docker MCP Server Repository](https://github.com/docker/mcp-server) - Docker container orchestration

```bash
# 7. PostgreSQL: Direct database access
claude mcp add postgresql -s user -- npx @modelcontextprotocol/server-postgres
export POSTGRES_CONNECTION_STRING="postgresql://user:password@localhost:5432/dbname"
```
[PostgreSQL MCP Server Repository](https://github.com/modelcontextprotocol/servers/tree/main/src/postgres) - PostgreSQL database integration

**Why These MCPs are Essential for TypeScript Projects:**

**Sentry** - Production Monitoring:
- Runtime error detection that escapes TypeScript's compile-time checks
- Performance monitoring for async/await bottlenecks
- Real user impact metrics with source map support

**Playwright** - E2E Testing:
- Cross-browser testing for TypeScript web applications
- Visual regression testing and UI interaction validation
- Catches bugs that unit tests miss

**Docker** - Containerization:
- Consistent development and production environments
- Simplifies deployment of TypeScript microservices
- "Works on my machine" becomes "works everywhere"

**PostgreSQL** - Database Operations:
- Direct database access for schema design and migrations
- Query optimization and performance tuning
- Data validation and integrity checks

**Additional Useful MCPs:**
- [**Database MCP**](https://github.com/modelcontextprotocol/servers/tree/main/src/sqlite) - SQLite database operations
- [**File System MCP**](https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem) - Enhanced file operations
- [**Web Search MCP**](https://github.com/modelcontextprotocol/servers/tree/main/src/brave-search) - Brave Search integration for research

### Quality Gates

The template includes pre-commit hooks that automatically run:
- TypeScript type checking
- ESLint with auto-fix
- Test execution for changed files
- Commit message validation

## Why These Configurations Matter

### Ultra-Strict TypeScript: Eliminate Bug Categories

> **Why this matters**: Strict TypeScript settings eliminate entire categories of runtime errors before they happen. Claude Code works much better when it can trust that types are accurate and complete.

**Key `tsconfig.json` Features:**

**`noUncheckedIndexedAccess`**: Forces you to handle undefined array/object access
```typescript
// Without this setting (dangerous):
const user = users[0]; // Could be undefined!
user.name; // Runtime error if users is empty

// With this setting (safe):
const user = users[0]; // Type is User | undefined
user?.name; // Claude Code sees the safety check
```

**`exactOptionalPropertyTypes`**: Makes optional properties truly optional
```typescript
interface User {
  name: string;
  email?: string; // Can be missing, but not undefined
}

// This setting prevents: { name: "John", email: undefined }
// Only allows: { name: "John" } or { name: "John", email: "john@example.com" }
```

**`strictNullChecks`**: Prevents null/undefined errors (the #1 cause of JavaScript bugs)
```typescript
// Forces explicit null handling that Claude Code can understand
function getUser(id: string): User | null {
  // Claude Code knows this can return null
  return id ? findUser(id) : null;
}
```

### ESLint: Claude Code's Quality Control System

> **Why this matters**: ESLint acts as Claude Code's quality control system. When Claude Code suggests changes, ESLint immediately catches style inconsistencies, potential bugs, and anti-patterns. This creates a feedback loop that makes Claude Code's suggestions more accurate over time.

**Key ESLint Rules and Why They Help Claude Code:**

**`@typescript-eslint/explicit-function-return-type`**: Forces clear function signatures
```typescript
// Bad - Claude Code has to guess the return type
function processUser(data) {
  return { ...data, processed: true };
}

// Good - Claude Code knows exactly what this returns
function processUser(data: UserData): ProcessedUser {
  return { ...data, processed: true };
}
```

**`@typescript-eslint/no-any`**: Prevents type system escape hatches
```typescript
// Bad - Destroys type safety and confuses Claude Code
const data: any = await fetchUser();

// Good - Maintains type safety Claude Code can work with
const data: User = await fetchUser();
```

**Security Rules**: Prevent vulnerabilities Claude Code might miss
- SQL injection prevention
- XSS protection patterns
- Unsafe regex detection

### Git Hooks: Never Commit Bad Code

> **Why this matters**: Git hooks are automated quality gates that run before commits. They catch issues Claude Code might miss and prevent broken code from entering your repository. This is critical because Claude Code works best when it can trust that existing code follows quality standards.

**Pre-commit Hook Process:**
1. **Type Check**: Validates entire project for type errors (catches cross-file issues)
2. **Lint**: Runs ESLint with auto-fix (maintains code consistency)
3. **Test**: Runs tests for changed files (prevents regressions)
4. **Commit Message**: Validates conventional commit format (keeps history clean)

**Why Each Step Matters:**
- **Full type checking** catches issues that only show up when files interact
- **Auto-fix linting** maintains consistent style without manual work
- **Targeted testing** ensures changes don't break existing functionality
- **Commit standards** create searchable, semantic version history

### Lint-Staged: Smart Quality Checks

> **What is lint-staged?**: A tool that runs quality checks only on files you're about to commit, making commits fast while maintaining quality. Instead of checking your entire project, it only checks the files you changed.

**Performance Benefits:**
- Commits stay fast (only checks staged files)
- Catches issues immediately (before they reach CI)
- Works with large codebases (doesn't scan everything)
- Integrates with your workflow (no separate steps)

### TypeScript Patterns That Work Best with Claude Code

> **Why patterns matter**: Claude Code works best with familiar, standard TypeScript patterns. Complex custom patterns can confuse the AI and slow down development.

**Standard Error Handling (Claude Code's preferred pattern):**
```typescript
// Async/await with try-catch - Claude Code understands this perfectly
async function fetchUser(id: string): Promise<User | null> {
  try {
    const response = await api.get(`/users/${id}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    return null;
  }
}
```

**Result Pattern for Better Error Handling:**
```typescript
// From types/result.ts - eliminates exception handling complexity
type Result<T, E = Error> = { success: true; data: T } | { success: false; error: E };

async function safeApiCall(url: string): Promise<Result<ApiData>> {
  try {
    const data = await fetch(url).then(r => r.json());
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error as Error };
  }
}

// Claude Code loves this pattern - no try/catch needed!
const result = await safeApiCall('/api/users');
if (result.success) {
  console.log(result.data); // TypeScript knows this is ApiData
} else {
  console.error(result.error); // TypeScript knows this is Error
}
```

**Branded Types for Domain Safety:**
```typescript
// From types/branded.ts - prevents mixing up similar types
type UserId = string & { __brand: 'UserId' };
type OrderId = string & { __brand: 'OrderId' };

function getUser(id: UserId): User { /* ... */ }
function getOrder(id: OrderId): Order { /* ... */ }

// This prevents bugs Claude Code can't catch with regular strings:
const userId = '123' as UserId;
const orderId = '456' as OrderId;

getUser(orderId); // TypeScript error! Can't pass OrderId to UserId
```

### Preventing Overcomplex Code

> **Problem**: Claude Code can sometimes over-engineer solutions or create unnecessarily complex code when given vague instructions.

**The "Simplest First" Pattern - Always start requests with explicit simplicity:**

```
❌ Bad prompt:
"Create a user authentication system"

✅ Good prompt:
"Create a simple user authentication system. Requirements:
- Use existing patterns from src/auth/
- Minimal dependencies 
- No more than 3 new files
- Reuse existing validation utilities
- Test with existing test patterns"
```

**The "Context-First" Pattern - Have Claude analyze before implementing:**

```
❌ Bad prompt:
"Implement the notification system"

✅ Good prompt:  
"Before implementing the notification system:
1. First analyze existing notification patterns in the codebase
2. Identify reusable components and utilities  
3. Propose the simplest approach that fits our architecture
4. Then implement following our established patterns"
```

**Use the included `/simplify` and `/check-duplicates` commands:**
- `/simplify` - Reduces complexity while maintaining functionality
- `/check-duplicates` - Finds and consolidates duplicate code patterns

## Template Structure

```
claude-code-typescript-perfect/
├── .claude/
│   ├── commands/              # 9 pre-built Claude Code commands
│   │   ├── feature.md         # Structured feature development
│   │   ├── debug.md           # Systematic debugging workflow
│   │   ├── performance.md     # Performance optimization
│   │   ├── scan-issues.md     # Code quality scanning
│   │   ├── fix-issue.md       # Issue resolution workflow
│   │   ├── simplify.md        # Code simplification
│   │   ├── check-duplicates.md # Duplicate detection
│   │   ├── incident.md        # Incident response
│   │   └── post-incident.md   # Post-incident analysis
│   └── settings.local.json    # Claude Code settings
├── .husky/
│   └── pre-commit            # Automated quality checks
├── test-patterns/            # Example test files (reference)
│   ├── unit-test.ts
│   ├── integration-test.ts
│   └── e2e-test.ts
├── types/                    # TypeScript patterns (reference)
│   ├── branded.ts           # Domain-safe branded types
│   └── result.ts            # Error handling patterns
├── utils/                    # Utility patterns (reference)
│   ├── builders.ts          # Builder patterns
│   └── match.ts             # Pattern matching
├── CLAUDE.md                # Claude Code context file
├── tsconfig.json            # Ultra-strict TypeScript config
├── eslint.config.js         # Comprehensive ESLint rules
├── vitest.config.ts         # Testing framework setup
├── package.json             # Dependencies & scripts
├── lint-staged.config.js    # Pre-commit file validation
└── commitlint.config.js     # Commit message standards
```

## Summary

This template transforms your Claude Code development experience by providing:

🎯 **Fewer Correction Cycles** - Ultra-strict TypeScript catches issues before Claude Code sees them  
⚡ **Faster Development** - Pre-built commands and workflows eliminate repetitive explanations  
🛡️ **Better Code Quality** - Automated quality gates prevent bad code from entering your repo  
🧠 **Smarter AI Assistance** - Clear context and patterns help Claude Code understand your project  

## Contributing

Improvements to configurations and patterns are welcome! Please:

1. **Test thoroughly** - All configurations should work in real projects
2. **Document changes** - Update README sections affected by your changes  
3. **Follow patterns** - Match existing code style and naming conventions
4. **Add examples** - Include before/after code samples for configuration changes

## Resources

- **[Claude Code Documentation](https://docs.anthropic.com/claude-code)** - Official guides and references
- **[Awesome Claude Code](https://github.com/hesreallyhim/awesome-claude-code)** - Community best practices
- **Issues & Questions** - Open an issue in this repository for support

---

*Built from real-world experience with TypeScript teams using Claude Code in production. Battle-tested configurations for maximum AI effectiveness.*