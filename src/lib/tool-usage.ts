/**
 * Tracks free tool usage per user per tool in localStorage.
 * Free users get 1 free generation per tool before being prompted to upgrade.
 */

const FREE_LIMIT = 1;

function key(userId: string, tool: string) {
  return `applyready_tool_uses_${userId}_${tool}`;
}

export function getToolUseCount(userId: string, tool: string): number {
  if (typeof window === "undefined") return 0;
  try {
    return parseInt(localStorage.getItem(key(userId, tool)) ?? "0", 10);
  } catch {
    return 0;
  }
}

export function incrementToolUse(userId: string, tool: string): void {
  if (typeof window === "undefined") return;
  try {
    const current = getToolUseCount(userId, tool);
    localStorage.setItem(key(userId, tool), String(current + 1));
  } catch {
    // ignore
  }
}

export function hasFreeTrial(userId: string, tool: string): boolean {
  return getToolUseCount(userId, tool) < FREE_LIMIT;
}

export function isToolLocked(isPro: boolean, userId: string, tool: string): boolean {
  if (isPro) return false;
  return !hasFreeTrial(userId, tool);
}
