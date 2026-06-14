import { NextRequest, NextResponse } from "next/server";
import { getOpenRouterModel } from "@/lib/ai-config";

export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json();

    if (!content?.trim()) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ content: basicMarkdownCleanup(content) });
    }

    const { generateText } = await import("ai");
    const { createOpenAI } = await import("@ai-sdk/openai");

    const openrouter = createOpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey,
    });

    const model = getOpenRouterModel();
    const prompt = `Rewrite the following note as clean, simple markdown.

Rules:
- Keep the same meaning and facts
- Use short sentences and plain language
- Organize with markdown headings, bullet lists, or numbered lists when helpful
- Do not add new information
- Return markdown only, no code fences or commentary

Original note:
"""
${content.slice(0, 4000)}
"""`;

    const { text } = await generateText({
      model: openrouter(model),
      prompt,
      maxTokens: 1200,
    });

    const cleaned = text
      .replace(/^```(?:markdown|md)?\n?/i, "")
      .replace(/\n?```$/i, "")
      .trim();

    return NextResponse.json({
      content: cleaned || content,
    });
  } catch {
    return NextResponse.json({ error: "Rewrite failed" }, { status: 500 });
  }
}

function basicMarkdownCleanup(content: string): string {
  return content
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
