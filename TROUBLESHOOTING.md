# Troubleshooting Guide

Common issues and solutions when using ShipIt.

## Installation Issues

### npm install fails

**Problem:** Dependencies fail to install

**Solutions:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### TypeScript compilation errors

**Problem:** `npm run build` fails

**Solutions:**
- Ensure you're using Node.js 18 or higher: `node --version`
- Update TypeScript: `npm install -g typescript@latest`
- Check tsconfig.json is not corrupted

## Configuration Issues

### Missing environment variables

**Problem:** "Error: Missing required environment variable"

**Solution:**
1. Copy `.env.example` to `.env`: `cp .env.example .env`
2. Fill in all required values
3. Test configuration: `npm run test:config`

### Invalid API keys

**Problem:** "Authentication failed" or "Invalid API key"

**Solutions:**

**Anthropic API:**
- Verify key starts with `sk-ant-`
- Check at https://console.anthropic.com/
- Generate a new key if needed

**GitHub Token:**
- Verify token starts with `ghp_` (classic) or `github_pat_` (fine-grained)
- Check token has `repo` scope
- Generate new at https://github.com/settings/tokens

**Slack Tokens:**
- Bot Token should start with `xoxb-`
- App Token should start with `xapp-`
- Verify Socket Mode is enabled
- Reinstall app to workspace if needed

## Slack Integration Issues

### Bot not responding

**Problem:** No response when mentioning `@ShipIt`

**Checklist:**
- [ ] Is the bot invited to the channel? (`/invite @ShipIt`)
- [ ] Is Socket Mode enabled in Slack app settings?
- [ ] Are the tokens correct in `.env`?
- [ ] Is ShipIt running? Check terminal for errors
- [ ] Check bot has `app_mentions:read` scope

**Debug:**
```bash
# Run in dev mode to see logs
npm run dev

# Look for errors in output
```

### Slash command not working

**Problem:** `/shipit` command not recognized

**Solutions:**
- Verify slash command is created in Slack app settings
- Command name must be exactly `/shipit`
- Bot must have `commands` scope
- Reinstall app to workspace
- Wait a few minutes after creating command

### Messages sent to wrong channel

**Problem:** Bot responds in unexpected channels

**Solution:**
- ShipIt responds in the same channel where it was mentioned
- For DMs, the bot needs `im:write` scope
- Thread responses stay in threads automatically

## GitHub Integration Issues

### Cannot clone repository

**Problem:** "Failed to clone repository"

**Possible causes:**
1. Repository doesn't exist
2. Token lacks permissions
3. Wrong owner/repo names
4. Network issues

**Solutions:**
```bash
# Test GitHub token manually
curl -H "Authorization: token YOUR_TOKEN" https://api.github.com/user

# Test repository access
curl -H "Authorization: token YOUR_TOKEN" \
  https://api.github.com/repos/OWNER/REPO

# Verify owner and repo in .env
echo $GITHUB_OWNER
echo $GITHUB_REPO
```

### Cannot create pull requests

**Problem:** "Error creating pull request"

**Solutions:**
- Verify token has `repo` scope (not just `public_repo`)
- Check branch protection rules allow bot PRs
- Ensure base branch exists
- Verify repository is not archived

### Push rejected

**Problem:** "Permission denied" when pushing

**Solutions:**
- Check token has write access
- Verify you're not pushing to protected branch directly
- Ensure working directory is clean: `git status`

## Runtime Issues

### Out of memory errors

**Problem:** Node.js crashes with heap out of memory

**Solution:**
```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
npm run dev
```

### Port already in use

**Problem:** (If adding HTTP server) "EADDRINUSE: address already in use"

**Solution:**
```bash
# Find process using port
lsof -i :3000

# Kill the process
kill -9 <PID>
```

### Workspace directory errors

**Problem:** "Cannot create working directory"

**Solutions:**
- Ensure write permissions: `mkdir -p ./workspace`
- Change location in `.env`: `WORKING_DIRECTORY=/tmp/shipit-workspace`
- Check disk space: `df -h`

## AI Generation Issues

### Claude API errors

**Problem:** "Rate limit exceeded" or API errors

**Solutions:**
- Check API usage at https://console.anthropic.com/
- Verify account has credits
- Implement retry logic with exponential backoff
- Consider upgrading API plan

### Poor code quality

**Problem:** Generated code doesn't meet expectations

**Solutions:**
- Provide more specific instructions
- Include context about coding standards
- Mention specific files or patterns to follow
- Review and refine the system prompt in `src/core/ai-code-generator.ts`

### Code not compiling

**Problem:** Generated code has syntax errors

**Solutions:**
- Add compilation check before creating PR (future feature)
- Review and fix manually in the PR
- Provide better context about project structure
- Update the AI prompt to emphasize syntax correctness

## Performance Issues

### Slow response times

**Problem:** Tasks take too long to complete

**Possible causes:**
1. Large repository clone
2. Network latency
3. AI API response time
4. Many files to process

**Optimizations:**
- Use shallow clone for large repos
- Run ShipIt on server with good network
- Consider caching frequently used data
- Optimize workspace cleanup

### High API costs

**Problem:** Claude API usage too expensive

**Solutions:**
- Use more specific, focused instructions
- Avoid generating entire large files
- Consider using different Claude models for different tasks
- Implement request caching for similar tasks

## Debugging Tips

### Enable verbose logging

Add to your code:
```typescript
// In src/index.ts
console.log('DEBUG:', JSON.stringify(data, null, 2));
```

### Check environment variables

```bash
# Print all ShipIt env vars
env | grep -E 'ANTHROPIC|SLACK|GITHUB'
```

### Test components independently

```typescript
// Test AI generator only
const generator = new AICodeGenerator(process.env.ANTHROPIC_API_KEY);
const result = await generator.generateCode({
  instruction: "Create a hello world function",
  taskType: "feature"
});
console.log(result);
```

### Monitor API calls

```bash
# Watch network requests
npm run dev 2>&1 | grep -E 'POST|GET|PUT'
```

## Common Error Messages

### "Cannot find module"

**Solution:**
```bash
npm install
npm run build
```

### "Permission denied"

**Solution:**
```bash
chmod +x scripts/*.js
```

### "ENOENT: no such file or directory"

**Solution:**
```bash
mkdir -p workspace
mkdir -p dist
```

## Getting Help

If you're still stuck:

1. **Check existing issues:** https://github.com/clafollett/ship-it/issues
2. **Review documentation:**
   - [README.md](README.md)
   - [ARCHITECTURE.md](ARCHITECTURE.md)
   - [QUICKSTART.md](QUICKSTART.md)
3. **Enable debug logging** and share error messages
4. **Create a new issue** with:
   - ShipIt version
   - Node.js version (`node --version`)
   - Operating system
   - Steps to reproduce
   - Full error message
   - Relevant logs

## Preventive Measures

### Regular maintenance

```bash
# Update dependencies monthly
npm outdated
npm update

# Check for security vulnerabilities
npm audit
npm audit fix

# Clean up old branches
git branch -d ai-task/*
```

### Best practices

1. **Always review PRs** before merging
2. **Set up branch protection** on main/production
3. **Monitor API usage** to avoid surprises
4. **Keep .env secure** - never commit it
5. **Test in development** before production use
6. **Backup important data** before major changes

---

Still having issues? Open an issue on GitHub with details!
