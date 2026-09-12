"use client";

import { useState, useRef, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { PostWithTags } from "@/lib/types/database";
import { createClient } from "@/lib/supabase/client";
import { cn, getRelativeTime, getDomain, truncate } from "@/lib/utils";
import { NoteContent } from "@/components/posts/note-content";
import { analyzePost, codePostToHtml, isNoteEmpty } from "@/lib/note-content";
import { toast } from "sonner";
import {
  FileText,
  Code2,
  Globe,
  ListChecks,
  Pin,
  PinOff,
  MoreHorizontal,
  Pencil,
  Trash2,
  Archive,
  ArchiveRestore,
  ExternalLink,
} from "lucide-react";
import Image from "next/image";

interface PostCardProps {
  post: PostWithTags;
  readOnly?: boolean;
  archived?: boolean;
  boardName?: string;
  density?: "cards" | "compact" | "list";
  onEdit: () => void;
  onOpen: () => void;
  onDeleted: (id: string) => void;
  onRestored?: (id: string) => void;
  onUpdated: (post: PostWithTags) => void;
  onUndoDelete?: (post: PostWithTags) => void;
}

export function PostCard({
  post,
  readOnly = false,
  archived = false,
  boardName,
  density = "cards",
  onEdit,
  onOpen,
  onDeleted,
  onRestored,
  onUpdated,
  onUndoDelete,
}: PostCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPlacement, setMenuPlacement] = useState<{ top: number; left: number } | null>(null);
  const menuAnchorRef = useRef<HTMLDivElement>(null);
  const menuPanelRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();
  const features = analyzePost(post);

  const showLinkCard = !!post.url;

  const bodyHtml =
    post.type === "code" && post.content_code && isNoteEmpty(post.content_text)
      ? codePostToHtml(post.content_code, post.code_language)
      : post.content_text;

  useLayoutEffect(() => {
    if (!menuOpen) {
      setMenuPlacement(null);
      return;
    }

    const updatePlacement = () => {
      const anchor = menuAnchorRef.current;
      const panel = menuPanelRef.current;
      if (!anchor || !panel) return;

      const ar = anchor.getBoundingClientRect();
      const margin = 8;
      const menuWidth = panel.offsetWidth;
      const menuHeight = panel.offsetHeight;

      let top = ar.top - menuHeight - margin;
      let left = ar.right - menuWidth;

      if (top < margin) top = ar.bottom + margin;
      if (left < margin) left = margin;
      if (left + menuWidth > window.innerWidth - margin) {
        left = window.innerWidth - menuWidth - margin;
      }

      setMenuPlacement({ top, left });
    };

    updatePlacement();
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(updatePlacement);
    });

    window.addEventListener("resize", updatePlacement);
    document.addEventListener("scroll", updatePlacement, true);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", updatePlacement);
      document.removeEventListener("scroll", updatePlacement, true);
    };
  }, [menuOpen]);

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

  const handleRestore = async () => {
    const { error } = await (supabase as any)
      .from("posts")
      .update({ is_archived: false })
      .eq("id", post.id);

    if (!error) {
      onRestored?.(post.id);
      toast.success("Post restored");
    }
  };

  const handleDelete = async () => {
    const snapshot = post;
    const { error } = await (supabase as any).from("posts").delete().eq("id", post.id);
    if (error) {
      toast.error("Failed to delete");
      return;
    }
    onDeleted(post.id);
    toast.success("Post deleted", {
      action: onUndoDelete
        ? {
            label: "Undo",
            onClick: () => onUndoDelete(snapshot),
          }
        : undefined,
    });
  };

  const cardStyle = post.color
    ? { borderColor: `${post.color}33`, backgroundColor: `${post.color}08` }
    : {};

  const badge = features.hasChecklist
    ? { icon: ListChecks, color: "text-amber-400", bg: "bg-amber-500/10" }
    : features.hasCode
      ? { icon: Code2, color: "text-emerald-400", bg: "bg-emerald-500/10" }
      : features.hasLinks || showLinkCard
        ? { icon: Globe, color: "text-sky-400", bg: "bg-sky-500/10" }
        : { icon: FileText, color: "text-rose-400", bg: "bg-rose-500/10" };

  if (density === "list") {
    return (
      <div
        className={cn(
          "group flex cursor-pointer items-center gap-3 rounded-xl border border-zinc-800/80 bg-card/40 px-3 py-2.5 transition-colors hover:bg-card/70",
          post.color && "border-opacity-40"
        )}
        style={cardStyle}
        onClick={onOpen}
        role="article"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onOpen();
          }
        }}
      >
        <div className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-lg", badge.bg)}>
          <badge.icon className={cn("h-3.5 w-3.5", badge.color)} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-sm font-medium text-zinc-100">{post.title}</h3>
            {post.is_pinned && <Pin className="h-3 w-3 shrink-0 fill-violet-400 text-violet-400" />}
          </div>
          {features.hasChecklist && features.checklistTotal > 0 && (
            <p className="text-[10px] tabular-nums text-zinc-600">
              {features.checklistDone}/{features.checklistTotal} done
            </p>
          )}
        </div>
        <span className="hidden text-[10px] text-zinc-600 opacity-0 transition-opacity group-hover:opacity-100 sm:inline">
          {getRelativeTime(post.created_at)}
        </span>
        {!readOnly && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="rounded-md p-1.5 text-zinc-600 opacity-0 transition-opacity hover:bg-zinc-800 hover:text-zinc-300 group-hover:opacity-100"
            title="Edit"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    );
  }

  const compact = density === "compact";

  return (
    <div
      className={cn(
        "group relative cursor-pointer rounded-xl border bg-card/50 transition-all hover:bg-card/80 hover:shadow-lg hover:shadow-black/10",
        !post.color && "border-zinc-800/80"
      )}
      style={cardStyle}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      tabIndex={0}
      role="article"
    >
      {post.is_pinned && (
        <div className="absolute top-2 right-2 z-10">
          <Pin className="h-3.5 w-3.5 fill-violet-400 text-violet-400" />
        </div>
      )}

      {showLinkCard && post.preview_image && !compact && (
        <div className="relative h-28 w-full overflow-hidden rounded-t-xl bg-zinc-900">
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

      <div className={cn(compact ? "p-3" : "p-4")}>
        <div className="mb-1.5 flex items-start gap-2">
          <div className={cn("mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md", badge.bg)}>
            <badge.icon className={cn("h-3 w-3", badge.color)} />
          </div>
          <h3
            className={cn(
              "flex-1 font-semibold leading-snug text-zinc-100",
              compact ? "text-xs" : "text-sm"
            )}
          >
            {post.title}
          </h3>
        </div>

        {archived && boardName && (
          <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-zinc-600">
            {boardName}
          </p>
        )}

        {showLinkCard && (
          <div className={cn(compact ? "mb-2" : "mb-3")}>
            {post.preview_title && !post.preview_image && (
              <p className="mb-1 text-sm font-medium text-zinc-300">
                {truncate(post.preview_title, compact ? 60 : 80)}
              </p>
            )}
            {post.preview_description && !compact && (
              <p className="mb-2 text-xs leading-relaxed text-zinc-500">
                {truncate(post.preview_description, 120)}
              </p>
            )}
            <a
              href={post.url || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-sky-400 transition-colors hover:text-sky-300"
              onClick={(e) => e.stopPropagation()}
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

        {!isNoteEmpty(bodyHtml) && (
          <div className={cn(compact ? "mb-2 line-clamp-4" : "mb-3 line-clamp-6", "text-left")}>
            <NoteContent
              html={bodyHtml}
              interactive={!readOnly}
              post={post}
              onPostUpdated={onUpdated}
              compact={compact}
              showEmptyHint={false}
            />
          </div>
        )}

        {post.tags.length > 0 && !compact && (
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

        <div className="flex items-center justify-between pt-1.5 opacity-70 transition-opacity group-hover:opacity-100">
          <span className="text-[10px] text-zinc-600">{getRelativeTime(post.created_at)}</span>

          {!readOnly && (
            <div ref={menuAnchorRef} className="relative z-10">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(!menuOpen);
                }}
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-md transition-opacity hover:bg-zinc-800",
                  menuOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                )}
                aria-expanded={menuOpen}
                aria-haspopup="menu"
              >
                <MoreHorizontal className="h-3.5 w-3.5 text-zinc-500" />
              </button>

              {menuOpen &&
                typeof document !== "undefined" &&
                createPortal(
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(false);
                      }}
                      aria-hidden
                    />
                    <div
                      ref={menuPanelRef}
                      role="menu"
                      style={
                        menuPlacement
                          ? {
                              position: "fixed",
                              top: menuPlacement.top,
                              left: menuPlacement.left,
                              zIndex: 30,
                            }
                          : {
                              position: "fixed",
                              top: 0,
                              left: 0,
                              zIndex: 30,
                              visibility: "hidden",
                              pointerEvents: "none",
                            }
                      }
                      className="min-w-[10.5rem] overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 py-1 shadow-xl ring-1 ring-black/20"
                    >
                      <button
                        type="button"
                        role="menuitem"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit();
                          setMenuOpen(false);
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-zinc-300 hover:bg-zinc-800"
                      >
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </button>
                      {archived ? (
                        <button
                          type="button"
                          role="menuitem"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRestore();
                            setMenuOpen(false);
                          }}
                          className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-zinc-300 hover:bg-zinc-800"
                        >
                          <ArchiveRestore className="h-3.5 w-3.5" /> Restore
                        </button>
                      ) : (
                        <>
                          <button
                            type="button"
                            role="menuitem"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePin();
                              setMenuOpen(false);
                            }}
                            className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-zinc-300 hover:bg-zinc-800"
                          >
                            {post.is_pinned ? (
                              <PinOff className="h-3.5 w-3.5" />
                            ) : (
                              <Pin className="h-3.5 w-3.5" />
                            )}
                            {post.is_pinned ? "Unpin" : "Pin to top"}
                          </button>
                          <button
                            type="button"
                            role="menuitem"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleArchive();
                              setMenuOpen(false);
                            }}
                            className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-zinc-300 hover:bg-zinc-800"
                          >
                            <Archive className="h-3.5 w-3.5" /> Archive
                          </button>
                        </>
                      )}
                      <button
                        type="button"
                        role="menuitem"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete();
                          setMenuOpen(false);
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-red-400 hover:bg-zinc-800"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                    </div>
                  </>,
                  document.body
                )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
