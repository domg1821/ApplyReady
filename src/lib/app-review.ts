/**
 * In-app review scaffold.
 * Requests an App Store review via Capacitor when conditions are met.
 * Silently no-ops on web / dev.
 *
 * Usage:
 *   import { maybeRequestReview } from "@/lib/app-review";
 *   await maybeRequestReview(userId);   // call after meaningful milestone
 *
 * Triggers only when:
 *   - Running inside a Capacitor native wrapper (iOS/Android)
 *   - User has not been prompted in the last 30 days
 *   - Called at least 3 times total (milestones reached)
 */

const STORAGE_KEY = "applyready_review";

interface ReviewState {
  promptCount: number;
  lastPromptedAt: number | null;
}

function getState(userId: string): ReviewState {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}_${userId}`);
    if (!raw) return { promptCount: 0, lastPromptedAt: null };
    return JSON.parse(raw);
  } catch {
    return { promptCount: 0, lastPromptedAt: null };
  }
}

function setState(userId: string, state: ReviewState) {
  try {
    localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(state));
  } catch { /* ignore */ }
}

/** Call after a meaningful event (resume created, analysis done, etc.) */
export async function maybeRequestReview(userId: string): Promise<void> {
  const state = getState(userId);
  const now = Date.now();
  const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

  // Increment milestone counter
  const newCount = state.promptCount + 1;
  setState(userId, { ...state, promptCount: newCount });

  // Only trigger on 3rd, 10th, 25th milestones
  const triggerPoints = [3, 10, 25];
  if (!triggerPoints.includes(newCount)) return;

  // Don't prompt again within 30 days
  if (state.lastPromptedAt && now - state.lastPromptedAt < THIRTY_DAYS) return;

  try {
    // Dynamic import with variable to prevent TypeScript from resolving the module at build time
    const pkg = "@capacitor-community/rate-app";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { RateApp } = await import(/* webpackIgnore: true */ pkg as any);
    await RateApp.requestReview();
    setState(userId, { promptCount: newCount, lastPromptedAt: now });
  } catch {
    // Capacitor not available (web) — silently ignore
  }
}
