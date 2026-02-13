import { NextRequest, NextResponse } from 'next/server';
import { aiManager } from '@/ai/ai-manager';
import { checkRateLimit } from '@/ai/prompt-firewall';
import { consumeUserCredit } from '@/db/users';
import { githubClient } from '@/github/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, projectId, prompt, siteType } = body;

    // Validate input
    if (!userId || !projectId || !prompt) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check rate limit
    if (!checkRateLimit(userId, 50)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Try again in 1 hour.' },
        { status: 429 }
      );
    }

    // Check user credits
    const hasCredits = await consumeUserCredit(userId);
    if (!hasCredits) {
      return NextResponse.json(
        { error: 'No credits remaining. Please upgrade your plan.' },
        { status: 403 }
      );
    }

    // Step 1: Architect phase (Claude)
    const architectResponse = await aiManager.generateResponse({
      prompt: `Design a ${siteType} website: ${prompt}`,
      role: 'architect',
      userId,
    });

    // Step 2: Engineer phase (Groq)
    const engineerResponse = await aiManager.generateResponse({
      prompt: `Build HTML/CSS for: ${prompt}`,
      role: 'engineer',
      context: architectResponse.content,
      userId,
    });

    // Step 3: Deploy to GitHub
    const { url } = await githubClient.createOrUpdateFile(
      userId,
      projectId,
      'index.html',
      engineerResponse.content
    );

    // Return result
    return NextResponse.json({
      success: true,
      data: {
        html: engineerResponse.content,
        architecture: architectResponse.content,
        publicUrl: url,
        previewUrl: githubClient.getPreviewUrl(userId, projectId),
      },
    });

  } catch (error: any) {
    console.error('Generation error:', error);
    
    return NextResponse.json(
      { 
        error: error.message || 'Generation failed',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
