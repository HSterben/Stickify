import { NextRequest, NextResponse } from "next/server";
import { getOpenRouterModel } from "@/lib/ai-config";

export async function POST(request: NextRequest) {
  try {
    const { content, type, existingTags } = await request.json();

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        tags: fallbackTagSuggestion(content),
        contentType: detectContentType(content),
        summary: null,
      });
    }

    const { generateText } = await import("ai");
    const { createOpenAI } = await import("@ai-sdk/openai");

    const openrouter = createOpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey,
    });

    const model = getOpenRouterModel();

    const prompt = `Analyze this content and suggest:
1. Up to 5 relevant tags (lowercase, single words or hyphenated)
2. Whether this is better saved as "text", "code", or "link"
3. A short one-sentence summary

Content: """
${content.slice(0, 1000)}
"""

${existingTags?.length ? `The user already has these tags: ${existingTags.join(", ")}. Prefer reusing existing tags when relevant.` : ""}

Respond in JSON format only:
{"tags": ["tag1", "tag2"], "contentType": "text|code|link", "summary": "..."}`;

    const { text } = await generateText({
      model: openrouter(model),
      prompt,
      maxTokens: 200,
    });

    const cleaned = text.replace(/```json\n?|```\n?/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return NextResponse.json({
      tags: parsed.tags || [],
      contentType: parsed.contentType || type || "text",
      summary: parsed.summary || null,
    });
  } catch {
    return NextResponse.json({
      tags: [],
      contentType: "text",
      summary: null,
    });
  }
}

function detectContentType(content: string): "text" | "code" | "link" {
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

  return "text";
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
