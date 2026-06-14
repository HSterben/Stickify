const DEFAULT_OPENROUTER_MODEL = "google/gemini-2.0-flash-001";

export function getOpenRouterModel(): string {
  return (
    process.env.OPENROUTER_MODEL ||
    process.env.AI_MODEL ||
    DEFAULT_OPENROUTER_MODEL
  );
}

export type PostContentType = "text" | "code" | "link";

export type AiCategoryOption = {
  id: string;
  name: string;
};

export type AiSuggestRequest = {
  content: string;
  type?: PostContentType;
  existingTags?: string[];
  categories?: AiCategoryOption[];
};

export type AiSuggestResponse = {
  tags: string[];
  contentType: PostContentType;
  summary: string | null;
  suggestedCategoryId: string | null;
};
