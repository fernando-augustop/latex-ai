import { streamText, convertToModelMessages, type UIMessage } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { z } from 'zod';
import { getModelForTier } from '@/lib/ai/providers';
import { buildSystemPrompt } from '@/lib/ai/latex-system-prompt';
import {
  isAuthenticated,
  fetchAuthMutation,
  fetchAuthQuery,
} from '@/lib/auth-server';
import { api } from '@/convex/_generated/api';
import type { Tier } from '@/lib/ai/types';
import type { Id } from '@/convex/_generated/dataModel';

export const maxDuration = 30;

const PRO_DAILY_LIMIT = 50;

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

const chatRequestSchema = z.object({
  messages: z.array(z.any()),
  modelId: z.string(),
  documentContent: z.string().optional().default(''),
  documentId: z.string(),
  tier: z.enum(['free', 'pro', 'enterprise']),
});

function extractTextFromUIMessage(message: unknown): string {
  if (typeof message !== 'object' || message === null) return '';
  const msg = message as Record<string, unknown>;

  if (typeof msg.content === 'string') {
    return msg.content;
  }
  if (Array.isArray(msg.parts)) {
    return msg.parts
      .filter((p: unknown) => typeof p === 'object' && p !== null && (p as Record<string, unknown>).type === 'text')
      .map((p: unknown) => (p as Record<string, unknown>).text as string)
      .join('\n');
  }
  return '';
}

export async function POST(req: Request) {
  try {
    if (!(await isAuthenticated())) {
      return Response.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body: unknown = await req.json();
    const parsed = chatRequestSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { error: 'Invalid request body', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { messages, modelId, documentContent, documentId, tier } =
      parsed.data;

    if (tier === 'free') {
      return Response.json(
        {
          error:
            'AI chat is not available on the Free tier. Please upgrade to Pro or Enterprise.',
        },
        { status: 403 }
      );
    }

    // Get current user from Convex
    const user = await fetchAuthMutation(
      api.users.getOrCreateCurrentUser,
      {}
    );

    // Check daily limit for Pro tier
    if (tier === 'pro') {
      const usage = await fetchAuthQuery(api.users.getAiUsage, {
        userId: user._id,
      });
      if (usage >= PRO_DAILY_LIMIT) {
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
        {
          error: `Model "${modelId}" is not available for the ${tier} tier.`,
        },
        { status: 403 }
      );
    }

    // Save user message to Convex (last message in the array)
    const lastMessage = messages[messages.length - 1];
    const userText = extractTextFromUIMessage(lastMessage);
    if (userText) {
      await fetchAuthMutation(api.chatMessages.sendMessage, {
        documentId: documentId as Id<'documents'>,
        userId: user._id,
        role: 'user' as const,
        content: userText,
      });
    }

    const systemPrompt = buildSystemPrompt(documentContent);

    const result = streamText({
      model: openrouter.chat(modelConfig.openRouterId),
      system: systemPrompt,
      messages: await convertToModelMessages(messages as UIMessage[]),
      onFinish: async ({ text }) => {
        try {
          // Save assistant message to Convex
          await fetchAuthMutation(api.chatMessages.sendMessage, {
            documentId: documentId as Id<'documents'>,
            userId: user._id,
            role: 'assistant' as const,
            content: text,
            model: modelId,
          });
          // Increment AI usage counter
          await fetchAuthMutation(api.users.incrementAiUsage, {
            userId: user._id,
          });
        } catch (err) {
          console.error('Failed to save assistant message or increment usage:', err);
        }
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Internal server error';
    return Response.json({ error: message }, { status: 500 });
  }
}
