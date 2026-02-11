export type Tier = "free" | "pro" | "enterprise";

export interface TierLimits {
  maxProjects: number;
  maxAiEditsPerProject: number;
  maxAiMessagesPerDay: number;
  hasAi: boolean;
  hasServerCompile: boolean;
  /** Storage limit in MB */
  storage: number;
}

export const TIER_LIMITS: Record<Tier, TierLimits> = {
  free: {
    maxProjects: 3,
    maxAiEditsPerProject: 3,
    maxAiMessagesPerDay: 0,
    hasAi: false,
    hasServerCompile: false,
    storage: 50,
  },
  pro: {
    maxProjects: Infinity,
    maxAiEditsPerProject: Infinity,
    maxAiMessagesPerDay: 50,
    hasAi: true,
    hasServerCompile: true,
    storage: 5000,
  },
  enterprise: {
    maxProjects: Infinity,
    maxAiEditsPerProject: Infinity,
    maxAiMessagesPerDay: Infinity,
    hasAi: true,
    hasServerCompile: true,
    storage: Infinity,
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
      "3 edicoes IA por projeto",
      "Preview client-side",
      "Editor basico com syntax highlighting",
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
      "Compilacao server-side (PDF real)",
      "Claude Haiku + GPT-4o-mini",
      "5GB de armazenamento",
      "Historico de versoes",
      "Export PDF",
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
      "Compilacao prioritaria",
      "Armazenamento ilimitado",
      "Suporte prioritario",
      "API access",
    ],
  },
];
