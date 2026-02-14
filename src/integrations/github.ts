import { Octokit } from '@octokit/rest';
import simpleGit, { SimpleGit } from 'simple-git';
import * as fs from 'fs/promises';
import * as path from 'path';
import { CodeGenerationResult } from '../types';

export class GitHubIntegration {
  private octokit: Octokit;
  private git: SimpleGit;
  private owner: string;
  private repo: string;
  private workingDir: string;

  constructor(token: string, owner: string, repo: string, workingDir: string) {
    this.octokit = new Octokit({ auth: token });
    this.owner = owner;
    this.repo = repo;
    this.workingDir = workingDir;
    this.git = simpleGit(workingDir);
  }

  async initializeRepository(baseBranch: string): Promise<void> {
    try {
      await fs.mkdir(this.workingDir, { recursive: true });

      const repoUrl = `https://github.com/${this.owner}/${this.repo}.git`;
      console.log(`Cloning repository: ${repoUrl}`);

      await this.git.clone(repoUrl, this.workingDir);
      await this.git.checkout(baseBranch);

      console.log('Repository initialized successfully');
    } catch (error) {
      console.error('Error initializing repository:', error);
      throw error;
    }
  }

  async createBranch(branchName: string, baseBranch: string): Promise<void> {
    try {
      await this.git.fetch();
      await this.git.checkout(baseBranch);
      await this.git.pull();
      await this.git.checkoutBranch(branchName, `origin/${baseBranch}`);
      console.log(`Created branch: ${branchName}`);
    } catch (error) {
      console.error('Error creating branch:', error);
      throw error;
    }
  }

  async applyChanges(result: CodeGenerationResult): Promise<void> {
    if (!result.files || result.files.length === 0) {
      console.log('No files to apply');
      return;
    }

    for (const file of result.files) {
      const filePath = path.join(this.workingDir, file.path);

      try {
        if (file.action === 'delete') {
          await fs.unlink(filePath);
          console.log(`Deleted file: ${file.path}`);
        } else if (file.action === 'create' || file.action === 'modify') {
          const dir = path.dirname(filePath);
          await fs.mkdir(dir, { recursive: true });
          await fs.writeFile(filePath, file.content, 'utf-8');
          console.log(`${file.action === 'create' ? 'Created' : 'Modified'} file: ${file.path}`);
        }
      } catch (error) {
        console.error(`Error applying changes to ${file.path}:`, error);
        throw error;
      }
    }
  }

  async commitAndPush(message: string, branchName: string): Promise<void> {
    try {
      await this.git.add('.');
      await this.git.commit(message);
      await this.git.push('origin', branchName);
      console.log(`Committed and pushed changes to ${branchName}`);
    } catch (error) {
      console.error('Error committing and pushing:', error);
      throw error;
    }
  }

  async createPullRequest(
    title: string,
    body: string,
    headBranch: string,
    baseBranch: string
  ): Promise<string> {
    try {
      const response = await this.octokit.pulls.create({
        owner: this.owner,
        repo: this.repo,
        title,
        body,
        head: headBranch,
        base: baseBranch,
      });

      console.log(`Created pull request: ${response.data.html_url}`);
      return response.data.html_url;
    } catch (error) {
      console.error('Error creating pull request:', error);
      throw error;
    }
  }

  async listMergedBranches(baseBranch: string): Promise<string[]> {
    try {
      // Get all branches from GitHub
      const branches = await this.octokit.repos.listBranches({
        owner: this.owner,
        repo: this.repo,
        per_page: 100,
      });

      const mergedBranches: string[] = [];

      // Check each branch to see if it's merged
      for (const branch of branches.data) {
        // Skip the base branch itself
        if (branch.name === baseBranch) {
          continue;
        }

        try {
          // Compare the branch with the base branch
          const comparison = await this.octokit.repos.compareCommits({
            owner: this.owner,
            repo: this.repo,
            base: baseBranch,
            head: branch.name,
          });

          // If behind_by is 0 and ahead_by is 0, the branch is fully merged
          if (comparison.data.behind_by === 0 && comparison.data.ahead_by === 0) {
            mergedBranches.push(branch.name);
          }
        } catch (error) {
          console.error(`Error checking if branch ${branch.name} is merged:`, error);
        }
      }

      return mergedBranches;
    } catch (error) {
      console.error('Error listing merged branches:', error);
      throw error;
    }
  }

  async deleteBranch(branchName: string): Promise<void> {
    try {
      await this.octokit.git.deleteRef({
        owner: this.owner,
        repo: this.repo,
        ref: `heads/${branchName}`,
      });
      console.log(`Deleted branch: ${branchName}`);
    } catch (error) {
      console.error(`Error deleting branch ${branchName}:`, error);
      throw error;
    }
  }

  async cleanup(): Promise<void> {
    try {
      await fs.rm(this.workingDir, { recursive: true, force: true });
      console.log('Cleaned up working directory');
    } catch (error) {
      console.error('Error cleaning up:', error);
    }
  }
}
