"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { PostWithTags } from "@/lib/types/database";
import { CODE_LANGUAGES } from "@/lib/utils";
import type { AiCategoryOption, AiSuggestResponse, PostContentType } from "@/lib/ai-config";
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
  Sparkles,
} from "lucide-react";
import { TagInput } from "./tag-input";
import { MarkdownContent } from "./markdown-content";

interface CreatePostModalProps {
  open: boolean;
  onClose: () => void;
  categoryId: string;
  onCreated: (post: PostWithTags) => void;
}

type PostType = PostContentType;

export function CreatePostModal({
  open,
  onClose,
  categoryId,
  onCreated,
}: CreatePostModalProps) {
  const [type, setType] = useState<PostType>("text");
  const [selectedCategoryId, setSelectedCategoryId] = useState(categoryId);
  const [categories, setCategories] = useState<AiCategoryOption[]>([]);
  const [title, setTitle] = useState("");
  const [contentText, setContentText] = useState("");
  const [contentCode, setContentCode] = useState("");
  const [codeLanguage, setCodeLanguage] = useState("javascript");
  const [url, setUrl] = useState("");
  const [color, setColor] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingMeta, setFetchingMeta] = useState(false);
  const [suggesting, setSuggesting] = useState(false);
  const [rewriting, setRewriting] = useState(false);
  const [boardSuggestion, setBoardSuggestion] = useState<AiCategoryOption | null>(null);
  const [preview, setPreview] = useState<{
    title?: string;
    description?: string;
    image?: string;
    favicon?: string;
    domain?: string;
  } | null>(null);

  const supabase = createClient();

  useEffect(() => {
    if (!open) return;

    setSelectedCategoryId(categoryId);
    setBoardSuggestion(null);

    const loadCategories = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await (supabase as any)
        .from("categories")
        .select("id, name")
        .eq("user_id", user.id)
        .order("position", { ascending: true });

      setCategories((data as AiCategoryOption[] | null) ?? []);
    };

    void loadCategories();
  }, [open, categoryId, supabase]);

  const resetForm = () => {
    setType("text");
    setSelectedCategoryId(categoryId);
    setTitle("");
    setContentText("");
    setContentCode("");
    setCodeLanguage("javascript");
    setUrl("");
    setColor(null);
    setTags([]);
    setPreview(null);
    setBoardSuggestion(null);
  };

  const getContentForSuggest = () => {
    if (type === "text") return contentText.trim();
    if (type === "code") return contentCode.trim();
    return [url.trim(), preview?.title, preview?.description]
      .filter(Boolean)
      .join("\n");
  };

  const handleSuggest = async () => {
    const content = getContentForSuggest();
    if (!content) {
      toast.error("Add some content before asking AI for suggestions");
      return;
    }

    setSuggesting(true);
    setBoardSuggestion(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: existingTagRows } = await (supabase as any)
        .from("tags")
        .select("name")
        .eq("user_id", user.id);

      const existingTags = ((existingTagRows as { name: string }[] | null) ?? []).map(
        (tag) => tag.name
      );

      const res = await fetch("/api/ai/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          type,
          existingTags,
          categories,
        }),
      });

      if (!res.ok) {
        toast.error("AI suggestions failed");
        return;
      }

      const data = (await res.json()) as AiSuggestResponse;

      if (data.tags.length > 0) {
        setTags(data.tags);
      }

      if (data.contentType && data.contentType !== type) {
        setType(data.contentType);
      }

      if (data.summary && !title.trim()) {
        setTitle(data.summary);
      }

      if (
        data.suggestedCategoryId &&
        data.suggestedCategoryId !== selectedCategoryId
      ) {
        const suggested = categories.find(
          (category) => category.id === data.suggestedCategoryId
        );
        if (suggested) {
          setBoardSuggestion(suggested);
        }
      }

      toast.success("AI suggestions applied");
    } catch {
      toast.error("AI suggestions failed");
    } finally {
      setSuggesting(false);
    }
  };

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

    const { data: siblingRows } = await (supabase as any)
      .from("posts")
      .select("position")
      .eq("category_id", selectedCategoryId)
      .eq("is_archived", false);

    const siblingPositions = ((siblingRows as { position: number | null }[] | null) ?? [])
      .map((row) => row.position)
      .filter((value): value is number => typeof value === "number");
    const nextPosition = siblingPositions.length
      ? Math.min(...siblingPositions) - 1
      : 0;

    const { data: post, error } = await (supabase as any)
      .from("posts")
      .insert({
        user_id: user.id,
        category_id: selectedCategoryId,
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
        position: nextPosition,
      })
      .select()
      .single();

    if (error || !post) {
      toast.error("Failed to create post");
      setLoading(false);
      return;
    }

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

    const createdPost = { ...post, tags: tagRecords } as PostWithTags;
    const boardName = categories.find((c) => c.id === selectedCategoryId)?.name;

    onCreated(createdPost);
    resetForm();
    onClose();
    setLoading(false);

    if (selectedCategoryId === categoryId) {
      toast.success("Post created");
    } else {
      toast.success(`Post created in ${boardName ?? "another board"}`);
    }
  };

  const types: { value: PostType; icon: typeof FileText; label: string }[] = [
    { value: "text", icon: FileText, label: "Text" },
    { value: "code", icon: Code2, label: "Code" },
    { value: "link", icon: Link2, label: "Link" },
  ];

  const selectedBoardName = categories.find((c) => c.id === selectedCategoryId)?.name;
  const hasSuggestableContent = Boolean(getContentForSuggest());

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
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-800 bg-zinc-900 px-6 py-4">
              <h2 className="text-lg font-semibold">New Post</h2>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5 p-6">
              {categories.length > 1 && selectedBoardName && (
                <p className="text-xs text-zinc-500">
                  Saving to <span className="text-zinc-300">{selectedBoardName}</span>
                </p>
              )}

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

              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-400">Title</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Give your post a name..."
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-800/50 px-3 py-2.5 text-sm text-white placeholder-zinc-600 outline-none transition-colors focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20"
                />
              </div>

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
                    className="w-full resize-none rounded-lg border border-zinc-800 bg-zinc-800/50 px-3 py-2.5 text-sm text-white placeholder-zinc-600 outline-none transition-colors focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20"
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
                      className="w-full resize-none rounded-lg border border-zinc-800 bg-zinc-800/50 px-3 py-2.5 font-mono text-sm text-emerald-300 placeholder-zinc-600 outline-none transition-colors focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20"
                    />
                  </div>
                </>
              )}

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
                        <p className="mt-1 line-clamp-2 text-xs text-zinc-500">{preview.description}</p>
                      )}
                      {preview.domain && (
                        <p className="mt-1.5 text-[10px] text-zinc-600">{preview.domain}</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {type === "text" && (
                <AccentColorPicker value={color} onChange={setColor} />
              )}

              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-400">Tags</label>
                <TagInput tags={tags} onChange={setTags} />
              </div>

              <button
                type="button"
                onClick={handleSuggest}
                disabled={suggesting || !hasSuggestableContent}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-violet-500/20 bg-violet-500/10 px-4 py-2.5 text-sm font-medium text-violet-200 transition-colors hover:bg-violet-500/15 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {suggesting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                Suggest with AI
              </button>

              {boardSuggestion && (
                <div className="flex flex-wrap items-center gap-2 rounded-xl border border-violet-500/20 bg-violet-500/10 px-3 py-2.5">
                  <Sparkles className="h-3.5 w-3.5 shrink-0 text-violet-300" />
                  <span className="text-sm text-violet-100">
                    Save to <span className="font-medium">{boardSuggestion.name}</span>?
                  </span>
                  <div className="ml-auto flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCategoryId(boardSuggestion.id);
                        setBoardSuggestion(null);
                      }}
                      className="rounded-lg bg-violet-600 px-3 py-1 text-xs font-medium text-white hover:bg-violet-500"
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => setBoardSuggestion(null)}
                      className="rounded-lg px-3 py-1 text-xs text-violet-200/80 hover:text-white"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              )}

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
