import { randomUUID } from 'node:crypto';
import { App, type BlockAction, type ButtonAction, LogLevel } from '@slack/bolt';
import type { RepositoryTarget, Task } from '../types';

export class SlackBot {
  private app: App;
  private taskHandler?: (
    instruction: string,
    userId: string,
    channel: string,
    repoTarget: RepositoryTarget
  ) => Promise<void>;
  private cleanupHandler?: (repoTarget: RepositoryTarget) => Promise<{
    deletedBranches: string[];
    cleanedTasks: string[];
    errors: string[];
  }>;
  private defaultRepoTarget: RepositoryTarget;
  private pendingTasks: Map<
    string,
    { instruction: string; userId: string; channel: string; timestamp: number }
  >;
  private cleanupInterval: NodeJS.Timeout | null;

  constructor(
    botToken: string,
    appToken: string,
    signingSecret: string,
    defaultRepoTarget: RepositoryTarget
  ) {
    this.app = new App({
      token: botToken,
      appToken: appToken,
      signingSecret: signingSecret,
      socketMode: true,
      logLevel: LogLevel.INFO,
    });
    this.defaultRepoTarget = defaultRepoTarget;
    this.pendingTasks = new Map();
    this.cleanupInterval = null;

    this.setupEventHandlers();
    this.startCleanupTask();
  }

  private startCleanupTask(): void {
    // Clean up expired tasks every 5 minutes
    this.cleanupInterval = setInterval(
      () => {
        const now = Date.now();
        const expirationTime = 30 * 60 * 1000; // 30 minutes

        for (const [taskId, task] of this.pendingTasks.entries()) {
          if (now - task.timestamp > expirationTime) {
            this.pendingTasks.delete(taskId);
            console.log(`Cleaned up expired pending task: ${taskId}`);
          }
        }
      },
      5 * 60 * 1000
    );
  }

  private formatCleanupResult(
    repoTarget: RepositoryTarget,
    result: { deletedBranches: string[]; cleanedTasks: string[]; errors: string[] }
  ): string {
    let message = `✅ *Cleanup Complete*\n\n`;
    message += `*Repository:* ${repoTarget.owner}/${repoTarget.repo}\n`;
    message += `*Base Branch:* ${repoTarget.baseBranch}\n\n`;
    message += `*Deleted Branches:* ${result.deletedBranches.length}\n`;
    message += `*Cleaned Tasks:* ${result.cleanedTasks.length}\n`;

    if (result.deletedBranches.length > 0) {
      message += `\n*Branches Deleted:*\n${result.deletedBranches.map((b) => `• \`${b}\``).join('\n')}\n`;
    }

    if (result.errors.length > 0) {
      message += `\n⚠️ *Errors:*\n${result.errors.map((e) => `• ${e}`).join('\n')}`;
    }

    return message;
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

        // Post message with button to configure repository
        const taskId = randomUUID();
        this.pendingTasks.set(taskId, {
          instruction: text,
          userId: event.user ?? '',
          channel: event.channel,
          timestamp: Date.now(),
        });

        await client.chat.postMessage({
          channel: event.channel,
          thread_ts: event.ts,
          text: `Got it! Let me know which repository and branch to target:`,
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `*Task:* ${text}\n\n*Default:* \`${this.defaultRepoTarget.owner}/${this.defaultRepoTarget.repo}\` → \`${this.defaultRepoTarget.baseBranch}\``,
              },
            },
            {
              type: 'actions',
              block_id: `configure_${taskId}`,
              elements: [
                {
                  type: 'button',
                  text: {
                    type: 'plain_text',
                    text: '✓ Use Default',
                  },
                  style: 'primary',
                  action_id: 'use_default',
                  value: taskId,
                },
                {
                  type: 'button',
                  text: {
                    type: 'plain_text',
                    text: '⚙️ Specify Different',
                  },
                  action_id: 'specify_repo',
                  value: taskId,
                },
              ],
            },
          ],
        });
      } catch (error) {
        console.error('Error handling app mention:', error);
      }
    });

    // Handle "Use Default" button
    this.app.action('use_default', async ({ ack, body, client }) => {
      await ack();
      const action = body as BlockAction<ButtonAction>;
      const channelId = action.channel?.id;
      if (!channelId) return;
      const taskId = action.actions[0].value ?? '';
      const pending = this.pendingTasks.get(taskId);

      if (!pending) {
        await client.chat.postMessage({
          channel: channelId,
          text: '❌ Task expired. Please try again.',
        });
        return;
      }

      this.pendingTasks.delete(taskId);

      await client.chat.update({
        channel: channelId,
        ts: action.message?.ts ?? '',
        text: `✅ Working on: "${pending.instruction}"\nRepository: ${this.defaultRepoTarget.owner}/${this.defaultRepoTarget.repo} → ${this.defaultRepoTarget.baseBranch}`,
        blocks: [],
      });

      if (this.taskHandler) {
        await this.taskHandler(
          pending.instruction,
          pending.userId,
          pending.channel,
          this.defaultRepoTarget
        );
      }
    });

    // Handle "Specify Different" button - open modal
    this.app.action('specify_repo', async ({ ack, body, client }) => {
      await ack();
      const action = body as BlockAction<ButtonAction>;
      const channelId = action.channel?.id;
      if (!channelId) return;
      const taskId = action.actions[0].value ?? '';
      const pending = this.pendingTasks.get(taskId);

      if (!pending) {
        await client.chat.postMessage({
          channel: channelId,
          text: '❌ Task expired. Please try again.',
        });
        return;
      }

      try {
        await client.views.open({
          trigger_id: action.trigger_id,
          view: {
            type: 'modal',
            callback_id: 'repo_branch_modal',
            private_metadata: taskId,
            title: {
              type: 'plain_text',
              text: 'Select Repository',
            },
            submit: {
              type: 'plain_text',
              text: 'Submit',
            },
            blocks: [
              {
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: `*Task:* ${pending.instruction}`,
                },
              },
              {
                type: 'divider',
              },
              {
                type: 'input',
                block_id: 'repository_block',
                element: {
                  type: 'plain_text_input',
                  action_id: 'repository_input',
                  initial_value: this.defaultRepoTarget.owner,
                  placeholder: {
                    type: 'plain_text',
                    text: 'e.g., myorg or myusername',
                  },
                },
                label: {
                  type: 'plain_text',
                  text: 'Repository Owner',
                },
              },
              {
                type: 'input',
                block_id: 'repo_name_block',
                element: {
                  type: 'plain_text_input',
                  action_id: 'repo_name_input',
                  initial_value: this.defaultRepoTarget.repo,
                  placeholder: {
                    type: 'plain_text',
                    text: 'e.g., my-repo',
                  },
                },
                label: {
                  type: 'plain_text',
                  text: 'Repository Name',
                },
              },
              {
                type: 'input',
                block_id: 'branch_block',
                element: {
                  type: 'plain_text_input',
                  action_id: 'branch_input',
                  initial_value: this.defaultRepoTarget.baseBranch,
                  placeholder: {
                    type: 'plain_text',
                    text: 'e.g., main or develop',
                  },
                },
                label: {
                  type: 'plain_text',
                  text: 'Base Branch (PR target)',
                },
              },
              {
                type: 'context',
                elements: [
                  {
                    type: 'mrkdwn',
                    text: '💡 A new working branch will be created and a PR will be opened to merge into the base branch.',
                  },
                ],
              },
            ],
          },
        });
      } catch (error) {
        console.error('Error opening modal:', error);
        await client.chat.postMessage({
          channel: channelId,
          text: '❌ Failed to open configuration dialog. Please try again.',
        });
      }
    });

    // Handle modal submissions
    this.app.view('repo_branch_modal', async ({ ack, view, client }) => {
      await ack();

      try {
        const taskId = view.private_metadata;
        const pending = this.pendingTasks.get(taskId);

        if (!pending) {
          return;
        }

        this.pendingTasks.delete(taskId);

        const values = view.state.values;
        const owner =
          values.repository_block.repository_input.value || this.defaultRepoTarget.owner;
        const repo = values.repo_name_block.repo_name_input.value || this.defaultRepoTarget.repo;
        const baseBranch =
          values.branch_block.branch_input.value || this.defaultRepoTarget.baseBranch;

        const repoTarget: RepositoryTarget = {
          owner: owner.trim(),
          repo: repo.trim(),
          baseBranch: baseBranch.trim(),
        };

        await client.chat.postMessage({
          channel: pending.channel,
          text: `✅ Working on: "${pending.instruction}"\nRepository: ${repoTarget.owner}/${repoTarget.repo} → ${repoTarget.baseBranch}`,
        });

        if (this.taskHandler) {
          await this.taskHandler(pending.instruction, pending.userId, pending.channel, repoTarget);
        }
      } catch (error) {
        console.error('Error handling modal submission:', error);
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

        // Post message with button to configure repository
        const taskId = randomUUID();
        this.pendingTasks.set(taskId, {
          instruction,
          userId: command.user_id,
          channel: command.channel_id,
          timestamp: Date.now(),
        });

        await client.chat.postMessage({
          channel: command.channel_id,
          text: `Got it! Let me know which repository and branch to target:`,
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `*Task:* ${instruction}\n\n*Default:* \`${this.defaultRepoTarget.owner}/${this.defaultRepoTarget.repo}\` → \`${this.defaultRepoTarget.baseBranch}\``,
              },
            },
            {
              type: 'actions',
              block_id: `configure_${taskId}`,
              elements: [
                {
                  type: 'button',
                  text: {
                    type: 'plain_text',
                    text: '✓ Use Default',
                  },
                  style: 'primary',
                  action_id: 'use_default',
                  value: taskId,
                },
                {
                  type: 'button',
                  text: {
                    type: 'plain_text',
                    text: '⚙️ Specify Different',
                  },
                  action_id: 'specify_repo',
                  value: taskId,
                },
              ],
            },
          ],
        });
      } catch (error) {
        console.error('Error handling slash command:', error);
      }
    });

    // Listen for cleanup command
    this.app.command('/shipit-cleanup', async ({ command, ack, client }) => {
      await ack();

      try {
        await client.chat.postMessage({
          channel: command.channel_id,
          text: `Starting cleanup of merged branches...`,
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `*Cleanup Merged Branches*\n\nChoose which repository to clean up:`,
              },
            },
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `*Default:* \`${this.defaultRepoTarget.owner}/${this.defaultRepoTarget.repo}\` (base: \`${this.defaultRepoTarget.baseBranch}\`)`,
              },
            },
            {
              type: 'actions',
              block_id: `cleanup_actions`,
              elements: [
                {
                  type: 'button',
                  text: {
                    type: 'plain_text',
                    text: '🧹 Clean Default Repo',
                  },
                  style: 'primary',
                  action_id: 'cleanup_default',
                  value: command.channel_id,
                },
                {
                  type: 'button',
                  text: {
                    type: 'plain_text',
                    text: '⚙️ Clean Different Repo',
                  },
                  action_id: 'cleanup_specify',
                  value: command.channel_id,
                },
              ],
            },
          ],
        });
      } catch (error) {
        console.error('Error handling cleanup command:', error);
      }
    });

    // Handle cleanup default button
    this.app.action('cleanup_default', async ({ ack, body, client }) => {
      await ack();
      const action = body as BlockAction<ButtonAction>;
      const channelId = action.actions[0].value ?? '';
      if (!channelId) return;

      try {
        await client.chat.postMessage({
          channel: channelId,
          text: '🧹 Starting cleanup of merged branches...',
        });

        if (this.cleanupHandler) {
          const result = await this.cleanupHandler(this.defaultRepoTarget);
          const message = this.formatCleanupResult(this.defaultRepoTarget, result);

          await client.chat.postMessage({
            channel: channelId,
            text: message,
          });
        } else {
          await client.chat.postMessage({
            channel: channelId,
            text: '❌ Cleanup handler not configured',
          });
        }
      } catch (error) {
        console.error('Error handling cleanup:', error);
        await client.chat.postMessage({
          channel: channelId,
          text: `❌ Error during cleanup: ${error instanceof Error ? error.message : 'Unknown error'}`,
        });
      }
    });

    // Handle cleanup specify button
    this.app.action('cleanup_specify', async ({ ack, body, client }) => {
      await ack();
      const action = body as BlockAction<ButtonAction>;
      const channelId = action.actions[0].value ?? '';
      if (!channelId) return;

      try {
        await client.views.open({
          trigger_id: action.trigger_id,
          view: {
            type: 'modal',
            callback_id: 'cleanup_repo_modal',
            private_metadata: channelId,
            title: {
              type: 'plain_text',
              text: 'Cleanup Repository',
            },
            submit: {
              type: 'plain_text',
              text: 'Clean Up',
            },
            blocks: [
              {
                type: 'input',
                block_id: 'repository_block',
                element: {
                  type: 'plain_text_input',
                  action_id: 'repository_input',
                  initial_value: this.defaultRepoTarget.owner,
                  placeholder: {
                    type: 'plain_text',
                    text: 'e.g., myorg or myusername',
                  },
                },
                label: {
                  type: 'plain_text',
                  text: 'Repository Owner',
                },
              },
              {
                type: 'input',
                block_id: 'repo_name_block',
                element: {
                  type: 'plain_text_input',
                  action_id: 'repo_name_input',
                  initial_value: this.defaultRepoTarget.repo,
                  placeholder: {
                    type: 'plain_text',
                    text: 'e.g., my-repo',
                  },
                },
                label: {
                  type: 'plain_text',
                  text: 'Repository Name',
                },
              },
              {
                type: 'input',
                block_id: 'branch_block',
                element: {
                  type: 'plain_text_input',
                  action_id: 'branch_input',
                  initial_value: this.defaultRepoTarget.baseBranch,
                  placeholder: {
                    type: 'plain_text',
                    text: 'e.g., main or develop',
                  },
                },
                label: {
                  type: 'plain_text',
                  text: 'Base Branch',
                },
              },
            ],
          },
        });
      } catch (error) {
        console.error('Error opening cleanup modal:', error);
      }
    });

    // Handle cleanup modal submission
    this.app.view('cleanup_repo_modal', async ({ ack, view, client }) => {
      await ack();

      const channelId = view.private_metadata;
      const values = view.state.values;

      const owner = values.repository_block.repository_input.value ?? '';
      const repo = values.repo_name_block.repo_name_input.value ?? '';
      const baseBranch = values.branch_block.branch_input.value ?? '';

      try {
        await client.chat.postMessage({
          channel: channelId,
          text: `🧹 Starting cleanup of merged branches for ${owner}/${repo}...`,
        });

        if (this.cleanupHandler) {
          const repoTarget: RepositoryTarget = { owner, repo, baseBranch };
          const result = await this.cleanupHandler(repoTarget);
          const message = this.formatCleanupResult(repoTarget, result);

          await client.chat.postMessage({
            channel: channelId,
            text: message,
          });
        } else {
          await client.chat.postMessage({
            channel: channelId,
            text: '❌ Cleanup handler not configured',
          });
        }
      } catch (error) {
        console.error('Error handling cleanup:', error);
        await client.chat.postMessage({
          channel: channelId,
          text: `❌ Error during cleanup: ${error instanceof Error ? error.message : 'Unknown error'}`,
        });
      }
    });
  }

  onTask(
    handler: (
      instruction: string,
      userId: string,
      channel: string,
      repoTarget: RepositoryTarget
    ) => Promise<void>
  ): void {
    this.taskHandler = handler;
  }

  onCleanup(
    handler: (repoTarget: RepositoryTarget) => Promise<{
      deletedBranches: string[];
      cleanedTasks: string[];
      errors: string[];
    }>
  ): void {
    this.cleanupHandler = handler;
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
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    await this.app.stop();
    console.log('Slack bot stopped');
  }
}
