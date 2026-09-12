"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { createClient } from "@/lib/supabase/client";
import { PostWithTags } from "@/lib/types/database";
import { MODAL_BACKDROP, MODAL_MAX_HEIGHT, MODAL_ROOT } from "@/lib/modal-classes";
import { AccentColorPicker } from "./accent-color-picker";
import { NoteEditor } from "./note-editor";
import { TagInput } from "./tag-input";
import {
  codePostToHtml,
  deriveTitleFromContent,
  htmlToPlainText,
  isNoteEmpty,
  markdownToHtml,
  normalizeNoteHtml,
} from "@/lib/note-content";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Save, Link2, EyeOff, Sparkles } from "lucide-react";
import { getDomain } from "@/lib/utils";

interface EditPostModalProps {
  open: boolean;
  onClose: () => void;
  post: PostWithTags;
  onUpdated: (post: PostWithTags) => void;
}

type LinkPreviewFields = {
  preview_title: string | null;
  preview_description: string | null;
  preview_image: string | null;
  preview_favicon: string | null;
  preview_domain: string | null;
};

export function EditPostModal({ open, onClose, post, onUpdated }: EditPostModalProps) {
  const initialHtml =
    post.type === "code" && post.content_code
      ? codePostToHtml(post.content_code, post.code_language)
      : normalizeNoteHtml(post.content_text ?? "");

  const [title, setTitle] = useState(post.title);
  const [html, setHtml] = useState(initialHtml);
  const [color, setColor] = useState<string | null>(post.color);
  const [tags, setTags] = useState<string[]>(post.tags.map((t) => t.name));
  const [url, setUrl] = useState<string | null>(post.url);
  const [previewFields, setPreviewFields] = useState<LinkPreviewFields>({
    preview_title: post.preview_title,
    preview_description: post.preview_description,
    preview_image: post.preview_image,
    preview_favicon: post.preview_favicon,
    preview_domain: post.preview_domain,
  });
  const [showLinkPreview, setShowLinkPreview] = useState(
    !!post.url &&
      !!(post.preview_title || post.preview_image || post.preview_description || post.preview_domain)
  );
  const [loading, setLoading] = useState(false);
  const [rewriting, setRewriting] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");

  const supabase = createClient();

  useEffect(() => {
    if (!open) return;
    setTitle(post.title);
    setHtml(
      post.type === "code" && post.content_code
        ? codePostToHtml(post.content_code, post.code_language)
        : normalizeNoteHtml(post.content_text ?? "")
    );
    setColor(post.color);
    setTags(post.tags.map((t) => t.name));
    setUrl(post.url);
    setPreviewFields({
      preview_title: post.preview_title,
      preview_description: post.preview_description,
      preview_image: post.preview_image,
      preview_favicon: post.preview_favicon,
      preview_domain: post.preview_domain,
    });
    const hasPreviewMeta = !!(
      post.preview_title ||
      post.preview_image ||
      post.preview_description ||
      post.preview_domain
    );
    setShowLinkPreview(!!post.url);
    if (post.url && !hasPreviewMeta) {
      void (async () => {
        try {
          const res = await fetch("/api/metadata", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: post.url }),
          });
          if (!res.ok) {
            const domain = getDomain(post.url!);
            setPreviewFields({
              preview_title: domain,
              preview_description: null,
              preview_image: null,
              preview_favicon: null,
              preview_domain: domain,
            });
            return;
          }
          const data = await res.json();
          setPreviewFields({
            preview_title: data.title ?? null,
            preview_description: data.description ?? null,
            preview_image: data.image ?? null,
            preview_favicon: data.favicon ?? null,
            preview_domain: data.domain ?? getDomain(post.url!),
          });
        } catch {
          const domain = getDomain(post.url!);
          setPreviewFields({
            preview_title: domain,
            preview_description: null,
            preview_image: null,
            preview_favicon: null,
            preview_domain: domain,
          });
        }
      })();
    }
    setSaveState("idle");
  }, [open, post]);

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
      toast.error("Write something or add a link");
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
      post.preview_title?.slice(0, 80) ||
      deriveTitleFromContent(html, url ? "Link" : "Untitled");

    const updates: Record<string, unknown> = {
      title: finalTitle,
      color,
      type: "text",
      content_text: isNoteEmpty(html) ? null : html,
      url,
      preview_title: showLinkPreview ? previewFields.preview_title : null,
      preview_description: showLinkPreview ? previewFields.preview_description : null,
      preview_image: showLinkPreview ? previewFields.preview_image : null,
      preview_favicon: showLinkPreview ? previewFields.preview_favicon : null,
      preview_domain: showLinkPreview
        ? previewFields.preview_domain ?? (url ? getDomain(url) : null)
        : null,
    };

    const { error } = await (supabase as any)
      .from("posts")
      .update(updates)
      .eq("id", post.id);

    if (error) {
      toast.error("Failed to update post");
      setLoading(false);
      setSaveState("idle");
      return;
    }

    await (supabase as any).from("post_tags").delete().eq("post_id", post.id);

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

    onUpdated({
      ...post,
      ...updates,
      tags: tagRecords,
    } as PostWithTags);
    setLoading(false);
    setSaveState("saved");
    toast.success("Post updated");
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
            onClick={onClose}
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
                <h2 className="text-lg font-semibold">Edit Post</h2>
                <p className="mt-0.5 text-[11px] text-zinc-500">
                  {saveState === "saving"
                    ? "Saving…"
                    : saveState === "saved"
                      ? "Saved"
                      : "Changes save when you click Save"}
                </p>
              </div>
              <button
                onClick={onClose}
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
                <NoteEditor content={html} onChange={setHtml} />
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

              {url && (
                <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-3">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs font-medium text-zinc-400">
                      <Link2 className="h-3.5 w-3.5 text-sky-400" />
                      Attached link
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
                  <p className="truncate text-xs text-sky-400">{url}</p>
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
                onClick={onClose}
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
                  <Save className="h-4 w-4" />
                )}
                Save
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
