"use client";

import { useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import type { PostWithTags } from "@/lib/types/database";
import {
  analyzeNoteHtml,
  looksLikeHtml,
  markdownToHtml,
  toggleTaskCheckedInHtml,
} from "@/lib/note-content";
import { MarkdownContent } from "./markdown-content";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type NoteContentProps = {
  html: string | null | undefined;
  className?: string;
  /** Interactive checkboxes on cards */
  interactive?: boolean;
  post?: PostWithTags;
  onPostUpdated?: (post: PostWithTags) => void;
  compact?: boolean;
  showEmptyHint?: boolean;
};

export function NoteContent({
  html,
  className,
  interactive = false,
  post,
  onPostUpdated,
  compact = false,
  showEmptyHint = false,
}: NoteContentProps) {
  const resolved = useMemo(() => {
    if (!html?.trim()) return "";
    return looksLikeHtml(html) ? html : markdownToHtml(html);
  }, [html]);

  const features = useMemo(() => analyzeNoteHtml(resolved), [resolved]);

  if (!resolved.trim()) {
    if (!showEmptyHint) return null;
    return <p className="text-sm italic text-zinc-600">No content</p>;
  }

  // Legacy markdown path when we couldn't convert cleanly — rare
  if (!looksLikeHtml(resolved) && !looksLikeHtml(html ?? "")) {
    return <MarkdownContent content={html ?? ""} className={className} showEmptyHint={showEmptyHint} />;
  }

  const handleClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive || !post || !onPostUpdated) return;

    const target = e.target as HTMLElement;
    // Only the checkbox itself — not the task label/text.
    if (target.tagName !== "INPUT") return;
    const checkbox = target as HTMLInputElement;
    if (checkbox.type !== "checkbox") return;

    e.preventDefault();
    e.stopPropagation();

    const taskItem = checkbox.closest('li[data-type="taskItem"]');
    if (!taskItem) return;

    const list = e.currentTarget.querySelectorAll('li[data-type="taskItem"]');
    let index = -1;
    list.forEach((node, i) => {
      if (node === taskItem) index = i;
    });
    if (index < 0) return;

    const nextHtml = toggleTaskCheckedInHtml(resolved, index);
    if (nextHtml === resolved) return;

    const supabase = createClient();
    const { error } = await (supabase as any)
      .from("posts")
      .update({ content_text: nextHtml })
      .eq("id", post.id);

    if (error) {
      toast.error("Could not update checklist");
      return;
    }

    onPostUpdated({ ...post, content_text: nextHtml });
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div
        className={cn(
          "note-content text-sm leading-relaxed text-zinc-400",
          compact && "note-content-compact",
          interactive && "note-content-interactive"
        )}
        onClick={handleClick}
        dangerouslySetInnerHTML={{ __html: resolved }}
      />
      {features.hasChecklist && features.checklistTotal > 0 && (
        <p className="text-[10px] font-medium tabular-nums text-zinc-600">
          {features.checklistDone}/{features.checklistTotal} completed
        </p>
      )}
    </div>
  );
}
