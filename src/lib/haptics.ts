/**
 * Haptic feedback utility.
 * Falls back silently when Capacitor is not available (web / dev).
 *
 * Usage:
 *   import { haptic } from "@/lib/haptics";
 *   haptic("light");   // button tap
 *   haptic("medium");  // confirm action
 *   haptic("heavy");   // destructive action
 *   haptic("success"); // task complete
 *   haptic("error");   // error / failure
 *   haptic("warning"); // warning
 */

type HapticStyle = "light" | "medium" | "heavy" | "success" | "error" | "warning";

let _haptics: null | {
  impact: (o: { style: string }) => Promise<void>;
  notification: (o: { type: string }) => Promise<void>;
} = null;

async function getHaptics() {
  if (_haptics) return _haptics;
  try {
    // Dynamic import so this doesn't crash on web builds without Capacitor
    const { Haptics } = await import(
      /* webpackIgnore: true */ "@capacitor/haptics"
    );
    _haptics = {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      impact: (o) => Haptics.impact({ style: o.style as any }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      notification: (o) => Haptics.notification({ type: o.type as any }),
    };
    return _haptics;
  } catch {
    return null;
  }
}

export async function haptic(style: HapticStyle = "light"): Promise<void> {
  const h = await getHaptics();
  if (!h) return;

  if (style === "success") {
    await h.notification({ type: "SUCCESS" });
  } else if (style === "error") {
    await h.notification({ type: "ERROR" });
  } else if (style === "warning") {
    await h.notification({ type: "WARNING" });
  } else {
    const map: Record<string, string> = {
      light: "LIGHT",
      medium: "MEDIUM",
      heavy: "HEAVY",
    };
    await h.impact({ style: map[style] ?? "LIGHT" });
  }
}
