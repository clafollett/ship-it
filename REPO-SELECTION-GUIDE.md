# Repository and Branch Selection Guide

This guide explains how to select different repositories and branches when using ShipIt.

## Overview

ShipIt now supports targeting different repositories and branches for each request. You can:
- Use the default repository/branch (configured in `.env`)
- Specify a custom repository/branch per request

## User Interface

### Step 1: Send Your Request

In Slack, mention ShipIt or use the slash command:

```
@ShipIt Add user authentication to the login page
```

or

```
/shipit Add error handling to the payment service
```

### Step 2: Select Repository

ShipIt will respond with an interactive prompt:

```
┌────────────────────────────────────────────────┐
│ Got it! Let me know which repository and       │
│ branch to target:                              │
│                                                 │
│ Task: Add user authentication to the login page│
│                                                 │
│ Default: myorg/frontend → main                 │
│                                                 │
│ [ ✓ Use Default ]  [ ⚙️ Specify Different ]   │
└────────────────────────────────────────────────┘
```

### Option A: Use Default Repository

Click **"✓ Use Default"** to immediately start the task with your configured repository and branch.

**Response:**
```
✅ Working on: "Add user authentication to the login page"
Repository: myorg/frontend → main
```

### Option B: Specify Different Repository

Click **"⚙️ Specify Different"** to open a modal where you can specify:

```
┌─────────────────────────────────────────┐
│  Select Repository                      │
├─────────────────────────────────────────┤
│  Task: Add user authentication to the   │
│        login page                        │
├─────────────────────────────────────────┤
│  Repository Owner                       │
│  ┌───────────────────────────────────┐ │
│  │ myorg                             │ │
│  └───────────────────────────────────┘ │
│  e.g., myorg or myusername             │
│                                         │
│  Repository Name                        │
│  ┌───────────────────────────────────┐ │
│  │ auth-service                      │ │
│  └───────────────────────────────────┘ │
│  e.g., my-repo                         │
│                                         │
│  Base Branch (PR target)               │
│  ┌───────────────────────────────────┐ │
│  │ develop                           │ │
│  └───────────────────────────────────┘ │
│  e.g., main or develop                 │
│                                         │
│  💡 A new working branch will be       │
│     created and a PR will be opened to │
│     merge into the base branch.        │
│                                         │
│           [ Cancel ]  [ Submit ]       │
└─────────────────────────────────────────┘
```

After submitting, ShipIt confirms:

```
✅ Working on: "Add user authentication to the login page"
Repository: myorg/auth-service → develop
```

## What Happens Next

Regardless of which option you choose, ShipIt will:

1. **Create a new working branch** in the specified repository
   - Branch name: `ai-task/add-user-authentication-login-page-1707915842000`

2. **Generate code** using Claude AI

3. **Commit and push** changes to the working branch

4. **Create a pull request** targeting your specified base branch

5. **Notify you** in Slack with the PR link

## Example Scenarios

### Scenario 1: Working on Main Project

```
@ShipIt Add API endpoint for user profile
→ Click "Use Default" 
→ PR created in myorg/frontend → main
```

### Scenario 2: Working on Microservice

```
@ShipIt Fix authentication bug
→ Click "Specify Different"
→ Enter: myorg / auth-service / develop
→ PR created in myorg/auth-service → develop
```

### Scenario 3: Working on Feature Branch

```
@ShipIt Add tests for payment flow
→ Click "Specify Different"  
→ Enter: myorg / payment-service / feature/v2-api
→ PR created in myorg/payment-service → feature/v2-api
```

### Scenario 4: Contributing to Another Organization

```
@ShipIt Add TypeScript types
→ Click "Specify Different"
→ Enter: open-source-org / library-name / main
→ PR created in open-source-org/library-name → main
```

## Configuration

### Default Repository

Set your default repository in `.env`:

```env
GITHUB_OWNER=myorg
GITHUB_REPO=frontend
DEFAULT_BRANCH=main
```

This will be used when you click "Use Default".

### Access Permissions

Make sure your `GITHUB_TOKEN` has access to all repositories you want to target. The token needs:
- `repo` scope (full control of private repositories)
- Read/write access to the repositories

## Tips

1. **Use Default for Common Tasks**: If 90% of your work is on one repository, configure that as your default for quick access.

2. **Bookmark Repositories**: Keep a note of frequently used repository/branch combinations.

3. **Branch Protection**: Set up branch protection rules on your repositories - ShipIt creates PRs, so protected branches work perfectly!

4. **Multiple Instances**: If you work with completely separate ecosystems, you can run multiple ShipIt instances with different default configurations.

## Troubleshooting

**Modal doesn't open?**
- Check that your Slack app has the necessary permissions
- Try using the slash command instead of mention
- Make sure Socket Mode is enabled

**"Repository not found" error?**
- Verify the repository owner and name are correct
- Ensure your GitHub token has access to the repository
- Check if the repository is public or private

**"Branch not found" error?**
- Make sure the base branch exists in the repository
- Check for typos in the branch name
- Remember branch names are case-sensitive

---

Need help? Check the [TROUBLESHOOTING.md](TROUBLESHOOTING.md) guide or open an issue!
