import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

export function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return url;
  }
}

export function getRelativeTime(date: string): string {
  const now = new Date();
  const then = new Date(date);
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  return then.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export const POST_COLORS = [
  { name: "Default", value: null },
  { name: "Rose", value: "#fecdd3" },
  { name: "Amber", value: "#fde68a" },
  { name: "Emerald", value: "#a7f3d0" },
  { name: "Sky", value: "#bae6fd" },
  { name: "Violet", value: "#ddd6fe" },
  { name: "Pink", value: "#fbcfe8" },
] as const;

const PRESET_HEX = new Set<string>(
  POST_COLORS.filter((c) => c.value != null).map((c) => c.value as string)
);

/** Normalize `#rgb` / `#rrggbb` (optional leading #) to lowercase `#rrggbb`, or null if invalid. */
export function parseHexColor(input: string): string | null {
  const t = input.trim();
  const m = t.match(/^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/);
  if (!m) return null;
  let h = m[1];
  if (h.length === 3) {
    h = h
      .split("")
      .map((ch) => ch + ch)
      .join("");
  }
  return `#${h.toLowerCase()}`;
}

export function colorsEqual(a: string | null, b: string | null): boolean {
  if (a == null && b == null) return true;
  if (a == null || b == null) return false;
  const pa = parseHexColor(a);
  const pb = parseHexColor(b);
  return pa != null && pb != null && pa === pb;
}

/** True when `color` matches a built-in preset swatch (not custom / not default). */
export function isPresetAccentColor(color: string | null): boolean {
  if (color == null) return false;
  const p = parseHexColor(color);
  return p != null && PRESET_HEX.has(p);
}

export const CODE_LANGUAGES = [
  "javascript",
  "typescript",
  "python",
  "java",
  "c",
  "cpp",
  "csharp",
  "go",
  "rust",
  "ruby",
  "php",
  "swift",
  "kotlin",
  "html",
  "css",
  "scss",
  "sql",
  "bash",
  "json",
  "yaml",
  "markdown",
  "docker",
  "graphql",
  "plaintext",
] as const;
