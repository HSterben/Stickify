"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { PostWithTags } from "@/lib/types/database";
import { CODE_LANGUAGES } from "@/lib/utils";
import { AccentColorPicker } from "./accent-color-picker";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  FileText,
  Code2,
  Link2,
  Loader2,
  Plus,
} from "lucide-react";
import { TagInput } from "./tag-input";
import { MarkdownContent } from "./markdown-content";

interface CreatePostModalProps {
  open: boolean;
  onClose: () => void;
  categoryId: string;
  onCreated: (post: PostWithTags) => void;
}

type PostType = "text" | "code" | "link";

export function CreatePostModal({
  open,
  onClose,
  categoryId,
  onCreated,
}: CreatePostModalProps) {
  const [type, setType] = useState<PostType>("text");
  const [title, setTitle] = useState("");
  const [contentText, setContentText] = useState("");
  const [contentCode, setContentCode] = useState("");
  const [codeLanguage, setCodeLanguage] = useState("javascript");
  const [url, setUrl] = useState("");
  const [color, setColor] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingMeta, setFetchingMeta] = useState(false);
  const [preview, setPreview] = useState<{
    title?: string;
    description?: string;
    image?: string;
    favicon?: string;
    domain?: string;
  } | null>(null);

  const supabase = createClient();

  const resetForm = () => {
    setType("text");
    setTitle("");
    setContentText("");
    setContentCode("");
    setCodeLanguage("javascript");
    setUrl("");
    setColor(null);
    setTags([]);
    setPreview(null);
  };

  const handleFetchMetadata = async (inputUrl: string) => {
    if (!inputUrl.trim()) return;
    setFetchingMeta(true);
    try {
      const res = await fetch("/api/metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: inputUrl }),
      });
      if (res.ok) {
        const data = await res.json();
        setPreview(data);
        if (data.title && !title) setTitle(data.title);
      }
    } catch {
      // Silently fail, user can still save the URL
    } finally {
      setFetchingMeta(false);
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

    const { data: post, error } = await (supabase as any)
      .from("posts")
      .insert({
        user_id: user.id,
        category_id: categoryId,
        type,
        title: title.trim(),
        content_text: type === "text" ? contentText : null,
        content_code: type === "code" ? contentCode : null,
        code_language: type === "code" ? codeLanguage : null,
        url: type === "link" ? url : null,
        preview_title: preview?.title ?? null,
        preview_description: preview?.description ?? null,
        preview_image: preview?.image ?? null,
        preview_favicon: preview?.favicon ?? null,
        preview_domain: preview?.domain ?? null,
        color,
      })
      .select()
      .single();

    if (error || !post) {
      toast.error("Failed to create post");
      setLoading(false);
      return;
    }

    // Handle tags
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

    onCreated({ ...post, tags: tagRecords } as PostWithTags);
    resetForm();
    onClose();
    setLoading(false);
    toast.success("Post created");
  };

  const types: { value: PostType; icon: typeof FileText; label: string; desc: string }[] = [
    { value: "text", icon: FileText, label: "Text", desc: "Note or thought" },
    { value: "code", icon: Code2, label: "Code", desc: "Code snippet" },
    { value: "link", icon: Link2, label: "Link", desc: "Website bookmark" },
  ];

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-800 bg-zinc-900 px-6 py-4">
              <h2 className="text-lg font-semibold">New Post</h2>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Type selector */}
              <div className="grid grid-cols-3 gap-2">
                {types.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setType(t.value)}
                    className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 transition-all ${
                      type === t.value
                        ? "border-violet-500/30 bg-violet-500/10"
                        : "border-zinc-800 bg-zinc-800/30 hover:border-zinc-700"
                    }`}
                  >
                    <t.icon className={`h-5 w-5 ${type === t.value ? "text-violet-400" : "text-zinc-500"}`} />
                    <span className={`text-xs font-medium ${type === t.value ? "text-violet-300" : "text-zinc-400"}`}>
                      {t.label}
                    </span>
                  </button>
                ))}
              </div>

              {/* Title */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-400">Title</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Give your post a name..."
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-800/50 px-3 py-2.5 text-sm text-white placeholder-zinc-600 outline-none transition-colors focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20"
                />
              </div>

              {/* Text content */}
              {type === "text" && (
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                    Content
                    <span className="ml-1.5 font-normal text-zinc-600">(Markdown — preview below)</span>
                  </label>
                  <textarea
                    value={contentText}
                    onChange={(e) => setContentText(e.target.value)}
                    placeholder="Write your note..."
                    rows={8}
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-800/50 px-3 py-2.5 text-sm text-white placeholder-zinc-600 outline-none transition-colors focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 resize-none"
                  />
                  {contentText.trim() ? (
                    <div className="mt-3 max-h-56 overflow-y-auto rounded-lg border border-zinc-800/80 bg-zinc-950/40 p-3">
                      <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                        Preview
                      </p>
                      <MarkdownContent content={contentText} showEmptyHint={false} />
                    </div>
                  ) : null}
                </div>
              )}

              {/* Code content */}
              {type === "code" && (
                <>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-zinc-400">Language</label>
                    <select
                      value={codeLanguage}
                      onChange={(e) => setCodeLanguage(e.target.value)}
                      className="w-full rounded-lg border border-zinc-800 bg-zinc-800/50 px-3 py-2.5 text-sm text-white outline-none focus:border-violet-500/50"
                    >
                      {CODE_LANGUAGES.map((lang) => (
                        <option key={lang} value={lang}>
                          {lang}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-zinc-400">Code</label>
                    <textarea
                      value={contentCode}
                      onChange={(e) => setContentCode(e.target.value)}
                      placeholder="Paste your code here..."
                      rows={8}
                      className="w-full rounded-lg border border-zinc-800 bg-zinc-800/50 px-3 py-2.5 font-mono text-sm text-emerald-300 placeholder-zinc-600 outline-none transition-colors focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 resize-none"
                    />
                  </div>
                </>
              )}

              {/* Link content */}
              {type === "link" && (
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-zinc-400">URL</label>
                  <div className="flex gap-2">
                    <input
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      onBlur={() => handleFetchMetadata(url)}
                      placeholder="https://example.com"
                      className="flex-1 rounded-lg border border-zinc-800 bg-zinc-800/50 px-3 py-2.5 text-sm text-white placeholder-zinc-600 outline-none transition-colors focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20"
                    />
                    <button
                      onClick={() => handleFetchMetadata(url)}
                      disabled={fetchingMeta}
                      className="flex items-center gap-1.5 rounded-lg bg-zinc-800 px-3 text-xs text-zinc-400 hover:text-white disabled:opacity-50"
                    >
                      {fetchingMeta ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Fetch"}
                    </button>
                  </div>
                  {preview && (
                    <div className="mt-3 rounded-lg border border-zinc-800 bg-zinc-800/30 p-3">
                      <p className="text-xs font-medium text-zinc-300">{preview.title}</p>
                      {preview.description && (
                        <p className="mt-1 text-xs text-zinc-500 line-clamp-2">{preview.description}</p>
                      )}
                      {preview.domain && (
                        <p className="mt-1.5 text-[10px] text-zinc-600">{preview.domain}</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Color picker */}
              {type === "text" && (
                <AccentColorPicker value={color} onChange={setColor} />
              )}

              {/* Tags */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-400">Tags</label>
                <TagInput tags={tags} onChange={setTags} />
              </div>
            </div>

            {/* Footer */}
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
                  <Plus className="h-4 w-4" />
                )}
                Create Post
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
