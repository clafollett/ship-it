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

```
┌─────────────┐         ┌──────────────┐
│   Slack     │────────▶│   ShipIt     │
│   (Input)   │         │     Bot      │
└─────────────┘         └──────┬───────┘
                               │
                               ▼
                    ┌──────────────────┐
                    │ Task Orchestrator │
                    └────────┬──────────┘
                             │
                ┌────────────┼────────────┐
                ▼            ▼            ▼
         ┌──────────┐  ┌─────────┐  ┌────────┐
         │  Claude  │  │  GitHub │  │  Git   │
         │   API    │  │   API   │  │  Repo  │
         └──────────┘  └─────────┘  └────────┘
```

### Components

- **SlackBot**: Receives developer instructions via Slack mentions or slash commands
- **AICodeGenerator**: Uses Claude 3.5 Sonnet to generate code based on instructions
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
5. Create a slash command: `/shipit`
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
@ShipIt Fix the bug in the payment processing module
@ShipIt Refactor the database connection code for better performance
@ShipIt Add tests for the user service
```

### Via Slash Command

```
/shipit Add error handling to the API endpoints
/shipit Create a new dashboard component
```

### Example Workflow

1. Developer sends instruction via Slack: `@ShipIt Add input validation to the signup form`
2. ShipIt acknowledges and starts processing
3. AI generates code changes
4. ShipIt creates a new branch (e.g., `ai-task/add-input-validation-signup-form-1234567890`)
5. Changes are committed and pushed
6. Pull request is automatically created
7. Developer reviews the PR, requests changes if needed, or merges
8. ShipIt notifies completion via Slack

## 🔧 Configuration

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
ANTHROPIC_MODEL=claude-sonnet-4.5-20250514

# Or use Opus 4.6 (more capable for complex tasks)
ANTHROPIC_MODEL=claude-opus-4.6-20250514
```

You can also modify the default model in `src/core/ai-code-generator.ts`.

## 🛠️ Development

### Build

```bash
npm run build
```

### Lint

```bash
npm run lint
npm run lint:fix
```

### Format

```bash
npm run format
```

## 📂 Project Structure

```
ship-it/
├── src/
│   ├── core/
│   │   ├── ai-code-generator.ts    # Claude AI integration
│   │   └── task-orchestrator.ts    # Main task coordination
│   ├── integrations/
│   │   ├── github.ts                # GitHub API & Git operations
│   │   └── slack.ts                 # Slack bot
│   ├── types/
│   │   └── index.ts                 # TypeScript types
│   ├── utils/
│   │   └── config.ts                # Configuration utilities
│   └── index.ts                     # Application entry point
├── .env.example                      # Environment variables template
├── .eslintrc.json                    # ESLint configuration
├── .prettierrc                       # Prettier configuration
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