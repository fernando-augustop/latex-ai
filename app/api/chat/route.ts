import { streamText } from 'ai';
import { z } from 'zod';
import { getModelForTier } from '@/lib/ai/providers';
import { buildSystemPrompt } from '@/lib/ai/latex-system-prompt';
import type { Tier } from '@/lib/ai/types';

const chatRequestSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant', 'system']),
      content: z.string(),
    })
  ),
  modelId: z.string(),
  documentContent: z.string().optional().default(''),
  tier: z.enum(['free', 'pro', 'enterprise']),
});

const PRO_DAILY_LIMIT = 50;

// In-memory daily message counter (replace with DB in production)
const dailyUsage = new Map<string, { count: number; date: string }>();

function checkDailyLimit(userId: string): boolean {
  const today = new Date().toISOString().slice(0, 10);
  const usage = dailyUsage.get(userId);

  if (!usage || usage.date !== today) {
    dailyUsage.set(userId, { count: 1, date: today });
    return true;
  }

  if (usage.count >= PRO_DAILY_LIMIT) {
    return false;
  }

  usage.count += 1;
  return true;
}

export async function POST(req: Request) {
  try {
    const body: unknown = await req.json();
    const parsed = chatRequestSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { error: 'Invalid request body', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { messages, modelId, documentContent, tier } = parsed.data;

    // Free tier cannot use AI
    if (tier === 'free') {
      return Response.json(
        { error: 'AI chat is not available on the Free tier. Please upgrade to Pro or Enterprise.' },
        { status: 403 }
      );
    }

    // Check daily limit for Pro tier
    if (tier === 'pro') {
      // TODO: Replace with real user ID from auth session
      const userId = 'anonymous';
      if (!checkDailyLimit(userId)) {
        return Response.json(
          {
            error: `Daily message limit reached (${PRO_DAILY_LIMIT} messages/day). Upgrade to Enterprise for unlimited messages.`,
          },
          { status: 429 }
        );
      }
    }

    // Resolve the model for this tier
    const modelConfig = getModelForTier(tier as Tier, modelId);

    if (!modelConfig) {
      return Response.json(
        { error: `Model "${modelId}" is not available for the ${tier} tier.` },
        { status: 403 }
      );
    }

    const systemPrompt = buildSystemPrompt(documentContent);

    const result = streamText({
      model: modelConfig.provider.languageModel(modelConfig.modelId),
      system: systemPrompt,
      messages,
    });

    return result.toTextStreamResponse();
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Internal server error';
    return Response.json({ error: message }, { status: 500 });
  }
}
