# Copilot Instructions for ship-it

## Project Overview
ShipIt is an AI-powered development system inspired by Spotify's "Honk" that enables developers to instruct AI to write, test, and deploy code through natural language interactions via Slack. The system uses Claude 4.5 Sonnet (or Opus 4.6) to generate code changes and automatically creates pull requests.

## Technologies & Stack
- **Language**: TypeScript 5.9 with strict type checking
- **Runtime**: Node.js 18+
- **Package Manager**: npm
- **AI**: Anthropic Claude SDK (@anthropic-ai/sdk)
- **Integrations**: 
  - Slack Bolt (@slack/bolt) - Socket Mode for real-time communication
  - Octokit REST API (@octokit/rest) - GitHub integration
  - simple-git - Git operations
- **Development Tools**: tsx, ESLint, Prettier

## Architecture
The system follows a modular architecture with four core components:
1. **Slack Bot** (`src/integrations/slack.ts`) - Handles user interactions, mentions, and slash commands
2. **AI Code Generator** (`src/core/ai-code-generator.ts`) - Interfaces with Claude API to generate code
3. **GitHub Integration** (`src/integrations/github.ts`) - Manages git operations and PR creation
4. **Task Orchestrator** (`src/core/task-orchestrator.ts`) - Coordinates workflow and manages task lifecycle

## Key Features
- Dynamic repository and branch targeting via interactive Slack prompts
- Automatic task type detection (bug fix, feature, refactor, test)
- Support for multiple repositories from a single instance
- Thread-based Slack responses for organized conversations
- Comprehensive error handling and user feedback

## Coding Standards
- Use TypeScript with strict type checking - no implicit any
- Follow existing ESLint configuration (`eslint.config.js`)
- Use Prettier for consistent formatting (`.prettierrc`)
- Prefer async/await over callbacks or raw promises
- Use descriptive variable and function names
- Add JSDoc comments for public APIs
- Handle errors explicitly with try-catch blocks
- Log important events with context

## Testing & Quality
- Run `npm run lint` to check code style
- Run `npm run lint:fix` to auto-fix linting issues
- Run `npm run format` to format code with Prettier
- Run `npm run build` to compile TypeScript
- Test configuration with `npm run test:config`
- Always test changes locally before committing
- Update relevant documentation when changing functionality

## Project Structure
```
src/
├── core/               # Core business logic
│   ├── ai-code-generator.ts
│   └── task-orchestrator.ts
├── integrations/      # External service integrations
│   ├── github.ts
│   └── slack.ts
├── types/            # TypeScript type definitions
│   └── index.ts
├── utils/            # Utility functions
│   └── config.ts
└── index.ts          # Application entry point
```

## Environment Configuration
Required environment variables (see `.env.example`):
- `ANTHROPIC_API_KEY` - Claude API key
- `SLACK_BOT_TOKEN` - Slack bot token
- `SLACK_APP_TOKEN` - Slack app-level token
- `GITHUB_TOKEN` - GitHub personal access token
- `DEFAULT_GITHUB_OWNER` / `DEFAULT_GITHUB_REPO` / `DEFAULT_BRANCH` - Defaults for repository targeting
- `CLAUDE_MODEL` - Optional: "claude-4.5-sonnet-20260620" (default) or "claude-4.6-opus-20265620"

## Best Practices
- Make minimal, focused changes that align with the system's architecture
- Update documentation in `docs/` when adding features or changing behavior
- Follow the existing patterns for error handling and logging
- When modifying Slack interactions, maintain the thread-based conversation flow
- When changing AI prompts, test thoroughly as they affect code generation quality
- Respect the task lifecycle states (pending → in progress → completed/failed)
- Use the existing repository management pattern for multi-repo support
- Always validate GitHub operations succeed before notifying users
