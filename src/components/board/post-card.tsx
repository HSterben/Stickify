"use client";

import { useState, useRef, useEffect } from "react";
import { PostWithTags } from "@/lib/types/database";
import { createClient } from "@/lib/supabase/client";
import { cn, getRelativeTime, truncate, getDomain } from "@/lib/utils";
import { toast } from "sonner";
import {
  FileText,
  Code2,
  Globe,
  Pin,
  PinOff,
  MoreHorizontal,
  Pencil,
  Trash2,
  Archive,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";
import Prism from "prismjs";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-python";
import "prismjs/components/prism-java";
import "prismjs/components/prism-css";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-json";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-go";
import "prismjs/components/prism-rust";
import Image from "next/image";

interface PostCardProps {
  post: PostWithTags;
  onEdit: () => void;
  onDeleted: (id: string) => void;
  onUpdated: (post: PostWithTags) => void;
}

const typeConfig = {
  text: { icon: FileText, color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/10" },
  code: { icon: Code2, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/10" },
  link: { icon: Globe, color: "text-sky-400", bg: "bg-sky-500/10", border: "border-sky-500/10" },
};

export function PostCard({ post, onEdit, onDeleted, onUpdated }: PostCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const codeRef = useRef<HTMLElement>(null);
  const supabase = createClient();
  const config = typeConfig[post.type];

  useEffect(() => {
    if (post.type === "code" && codeRef.current) {
      Prism.highlightElement(codeRef.current);
    }
  }, [post.type, post.content_code]);

  const handlePin = async () => {
    const { error } = await (supabase as any)
      .from("posts")
      .update({ is_pinned: !post.is_pinned })
      .eq("id", post.id);

    if (!error) {
      onUpdated({ ...post, is_pinned: !post.is_pinned });
    }
  };

  const handleArchive = async () => {
    const { error } = await (supabase as any)
      .from("posts")
      .update({ is_archived: true })
      .eq("id", post.id);

    if (!error) {
      onDeleted(post.id);
      toast.success("Post archived");
    }
  };

  const handleDelete = async () => {
    const { error } = await (supabase as any).from("posts").delete().eq("id", post.id);
    if (!error) {
      onDeleted(post.id);
      toast.success("Post deleted");
    }
  };

  const handleCopyCode = async () => {
    if (post.content_code) {
      await navigator.clipboard.writeText(post.content_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const cardStyle = post.color
    ? { borderColor: `${post.color}33`, backgroundColor: `${post.color}08` }
    : {};

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border bg-card/50 transition-all hover:bg-card/80 hover:shadow-lg hover:shadow-black/10",
        post.color ? "" : config.border
      )}
      style={cardStyle}
    >
      {/* Pin indicator */}
      {post.is_pinned && (
        <div className="absolute top-2 right-2 z-10">
          <Pin className="h-3.5 w-3.5 fill-violet-400 text-violet-400" />
        </div>
      )}

      {/* Link preview image */}
      {post.type === "link" && post.preview_image && (
        <div className="relative h-36 w-full overflow-hidden bg-zinc-900">
          <Image
            src={post.preview_image}
            alt={post.preview_title || post.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
        </div>
      )}

      <div className="p-4">
        {/* Type badge + title */}
        <div className="mb-2 flex items-start gap-2">
          <div className={cn("mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md", config.bg)}>
            <config.icon className={cn("h-3 w-3", config.color)} />
          </div>
          <h3 className="flex-1 text-sm font-semibold leading-snug">{post.title}</h3>
        </div>

        {/* Content body */}
        {post.type === "text" && post.content_text && (
          <p className="mb-3 text-sm leading-relaxed text-zinc-400">
            {truncate(post.content_text, 200)}
          </p>
        )}

        {post.type === "code" && post.content_code && (
          <div className="relative mb-3">
            <div className="flex items-center justify-between mb-1.5">
              {post.code_language && (
                <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
                  {post.code_language}
                </span>
              )}
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300"
              >
                {copied ? (
                  <Check className="h-3 w-3 text-emerald-400" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <pre className="max-h-48 overflow-auto rounded-lg border border-zinc-800 bg-surface p-3 text-xs">
              <code
                ref={codeRef}
                className={`language-${post.code_language || "plaintext"}`}
              >
                {post.content_code}
              </code>
            </pre>
          </div>
        )}

        {post.type === "link" && (
          <div className="mb-3">
            {post.preview_title && !post.preview_image && (
              <p className="mb-1 text-sm font-medium text-zinc-300">
                {truncate(post.preview_title, 80)}
              </p>
            )}
            {post.preview_description && (
              <p className="mb-2 text-xs leading-relaxed text-zinc-500">
                {truncate(post.preview_description, 120)}
              </p>
            )}
            <a
              href={post.url || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-sky-400 transition-colors hover:text-sky-300"
            >
              {post.preview_favicon && (
                <Image
                  src={post.preview_favicon}
                  alt=""
                  width={12}
                  height={12}
                  className="rounded-sm"
                  unoptimized
                />
              )}
              <span>{post.preview_domain || (post.url ? getDomain(post.url) : "Link")}</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        )}

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1">
            {post.tags.map((tag) => (
              <span
                key={tag.id}
                className="rounded-full bg-violet-500/10 px-2 py-0.5 text-[10px] font-medium text-violet-300"
              >
                #{tag.name}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-zinc-800/50">
          <span className="text-[10px] text-zinc-600">
            {getRelativeTime(post.created_at)}
          </span>

          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex h-6 w-6 items-center justify-center rounded-md opacity-0 transition-opacity group-hover:opacity-100 hover:bg-zinc-800"
            >
              <MoreHorizontal className="h-3.5 w-3.5 text-zinc-500" />
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 bottom-full z-20 mb-1 w-40 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 shadow-xl">
                  <button
                    onClick={() => { onEdit(); setMenuOpen(false); }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
                  >
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => { handlePin(); setMenuOpen(false); }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
                  >
                    {post.is_pinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
                    {post.is_pinned ? "Unpin" : "Pin to top"}
                  </button>
                  <button
                    onClick={() => { handleArchive(); setMenuOpen(false); }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
                  >
                    <Archive className="h-3.5 w-3.5" /> Archive
                  </button>
                  <button
                    onClick={() => { handleDelete(); setMenuOpen(false); }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-zinc-800"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
