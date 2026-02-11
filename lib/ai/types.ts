import type { LanguageModel } from 'ai';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ModelConfig {
  id: string;
  label: string;
  provider: { languageModel: (modelId: string) => LanguageModel };
  modelId: string;
}

export type Tier = 'free' | 'pro' | 'enterprise';

export interface TierModels {
  free: ModelConfig[];
  pro: ModelConfig[];
  enterprise: ModelConfig[];
}

export interface ChatRequest {
  messages: ChatMessage[];
  modelId: string;
  documentContent: string;
  tier: Tier;
}

export interface ChatResponse {
  id: string;
  role: 'assistant';
  content: string;
}
