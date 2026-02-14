# ShipIt Architecture

## Overview

ShipIt is an AI-powered development system that enables developers to instruct AI to write code through natural language. It's inspired by Spotify's "Honk" system and built with TypeScript and Claude 4.5 Sonnet (with support for Opus 4.6).

## Core Concepts

### Developer-AI Workflow Shift

Traditional workflow:
```
Developer → Write Code → Test → PR → Review → Merge
```

ShipIt workflow:
```
Developer → Instruct AI → AI Generates Code → PR → Review → Merge
```

The developer's role shifts from:
- ✍️ Writing code → 🎯 Directing AI
- 🔧 Implementing → 👀 Reviewing
- ⚙️ Technical execution → 🎨 Architecture & design

## System Architecture

### High-Level Components

```
┌─────────────────────────────────────────────────────────┐
│                        ShipIt App                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │                  Task Orchestrator                 │  │
│  │  (Coordinates entire workflow from input to PR)   │  │
│  └─────────┬───────────────┬────────────┬───────────┘  │
│            │               │            │               │
│  ┌─────────▼──────┐ ┌─────▼─────┐ ┌───▼──────────┐   │
│  │  Slack Bot     │ │ AI Code   │ │   GitHub     │   │
│  │  Integration   │ │ Generator │ │ Integration  │   │
│  └────────────────┘ └───────────┘ └──────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Component Details

#### 1. Slack Bot (`src/integrations/slack.ts`)

**Responsibilities:**
- Listen for mentions (`@ShipIt`) in Slack channels
- Handle slash commands (`/shipit`)
- Send task updates and notifications
- Maintain conversation context

**Key Features:**
- Socket Mode for real-time communication
- Thread-based responses for organized conversations
- Status updates with emoji indicators
- Error handling and user feedback

**Event Flow:**
```
Slack Message → Event Handler → Parse Instruction → 
Trigger Task Handler → Send Acknowledgment
```

#### 2. AI Code Generator (`src/core/ai-code-generator.ts`)

**Responsibilities:**
- Interface with Anthropic's Claude API
- Build context-aware prompts
- Parse AI responses into structured code changes
- Handle different task types (bug fix, feature, refactor, test)

**Prompt Engineering:**
```typescript
System Prompt = Base Instructions + Task-Specific Instructions
User Prompt = Task Description + Context + Relevant Files
```

**Response Format:**
```json
{
  "success": true,
  "files": [
    {
      "path": "src/utils/helper.ts",
      "content": "... generated code ...",
      "action": "create"
    }
  ],
  "explanation": "Added helper function for..."
}
```

#### 3. GitHub Integration (`src/integrations/github.ts`)

**Responsibilities:**
- Clone and manage local repository
- Create feature branches
- Apply code changes to files
- Commit and push changes
- Create pull requests with detailed descriptions

**Git Workflow:**
```
1. Clone repo → 2. Checkout base branch → 3. Create feature branch →
4. Apply changes → 5. Commit → 6. Push → 7. Create PR
```

#### 4. Task Orchestrator (`src/core/task-orchestrator.ts`)

**Responsibilities:**
- Coordinate all components
- Manage task lifecycle
- Handle errors and rollbacks
- Track task status

**Task Lifecycle:**
```
┌────────┐   ┌─────────────┐   ┌───────────┐   ┌───────────┐
│Pending │──▶│ In Progress │──▶│ Completed │   │  Failed   │
└────────┘   └─────────────┘   └───────────┘   └───────────┘
                     │                               ▲
                     └───────────────────────────────┘
```

## Data Flow

### Complete Request Flow

```
1. Developer Instruction
   ↓
2. Slack Bot (receives & parses)
   ↓
3. Task Orchestrator (creates task)
   ↓
4. AI Code Generator (generates code)
   ↓
5. GitHub Integration (creates branch)
   ↓
6. GitHub Integration (applies changes)
   ↓
7. GitHub Integration (commits & pushes)
   ↓
8. GitHub Integration (creates PR)
   ↓
9. Slack Bot (notifies completion)
   ↓
10. Developer (reviews PR)
```

### Task State Management

```typescript
interface Task {
  id: string;              // Unique identifier
  description: string;     // User instruction
  type: 'bug_fix' | 'feature' | 'refactor' | 'test';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  requestedBy: string;     // Slack user ID
  createdAt: Date;
  completedAt?: Date;
  branch?: string;         // Git branch name
  pullRequestUrl?: string; // GitHub PR URL
  error?: string;          // Error message if failed
}
```

## Key Design Decisions

### 1. Task Type Detection

ShipIt automatically classifies tasks based on keywords:

- **Bug Fix**: "bug", "fix", "error", "issue"
- **Feature**: Default type, new functionality
- **Refactor**: "refactor", "improve", "clean up", "optimize"
- **Test**: "test", "spec", "coverage", "unit test"

This influences the AI's prompt and approach.

### 2. Branch Naming Strategy

Format: `ai-task/{description}-{timestamp}`

Example: `ai-task/add-user-authentication-1707915842000`

Benefits:
- Clear identification of AI-generated branches
- Descriptive naming helps reviewers
- Timestamp prevents collisions

### 3. Pull Request Structure

Every PR includes:
- Clear title with `[AI]` prefix
- Task metadata (ID, requester, type)
- Original instruction
- AI's explanation of changes
- List of modified files
- Attribution to ShipIt

### 4. Error Handling

Layers of error handling:
1. **API Level**: Catch and log API errors
2. **Task Level**: Mark task as failed, store error
3. **User Level**: Notify via Slack with clear message
4. **System Level**: Graceful shutdown on critical errors

### 5. Security Considerations

- API keys stored in environment variables
- No sensitive data in logs
- Pull requests require human review
- Branch protection compatible
- Token-based authentication

## Extensibility

### Adding New Integrations

To add a new chat platform (e.g., Discord, Teams):

1. Create integration file: `src/integrations/discord.ts`
2. Implement interface:
```typescript
interface ChatIntegration {
  onMessage(handler: MessageHandler): void;
  sendMessage(channel: string, text: string): Promise<void>;
  start(): Promise<void>;
  stop(): Promise<void>;
}
```
3. Update `src/index.ts` to use new integration

### Adding New AI Providers

To add a new AI provider (e.g., OpenAI):

1. Create generator: `src/core/openai-code-generator.ts`
2. Implement interface:
```typescript
interface CodeGenerator {
  generateCode(request: CodeGenerationRequest): Promise<CodeGenerationResult>;
}
```
3. Update TaskOrchestrator to use new generator

### Custom Task Types

Add new task types in `src/types/index.ts`:
```typescript
type TaskType = 'bug_fix' | 'feature' | 'refactor' | 'test' | 'documentation';
```

Update detection logic in `src/index.ts`.

## Performance Considerations

### Optimization Strategies

1. **Parallel Operations**: GitHub API calls can be parallelized
2. **Caching**: Cache repository structure and common files
3. **Rate Limiting**: Respect API rate limits (Claude, GitHub, Slack)
4. **Cleanup**: Remove old working directories
5. **Connection Pooling**: Reuse HTTP connections

### Scalability

Current architecture supports:
- Single repository per instance
- Multiple concurrent tasks (sequential execution)
- Multiple Slack workspaces

For multi-repository support:
- Run multiple instances with different configs
- Implement repository queue system
- Add database for persistent task tracking

## Testing Strategy

### Unit Tests
- Test each component in isolation
- Mock external APIs (Claude, GitHub, Slack)
- Test error handling paths

### Integration Tests
- Test component interactions
- Use test repositories and Slack workspaces
- Verify end-to-end workflows

### Manual Testing
- Test with real Slack messages
- Review AI-generated PRs
- Validate different task types

## Monitoring & Observability

### Logging Levels
- **INFO**: Task lifecycle events
- **WARN**: Non-critical errors, retries
- **ERROR**: Task failures, API errors

### Metrics to Track
- Tasks completed vs failed
- Average time per task
- AI response quality (through PR feedback)
- API usage and costs

## Future Enhancements

### Planned Features
1. **Test Execution**: Run tests before creating PR
2. **Iterative Refinement**: Allow follow-up instructions
3. **Multi-file Context**: Better understanding of large codebases
4. **Code Review Integration**: AI responds to review comments
5. **Learning System**: Improve based on PR feedback
6. **Dashboard**: Web UI for task monitoring
7. **Analytics**: Track AI performance and patterns

### Advanced Capabilities
- Automatic dependency updates
- Security vulnerability fixes
- Performance optimization suggestions
- Documentation generation
- Code migration assistance

## Comparison to Spotify's Honk

### Similarities
- ✅ Slack-based interaction
- ✅ AI-powered code generation
- ✅ Automatic PR creation
- ✅ Developer reviews AI code

### Differences
- 🔄 ShipIt is open source, Honk is proprietary
- 🔄 ShipIt uses Claude, Honk's AI is undisclosed
- 🔄 ShipIt focuses on single tasks, Honk may have broader capabilities
- 🔄 Honk includes testing and deployment, ShipIt focuses on code generation

## Conclusion

ShipIt demonstrates how AI can transform the software development workflow. By shifting developers from code writers to code reviewers and architects, it enables faster iteration while maintaining quality through human oversight.

The modular architecture allows for easy customization and extension, making it suitable for teams of various sizes and needs.

---

For implementation details, see the source code in `src/` directory.
