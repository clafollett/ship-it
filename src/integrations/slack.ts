import { App, LogLevel } from '@slack/bolt';
import { Task } from '../types';

export class SlackBot {
  private app: App;
  private taskHandler?: (instruction: string, userId: string, channel: string) => Promise<void>;

  constructor(botToken: string, appToken: string, signingSecret: string) {
    this.app = new App({
      token: botToken,
      appToken: appToken,
      signingSecret: signingSecret,
      socketMode: true,
      logLevel: LogLevel.INFO,
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    // Listen for app mentions
    this.app.event('app_mention', async ({ event, client }) => {
      try {
        const text = event.text.replace(/<@[A-Z0-9]+>/g, '').trim();

        if (!text) {
          await client.chat.postMessage({
            channel: event.channel,
            thread_ts: event.ts,
            text: "Hi! I'm ShipIt, your AI coding assistant. Tell me what you need, and I'll generate the code for you. For example: 'Fix the bug in the authentication module' or 'Add a new feature for user profiles'",
          });
          return;
        }

        await client.chat.postMessage({
          channel: event.channel,
          thread_ts: event.ts,
          text: `Got it! I'm working on: "${text}"\nI'll let you know when it's ready for review.`,
        });

        if (this.taskHandler && event.user) {
          await this.taskHandler(text, event.user, event.channel);
        }
      } catch (error) {
        console.error('Error handling app mention:', error);
      }
    });

    // Listen for slash commands
    this.app.command('/shipit', async ({ command, ack, client }) => {
      await ack();

      try {
        const instruction = command.text.trim();

        if (!instruction) {
          await client.chat.postMessage({
            channel: command.channel_id,
            text: 'Please provide a task description. Example: `/shipit Add error handling to the payment service`',
          });
          return;
        }

        await client.chat.postMessage({
          channel: command.channel_id,
          text: `Working on: "${instruction}"\nI'll notify you when it's complete!`,
        });

        if (this.taskHandler) {
          await this.taskHandler(instruction, command.user_id, command.channel_id);
        }
      } catch (error) {
        console.error('Error handling slash command:', error);
      }
    });
  }

  onTask(handler: (instruction: string, userId: string, channel: string) => Promise<void>): void {
    this.taskHandler = handler;
  }

  async sendMessage(channel: string, text: string, threadTs?: string): Promise<void> {
    await this.app.client.chat.postMessage({
      channel,
      text,
      thread_ts: threadTs,
    });
  }

  async sendTaskUpdate(channel: string, task: Task, threadTs?: string): Promise<void> {
    let statusEmoji = '⏳';
    let statusText = 'In Progress';

    if (task.status === 'completed') {
      statusEmoji = '✅';
      statusText = 'Completed';
    } else if (task.status === 'failed') {
      statusEmoji = '❌';
      statusText = 'Failed';
    }

    let message = `${statusEmoji} *Task ${statusText}*\n\n`;
    message += `*Description:* ${task.description}\n`;
    message += `*Type:* ${task.type}\n`;
    message += `*Requested by:* <@${task.requestedBy}>\n`;

    if (task.pullRequestUrl) {
      message += `*Pull Request:* ${task.pullRequestUrl}\n`;
    }

    if (task.error) {
      message += `*Error:* ${task.error}\n`;
    }

    await this.app.client.chat.postMessage({
      channel,
      text: message,
      thread_ts: threadTs,
    });
  }

  async start(): Promise<void> {
    await this.app.start();
    console.log('⚡️ Slack bot is running!');
  }

  async stop(): Promise<void> {
    await this.app.stop();
    console.log('Slack bot stopped');
  }
}
