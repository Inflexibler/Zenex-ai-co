import Anthropic from '@anthropic-ai/sdk';
import Groq from 'groq-sdk';
import { checkPromptSafety, PromptFirewallResult } from './prompt-firewall';

// ✅ FIXED: Key rotation helper
class KeyRotator {
  private keys: string[];
  private currentIndex: number = 0;

  constructor(keyString: string) {
    this.keys = keyString.split(',').map(k => k.trim()).filter(Boolean);
    if (this.keys.length === 0) {
      throw new Error('No API keys provided');
    }
  }

  getNext(): string {
    const key = this.keys[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.keys.length;
    return key;
  }

  hasMultiple(): boolean {
    return this.keys.length > 1;
  }
}

// Initialize rotators
const groqRotator = new KeyRotator(process.env.GROQ_KEYS || '');
const geminiRotator = new KeyRotator(process.env.GEMINI_KEYS || '');
const anthropicRotator = new KeyRotator(process.env.ANTHROPIC_KEYS || '');

export type AIProvider = 'groq' | 'gemini' | 'anthropic' | 'sambanova';
export type AIRole = 'architect' | 'engineer';

export interface AIRequest {
  prompt: string;
  role: AIRole;
  context?: string;
  userId: string;
}

export interface AIResponse {
  content: string;
  provider: AIProvider;
  tokensUsed?: number;
  cached: boolean;
}

export class AIManager {
  private requestCache = new Map<string, AIResponse>();
  private readonly CACHE_TTL = 3600000; // 1 hour

  async generateResponse(request: AIRequest): Promise<AIResponse> {
    // ✅ CRITICAL: FIREWALL ENFORCEMENT
    const safetyCheck = await this.enforceFirewall(request.prompt, request.userId);
    
    if (!safetyCheck.safe) {
      throw new Error(`Prompt blocked: ${safetyCheck.reason}`);
    }

    // Check cache
    const cacheKey = this.getCacheKey(request);
    const cached = this.requestCache.get(cacheKey);
    
    if (cached) {
      return { ...cached, cached: true };
    }

    // Route to appropriate AI based on role
    let response: AIResponse;

    if (request.role === 'architect') {
      response = await this.callArchitect(request);
    } else {
      response = await this.callEngineer(request);
    }

    // Cache response
    this.requestCache.set(cacheKey, response);
    setTimeout(() => this.requestCache.delete(cacheKey), this.CACHE_TTL);

    return response;
  }

  private async enforceFirewall(prompt: string, userId: string): Promise<PromptFirewallResult> {
    const result = await checkPromptSafety(prompt);
    
    // Log blocked attempts
    if (!result.safe) {
      console.warn(`[FIREWALL BLOCK] User: ${userId}, Reason: ${result.reason}`);
      
      // You can add database logging here
      // await logSecurityEvent(userId, 'prompt_blocked', result.reason);
    }

    return result;
  }

  private async callArchitect(request: AIRequest): Promise<AIResponse> {
    // Architect = Claude (Anthropic)
    try {
      const client = new Anthropic({
        apiKey: anthropicRotator.getNext(),
      });

      const message = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        messages: [{
          role: 'user',
          content: this.buildArchitectPrompt(request),
        }],
      });

      const content = message.content[0];
      const text = content.type === 'text' ? content.text : '';

      return {
        content: text,
        provider: 'anthropic',
        tokensUsed: message.usage.input_tokens + message.usage.output_tokens,
        cached: false,
      };
    } catch (error: any) {
      console.error('Anthropic error:', error);
      
      // Fallback to Groq if Anthropic fails
      return await this.callEngineer(request);
    }
  }

  private async callEngineer(request: AIRequest): Promise<AIResponse> {
    // Engineer = Groq (fast code generation)
    try {
      const client = new Groq({
        apiKey: groqRotator.getNext(),
      });

      const completion = await client.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{
          role: 'user',
          content: this.buildEngineerPrompt(request),
        }],
        max_tokens: 8000,
        temperature: 0.7,
      });

      return {
        content: completion.choices[0]?.message?.content || '',
        provider: 'groq',
        tokensUsed: completion.usage?.total_tokens,
        cached: false,
      };
    } catch (error: any) {
      console.error('Groq error:', error);
      throw new Error('All AI providers failed');
    }
  }

  private buildArchitectPrompt(request: AIRequest): string {
    return `You are a website architecture expert. Design a complete website structure.

User Request: ${request.prompt}

${request.context ? `Context: ${request.context}` : ''}

Provide:
1. Site structure (pages, navigation)
2. Design system (colors, typography, spacing)
3. Content sections for each page
4. Admin panel requirements

Output as JSON with this structure:
{
  "structure": {...},
  "design": {...},
  "pages": [...],
  "adminSchema": {...}
}`;
  }

  private buildEngineerPrompt(request: AIRequest): string {
    return `You are an expert frontend engineer. Generate production-ready HTML/CSS code.

Architecture: ${request.context || 'N/A'}

User Request: ${request.prompt}

Requirements:
- Modern, responsive design
- Tailwind CSS for styling
- Semantic HTML5
- Optimized for performance
- Mobile-first approach

Generate complete HTML with embedded CSS (using Tailwind CDN).`;
  }

  private getCacheKey(request: AIRequest): string {
    return `${request.role}:${request.prompt}:${request.context || ''}`;
  }
}

export const aiManager = new AIManager();
