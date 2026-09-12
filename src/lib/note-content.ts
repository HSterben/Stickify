import { marked } from "marked";
import type { Post } from "@/lib/types/database";

marked.setOptions({ gfm: true, breaks: true });

const HTML_START = /^\s*</;

export function looksLikeHtml(content: string | null | undefined): boolean {
  if (!content?.trim()) return false;
  return HTML_START.test(content);
}

/** Convert legacy markdown (or plain text) into TipTap-friendly HTML. */
export function markdownToHtml(markdown: string): string {
  const trimmed = markdown.trim();
  if (!trimmed) return "";
  if (looksLikeHtml(trimmed)) return trimmed;
  return marked.parse(trimmed, { async: false }) as string;
}

/** Normalize stored note body for the editor (migrates markdown in place of view). */
export function normalizeNoteHtml(content: string | null | undefined): string {
  if (!content?.trim()) return "";
  return markdownToHtml(content);
}

export function isNoteEmpty(html: string | null | undefined): boolean {
  if (!html?.trim()) return true;
  const text = html
    .replace(/<br\s*\/?>/gi, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/<[^>]+>/g, "")
    .trim();
  const hasMedia = /<(img|video|iframe)\b/i.test(html);
  const hasTask = /data-type=["']taskItem["']/i.test(html) || /task-list/i.test(html);
  return !text && !hasMedia && !hasTask;
}

export function htmlToPlainText(html: string): string {
  if (!html) return "";
  if (!looksLikeHtml(html)) return html.replace(/\s+/g, " ").trim();
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<\/h[1-6]>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function deriveTitleFromContent(html: string, fallback = "Untitled"): string {
  const plain = htmlToPlainText(html);
  if (!plain) return fallback;
  const firstLine = plain.split("\n").map((l) => l.trim()).find(Boolean) ?? "";
  return firstLine.slice(0, 80) || fallback;
}

export type NoteFeatures = {
  hasChecklist: boolean;
  hasCode: boolean;
  hasLinks: boolean;
  hasImages: boolean;
  checklistTotal: number;
  checklistDone: number;
};

export function analyzeNoteHtml(html: string | null | undefined): NoteFeatures {
  const content = html ?? "";
  const taskItems = content.match(/data-type=["']taskItem["']/gi) ?? [];
  const checked =
    content.match(/data-checked=["']true["']/gi) ??
    content.match(/checked(?:="")?(?=\s|>)/gi) ??
    [];
  // TipTap task items use data-checked="true"
  const done = (content.match(/data-checked=["']true["']/gi) ?? []).length;
  const total = taskItems.length;

  return {
    hasChecklist: total > 0 || /task-list|taskList/i.test(content),
    hasCode: /<pre[\s>]|<code[\s>]/i.test(content),
    hasLinks: /<a\s[^>]*href=/i.test(content),
    hasImages: /<img\s/i.test(content),
    checklistTotal: total,
    checklistDone: Math.min(done, total || checked.length),
  };
}

export function analyzePost(post: Pick<
  Post,
  "type" | "content_text" | "content_code" | "url" | "preview_image"
>): NoteFeatures {
  const fromHtml = analyzeNoteHtml(post.content_text);
  return {
    hasChecklist: fromHtml.hasChecklist,
    hasCode: fromHtml.hasCode || post.type === "code" || !!post.content_code?.trim(),
    hasLinks:
      fromHtml.hasLinks ||
      post.type === "link" ||
      !!post.url?.trim(),
    hasImages: fromHtml.hasImages || !!post.preview_image,
    checklistTotal: fromHtml.checklistTotal,
    checklistDone: fromHtml.checklistDone,
  };
}

/** Toggle a TipTap task item checked state in stored HTML by index. */
export function toggleTaskCheckedInHtml(html: string, index: number): string {
  let i = 0;
  let itemStart = -1;
  let itemEnd = -1;
  const re = /<li\b[^>]*data-type=["']taskItem["'][^>]*>[\s\S]*?<\/li>/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html)) !== null) {
    if (i === index) {
      itemStart = match.index;
      itemEnd = match.index + match[0].length;
      break;
    }
    i += 1;
  }
  if (itemStart < 0) return html;

  const item = html.slice(itemStart, itemEnd);
  const currentlyChecked = /data-checked=["']true["']/i.test(item);
  const next = currentlyChecked ? "false" : "true";
  let updated = /data-checked=/i.test(item)
    ? item.replace(/data-checked=["'](?:true|false)["']/i, `data-checked="${next}"`)
    : item.replace(
        /(<li\b[^>]*data-type=["']taskItem["'])/i,
        `$1 data-checked="${next}"`
      );

  if (currentlyChecked) {
    updated = updated.replace(
      /<input\b([^>]*type=["']checkbox["'][^>]*)>/i,
      (_m, attrs: string) => {
        const cleaned = attrs.replace(/\schecked(?:=["'][^"']*["'])?/gi, "");
        return `<input${cleaned}>`;
      }
    );
  } else {
    updated = updated.replace(
      /<input\b([^>]*type=["']checkbox["'][^>]*)>/i,
      (_m, attrs: string) => {
        if (/\schecked\b/i.test(attrs)) return `<input${attrs}>`;
        return `<input${attrs} checked>`;
      }
    );
  }
  return html.slice(0, itemStart) + updated + html.slice(itemEnd);
}

const URL_ONLY =
  /^(https?:\/\/[^\s]+)$/i;

export function isBareUrl(text: string): boolean {
  return URL_ONLY.test(text.trim());
}

export function getDraftKey(categoryId: string): string {
  return `stickify-draft:${categoryId}`;
}

export type PostDraft = {
  title: string;
  html: string;
  url: string | null;
  preview: {
    title?: string;
    description?: string;
    image?: string;
    favicon?: string;
    domain?: string;
  } | null;
  color: string | null;
  tags: string[];
  showLinkPreview: boolean;
  updatedAt: number;
};

export function loadDraft(categoryId: string): PostDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(getDraftKey(categoryId));
    if (!raw) return null;
    return JSON.parse(raw) as PostDraft;
  } catch {
    return null;
  }
}

export function saveDraft(categoryId: string, draft: Omit<PostDraft, "updatedAt">) {
  if (typeof window === "undefined") return;

  const key = getDraftKey(categoryId);
  const tryWrite = (payload: PostDraft) => {
    localStorage.setItem(key, JSON.stringify(payload));
  };

  // Base64 images/GIFs blow past localStorage quotas (~5MB). Keep them in
  // editor state only; drafts store a lightweight placeholder instead.
  const lightHtml = stripDraftMedia(draft.html);
  const payload: PostDraft = {
    ...draft,
    html: lightHtml,
    updatedAt: Date.now(),
  };

  try {
    tryWrite(payload);
  } catch {
    try {
      tryWrite({
        ...payload,
        html: stripDraftMedia(draft.html, true),
        preview: payload.preview
          ? { ...payload.preview, image: undefined }
          : null,
      });
    } catch {
      // Quota still exceeded — drop the draft rather than crash the editor.
      try {
        localStorage.removeItem(key);
      } catch {
        /* ignore */
      }
    }
  }
}

/** Remove or stub oversized embedded media so drafts fit in localStorage. */
export function stripDraftMedia(html: string, aggressive = false): string {
  if (!html) return html;
  let next = html.replace(
    /<img\b([^>]*?)src=["']data:image\/[^"']+["']([^>]*)>/gi,
    (_match, before: string, after: string) =>
      `<img${before}src="" data-draft-omitted="true" alt="Image saved with post, not in draft"${after}>`
  );
  if (aggressive) {
    next = next.replace(/<img\b[^>]*>/gi, "");
  }
  return next;
}

export function clearDraft(categoryId: string) {
  if (typeof window === "undefined") return;
  localStorage.removeItem(getDraftKey(categoryId));
}

export type BoardViewMode = "cards" | "compact" | "list";

export function getBoardViewStorageKey(boardId: string): string {
  return `stickify-board-view:${boardId}`;
}

export function loadBoardViewMode(boardId: string): BoardViewMode {
  if (typeof window === "undefined") return "cards";
  const v = localStorage.getItem(getBoardViewStorageKey(boardId));
  if (v === "cards" || v === "compact" || v === "list") return v;
  return "cards";
}

export function saveBoardViewMode(boardId: string, mode: BoardViewMode) {
  if (typeof window === "undefined") return;
  localStorage.setItem(getBoardViewStorageKey(boardId), mode);
}

export const SIDEBAR_WIDTH_KEY = "stickify-sidebar-width";
export const SIDEBAR_WIDTH_DEFAULT = 256;
export const SIDEBAR_WIDTH_MIN = 200;
export const SIDEBAR_WIDTH_MAX = 420;

export function loadSidebarWidth(): number {
  if (typeof window === "undefined") return SIDEBAR_WIDTH_DEFAULT;
  const n = Number(localStorage.getItem(SIDEBAR_WIDTH_KEY));
  if (!Number.isFinite(n)) return SIDEBAR_WIDTH_DEFAULT;
  return Math.min(SIDEBAR_WIDTH_MAX, Math.max(SIDEBAR_WIDTH_MIN, n));
}

export function saveSidebarWidth(width: number) {
  if (typeof window === "undefined") return;
  localStorage.setItem(SIDEBAR_WIDTH_KEY, String(width));
}

/** Wrap legacy code-only posts into HTML for the unified editor. */
export function codePostToHtml(code: string, language?: string | null): string {
  const lang = language?.trim() || "plaintext";
  const escaped = code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return `<pre><code class="language-${lang}">${escaped}</code></pre>`;
}
