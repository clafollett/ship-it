# ShipIt Feature Ideas

A brainstorm of potential features to make ShipIt more powerful, safer, and easier to use.

---

## Workflow & Intelligence

### 1. Iterative Refinement via Slack Threads

Let developers reply in a Slack thread to refine AI output before a PR is created. For example: "Make that function async," or "Add error handling for the null case." The AI maintains context from the original request and applies incremental changes to the working branch.

**Why it matters:** Most tasks require a few rounds of back-and-forth. Right now, each request is fire-and-forget, producing a single PR. Thread-based iteration would let developers direct the AI like a junior engineer, converging on the right solution before review.

### 2. Codebase Context Retrieval (RAG)

Before generating code, index the target repository and retrieve relevant files (types, utilities, patterns, config) so Claude understands the existing codebase. Use embeddings or file-tree heuristics to pull in only the most relevant context.

**Why it matters:** The current zero-context approach means Claude invents its own patterns instead of following what the repo already does. Even basic awareness of existing types and helpers would dramatically improve output quality.

### 3. Pre-PR Validation Pipeline

Run the repo's test suite, linter, and type checker locally *before* creating the PR. If checks fail, let Claude auto-fix and retry up to a configurable number of attempts. Only open a PR once everything passes.

**Why it matters:** Opening a PR that immediately fails CI wastes reviewer attention and erodes trust. Catching failures before the PR exists makes ShipIt feel reliable.

### 4. PR Review Feedback Loop

When a reviewer leaves comments on a ShipIt-generated PR, the bot picks up the feedback, generates fixes, and pushes follow-up commits. The developer stays in reviewer mode without ever touching the code.

**Why it matters:** This completes the vision of "developer as reviewer." Today, if the AI gets something 80% right, a human still has to write the remaining 20%. With this feature, the human just keeps reviewing until it's done.

### 5. Multi-Step Task Plans

For complex requests, have Claude produce a plan first (broken into ordered subtasks), post it to Slack for approval, then execute each step in sequence. Developers can edit, reorder, or remove steps before execution begins.

**Why it matters:** Large tasks are risky as a single shot. A plan step gives developers visibility and control, and produces smaller, more reviewable commits.

---

## Developer Experience

### 6. `/shipit status` Command

Show all active and recent tasks: what's in progress, what PRs are open, what succeeded or failed. A quick status check without leaving Slack.

### 7. Emoji Reactions as Controls

Use Slack emoji reactions for lightweight task management:

- :eyes: Watch a task (get DM updates)
- :x: Cancel a running task
- :rocket: Auto-merge when CI passes
- :repeat: Retry a failed task

**Why it matters:** Reduces friction to a single click instead of typing commands.

### 8. Task Templates

Predefined templates for common requests like "add CRUD endpoints for resource X," "write unit tests for file Y," or "add OpenAPI docs for endpoint Z." Invoked via:

```
/shipit template crud --resource users --fields name,email,role
```

**Why it matters:** Standardized tasks produce more consistent results and reduce prompt engineering burden on developers.

### 9. Dry Run Mode

`/shipit dry-run <instruction>` shows what files would be changed and a diff preview in Slack *without* creating a branch or PR. Helps developers evaluate whether a request is well-scoped before committing to it.

### 10. Personal Defaults

Let each user configure their own default repo, branch, and preferred AI model via `/shipit config`. Stored per Slack user ID. Reduces friction for developers who always work in the same repo.

---

## Observability & Analytics

### 11. Web Dashboard

A lightweight web UI showing:

- Task history with status and links to PRs
- Success/failure rates over time
- Average time-to-merge for AI-generated PRs
- Most active repositories and users
- API cost tracking (token usage per task)

### 12. Task Analytics & Learning

Track which types of tasks succeed vs. get rejected in review. Surface insights:

- "Bug fix tasks have a 70% merge rate; refactor tasks have 35%"
- "Tasks targeting repo X tend to fail — consider improving context retrieval for that repo"
- Warning prompts: "Tasks like this historically have low merge rates. Consider being more specific."

### 13. Cost Tracking

Log Anthropic API token usage per task and expose it in:

- The Slack completion message ("This task used ~12K tokens, est. $0.04")
- The web dashboard (aggregated by team, repo, time period)

**Why it matters:** Teams need to budget AI spend and identify unexpectedly expensive requests.

---

## Security & Governance

### 14. Repository & Branch Allowlist

Admins configure which repositories and branches ShipIt is permitted to target. Prevents accidental PRs against production branches, sensitive repos, or repos without proper test coverage.

```
ALLOWED_REPOS=org/frontend,org/backend,org/shared-libs
BLOCKED_BRANCHES=main,release/*
```

### 15. Approval Gates

For certain repos or task types, require a second Slack user to approve before execution begins. A lightweight governance layer for critical codebases, implemented as a Slack button prompt sent to a designated approver or channel.

### 16. Diff Size Limits

Reject or warn on tasks that produce changes above a configurable threshold (e.g., >500 lines changed). Large AI-generated diffs are difficult to review and risky to merge. If a task exceeds the limit, ShipIt posts the plan and suggests breaking it into smaller tasks.

---

## Integrations

### 17. Jira / Linear Issue Linking

Accept a Jira or Linear ticket URL as input, pull the title and description, and use it as task context. Auto-link the resulting PR back to the ticket and transition the ticket status.

```
/shipit https://linear.app/team/ENG-1234
```

### 18. Slack-to-GitHub Issue Bridge

`/shipit issue <description>` creates a GitHub issue instead of a PR. Useful when a request needs human design work or discussion before code generation. The issue includes a "Generate with ShipIt" button for later execution.

### 19. Discord / Teams Support

Abstract the chat integration layer behind an interface so ShipIt can run on Slack, Discord, or Microsoft Teams. The core orchestration and AI logic stay the same — only the messaging adapter changes.

### 20. Notification Preferences

Let users choose how they're notified about task progress: DM, channel message, or thread reply. Option to get notified when CI finishes on a ShipIt-generated PR (via GitHub webhook integration).

---

## Implementation Priority Suggestion

| Priority | Features | Rationale |
|----------|---------|-----------|
| **P0** | Codebase Context (2), Pre-PR Validation (3) | Directly improves output quality and trust |
| **P1** | Thread Refinement (1), PR Feedback Loop (4), Status Command (6) | Completes the core developer loop |
| **P2** | Dry Run (9), Repo Allowlist (14), Diff Limits (16), Cost Tracking (13) | Safety and visibility |
| **P3** | Dashboard (11), Templates (8), Issue Linking (17), Task Plans (5) | Power-user and team features |
| **P4** | Analytics (12), Emoji Controls (7), Discord/Teams (19), Approval Gates (15) | Nice to have |
