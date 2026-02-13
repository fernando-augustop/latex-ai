/**
 * Tier limits shared between Convex functions.
 * The canonical tier limits are in lib/tier-limits.ts;
 * this file contains only the subset needed for server-side enforcement.
 */

export const TIER_LIMITS = {
  free: { maxProjects: 3, maxAiMessagesPerDay: 0, hasServerCompile: true, maxServerCompilesPerDay: Infinity, maxCompilesPerMinute: 15 },
  pro: { maxProjects: Infinity, maxAiMessagesPerDay: 50, hasServerCompile: true, maxServerCompilesPerDay: Infinity, maxCompilesPerMinute: 15 },
  enterprise: { maxProjects: Infinity, maxAiMessagesPerDay: Infinity, hasServerCompile: true, maxServerCompilesPerDay: Infinity, maxCompilesPerMinute: 30 },
} as const;

export type Tier = keyof typeof TIER_LIMITS;
