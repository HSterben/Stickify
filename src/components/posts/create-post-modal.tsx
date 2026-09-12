"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { createClient } from "@/lib/supabase/client";
import { PostWithTags } from "@/lib/types/database";
import { MODAL_BACKDROP, MODAL_MAX_HEIGHT, MODAL_ROOT } from "@/lib/modal-classes";
import { AccentColorPicker } from "./accent-color-picker";
import { NoteEditor } from "./note-editor";
import { TagInput } from "./tag-input";
import {
  clearDraft,
  deriveTitleFromContent,
  htmlToPlainText,
  isNoteEmpty,
  loadDraft,
  markdownToHtml,
  saveDraft,
} from "@/lib/note-content";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Plus, Sparkles, Link2, EyeOff } from "lucide-react";

interface CreatePostModalProps {
  open: boolean;
  onClose: () => void;
  categoryId: string;
  onCreated: (post: PostWithTags) => void;
  /** Prefill from quick-add */
  initialHtml?: string;
  initialUrl?: string;
}

type BoardOption = { id: string; name: string };

type LinkPreview = {
  title?: string;
  description?: string;
  image?: string | null;
  favicon?: string | null;
  domain?: string;
};

export function CreatePostModal({
  open,
  onClose,
  categoryId,
  onCreated,
  initialHtml,
  initialUrl,
}: CreatePostModalProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState(categoryId);
  const [categories, setCategories] = useState<BoardOption[]>([]);
  const [title, setTitle] = useState("");
  const [html, setHtml] = useState("");
  const [color, setColor] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [url, setUrl] = useState<string | null>(null);
  const [preview, setPreview] = useState<LinkPreview | null>(null);
  const [showLinkPreview, setShowLinkPreview] = useState(true);
  const [loading, setLoading] = useState(false);
  const [fetchingMeta, setFetchingMeta] = useState(false);
  const [rewriting, setRewriting] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "draft" | "saving">("idle");
  const draftTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hydrated = useRef(false);

  const supabase = createClient();

  useEffect(() => {
    if (!open) {
      hydrated.current = false;
      return;
    }

    setSelectedCategoryId(categoryId);

    const draft = loadDraft(categoryId);
    if (initialHtml || initialUrl) {
      setTitle("");
      setHtml(initialHtml ?? "");
      setUrl(initialUrl ?? null);
      setPreview(null);
      setColor(null);
      setTags([]);
      setShowLinkPreview(true);
      setSaveState("idle");
      if (initialUrl) void fetchPreview(initialUrl);
    } else if (draft && (draft.html || draft.title || draft.url)) {
      setTitle(draft.title);
      setHtml(draft.html);
      setUrl(draft.url);
      setPreview(draft.preview);
      setColor(draft.color);
      setTags(draft.tags);
      setShowLinkPreview(draft.showLinkPreview);
      setSaveState("draft");
    } else {
      setTitle("");
      setHtml("");
      setUrl(null);
      setPreview(null);
      setColor(null);
      setTags([]);
      setShowLinkPreview(true);
      setSaveState("idle");
    }
    hydrated.current = true;

    const loadCategories = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await (supabase as any)
        .from("categories")
        .select("id, name")
        .eq("user_id", user.id)
        .order("position", { ascending: true });
      setCategories((data as BoardOption[] | null) ?? []);
    };
    void loadCategories();
  }, [open, categoryId, initialHtml, initialUrl, supabase]);

  useEffect(() => {
    if (!open || !hydrated.current) return;
    if (draftTimer.current) clearTimeout(draftTimer.current);
    draftTimer.current = setTimeout(() => {
      if (isNoteEmpty(html) && !title.trim() && !url) {
        clearDraft(categoryId);
        setSaveState("idle");
        return;
      }
      saveDraft(categoryId, {
        title,
        html,
        url,
        preview,
        color,
        tags,
        showLinkPreview,
      });
      setSaveState("draft");
    }, 400);
    return () => {
      if (draftTimer.current) clearTimeout(draftTimer.current);
    };
  }, [open, categoryId, title, html, url, preview, color, tags, showLinkPreview]);

  const fetchPreview = async (targetUrl: string) => {
    setFetchingMeta(true);
    setUrl(targetUrl);
    const fallbackDomain = (() => {
      try {
        return new URL(targetUrl).hostname.replace(/^www\./, "");
      } catch {
        return targetUrl;
      }
    })();

    try {
      const res = await fetch("/api/metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: targetUrl }),
      });
      const data = res.ok ? await res.json() : null;
      const nextPreview = {
        title: (data?.title as string | undefined) || fallbackDomain,
        description: (data?.description as string | undefined) || "",
        image: (data?.image as string | null | undefined) ?? null,
        favicon: (data?.favicon as string | null | undefined) ?? null,
        domain: (data?.domain as string | undefined) || fallbackDomain,
      };
      setPreview(nextPreview);
      setShowLinkPreview(true);
      if (!title.trim() && nextPreview.title) {
        setTitle(nextPreview.title.slice(0, 80));
      }
    } catch {
      setPreview({
        title: fallbackDomain,
        description: "",
        image: null,
        favicon: null,
        domain: fallbackDomain,
      });
      setShowLinkPreview(true);
    } finally {
      setFetchingMeta(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  const handleRewrite = async () => {
    const plain = htmlToPlainText(html);
    if (!plain.trim()) {
      toast.error("Add some note content first");
      return;
    }

    setRewriting(true);
    try {
      const res = await fetch("/api/ai/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: plain }),
      });

      if (!res.ok) {
        toast.error("AI rewrite failed");
        return;
      }

      const data = (await res.json()) as { content?: string };
      if (data.content) {
        setHtml(markdownToHtml(data.content));
        toast.success("Note improved with AI");
      }
    } catch {
      toast.error("AI rewrite failed");
    } finally {
      setRewriting(false);
    }
  };

  const handleSubmit = async () => {
    if (isNoteEmpty(html) && !url) {
      toast.error("Write something or paste a link first");
      return;
    }

    setLoading(true);
    setSaveState("saving");
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const finalTitle =
      title.trim() ||
      preview?.title?.slice(0, 80) ||
      deriveTitleFromContent(html, url ? "Link" : "Untitled");

    const { data: positionRows } = await (supabase as any)
      .from("posts")
      .select("position")
      .eq("category_id", selectedCategoryId)
      .eq("is_archived", false);
    const positions = ((positionRows as { position: number | null }[] | null) ?? [])
      .map((row) => row.position)
      .filter((value): value is number => typeof value === "number");
    const nextPosition = positions.length ? Math.max(...positions) + 1 : 0;

    const usePreview = showLinkPreview && !!url;
    const fallbackDomain = url
      ? (() => {
          try {
            return new URL(url).hostname.replace(/^www\./, "");
          } catch {
            return null;
          }
        })()
      : null;

    const { data: post, error } = await (supabase as any)
      .from("posts")
      .insert({
        user_id: user.id,
        category_id: selectedCategoryId,
        type: "text",
        title: finalTitle,
        content_text: isNoteEmpty(html) ? null : html,
        content_code: null,
        code_language: null,
        url: url,
        preview_title: usePreview ? preview?.title ?? fallbackDomain : null,
        preview_description: usePreview ? preview?.description ?? null : null,
        preview_image: usePreview ? preview?.image ?? null : null,
        preview_favicon: usePreview ? preview?.favicon ?? null : null,
        preview_domain: usePreview ? preview?.domain ?? fallbackDomain : null,
        color,
        position: nextPosition,
      })
      .select()
      .single();

    if (error || !post) {
      toast.error("Failed to create post");
      setLoading(false);
      setSaveState("draft");
      return;
    }

    const tagRecords: { id: string; name: string }[] = [];
    for (const tagName of tags) {
      const { data: existing } = await (supabase as any)
        .from("tags")
        .select("id, name")
        .eq("user_id", user.id)
        .eq("name", tagName)
        .maybeSingle();

      if (existing) {
        tagRecords.push(existing);
      } else {
        const { data: created } = await (supabase as any)
          .from("tags")
          .insert({ user_id: user.id, name: tagName })
          .select("id, name")
          .single();
        if (created) tagRecords.push(created);
      }
    }

    if (tagRecords.length) {
      await (supabase as any).from("post_tags").insert(
        tagRecords.map((tag) => ({ post_id: post.id, tag_id: tag.id }))
      );
    }

    clearDraft(categoryId);
    onCreated({ ...post, tags: tagRecords });
    setLoading(false);
    toast.success(
      selectedCategoryId === categoryId
        ? "Post created"
        : `Post created in ${categories.find((c) => c.id === selectedCategoryId)?.name ?? "another board"}`
    );
    onClose();
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className={MODAL_ROOT}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className={MODAL_BACKDROP}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className={`relative w-full max-w-2xl overflow-y-auto rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl ${MODAL_MAX_HEIGHT}`}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-800 bg-zinc-900 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold">New Post</h2>
                <p className="mt-0.5 text-[11px] text-zinc-500">
                  {saveState === "saving"
                    ? "Saving…"
                    : saveState === "draft"
                      ? "Draft autosaved"
                      : "Optional title · write freely"}
                </p>
              </div>
              <button
                onClick={handleClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5 p-6">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                  Title{" "}
                  <span className="font-normal text-zinc-600">(optional)</span>
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Leave blank to use the first line"
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-800/50 px-3 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                  Content
                </label>
                <NoteEditor
                  content={html}
                  onChange={setHtml}
                  autofocus
                  onBareUrlPaste={(pasted) => {
                    void fetchPreview(pasted);
                  }}
                />
                {!isNoteEmpty(html) && (
                  <button
                    type="button"
                    onClick={handleRewrite}
                    disabled={rewriting}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-700/80 bg-zinc-800/40 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800/70 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {rewriting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4 text-violet-300" />
                    )}
                    Improve with AI
                  </button>
                )}
              </div>

              {(url || fetchingMeta) && (
                <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-3">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs font-medium text-zinc-400">
                      <Link2 className="h-3.5 w-3.5 text-sky-400" />
                      Link preview
                      {fetchingMeta && (
                        <Loader2 className="h-3 w-3 animate-spin text-zinc-500" />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowLinkPreview((v) => !v)}
                      className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
                    >
                      <EyeOff className="h-3 w-3" />
                      {showLinkPreview ? "Show as plain link" : "Show preview card"}
                    </button>
                  </div>
                  {showLinkPreview && preview ? (
                    <div>
                      <p className="text-sm font-medium text-zinc-200">
                        {preview.title || url}
                      </p>
                      {preview.description && (
                        <p className="mt-1 line-clamp-2 text-xs text-zinc-500">
                          {preview.description}
                        </p>
                      )}
                      <p className="mt-1.5 text-[10px] text-zinc-600">
                        {preview.domain || url}
                      </p>
                    </div>
                  ) : (
                    <p className="truncate text-xs text-sky-400">{url}</p>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setUrl(null);
                      setPreview(null);
                    }}
                    className="mt-2 text-[11px] text-zinc-500 hover:text-zinc-300"
                  >
                    Remove link
                  </button>
                </div>
              )}

              <AccentColorPicker value={color} onChange={setColor} />

              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                  Tags
                </label>
                <TagInput tags={tags} onChange={setTags} />
              </div>
            </div>

            <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-zinc-800 bg-zinc-900 px-6 py-4">
              <button
                onClick={handleClose}
                className="rounded-lg px-4 py-2 text-sm text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2 rounded-lg bg-violet-600 px-5 py-2 text-sm font-medium text-white shadow-lg shadow-violet-500/20 transition-all hover:bg-violet-500 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                Create Post
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
