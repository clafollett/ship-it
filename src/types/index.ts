export interface Task {
  id: string;
  description: string;
  type: 'bug_fix' | 'feature' | 'refactor' | 'test';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  requestedBy: string;
  createdAt: Date;
  completedAt?: Date;
  branch?: string;
  pullRequestUrl?: string;
  error?: string;
}

export interface CodeGenerationRequest {
  instruction: string;
  context?: string;
  files?: string[];
  taskType: Task['type'];
}

export interface CodeGenerationResult {
  success: boolean;
  generatedCode?: string;
  files?: Array<{
    path: string;
    content: string;
    action: 'create' | 'modify' | 'delete';
  }>;
  testResults?: TestResult;
  explanation?: string;
  error?: string;
}

export interface TestResult {
  passed: boolean;
  output: string;
  failedTests?: string[];
}

export interface SlackMessage {
  channel: string;
  user: string;
  text: string;
  timestamp: string;
}

export interface Config {
  anthropicApiKey: string;
  anthropicModel?: string;
  slackBotToken: string;
  slackAppToken: string;
  slackSigningSecret: string;
  githubToken: string;
  githubOwner: string;
  githubRepo: string;
  workingDirectory: string;
  defaultBranch: string;
}
