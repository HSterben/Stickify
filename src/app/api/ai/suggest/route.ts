import { NextRequest, NextResponse } from "next/server";
import {
  getOpenRouterModel,
  type AiCategoryOption,
  type AiSuggestResponse,
  type PostContentType,
} from "@/lib/ai-config";

export async function POST(request: NextRequest) {
  try {
    const { content, type, existingTags, categories } = await request.json();

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    const normalizedCategories = normalizeCategories(categories);

    if (!apiKey) {
      return NextResponse.json(
        buildFallbackResponse(content, type, normalizedCategories)
      );
    }

    const { generateText } = await import("ai");
    const { createOpenAI } = await import("@ai-sdk/openai");

    const openrouter = createOpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey,
    });

    const model = getOpenRouterModel();
    const boardPrompt = normalizedCategories.length
      ? `4. Which board should this be saved to? Pick exactly one board name from this list: ${normalizedCategories.map((c) => c.name).join(", ")}. Use the exact name from the list, or null if none fit.`
      : "";
    const boardJson = normalizedCategories.length
      ? ', "suggestedBoard": "exact board name or null"'
      : "";

    const prompt = `Analyze this content and suggest:
1. Up to 5 relevant tags (lowercase, single words or hyphenated)
2. Whether this is better saved as "text", "code", or "link"
3. A short title (max 8 words) that summarizes the content
${boardPrompt ? `${boardPrompt}\n` : ""}
Content: """
${content.slice(0, 1000)}
"""

${existingTags?.length ? `The user already has these tags: ${existingTags.join(", ")}. Prefer reusing existing tags when relevant.` : ""}

Respond in JSON format only:
{"tags": ["tag1", "tag2"], "contentType": "text|code|link", "summary": "short title here"${boardJson}}`;

    const { text } = await generateText({
      model: openrouter(model),
      prompt,
      maxOutputTokens: 250,
    });

    const cleaned = text.replace(/```json\n?|```\n?/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return NextResponse.json({
      tags: normalizeTags(parsed.tags),
      contentType: normalizeContentType(parsed.contentType, type),
      summary: typeof parsed.summary === "string" ? parsed.summary.trim() : null,
      suggestedCategoryId: resolveSuggestedCategoryId(
        parsed.suggestedBoard,
        normalizedCategories
      ),
    } satisfies AiSuggestResponse);
  } catch {
    return NextResponse.json({
      tags: [],
      contentType: "text",
      summary: null,
      suggestedCategoryId: null,
    } satisfies AiSuggestResponse);
  }
}

function normalizeCategories(categories: unknown): AiCategoryOption[] {
  if (!Array.isArray(categories)) return [];

  return categories
    .filter(
      (item): item is AiCategoryOption =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as AiCategoryOption).id === "string" &&
        typeof (item as AiCategoryOption).name === "string"
    )
    .map((item) => ({ id: item.id, name: item.name.trim() }))
    .filter((item) => item.name.length > 0);
}

function normalizeTags(tags: unknown): string[] {
  if (!Array.isArray(tags)) return [];

  return tags
    .filter((tag): tag is string => typeof tag === "string")
    .map((tag) => tag.trim().toLowerCase().replace(/[^a-z0-9-]/g, ""))
    .filter(Boolean)
    .slice(0, 5);
}

function normalizeContentType(
  value: unknown,
  fallback?: PostContentType
): PostContentType {
  if (value === "text" || value === "code" || value === "link") return value;
  return fallback ?? "text";
}

function resolveSuggestedCategoryId(
  suggestedBoard: unknown,
  categories: AiCategoryOption[]
): string | null {
  if (typeof suggestedBoard !== "string" || !suggestedBoard.trim()) return null;

  const match = categories.find(
    (category) =>
      category.name.toLowerCase() === suggestedBoard.trim().toLowerCase()
  );

  return match?.id ?? null;
}

function buildFallbackResponse(
  content: string,
  type: PostContentType | undefined,
  categories: AiCategoryOption[]
): AiSuggestResponse {
  return {
    tags: fallbackTagSuggestion(content),
    contentType: detectContentType(content, type),
    summary: fallbackTitleSuggestion(content),
    suggestedCategoryId: fallbackBoardSuggestion(content, categories),
  };
}

function detectContentType(
  content: string,
  fallback?: PostContentType
): PostContentType {
  const urlPattern = /^https?:\/\/[^\s]+$/;
  if (urlPattern.test(content.trim())) return "link";

  const codeIndicators = [
    /^(import|export|const|let|var|function|class|def|fn|pub|use)\s/m,
    /[{}\[\]();].*[{}\[\]();]/,
    /=>/,
    /\b(if|else|for|while|return|switch|case)\s*[({]/,
    /<\/?[a-z][\s\S]*>/i,
  ];

  const codeScore = codeIndicators.filter((p) => p.test(content)).length;
  if (codeScore >= 2) return "code";

  return fallback ?? "text";
}

function fallbackTitleSuggestion(content: string): string | null {
  const line = content
    .split("\n")
    .map((part) => part.trim())
    .find(Boolean);

  if (!line) return null;

  const words = line.split(/\s+/).slice(0, 8);
  return words.join(" ").slice(0, 80) || null;
}

function fallbackBoardSuggestion(
  content: string,
  categories: AiCategoryOption[]
): string | null {
  const lower = content.toLowerCase();

  const match = categories.find((category) =>
    lower.includes(category.name.toLowerCase())
  );

  return match?.id ?? null;
}

function fallbackTagSuggestion(content: string): string[] {
  const words = content.toLowerCase().split(/\s+/);
  const commonWords = new Set([
    "the", "a", "an", "is", "are", "was", "were", "be", "been",
    "have", "has", "had", "do", "does", "did", "will", "would",
    "could", "should", "may", "might", "can", "to", "of", "in",
    "for", "on", "with", "at", "by", "from", "as", "into", "this",
    "that", "it", "not", "or", "and", "but", "if", "so", "my",
    "your", "we", "they", "you", "i", "he", "she", "all", "no",
  ]);

  const freq = new Map<string, number>();
  for (const word of words) {
    const clean = word.replace(/[^a-z0-9-]/g, "");
    if (clean.length > 2 && !commonWords.has(clean)) {
      freq.set(clean, (freq.get(clean) || 0) + 1);
    }
  }

  return Array.from(freq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([word]) => word);
}
