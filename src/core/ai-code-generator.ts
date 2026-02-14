import Anthropic from '@anthropic-ai/sdk';
import type { CodeGenerationRequest, CodeGenerationResult } from '../types';

export class AICodeGenerator {
  private client: Anthropic;
  private model: string;

  constructor(apiKey: string, model: string = 'claude-sonnet-4.5-20250514') {
    this.client = new Anthropic({
      apiKey,
    });
    this.model = model;
  }

  async generateCode(request: CodeGenerationRequest): Promise<CodeGenerationResult> {
    try {
      const systemPrompt = this.buildSystemPrompt(request.taskType);
      const userPrompt = this.buildUserPrompt(request);

      const message = await this.client.messages.create({
        model: this.model,
        max_tokens: 8192,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt,
          },
        ],
      });

      const response = message.content[0];
      if (response.type !== 'text') {
        throw new Error('Unexpected response type from Claude');
      }

      return this.parseClaudeResponse(response.text);
    } catch (error) {
      console.error('Error generating code:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private buildSystemPrompt(taskType: CodeGenerationRequest['taskType']): string {
    const basePrompt = `You are an expert software engineer working on an AI-powered development system. 
Your role is to generate high-quality, production-ready code based on developer instructions.

When generating code, you should:
1. Write clean, maintainable, and well-documented code
2. Follow best practices and design patterns
3. Include error handling and edge cases
4. Write appropriate tests when needed
5. Provide clear explanations of your changes

Format your response as JSON with the following structure:
{
  "success": true,
  "files": [
    {
      "path": "relative/path/to/file.ts",
      "content": "file content here",
      "action": "create|modify|delete"
    }
  ],
  "explanation": "Brief explanation of what was changed and why"
}`;

    const taskSpecificPrompt = {
      bug_fix: '\n\nFocus on identifying and fixing the bug while minimizing code changes.',
      feature:
        '\n\nFocus on implementing the feature with proper structure, tests, and documentation.',
      refactor:
        '\n\nFocus on improving code quality, readability, and maintainability without changing behavior.',
      test: '\n\nFocus on creating comprehensive tests that cover edge cases and error scenarios.',
    };

    return basePrompt + taskSpecificPrompt[taskType];
  }

  private buildUserPrompt(request: CodeGenerationRequest): string {
    let prompt = `Task: ${request.instruction}\n\n`;

    if (request.context) {
      prompt += `Context:\n${request.context}\n\n`;
    }

    if (request.files && request.files.length > 0) {
      prompt += `Relevant files:\n${request.files.join('\n')}\n\n`;
    }

    prompt += 'Please generate the necessary code changes to complete this task.';

    return prompt;
  }

  private parseClaudeResponse(text: string): CodeGenerationResult {
    try {
      // Try to extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        // If no JSON found, treat the entire response as code
        return {
          success: true,
          generatedCode: text,
          explanation: 'Generated code from AI',
        };
      }

      const parsed = JSON.parse(jsonMatch[0]);
      return {
        success: parsed.success !== false,
        files: parsed.files,
        explanation: parsed.explanation,
        generatedCode: parsed.code || text,
      };
    } catch (_error) {
      console.warn('Failed to parse Claude response as JSON, using raw text');
      return {
        success: true,
        generatedCode: text,
        explanation: 'Generated code from AI',
      };
    }
  }
}
