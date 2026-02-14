import { TaskOrchestrator } from './core/task-orchestrator';
import { SlackBot } from './integrations/slack';
import { loadConfig } from './utils/config';
import { Task } from './types';

class ShipItApp {
  private orchestrator: TaskOrchestrator;
  private slackBot: SlackBot;
  private config: ReturnType<typeof loadConfig>;

  constructor() {
    this.config = loadConfig();

    this.orchestrator = new TaskOrchestrator(
      this.config.anthropicApiKey,
      this.config.githubToken,
      this.config.githubOwner,
      this.config.githubRepo,
      this.config.workingDirectory,
      this.config.defaultBranch,
      this.config.anthropicModel
    );

    this.slackBot = new SlackBot(
      this.config.slackBotToken,
      this.config.slackAppToken,
      this.config.slackSigningSecret
    );
  }

  async start(): Promise<void> {
    console.log('🚀 Starting ShipIt AI Development System...');

    try {
      // Initialize the task orchestrator
      await this.orchestrator.initialize();

      // Set up task handler for Slack
      this.slackBot.onTask(async (instruction: string, userId: string, channel: string) => {
        try {
          // Determine task type from instruction
          const taskType = this.determineTaskType(instruction);

          // Execute the task
          const task = await this.orchestrator.executeTask(instruction, userId, taskType);

          // Send update back to Slack
          await this.slackBot.sendTaskUpdate(channel, task);
        } catch (error) {
          console.error('Error processing task:', error);
          await this.slackBot.sendMessage(
            channel,
            `❌ Failed to process task: ${error instanceof Error ? error.message : 'Unknown error'}`
          );
        }
      });

      // Start the Slack bot
      await this.slackBot.start();

      console.log('✅ ShipIt is ready! Waiting for developer instructions...');
    } catch (error) {
      console.error('Failed to start ShipIt:', error);
      process.exit(1);
    }
  }

  private determineTaskType(instruction: string): Task['type'] {
    const lowerInstruction = instruction.toLowerCase();

    if (
      lowerInstruction.includes('bug') ||
      lowerInstruction.includes('fix') ||
      lowerInstruction.includes('error')
    ) {
      return 'bug_fix';
    }

    if (
      lowerInstruction.includes('test') ||
      lowerInstruction.includes('spec') ||
      lowerInstruction.includes('coverage')
    ) {
      return 'test';
    }

    if (
      lowerInstruction.includes('refactor') ||
      lowerInstruction.includes('improve') ||
      lowerInstruction.includes('clean up')
    ) {
      return 'refactor';
    }

    return 'feature';
  }

  async stop(): Promise<void> {
    console.log('Shutting down ShipIt...');
    await this.slackBot.stop();
    await this.orchestrator.cleanup();
    console.log('ShipIt stopped');
  }
}

// Handle graceful shutdown
const app = new ShipItApp();

process.on('SIGINT', async () => {
  await app.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await app.stop();
  process.exit(0);
});

// Start the application
app.start().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
