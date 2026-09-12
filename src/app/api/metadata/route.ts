import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";

type MetadataResult = {
  title: string;
  description: string;
  image: string | null;
  favicon: string | null;
  domain: string;
};

function domainFromUrl(parsedUrl: URL): string {
  return parsedUrl.hostname.replace(/^www\./, "");
}

function fallbackMeta(parsedUrl: URL): MetadataResult {
  const domain = domainFromUrl(parsedUrl);
  return {
    title: domain,
    description: "",
    image: null,
    favicon: `${parsedUrl.origin}/favicon.ico`,
    domain,
  };
}

async function fetchMetadata(url: string): Promise<MetadataResult | { error: string; status: number }> {
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return { error: "Invalid URL", status: 400 };
  }

  if (!/^https?:$/i.test(parsedUrl.protocol)) {
    return { error: "Only http(s) URLs are supported", status: 400 };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(parsedUrl.toString(), {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; Stickify/1.0; +https://stickify.app)",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
    });

    clearTimeout(timeout);

    if (!response.ok) {
      return fallbackMeta(parsedUrl);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const title =
      $('meta[property="og:title"]').attr("content") ||
      $('meta[name="twitter:title"]').attr("content") ||
      $("title").text().trim() ||
      domainFromUrl(parsedUrl);

    const description =
      $('meta[property="og:description"]').attr("content") ||
      $('meta[name="twitter:description"]').attr("content") ||
      $('meta[name="description"]').attr("content") ||
      "";

    let image =
      $('meta[property="og:image"]').attr("content") ||
      $('meta[name="twitter:image"]').attr("content") ||
      $('meta[name="twitter:image:src"]').attr("content") ||
      "";

    if (image && !image.startsWith("http")) {
      image = new URL(image, parsedUrl.origin).toString();
    }

    let favicon =
      $('link[rel="icon"]').attr("href") ||
      $('link[rel="shortcut icon"]').attr("href") ||
      $('link[rel="apple-touch-icon"]').attr("href") ||
      "/favicon.ico";

    if (favicon && !favicon.startsWith("http")) {
      favicon = new URL(favicon, parsedUrl.origin).toString();
    }

    const domain = domainFromUrl(parsedUrl);

    return {
      title: title?.slice(0, 200) || domain,
      description: description?.slice(0, 500) || "",
      image: image || null,
      favicon: favicon || null,
      domain,
    };
  } catch {
    return fallbackMeta(parsedUrl);
  }
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  const result = await fetchMetadata(url);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const url = body?.url;
    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const result = await fetchMetadata(url);
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Failed to fetch metadata" }, { status: 500 });
  }
}
