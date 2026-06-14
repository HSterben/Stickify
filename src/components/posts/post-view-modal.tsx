"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { PostWithTags } from "@/lib/types/database";
import { MarkdownContent } from "./markdown-content";
import { motion, AnimatePresence } from "framer-motion";
import { X, Pencil, FileText, Code2, Globe, ExternalLink } from "lucide-react";
import Image from "next/image";
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
import { cn, getDomain, getRelativeTime } from "@/lib/utils";
import { MODAL_BACKDROP, MODAL_MAX_HEIGHT_LG, MODAL_ROOT } from "@/lib/modal-classes";

interface PostViewModalProps {
  open: boolean;
  post: PostWithTags | null;
  readOnly?: boolean;
  onClose: () => void;
  onEdit: (post: PostWithTags) => void;
}

const typeConfig = {
  text: { icon: FileText, color: "text-rose-400", bg: "bg-rose-500/10" },
  code: { icon: Code2, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  link: { icon: Globe, color: "text-sky-400", bg: "bg-sky-500/10" },
};

export function PostViewModal({ open, post, readOnly = false, onClose, onEdit }: PostViewModalProps) {
  const codeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (open && post?.type === "code" && codeRef.current) {
      Prism.highlightElement(codeRef.current);
    }
  }, [open, post?.type, post?.content_code, post?.code_language]);

  if (!post) return null;

  const config = typeConfig[post.type];
  const cardStyle = post.color
    ? { borderColor: `${post.color}44`, backgroundColor: `${post.color}0d` }
    : {};

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
            style={cardStyle}
            className={cn(
              `relative w-full max-w-2xl overflow-y-auto rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl ${MODAL_MAX_HEIGHT_LG}`,
              post.color && "border-opacity-80"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-900/95 px-4 py-3 backdrop-blur-sm sm:px-6 sm:py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <div className={cn("flex h-7 w-7 items-center justify-center rounded-lg", config.bg)}>
                      <config.icon className={cn("h-4 w-4", config.color)} />
                    </div>
                    {post.is_pinned && (
                      <span className="rounded-md bg-violet-500/15 px-2 py-0.5 text-[10px] font-medium text-violet-300">
                        Pinned
                      </span>
                    )}
                    <span className="text-[10px] text-zinc-600">{getRelativeTime(post.created_at)}</span>
                  </div>
                  <h2 className="text-xl font-semibold leading-snug tracking-tight text-zinc-50">
                    {post.title}
                  </h2>
                </div>
                <div className="hidden shrink-0 items-center gap-2 sm:flex">
                  {!readOnly && (
                    <button
                      type="button"
                      onClick={() => {
                        onEdit(post);
                        onClose();
                      }}
                      className="flex h-9 items-center gap-2 rounded-lg bg-violet-600/90 px-3 text-sm font-medium text-white shadow-lg shadow-violet-500/15 transition-colors hover:bg-violet-500"
                    >
                      <Pencil className="h-4 w-4" />
                      Edit
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-white"
                    aria-label="Close"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-white sm:hidden"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => {
                    onEdit(post);
                    onClose();
                  }}
                  className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-violet-600/90 text-sm font-medium text-white shadow-lg shadow-violet-500/15 transition-colors hover:bg-violet-500 sm:hidden"
                >
                  <Pencil className="h-4 w-4" />
                  Edit post
                </button>
              )}
            </div>

            <div className="space-y-4 px-6 py-5">
              {post.type === "text" && (
                <MarkdownContent content={post.content_text ?? ""} className="prose-markdown" />
              )}

              {post.type === "code" && post.content_code && (
                <div>
                  {post.code_language && (
                    <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                      {post.code_language}
                    </p>
                  )}
                  <pre className="overflow-auto rounded-xl border border-zinc-800 bg-surface p-4 text-sm">
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
                <div className="space-y-4">
                  {post.preview_image && (
                    <div className="relative h-48 w-full overflow-hidden rounded-xl bg-zinc-900">
                      <Image
                        src={post.preview_image}
                        alt={post.preview_title || post.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  )}
                  {post.preview_description && (
                    <p className="text-sm leading-relaxed text-zinc-400">{post.preview_description}</p>
                  )}
                  {post.url && (
                    <a
                      href={post.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-sky-400 transition-colors hover:text-sky-300"
                    >
                      {post.preview_favicon && (
                        <Image
                          src={post.preview_favicon}
                          alt=""
                          width={16}
                          height={16}
                          className="rounded"
                          unoptimized
                        />
                      )}
                      <span>{post.preview_domain || getDomain(post.url)}</span>
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
              )}

              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="rounded-full bg-violet-500/10 px-2.5 py-0.5 text-xs font-medium text-violet-300"
                    >
                      #{tag.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
