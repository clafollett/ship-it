# Quick Start Guide

Get ShipIt running in under 5 minutes!

## 1. Prerequisites Check

Make sure you have:
- [ ] Node.js 18 or higher installed (`node --version`)
- [ ] A GitHub account
- [ ] A Slack workspace where you can add apps
- [ ] An Anthropic API account

## 2. Get API Keys

### Anthropic API Key
1. Go to https://console.anthropic.com/
2. Sign up or log in
3. Navigate to API Keys
4. Create a new API key
5. Copy the key (starts with `sk-ant-`)

### GitHub Personal Access Token
1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Give it a name like "ShipIt Bot"
4. Select scopes:
   - `repo` (all)
   - `workflow` (optional)
5. Click "Generate token"
6. Copy the token (starts with `ghp_`)

### Slack App
1. Go to https://api.slack.com/apps
2. Click "Create New App" → "From scratch"
3. Name it "ShipIt" and select your workspace
4. Configure the app:

#### Enable Socket Mode
- Go to "Socket Mode" in the sidebar
- Enable Socket Mode
- Copy the App Token (starts with `xapp-`)

#### Add Bot Token Scopes
- Go to "OAuth & Permissions"
- Under "Bot Token Scopes", add:
  - `app_mentions:read`
  - `chat:write`
  - `commands`
- Install app to workspace
- Copy the Bot Token (starts with `xoxb-`)

#### Add Slash Command
- Go to "Slash Commands"
- Click "Create New Command"
- Command: `/shipit`
- Request URL: (leave empty for Socket Mode)
- Short Description: "Ask AI to write code"

#### Subscribe to Events
- Go to "Event Subscriptions"
- Enable Events
- Subscribe to bot events:
  - `app_mention`

#### Get Signing Secret
- Go to "Basic Information"
- Under "App Credentials", copy the "Signing Secret"

## 3. Setup ShipIt

```bash
# Clone the repo
git clone https://github.com/clafollett/ship-it.git
cd ship-it

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your credentials
nano .env  # or use your favorite editor
```

Fill in your `.env` file:
```env
ANTHROPIC_API_KEY=sk-ant-your-key-here
SLACK_BOT_TOKEN=xoxb-your-token-here
SLACK_APP_TOKEN=xapp-your-token-here
SLACK_SIGNING_SECRET=your-signing-secret-here
GITHUB_TOKEN=ghp_your-token-here
GITHUB_OWNER=your-github-username
GITHUB_REPO=your-test-repo
WORKING_DIRECTORY=./workspace
DEFAULT_BRANCH=main
```

## 4. Run ShipIt

```bash
# Development mode (with hot reload)
npm run dev

# Or build and run in production mode
npm run build
npm start
```

You should see:
```
🚀 Starting ShipIt AI Development System...
Initializing TaskOrchestrator...
Cloning repository: https://github.com/...
Repository initialized successfully
TaskOrchestrator initialized successfully
⚡️ Slack bot is running!
✅ ShipIt is ready! Waiting for developer instructions...
```

## 5. Test It Out

In Slack, try:
```
@ShipIt Add a hello world function to utils.ts
```

Or use the slash command:
```
/shipit Create a README for the project
```

ShipIt will:
1. Acknowledge your request
2. Generate the code using Claude
3. Create a new branch
4. Commit the changes
5. Create a pull request
6. Notify you when done

## 6. Review the PR

1. Go to your GitHub repository
2. Check the Pull Requests tab
3. Review the AI-generated code
4. Request changes or merge!

## Troubleshooting

### "Error: Missing required environment variable"
- Double-check your `.env` file has all required variables
- Make sure there are no spaces around the `=` sign
- Verify the variable names match exactly

### "Failed to clone repository"
- Verify your GitHub token has `repo` permissions
- Check that GITHUB_OWNER and GITHUB_REPO are correct
- Make sure the repository exists and you have access

### "Slack bot not responding"
- Verify the bot is invited to the channel (`/invite @ShipIt`)
- Check that Socket Mode is enabled
- Confirm all Slack tokens are correct

### "Cannot create pull request"
- Ensure the default branch exists
- Check that your GitHub token has write permissions
- Verify branch protection rules allow bot-created PRs

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Check [ARCHITECTURE.md](ARCHITECTURE.md) to understand how it works
- Customize the AI prompts in `src/core/ai-code-generator.ts`
- Set up CI/CD for AI-generated PRs

Happy shipping! 🚀
