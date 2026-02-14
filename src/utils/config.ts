import { Config } from '../types';
import * as dotenv from 'dotenv';

dotenv.config();

export function loadConfig(): Config {
  const requiredEnvVars = [
    'ANTHROPIC_API_KEY',
    'SLACK_BOT_TOKEN',
    'SLACK_APP_TOKEN',
    'SLACK_SIGNING_SECRET',
    'GITHUB_TOKEN',
    'GITHUB_OWNER',
    'GITHUB_REPO',
  ];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  }

  return {
    anthropicApiKey: process.env.ANTHROPIC_API_KEY!,
    slackBotToken: process.env.SLACK_BOT_TOKEN!,
    slackAppToken: process.env.SLACK_APP_TOKEN!,
    slackSigningSecret: process.env.SLACK_SIGNING_SECRET!,
    githubToken: process.env.GITHUB_TOKEN!,
    githubOwner: process.env.GITHUB_OWNER!,
    githubRepo: process.env.GITHUB_REPO!,
    workingDirectory: process.env.WORKING_DIRECTORY || './workspace',
    defaultBranch: process.env.DEFAULT_BRANCH || 'main',
  };
}

export function generateTaskId(): string {
  return `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function generateBranchName(taskDescription: string): string {
  const sanitized = taskDescription
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50);
  return `ai-task/${sanitized}-${Date.now()}`;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
