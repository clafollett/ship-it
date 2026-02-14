# Example Usage Scenarios for ShipIt

This document provides real-world examples of how to use ShipIt for various development tasks.

## Basic Examples

### 1. Adding a New Feature

**Slack Message:**
```
@ShipIt Add a new REST API endpoint for fetching user profile data
```

**What ShipIt Does:**
1. Creates a new branch: `ai-task/add-rest-api-endpoint-user-profile-1707915842000`
2. Generates code for the endpoint
3. Creates necessary files (controller, route, types)
4. Commits and pushes
5. Creates a PR

**Example PR:**
```markdown
## AI-Generated Changes

**Task Type:** feature

### Description
Add a new REST API endpoint for fetching user profile data

### Changes Made
- Created `src/controllers/userProfile.ts`
- Updated `src/routes/api.ts` with new endpoint
- Added TypeScript types in `src/types/user.ts`

### Files Modified
- CREATE: `src/controllers/userProfile.ts`
- MODIFY: `src/routes/api.ts`
- MODIFY: `src/types/user.ts`
```

### 2. Fixing a Bug

**Slack Message:**
```
@ShipIt Fix the null pointer error in the payment processing module
```

**What ShipIt Does:**
1. Analyzes the task as a bug fix
2. Generates code that adds null checks
3. Updates error handling
4. Creates PR with the fix

### 3. Refactoring Code

**Slack Message:**
```
@ShipIt Refactor the database connection code to use connection pooling
```

**What ShipIt Does:**
1. Identifies this as a refactoring task
2. Generates improved code structure
3. Maintains existing functionality
4. Creates PR with refactored code

### 4. Adding Tests

**Slack Message:**
```
@ShipIt Add unit tests for the authentication service
```

**What ShipIt Does:**
1. Identifies this as a test task
2. Generates comprehensive test cases
3. Includes edge cases and error scenarios
4. Creates PR with new test file

## Advanced Examples

### 5. Complex Feature with Multiple Components

**Slack Message:**
```
@ShipIt Create a user authentication system with JWT tokens, including login, logout, and token refresh endpoints
```

**What ShipIt Generates:**
- Authentication middleware
- JWT token utilities
- Login/logout/refresh endpoints
- Type definitions
- Error handling

### 6. Database Migration

**Slack Message:**
```
@ShipIt Add a new 'email_verified' boolean field to the users table with migration script
```

**What ShipIt Generates:**
- Database migration file
- Updated model definitions
- Example queries using new field

### 7. API Documentation

**Slash Command:**
```
/shipit Generate OpenAPI/Swagger documentation for all API endpoints
```

**What ShipIt Generates:**
- OpenAPI specification file
- Documentation for each endpoint
- Request/response examples

### 8. Performance Optimization

**Slack Message:**
```
@ShipIt Optimize the database queries in the user service to reduce response time
```

**What ShipIt Does:**
1. Analyzes existing queries
2. Suggests and implements optimizations
3. Adds indexes if needed
4. Updates code with optimized queries

## Task Type Detection Examples

ShipIt automatically detects the type of task based on keywords:

### Bug Fix Tasks
```
@ShipIt Fix the memory leak in the WebSocket handler
@ShipIt Resolve the error when uploading large files
@ShipIt Debug the issue with session timeout
```

### Feature Tasks
```
@ShipIt Add email notification functionality
@ShipIt Create a dashboard for admin users
@ShipIt Implement rate limiting for API endpoints
```

### Refactor Tasks
```
@ShipIt Refactor the authentication logic to use a service pattern
@ShipIt Clean up the utility functions in the helpers folder
@ShipIt Improve the error handling in the API layer
```

### Test Tasks
```
@ShipIt Add integration tests for the payment flow
@ShipIt Create unit tests for the validation utilities
@ShipIt Write test specs for the user registration process
```

## Context-Aware Examples

### 9. Providing Additional Context

**Slack Message:**
```
@ShipIt Add input validation to the user registration endpoint

The endpoint is in src/controllers/auth.ts and should validate:
- Email format
- Password strength (min 8 chars, one uppercase, one number)
- Username length (3-20 chars)
```

ShipIt uses the context to:
- Find the right file
- Understand specific requirements
- Generate appropriate validation logic

### 10. Working with Specific Files

**Slack Message:**
```
@ShipIt Update the error messages in src/utils/errors.ts to be more user-friendly
```

ShipIt:
- Locates the specific file
- Reviews existing error messages
- Generates improved, user-friendly messages
- Maintains the same structure

## Review Process Examples

### 11. After PR Creation

1. **Review the PR** on GitHub
2. **Check the generated code** for quality
3. **Request changes** if needed (manually)
4. **Merge** when satisfied

### 12. Iterative Refinement

First request:
```
@ShipIt Add a search feature for blog posts
```

After reviewing the PR, if you need changes:
```
@ShipIt Update the blog post search to include fuzzy matching
```

ShipIt will create a new PR building on the concept.

## Best Practices

### ✅ Good Instructions

**Specific:**
```
@ShipIt Add a PUT endpoint at /api/users/:id for updating user profiles, 
including validation for email and name fields
```

**Clear Context:**
```
@ShipIt Fix the bug in src/services/payment.ts where transactions fail 
when the amount is exactly 0
```

**Well-Scoped:**
```
@ShipIt Add error handling to the file upload endpoint to catch 
and log size limit errors
```

### ❌ Instructions to Avoid

**Too Vague:**
```
@ShipIt Make the app better
```

**Too Broad:**
```
@ShipIt Rewrite the entire backend
```

**Unclear:**
```
@ShipIt Do something with the users
```

## Tips for Success

1. **Be Specific**: The more details you provide, the better the results
2. **One Task at a Time**: Break large projects into smaller tasks
3. **Review Carefully**: Always review AI-generated code before merging
4. **Provide Context**: Mention file paths, requirements, or constraints
5. **Iterate**: Don't hesitate to request improvements

## Integration with Development Workflow

### Morning Commute Workflow (Spotify Style)
```
8:00 AM - On the train
@ShipIt Fix the timezone bug in the calendar view

8:15 AM - Still commuting
@ShipIt Add unit tests for the timezone fix

9:00 AM - Arriving at office
- Review PRs created by ShipIt
- Request changes if needed
- Merge approved PRs

9:30 AM - Ready to work
- All fixes deployed
- No code written manually
```

### Sprint Planning Workflow
```
Monday Morning:
- Review sprint tasks
- Convert each task to ShipIt instruction
- Let AI generate initial implementations

Monday Afternoon:
- Review all PRs
- Provide feedback
- Request refinements

Tuesday:
- Merge approved PRs
- Focus on architecture and design
```

## Monitoring and Feedback

After using ShipIt:
1. Track PR quality over time
2. Note which types of tasks work best
3. Refine your instruction style
4. Share successful patterns with team

---

Remember: ShipIt is a tool to augment your development process, not replace your judgment. Always review and test AI-generated code before deploying to production.
