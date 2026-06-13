const DEFAULT_OPENROUTER_MODEL = "google/gemini-2.0-flash-001";

export function getOpenRouterModel(): string {
  return (
    process.env.OPENROUTER_MODEL ||
    process.env.AI_MODEL ||
    DEFAULT_OPENROUTER_MODEL
  );
}
