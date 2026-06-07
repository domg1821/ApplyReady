/**
 * Persists AI tool outputs to localStorage so they survive page navigation.
 * Keyed by userId + tool name. Stores last 5 outputs per tool.
 */

export interface SavedOutput {
  id: string;
  tool: "cover-letter" | "linkedin-bio" | "interview-prep" | "job-match";
  label: string;       // e.g. "Cover Letter for Stripe — Product Manager"
  content: string;     // The text output (or JSON string for structured data)
  savedAt: number;     // Date.now()
}

const MAX_PER_TOOL = 5;

function key(userId: string) {
  return `applyready_saved_outputs_${userId}`;
}

function load(userId: string): SavedOutput[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(key(userId)) ?? "[]");
  } catch {
    return [];
  }
}

function save(userId: string, outputs: SavedOutput[]) {
  localStorage.setItem(key(userId), JSON.stringify(outputs));
}

export function saveOutput(
  userId: string,
  output: Omit<SavedOutput, "id" | "savedAt">
): void {
  const all = load(userId);
  const forTool = all.filter((o) => o.tool === output.tool);
  const others = all.filter((o) => o.tool !== output.tool);

  const newEntry: SavedOutput = {
    ...output,
    id: `${output.tool}-${Date.now()}`,
    savedAt: Date.now(),
  };

  // Keep only last MAX_PER_TOOL per tool
  const updated = [newEntry, ...forTool].slice(0, MAX_PER_TOOL);
  save(userId, [...others, ...updated]);
}

export function loadOutputs(userId: string, tool?: SavedOutput["tool"]): SavedOutput[] {
  const all = load(userId);
  const filtered = tool ? all.filter((o) => o.tool === tool) : all;
  return filtered.sort((a, b) => b.savedAt - a.savedAt);
}

export function deleteOutput(userId: string, id: string): void {
  const all = load(userId).filter((o) => o.id !== id);
  save(userId, all);
}
