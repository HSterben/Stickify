import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(parsedUrl.toString(), {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Stickify/1.0; +https://stickify.app)",
        Accept: "text/html",
      },
    });

    clearTimeout(timeout);

    if (!response.ok) {
      return NextResponse.json({
        title: parsedUrl.hostname,
        domain: parsedUrl.hostname.replace("www.", ""),
        images: ["/web-preview.png"],
      });
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const title =
      $('meta[property="og:title"]').attr("content") ||
      $('meta[name="twitter:title"]').attr("content") ||
      $("title").text() ||
      parsedUrl.hostname;

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

    const domain = parsedUrl.hostname.replace("www.", "");

    // Add the images property with the local image
    return NextResponse.json({
      title: title?.slice(0, 200) || domain,
      description: description?.slice(0, 500) || "",
      image: image || null,
      favicon: favicon || null,
      domain,
      images: ["/web-preview.png"],
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch metadata" },
      { status: 500 }
    );
  }
}
