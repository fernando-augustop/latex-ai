export interface ModelConfig {
  id: string;
  label: string;
  openRouterId: string;
}

export type Tier = 'free' | 'pro' | 'enterprise';

export interface TierModels {
  free: ModelConfig[];
  pro: ModelConfig[];
  enterprise: ModelConfig[];
}
