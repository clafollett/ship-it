# Contributing to ShipIt

Thank you for your interest in contributing to ShipIt! This document provides guidelines and instructions for contributing.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/ship-it.git`
3. Create a branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Test your changes
6. Commit and push
7. Create a Pull Request

## Development Setup

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your test credentials

# Run in development mode
npm run dev
```

## Code Style

We use ESLint and Prettier for code formatting:

```bash
# Check linting
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

### TypeScript Guidelines

- Use strict TypeScript
- Define proper types (avoid `any`)
- Export types from `src/types/index.ts`
- Use async/await over promises
- Handle errors properly

### Code Structure

- Keep files focused and single-purpose
- Extract reusable logic into utilities
- Follow existing patterns in the codebase
- Add JSDoc comments for public APIs

## Testing

Currently, ShipIt uses manual testing. When adding features:

1. Test with a real Slack workspace
2. Verify GitHub integration works
3. Check AI responses are appropriate
4. Test error handling

Future: We plan to add automated tests.

## Pull Request Process

1. **Update Documentation**: Update README, ARCHITECTURE, or other docs if needed
2. **Test Thoroughly**: Test your changes in a real environment
3. **Follow Code Style**: Run `npm run lint:fix` and `npm run format`
4. **Write Clear Commits**: Use descriptive commit messages
5. **Update CHANGELOG**: Add your changes to CHANGELOG.md (if it exists)

### PR Title Format

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance tasks

Examples:
- `feat: Add support for OpenAI GPT-4`
- `fix: Handle empty Slack messages gracefully`
- `docs: Update Slack setup instructions`

## Feature Requests

We welcome feature requests! Please:

1. Check if the feature already exists
2. Search existing issues/PRs
3. Create a detailed issue describing:
   - The problem you're solving
   - Your proposed solution
   - Any alternatives considered

## Bug Reports

When reporting bugs, please include:

- ShipIt version
- Node.js version
- Operating system
- Steps to reproduce
- Expected behavior
- Actual behavior
- Error messages/logs

## Areas for Contribution

### High Priority

- [ ] Automated testing (unit, integration)
- [ ] Better error handling and recovery
- [ ] Support for multiple repositories
- [ ] Web dashboard for monitoring tasks
- [ ] Support for other AI providers (OpenAI, etc.)

### Medium Priority

- [ ] Code review integration (AI responds to PR comments)
- [ ] Test execution before PR creation
- [ ] Better context gathering from codebase
- [ ] Support for other chat platforms (Discord, Teams)
- [ ] Database for persistent task tracking

### Documentation

- [ ] Video tutorials
- [ ] More examples
- [ ] Best practices guide
- [ ] Troubleshooting guide
- [ ] API documentation

## Architectural Decisions

When proposing major changes:

1. Create an issue first to discuss
2. Consider backward compatibility
3. Update ARCHITECTURE.md
4. Provide migration guide if needed

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Assume good intentions

## Questions?

- Open an issue for discussion
- Check existing documentation
- Review closed issues/PRs

## License

By contributing, you agree that your contributions will be licensed under the ISC License.

---

Thank you for contributing to ShipIt! 🚀
