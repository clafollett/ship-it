import * as dotenv from 'dotenv';
import type { Config } from '../types';

dotenv.config();

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function loadConfig(): Config {
  return {
    anthropicApiKey: requireEnv('ANTHROPIC_API_KEY'),
    anthropicModel: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4.5-20250514',
    slackBotToken: requireEnv('SLACK_BOT_TOKEN'),
    slackAppToken: requireEnv('SLACK_APP_TOKEN'),
    slackSigningSecret: requireEnv('SLACK_SIGNING_SECRET'),
    githubToken: requireEnv('GITHUB_TOKEN'),
    githubOwner: requireEnv('GITHUB_OWNER'),
    githubRepo: requireEnv('GITHUB_REPO'),
    workingDirectory: process.env.WORKING_DIRECTORY || './workspace',
    defaultBranch: process.env.DEFAULT_BRANCH || 'main',
  };
}

export function generateTaskId(): string {
  return `task-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
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

export function formatRepositoryString(owner: string, repo: string): string {
  return `${owner}/${repo}`;
}
