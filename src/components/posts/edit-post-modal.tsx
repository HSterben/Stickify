"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { createClient } from "@/lib/supabase/client";
import { PostWithTags } from "@/lib/types/database";
import { CODE_LANGUAGES } from "@/lib/utils";
import { MODAL_BACKDROP, MODAL_MAX_HEIGHT, MODAL_ROOT } from "@/lib/modal-classes";
import { AccentColorPicker } from "./accent-color-picker";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Save, Sparkles } from "lucide-react";
import { TagInput } from "./tag-input";
import { MarkdownContent } from "./markdown-content";

interface EditPostModalProps {
  open: boolean;
  onClose: () => void;
  post: PostWithTags;
  onUpdated: (post: PostWithTags) => void;
}

export function EditPostModal({ open, onClose, post, onUpdated }: EditPostModalProps) {
  const [title, setTitle] = useState(post.title);
  const [contentText, setContentText] = useState(post.content_text ?? "");
  const [contentCode, setContentCode] = useState(post.content_code ?? "");
  const [codeLanguage, setCodeLanguage] = useState(post.code_language ?? "javascript");
  const [url, setUrl] = useState(post.url ?? "");
  const [color, setColor] = useState<string | null>(post.color);
  const [tags, setTags] = useState<string[]>(post.tags.map((t) => t.name));
  const [loading, setLoading] = useState(false);
  const [rewriting, setRewriting] = useState(false);

  const supabase = createClient();

  const handleRewrite = async () => {
    if (!contentText.trim()) {
      toast.error("Add some note content first");
      return;
    }

    setRewriting(true);

    try {
      const res = await fetch("/api/ai/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: contentText }),
      });

      if (!res.ok) {
        toast.error("AI rewrite failed");
        return;
      }

      const data = (await res.json()) as { content?: string };
      if (data.content) {
        setContentText(data.content);
        toast.success("Note improved with AI");
      }
    } catch {
      toast.error("AI rewrite failed");
    } finally {
      setRewriting(false);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const updates: Record<string, any> = {
      title: title.trim(),
      color,
    };

    if (post.type === "text") updates.content_text = contentText;
    if (post.type === "code") {
      updates.content_code = contentCode;
      updates.code_language = codeLanguage;
    }
    if (post.type === "link") updates.url = url;

    const { error } = await (supabase as any)
      .from("posts")
      .update(updates)
      .eq("id", post.id);

    if (error) {
      toast.error("Failed to update post");
      setLoading(false);
      return;
    }

    await (supabase as any).from("post_tags").delete().eq("post_id", post.id);

    const tagRecords: { id: string; name: string }[] = [];
    for (const tagName of tags) {
      const { data: existing } = await (supabase as any)
        .from("tags")
        .select("*")
        .eq("user_id", user.id)
        .eq("name", tagName.toLowerCase())
        .single();

      if (existing) {
        tagRecords.push(existing);
      } else {
        const { data: newTag } = await (supabase as any)
          .from("tags")
          .insert({ user_id: user.id, name: tagName.toLowerCase() })
          .select()
          .single();
        if (newTag) tagRecords.push(newTag);
      }
    }

    if (tagRecords.length > 0) {
      await (supabase as any).from("post_tags").insert(
        tagRecords.map((t: any) => ({ post_id: post.id, tag_id: t.id }))
      );
    }

    onUpdated({ ...post, ...updates, tags: tagRecords } as PostWithTags);
    setLoading(false);
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
            className={`relative w-full max-w-lg overflow-y-auto rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl ${MODAL_MAX_HEIGHT}`}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-800 bg-zinc-900 px-6 py-4">
              <h2 className="text-lg font-semibold">Edit Post</h2>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Title */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-400">Title</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-800/50 px-3 py-2.5 text-sm text-white outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20"
                />
              </div>

              {post.type === "text" && (
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                    Content
                    <span className="ml-1.5 font-normal text-zinc-600">(Markdown — preview below)</span>
                  </label>
                  <textarea
                    value={contentText}
                    onChange={(e) => setContentText(e.target.value)}
                    rows={8}
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-800/50 px-3 py-2.5 text-sm text-white outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 resize-none"
                  />
                  {contentText.trim() ? (
                    <div className="mt-3 max-h-56 overflow-y-auto rounded-lg border border-zinc-800/80 bg-zinc-950/40 p-3">
                      <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                        Preview
                      </p>
                      <MarkdownContent content={contentText} showEmptyHint={false} />
                    </div>
                  ) : null}
                  {contentText.trim() ? (
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
                  ) : null}
                </div>
              )}

              {post.type === "code" && (
                <>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-zinc-400">Language</label>
                    <select
                      value={codeLanguage}
                      onChange={(e) => setCodeLanguage(e.target.value)}
                      className="w-full rounded-lg border border-zinc-800 bg-zinc-800/50 px-3 py-2.5 text-sm text-white outline-none focus:border-violet-500/50"
                    >
                      {CODE_LANGUAGES.map((lang) => (
                        <option key={lang} value={lang}>{lang}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-zinc-400">Code</label>
                    <textarea
                      value={contentCode}
                      onChange={(e) => setContentCode(e.target.value)}
                      rows={8}
                      className="w-full rounded-lg border border-zinc-800 bg-zinc-800/50 px-3 py-2.5 font-mono text-sm text-emerald-300 outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 resize-none"
                    />
                  </div>
                </>
              )}

              {post.type === "link" && (
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-zinc-400">URL</label>
                  <input
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-800/50 px-3 py-2.5 text-sm text-white outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20"
                  />
                </div>
              )}

              {post.type === "text" && (
                <AccentColorPicker value={color} onChange={setColor} />
              )}

              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-400">Tags</label>
                <TagInput tags={tags} onChange={setTags} />
              </div>
            </div>

            <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-zinc-800 bg-zinc-900 px-6 py-4">
              <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm text-zinc-400 hover:text-white">
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2 rounded-lg bg-violet-600 px-5 py-2 text-sm font-medium text-white shadow-lg shadow-violet-500/20 hover:bg-violet-500 disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Changes
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
