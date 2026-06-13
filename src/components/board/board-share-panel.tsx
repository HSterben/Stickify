"use client";

import { useState } from "react";
import { Category } from "@/lib/types/database";
import { createClient } from "@/lib/supabase/client";
import {
  generateShareId,
  getBoardShareUrl,
  getBoardVisibility,
  isBoardPublic,
} from "@/lib/sharing";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, Globe, Lock, Copy, Check, X, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";

interface BoardSharePanelProps {
  category: Category;
  onCategoryUpdated: (category: Category) => void;
}

export function BoardSharePanel({
  category,
  onCategoryUpdated,
}: BoardSharePanelProps) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const supabase = createClient();
  const isPublic = isBoardPublic(getBoardVisibility(category));

  const handleVisibilityChange = async (makePublic: boolean) => {
    if (makePublic === isPublic || saving) return;

    setSaving(true);
    const shareId = category.share_id ?? generateShareId();

    const { data, error } = await (supabase as any)
      .from("categories")
      .update({
        visibility: makePublic ? "public" : "private",
        share_id: shareId,
      })
      .eq("id", category.id)
      .select()
      .single();

    setSaving(false);

    if (error) {
      toast.error("Could not update board");
      return;
    }

    onCategoryUpdated(data as Category);
    toast.success(makePublic ? "Board is public now" : "Board is private now");
  };

  const handleCopyLink = async () => {
    if (!category.share_id) return;

    try {
      await navigator.clipboard.writeText(getBoardShareUrl(category.share_id));
      setCopied(true);
      toast.success("Link copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy link");
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
          isPublic
            ? "bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/15"
            : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
        )}
      >
        {isPublic ? (
          <Globe className="h-4 w-4" />
        ) : (
          <Share2 className="h-4 w-4" />
        )}
        <span className="hidden sm:inline">
          {isPublic ? "Public" : "Share"}
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div
              className="fixed inset-0 z-30"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full z-40 mt-2 w-80 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 shadow-2xl ring-1 ring-black/20"
            >
              <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
                <div className="flex items-center gap-2">
                  <Share2 className="h-4 w-4 text-violet-400" />
                  <span className="text-sm font-medium">Share this board</span>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-500 hover:bg-zinc-800 hover:text-white"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-4 p-4">
                <p className="text-xs leading-relaxed text-zinc-500">
                  Private means only you see it. Public means anyone with the
                  link can view it. Like sharing a YouTube playlist.
                </p>

                <div className="flex items-center justify-between rounded-lg bg-zinc-800/50 px-3 py-2.5">
                  <div className="flex items-center gap-2.5">
                    {isPublic ? (
                      <Globe className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <Lock className="h-4 w-4 text-zinc-500" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-zinc-200">
                        {isPublic ? "Public" : "Private"}
                      </p>
                      <p className="text-[11px] text-zinc-500">
                        {isPublic
                          ? "Anyone with the link can view"
                          : "Only you can view"}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={isPublic}
                    disabled={saving}
                    onCheckedChange={handleVisibilityChange}
                    aria-label={isPublic ? "Make private" : "Make public"}
                  />
                </div>

                {isPublic && category.share_id && (
                  <div className="space-y-2">
                    <label className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                      Link
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2">
                        <Link2 className="h-3.5 w-3.5 shrink-0 text-zinc-600" />
                        <span className="truncate text-xs text-zinc-400">
                          {getBoardShareUrl(category.share_id)}
                        </span>
                      </div>
                      <button
                        onClick={handleCopyLink}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-600 text-white transition-colors hover:bg-violet-500"
                        aria-label="Copy link"
                      >
                        {copied ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
