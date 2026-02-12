/**
 * Tier limits shared between Convex functions.
 * The canonical tier limits are in lib/tier-limits.ts;
 * this file contains only the subset needed for server-side enforcement.
 */

export const TIER_LIMITS = {
  free: { maxProjects: 3, maxAiMessagesPerDay: 0, hasServerCompile: false },
  pro: { maxProjects: Infinity, maxAiMessagesPerDay: 50, hasServerCompile: true },
  enterprise: { maxProjects: Infinity, maxAiMessagesPerDay: Infinity, hasServerCompile: true },
} as const;

export type Tier = keyof typeof TIER_LIMITS;
