import type { ModelConfig, Tier, TierModels } from './types';

const proModels: ModelConfig[] = [
  {
    id: 'claude-haiku',
    label: 'Claude Haiku',
    openRouterId: 'anthropic/claude-haiku-4-5-20251001',
  },
  {
    id: 'gpt-4o-mini',
    label: 'GPT-4o Mini',
    openRouterId: 'openai/gpt-4o-mini',
  },
];

const enterpriseExclusiveModels: ModelConfig[] = [
  {
    id: 'claude-sonnet',
    label: 'Claude Sonnet',
    openRouterId: 'anthropic/claude-sonnet-4-5-20250929',
  },
  {
    id: 'claude-opus',
    label: 'Claude Opus',
    openRouterId: 'anthropic/claude-opus-4-6',
  },
  {
    id: 'gpt-4o',
    label: 'GPT-4o',
    openRouterId: 'openai/gpt-4o',
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
