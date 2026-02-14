export type Tier = "free" | "pro" | "enterprise";

export interface TierLimits {
  maxProjects: number;
  maxAiEditsPerProject: number;
  maxAiMessagesPerDay: number;
  hasAi: boolean;
  hasServerCompile: boolean;
  maxServerCompilesPerDay: number;
  maxCompilesPerMinute: number;
  /** Storage limit in MB */
  storage: number;
  /** Auto-compile debounce delay in milliseconds */
  autoCompileDebounceMs: number;
}

export const TIER_LIMITS: Record<Tier, TierLimits> = {
  free: {
    maxProjects: 3,
    maxAiEditsPerProject: 3,
    maxAiMessagesPerDay: 0,
    hasAi: false,
    hasServerCompile: true,
    maxServerCompilesPerDay: Infinity,
    maxCompilesPerMinute: Infinity,
    storage: 50,
    autoCompileDebounceMs: 1000,
  },
  pro: {
    maxProjects: Infinity,
    maxAiEditsPerProject: Infinity,
    maxAiMessagesPerDay: 50,
    hasAi: true,
    hasServerCompile: true,
    maxServerCompilesPerDay: Infinity,
    maxCompilesPerMinute: Infinity,
    storage: 5000,
    autoCompileDebounceMs: 1000,
  },
  enterprise: {
    maxProjects: Infinity,
    maxAiEditsPerProject: Infinity,
    maxAiMessagesPerDay: Infinity,
    hasAi: true,
    hasServerCompile: true,
    maxServerCompilesPerDay: Infinity,
    maxCompilesPerMinute: Infinity,
    storage: Infinity,
    autoCompileDebounceMs: 1000,
  },
};

export function canCreateProject(tier: Tier, currentCount: number): boolean {
  return currentCount < TIER_LIMITS[tier].maxProjects;
}

export function canSendAiMessage(tier: Tier, usedToday: number): boolean {
  const limits = TIER_LIMITS[tier];
  if (!limits.hasAi) return false;
  return usedToday < limits.maxAiMessagesPerDay;
}

export function canUseStorage(tier: Tier, currentBytes: number, additionalBytes: number): boolean {
  const limitMB = TIER_LIMITS[tier].storage;
  if (limitMB === Infinity) return true;
  const limitBytes = limitMB * 1024 * 1024;
  return (currentBytes + additionalBytes) <= limitBytes;
}

export function getStorageLimitMB(tier: Tier): number {
  return TIER_LIMITS[tier].storage;
}

export function getRemainingCompiles(tier: Tier, usedToday: number): number {
  const max = TIER_LIMITS[tier].maxServerCompilesPerDay;
  if (max === Infinity) return Infinity;
  return Math.max(0, max - usedToday);
}

export function getAvailableModels(tier: Tier): string[] {
  switch (tier) {
    case "free":
      return [];
    case "pro":
      return ["claude-haiku", "gpt-4o-mini"];
    case "enterprise":
      return [
        "claude-haiku",
        "gpt-4o-mini",
        "claude-sonnet",
        "claude-opus",
        "gpt-4o",
      ];
  }
}

export function getTierLabel(tier: Tier): string {
  switch (tier) {
    case "free":
      return "Para experimentar";
    case "pro":
      return "Mais popular";
    case "enterprise":
      return "Para profissionais";
  }
}

export interface PricingInfo {
  tier: Tier;
  label: string;
  monthlyPrice: number;
  annualMonthlyPrice: number;
  features: string[];
}

export const PRICING: PricingInfo[] = [
  {
    tier: "free",
    label: "Free",
    monthlyPrice: 0,
    annualMonthlyPrice: 0,
    features: [
      "3 projetos",
      "Compilação no servidor (ilimitada)",
      "Editor básico com syntax highlighting",
      "50MB de armazenamento",
    ],
  },
  {
    tier: "pro",
    label: "Pro",
    monthlyPrice: 49,
    annualMonthlyPrice: 39,
    features: [
      "Projetos ilimitados",
      "50 mensagens IA/dia",
      "Compilação no servidor (ilimitada)",
      "Claude Haiku + GPT-4o-mini",
      "5GB de armazenamento",
    ],
  },
  {
    tier: "enterprise",
    label: "Enterprise",
    monthlyPrice: 149,
    annualMonthlyPrice: 119,
    features: [
      "Tudo do Pro",
      "Mensagens IA ilimitadas",
      "Todos os modelos (Sonnet, Opus, GPT-4o)",
      "Compilação no servidor (ilimitada)",
      "Armazenamento ilimitado",
      "Suporte prioritário",
      "Acesso à API",
    ],
  },
];
