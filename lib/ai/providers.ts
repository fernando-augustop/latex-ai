import { createAnthropic } from '@ai-sdk/anthropic';
import { createOpenAI } from '@ai-sdk/openai';
import type { ModelConfig, Tier, TierModels } from './types';

const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });

const proModels: ModelConfig[] = [
  {
    id: 'claude-haiku',
    label: 'Claude Haiku',
    provider: anthropic,
    modelId: 'claude-haiku-4-5-20251001',
  },
  {
    id: 'gpt-4o-mini',
    label: 'GPT-4o Mini',
    provider: openai,
    modelId: 'gpt-4o-mini',
  },
];

const enterpriseExclusiveModels: ModelConfig[] = [
  {
    id: 'claude-sonnet',
    label: 'Claude Sonnet',
    provider: anthropic,
    modelId: 'claude-sonnet-4-5-20250929',
  },
  {
    id: 'claude-opus',
    label: 'Claude Opus',
    provider: anthropic,
    modelId: 'claude-opus-4-6',
  },
  {
    id: 'gpt-4o',
    label: 'GPT-4o',
    provider: openai,
    modelId: 'gpt-4o',
  },
];

export const TIER_MODELS: TierModels = {
  free: [],
  pro: proModels,
  enterprise: [...enterpriseExclusiveModels, ...proModels],
};

export function getAvailableModelsForTier(tier: Tier): ModelConfig[] {
  return TIER_MODELS[tier];
}

export function getModelForTier(
  tier: Tier,
  modelId: string
): ModelConfig | null {
  const models = TIER_MODELS[tier];
  return models.find((m) => m.id === modelId) ?? null;
}
