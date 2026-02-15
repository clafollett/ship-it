#!/usr/bin/env bash
# Create GitHub Issues for all ShipIt feature ideas from docs/planning/FEATURE_IDEAS.md
#
# Prerequisites:
#   - gh CLI installed and authenticated (gh auth login)
#   - Run from the repository root
#
# Usage:
#   ./scripts/create-feature-issues.sh

set -euo pipefail

REPO="clafollett/ship-it"

echo "Creating GitHub Issues for ShipIt feature ideas..."
echo "Repository: $REPO"
echo ""

# --- Workflow & Intelligence ---

gh issue create --repo "$REPO" \
  --title "Feature: Iterative Refinement via Slack Threads" \
  --label "enhancement" \
  --body "## Iterative Refinement via Slack Threads

Let developers reply in a Slack thread to refine AI output before a PR is created. For example: \"Make that function async,\" or \"Add error handling for the null case.\" The AI maintains context from the original request and applies incremental changes to the working branch.

**Why it matters:** Most tasks require a few rounds of back-and-forth. Right now, each request is fire-and-forget, producing a single PR. Thread-based iteration would let developers direct the AI like a junior engineer, converging on the right solution before review.

**Priority:** P1
**Category:** Workflow & Intelligence

_From [FEATURE_IDEAS.md](docs/planning/FEATURE_IDEAS.md) item #1_"

echo "✅ Created issue: Iterative Refinement via Slack Threads"

gh issue create --repo "$REPO" \
  --title "Feature: Codebase Context Retrieval (RAG)" \
  --label "enhancement" \
  --body "## Codebase Context Retrieval (RAG)

Before generating code, index the target repository and retrieve relevant files (types, utilities, patterns, config) so Claude understands the existing codebase. Use embeddings or file-tree heuristics to pull in only the most relevant context.

**Why it matters:** The current zero-context approach means Claude invents its own patterns instead of following what the repo already does. Even basic awareness of existing types and helpers would dramatically improve output quality.

**Priority:** P0
**Category:** Workflow & Intelligence

_From [FEATURE_IDEAS.md](docs/planning/FEATURE_IDEAS.md) item #2_"

echo "✅ Created issue: Codebase Context Retrieval (RAG)"

gh issue create --repo "$REPO" \
  --title "Feature: Pre-PR Validation Pipeline" \
  --label "enhancement" \
  --body "## Pre-PR Validation Pipeline

Run the repo's test suite, linter, and type checker locally *before* creating the PR. If checks fail, let Claude auto-fix and retry up to a configurable number of attempts. Only open a PR once everything passes.

**Why it matters:** Opening a PR that immediately fails CI wastes reviewer attention and erodes trust. Catching failures before the PR exists makes ShipIt feel reliable.

**Priority:** P0
**Category:** Workflow & Intelligence

_From [FEATURE_IDEAS.md](docs/planning/FEATURE_IDEAS.md) item #3_"

echo "✅ Created issue: Pre-PR Validation Pipeline"

gh issue create --repo "$REPO" \
  --title "Feature: PR Review Feedback Loop" \
  --label "enhancement" \
  --body "## PR Review Feedback Loop

When a reviewer leaves comments on a ShipIt-generated PR, the bot picks up the feedback, generates fixes, and pushes follow-up commits. The developer stays in reviewer mode without ever touching the code.

**Why it matters:** This completes the vision of \"developer as reviewer.\" Today, if the AI gets something 80% right, a human still has to write the remaining 20%. With this feature, the human just keeps reviewing until it's done.

**Priority:** P1
**Category:** Workflow & Intelligence

_From [FEATURE_IDEAS.md](docs/planning/FEATURE_IDEAS.md) item #4_"

echo "✅ Created issue: PR Review Feedback Loop"

gh issue create --repo "$REPO" \
  --title "Feature: Multi-Step Task Plans" \
  --label "enhancement" \
  --body "## Multi-Step Task Plans

For complex requests, have Claude produce a plan first (broken into ordered subtasks), post it to Slack for approval, then execute each step in sequence. Developers can edit, reorder, or remove steps before execution begins.

**Why it matters:** Large tasks are risky as a single shot. A plan step gives developers visibility and control, and produces smaller, more reviewable commits.

**Priority:** P3
**Category:** Workflow & Intelligence

_From [FEATURE_IDEAS.md](docs/planning/FEATURE_IDEAS.md) item #5_"

echo "✅ Created issue: Multi-Step Task Plans"

# --- Developer Experience ---

gh issue create --repo "$REPO" \
  --title "Feature: /shipit status Command" \
  --label "enhancement" \
  --body "## /shipit status Command

Show all active and recent tasks: what's in progress, what PRs are open, what succeeded or failed. A quick status check without leaving Slack.

**Priority:** P1
**Category:** Developer Experience

_From [FEATURE_IDEAS.md](docs/planning/FEATURE_IDEAS.md) item #6_"

echo "✅ Created issue: /shipit status Command"

gh issue create --repo "$REPO" \
  --title "Feature: Emoji Reactions as Controls" \
  --label "enhancement" \
  --body "## Emoji Reactions as Controls

Use Slack emoji reactions for lightweight task management:

- 👀 Watch a task (get DM updates)
- ❌ Cancel a running task
- 🚀 Auto-merge when CI passes
- 🔁 Retry a failed task

**Why it matters:** Reduces friction to a single click instead of typing commands.

**Priority:** P4
**Category:** Developer Experience

_From [FEATURE_IDEAS.md](docs/planning/FEATURE_IDEAS.md) item #7_"

echo "✅ Created issue: Emoji Reactions as Controls"

gh issue create --repo "$REPO" \
  --title "Feature: Task Templates" \
  --label "enhancement" \
  --body "## Task Templates

Predefined templates for common requests like \"add CRUD endpoints for resource X,\" \"write unit tests for file Y,\" or \"add OpenAPI docs for endpoint Z.\" Invoked via:

\`\`\`
/shipit template crud --resource users --fields name,email,role
\`\`\`

**Why it matters:** Standardized tasks produce more consistent results and reduce prompt engineering burden on developers.

**Priority:** P3
**Category:** Developer Experience

_From [FEATURE_IDEAS.md](docs/planning/FEATURE_IDEAS.md) item #8_"

echo "✅ Created issue: Task Templates"

gh issue create --repo "$REPO" \
  --title "Feature: Dry Run Mode" \
  --label "enhancement" \
  --body "## Dry Run Mode

\`/shipit dry-run <instruction>\` shows what files would be changed and a diff preview in Slack *without* creating a branch or PR. Helps developers evaluate whether a request is well-scoped before committing to it.

**Priority:** P2
**Category:** Developer Experience

_From [FEATURE_IDEAS.md](docs/planning/FEATURE_IDEAS.md) item #9_"

echo "✅ Created issue: Dry Run Mode"

gh issue create --repo "$REPO" \
  --title "Feature: Personal Defaults" \
  --label "enhancement" \
  --body "## Personal Defaults

Let each user configure their own default repo, branch, and preferred AI model via \`/shipit config\`. Stored per Slack user ID. Reduces friction for developers who always work in the same repo.

**Priority:** P4
**Category:** Developer Experience

_From [FEATURE_IDEAS.md](docs/planning/FEATURE_IDEAS.md) item #10_"

echo "✅ Created issue: Personal Defaults"

# --- Observability & Analytics ---

gh issue create --repo "$REPO" \
  --title "Feature: Web Dashboard" \
  --label "enhancement" \
  --body "## Web Dashboard

A lightweight web UI showing:

- Task history with status and links to PRs
- Success/failure rates over time
- Average time-to-merge for AI-generated PRs
- Most active repositories and users
- API cost tracking (token usage per task)

**Priority:** P3
**Category:** Observability & Analytics

_From [FEATURE_IDEAS.md](docs/planning/FEATURE_IDEAS.md) item #11_"

echo "✅ Created issue: Web Dashboard"

gh issue create --repo "$REPO" \
  --title "Feature: Task Analytics & Learning" \
  --label "enhancement" \
  --body "## Task Analytics & Learning

Track which types of tasks succeed vs. get rejected in review. Surface insights:

- \"Bug fix tasks have a 70% merge rate; refactor tasks have 35%\"
- \"Tasks targeting repo X tend to fail — consider improving context retrieval for that repo\"
- Warning prompts: \"Tasks like this historically have low merge rates. Consider being more specific.\"

**Priority:** P4
**Category:** Observability & Analytics

_From [FEATURE_IDEAS.md](docs/planning/FEATURE_IDEAS.md) item #12_"

echo "✅ Created issue: Task Analytics & Learning"

gh issue create --repo "$REPO" \
  --title "Feature: Cost Tracking" \
  --label "enhancement" \
  --body "## Cost Tracking

Log Anthropic API token usage per task and expose it in:

- The Slack completion message (\"This task used ~12K tokens, est. \$0.04\")
- The web dashboard (aggregated by team, repo, time period)

**Why it matters:** Teams need to budget AI spend and identify unexpectedly expensive requests.

**Priority:** P2
**Category:** Observability & Analytics

_From [FEATURE_IDEAS.md](docs/planning/FEATURE_IDEAS.md) item #13_"

echo "✅ Created issue: Cost Tracking"

# --- Security & Governance ---

gh issue create --repo "$REPO" \
  --title "Feature: Repository & Branch Allowlist" \
  --label "enhancement" \
  --body "## Repository & Branch Allowlist

Admins configure which repositories and branches ShipIt is permitted to target. Prevents accidental PRs against production branches, sensitive repos, or repos without proper test coverage.

\`\`\`
ALLOWED_REPOS=org/frontend,org/backend,org/shared-libs
BLOCKED_BRANCHES=main,release/*
\`\`\`

**Priority:** P2
**Category:** Security & Governance

_From [FEATURE_IDEAS.md](docs/planning/FEATURE_IDEAS.md) item #14_"

echo "✅ Created issue: Repository & Branch Allowlist"

gh issue create --repo "$REPO" \
  --title "Feature: Approval Gates" \
  --label "enhancement" \
  --body "## Approval Gates

For certain repos or task types, require a second Slack user to approve before execution begins. A lightweight governance layer for critical codebases, implemented as a Slack button prompt sent to a designated approver or channel.

**Priority:** P4
**Category:** Security & Governance

_From [FEATURE_IDEAS.md](docs/planning/FEATURE_IDEAS.md) item #15_"

echo "✅ Created issue: Approval Gates"

gh issue create --repo "$REPO" \
  --title "Feature: Diff Size Limits" \
  --label "enhancement" \
  --body "## Diff Size Limits

Reject or warn on tasks that produce changes above a configurable threshold (e.g., >500 lines changed). Large AI-generated diffs are difficult to review and risky to merge. If a task exceeds the limit, ShipIt posts the plan and suggests breaking it into smaller tasks.

**Priority:** P2
**Category:** Security & Governance

_From [FEATURE_IDEAS.md](docs/planning/FEATURE_IDEAS.md) item #16_"

echo "✅ Created issue: Diff Size Limits"

# --- Integrations ---

gh issue create --repo "$REPO" \
  --title "Feature: Jira / Linear Issue Linking" \
  --label "enhancement" \
  --body "## Jira / Linear Issue Linking

Accept a Jira or Linear ticket URL as input, pull the title and description, and use it as task context. Auto-link the resulting PR back to the ticket and transition the ticket status.

\`\`\`
/shipit https://linear.app/team/ENG-1234
\`\`\`

**Priority:** P3
**Category:** Integrations

_From [FEATURE_IDEAS.md](docs/planning/FEATURE_IDEAS.md) item #17_"

echo "✅ Created issue: Jira / Linear Issue Linking"

gh issue create --repo "$REPO" \
  --title "Feature: Slack-to-GitHub Issue Bridge" \
  --label "enhancement" \
  --body "## Slack-to-GitHub Issue Bridge

\`/shipit issue <description>\` creates a GitHub issue instead of a PR. Useful when a request needs human design work or discussion before code generation. The issue includes a \"Generate with ShipIt\" button for later execution.

**Priority:** P3
**Category:** Integrations

_From [FEATURE_IDEAS.md](docs/planning/FEATURE_IDEAS.md) item #18_"

echo "✅ Created issue: Slack-to-GitHub Issue Bridge"

gh issue create --repo "$REPO" \
  --title "Feature: Discord / Teams Support" \
  --label "enhancement" \
  --body "## Discord / Teams Support

Abstract the chat integration layer behind an interface so ShipIt can run on Slack, Discord, or Microsoft Teams. The core orchestration and AI logic stay the same — only the messaging adapter changes.

**Priority:** P4
**Category:** Integrations

_From [FEATURE_IDEAS.md](docs/planning/FEATURE_IDEAS.md) item #19_"

echo "✅ Created issue: Discord / Teams Support"

gh issue create --repo "$REPO" \
  --title "Feature: Notification Preferences" \
  --label "enhancement" \
  --body "## Notification Preferences

Let users choose how they're notified about task progress: DM, channel message, or thread reply. Option to get notified when CI finishes on a ShipIt-generated PR (via GitHub webhook integration).

**Priority:** P4
**Category:** Integrations

_From [FEATURE_IDEAS.md](docs/planning/FEATURE_IDEAS.md) item #20_"

echo "✅ Created issue: Notification Preferences"

echo ""
echo "🎉 All 20 feature issues created successfully!"
