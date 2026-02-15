# ShipIt - AI-Powered Development System

![ShipIt Banner](https://img.shields.io/badge/AI-Powered-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue) ![Claude](https://img.shields.io/badge/Claude-4.5%20Sonnet-orange)

An AI-powered development system inspired by Spotify's "Honk" - allowing developers to instruct AI to write, test, and deploy code through natural language interactions.

## 🌟 Overview

ShipIt enables developers to:
- **Instruct AI via Slack** to fix bugs, add features, or refactor code
- **Automatically generate code** using Claude 4.5 Sonnet (or Opus 4.6)
- **Create pull requests** with AI-generated code changes
- **Review and merge** AI-generated code like any other PR

Just like Spotify's internal system, ShipIt shifts the developer's role from writing code to reviewing and directing AI-generated code.

## 🏗️ Architecture

```mermaid
flowchart TD
    Slack["Slack (Input)"] -->|mention / slash cmd| Bot["ShipIt Bot"]
    Bot --> Orchestrator["Task Orchestrator"]
    Orchestrator --> Claude["Claude API"]
    Orchestrator --> GitHub["GitHub API"]
    Orchestrator --> Git["Git Repo"]
```

### Components

- **SlackBot**: Receives developer instructions via Slack mentions or slash commands
- **AICodeGenerator**: Uses Claude 4.5 Sonnet (or Opus 4.6) to generate code based on instructions
- **TaskOrchestrator**: Coordinates the entire workflow from instruction to PR
- **GitHubIntegration**: Manages git operations and creates pull requests

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- GitHub account with Personal Access Token
- Anthropic API key for Claude
- Slack workspace with bot configured

### Installation

1. Clone the repository:
```bash
git clone https://github.com/clafollett/ship-it.git
cd ship-it
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your credentials:
```env
ANTHROPIC_API_KEY=your_anthropic_api_key_here
SLACK_BOT_TOKEN=xoxb-your-slack-bot-token
SLACK_APP_TOKEN=xapp-your-slack-app-token
SLACK_SIGNING_SECRET=your-slack-signing-secret
GITHUB_TOKEN=your_github_personal_access_token
GITHUB_OWNER=your-github-username-or-org
GITHUB_REPO=your-repository-name
WORKING_DIRECTORY=./workspace
DEFAULT_BRANCH=main
```

### Slack App Setup

1. Create a new Slack app at https://api.slack.com/apps
2. Enable Socket Mode
3. Add Bot Token Scopes:
   - `app_mentions:read`
   - `chat:write`
   - `commands`
4. Subscribe to bot events:
   - `app_mention`
5. Create slash commands:
   - `/shipit` - Create new tasks
   - `/shipit-cleanup` - Clean up merged branches
6. Install the app to your workspace
7. Copy the tokens to your `.env` file

### GitHub Setup

1. Create a Personal Access Token with these permissions:
   - `repo` (full control)
   - `workflow` (if you want to trigger workflows)
2. Add the token to your `.env` file

### Running ShipIt

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm run build
npm start
```

## 📖 Usage

### Via Slack Mention

In any channel where the bot is present:
```
@ShipIt Add user authentication to the login page
```

The bot will prompt you to select which repository and branch to target:
- **Use Default**: Uses the configured repository and branch from `.env`
- **Specify Different**: Opens a modal to specify custom repository owner, name, and base branch

### Via Slash Command

```
/shipit Add error handling to the API endpoints
/shipit Create a new dashboard component
```

Similar to mentions, the bot will prompt for repository and branch selection.

### Cleanup Merged Branches

After PRs are merged, you can clean up the merged branches and their associated task sessions:

```
/shipit-cleanup
```

The bot will prompt you to select which repository to clean up:
- **Clean Default Repo**: Cleans up the default repository configured in `.env`
- **Clean Different Repo**: Opens a modal to specify a custom repository and base branch

This will:
- Delete all branches that have been merged into the base branch
- Remove associated completed tasks from memory
- Clean up any lingering session data

**Note**: Only merged branches are deleted. Active branches and branches ahead of the base branch are preserved.

### Example Workflow

1. Developer sends instruction via Slack: `@ShipIt Add input validation to the signup form`
2. ShipIt prompts: "Which repository and branch?"
   - Option 1: **Use Default** (configured in `.env`)
   - Option 2: **Specify Different** (opens modal to enter custom repo/branch)
3. Developer selects repository and branch
4. ShipIt acknowledges and starts processing
5. AI generates code changes
6. ShipIt creates a new branch (e.g., `ai-task/add-input-validation-signup-form-1234567890`)
7. Changes are committed and pushed
8. Pull request is automatically created targeting the specified base branch
9. Developer reviews the PR, requests changes if needed, or merges
10. ShipIt notifies completion via Slack

## 🔧 Configuration

### Repository Selection

ShipIt now supports targeting different repositories and branches for each request:

**Default Repository**: Configured in `.env` file
```env
GITHUB_OWNER=your-github-username
GITHUB_REPO=your-repository-name
DEFAULT_BRANCH=main
```

**Per-Request Selection**: When you mention `@ShipIt` or use `/shipit`, you'll be prompted to:
1. Use the default repository and branch
2. Specify a different repository and/or branch

This allows a single ShipIt instance to manage code changes across multiple repositories!

### Task Types

ShipIt automatically detects task types based on keywords:

- **bug_fix**: Keywords like "bug", "fix", "error"
- **feature**: Default type for new functionality
- **refactor**: Keywords like "refactor", "improve", "clean up"
- **test**: Keywords like "test", "spec", "coverage"

### AI Model

The system uses Claude Sonnet 4.5 by default, with optional support for Claude Opus 4.6. You can configure the model in your `.env` file:

```env
# Use Sonnet 4.5 (faster, more cost-effective - recommended)
ANTHROPIC_MODEL=claude-sonnet-4-5-20250514

# Or use Opus 4.6 (more capable for complex tasks)
ANTHROPIC_MODEL=claude-opus-4-6-20250514
```

You can also modify the default model in `src/core/ai-code-generator.ts`.

## 🛠️ Development

### Build

```bash
npm run build
```

### Lint & Format

```bash
npm run check        # lint + format check
npm run check:fix    # auto-fix both
npm run lint         # lint only
npm run format       # format only
```

## 📂 Project Structure

```
ship-it/
├── src/
│   ├── core/
│   │   ├── ai-code-generator.ts     # Claude AI integration
│   │   └── task-orchestrator.ts     # Main task coordination
│   ├── integrations/
│   │   ├── github.ts                # GitHub API & Git operations
│   │   └── slack.ts                 # Slack bot
│   ├── types/
│   │   └── index.ts                 # TypeScript types
│   ├── utils/
│   │   └── config.ts                # Configuration utilities
│   └── index.ts                     # Application entry point
├── infra/                            # Terraform IaC (AWS ECS Fargate)
├── .github/workflows/ci.yml         # CI pipeline
├── Dockerfile                        # Multi-stage Docker build
├── .env.example                      # Environment variables template
├── biome.json                        # Biome linter & formatter config
├── tsconfig.json                     # TypeScript configuration
└── package.json                      # Project dependencies
```

## 🔐 Security Considerations

- Never commit your `.env` file
- Keep API keys and tokens secure
- Review all AI-generated code before merging
- Set up branch protection rules on your main branch
- Consider running CI/CD pipelines on AI-generated PRs

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the ISC License - see the LICENSE file for details.

## 🙏 Acknowledgments

Inspired by Spotify's "Honk" system as described in the TechCrunch article about AI-powered development workflows.

## 📚 References

- [TechCrunch Article: Spotify's AI Development System](https://techcrunch.com/2026/02/12/spotify-says-its-best-developers-havent-written-a-line-of-code-since-december-thanks-to-ai/)
- [Anthropic Claude API Documentation](https://docs.anthropic.com/)
- [Slack Bolt Framework](https://slack.dev/bolt-js/)
- [Octokit GitHub API](https://github.com/octokit/rest.js)

---

Built with ❤️ using TypeScript and Claude 4.5 Sonnet