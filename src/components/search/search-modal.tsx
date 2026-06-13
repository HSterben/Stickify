"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Post } from "@/lib/types/database";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Search, FileText, Code2, Globe, X, ArrowRight } from "lucide-react";
import { truncate, getRelativeTime } from "@/lib/utils";

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

export function SearchModal({ open, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<(Post & { category_slug?: string })[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const search = useCallback(
    async (q: string) => {
      if (!q.trim()) {
        setResults([]);
        return;
      }

      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data } = await (supabase as any)
        .from("posts")
        .select("*, categories!inner(slug)")
        .eq("user_id", user.id)
        .or(`title.ilike.%${q}%,content_text.ilike.%${q}%,content_code.ilike.%${q}%,url.ilike.%${q}%,preview_title.ilike.%${q}%`)
        .order("created_at", { ascending: false })
        .limit(20);

      setResults(
        (data ?? []).map((item: any) => ({
          ...item,
          category_slug: item.categories?.slug,
        }))
      );
      setLoading(false);
    },
    [supabase]
  );

  useEffect(() => {
    const timer = setTimeout(() => search(query), 300);
    return () => clearTimeout(timer);
  }, [query, search]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (open) onClose();
        else {
          // This is handled by topbar, but keyboard shortcut also works
        }
      }
      if (e.key === "Escape" && open) onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  const typeIcons = { text: FileText, code: Code2, link: Globe };
  const typeColors = {
    text: "text-rose-400",
    code: "text-emerald-400",
    link: "text-sky-400",
  };

  const handleSelect = (result: Post & { category_slug?: string }) => {
    if (result.category_slug) {
      router.push(`/dashboard/${result.category_slug}`);
    }
    onClose();
    setQuery("");
    setResults([]);
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl"
          >
            <div className="flex items-center gap-3 border-b border-zinc-800 px-4">
              <Search className="h-5 w-5 shrink-0 text-zinc-500" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search your boards..."
                className="flex-1 bg-transparent py-4 text-sm text-white placeholder-zinc-500 outline-none"
                autoFocus
              />
              {query && (
                <button
                  onClick={() => { setQuery(""); setResults([]); }}
                  className="shrink-0 text-zinc-500 hover:text-zinc-300"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {query.trim() && (
              <div className="max-h-80 overflow-y-auto p-2">
                {loading ? (
                  <div className="py-8 text-center text-sm text-zinc-500">
                    Searching...
                  </div>
                ) : results.length === 0 ? (
                  <div className="py-8 text-center text-sm text-zinc-500">
                    No results found
                  </div>
                ) : (
                  results.map((result) => {
                    const Icon = typeIcons[result.type];
                    return (
                      <button
                        key={result.id}
                        onClick={() => handleSelect(result)}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-zinc-800/50"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-800">
                          <Icon className={`h-4 w-4 ${typeColors[result.type]}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-sm font-medium">{result.title}</p>
                          <p className="truncate text-xs text-zinc-500">
                            {result.content_text
                              ? truncate(result.content_text, 60)
                              : result.preview_title
                                ? truncate(result.preview_title, 60)
                                : result.type}
                          </p>
                        </div>
                        <span className="shrink-0 text-[10px] text-zinc-600">
                          {getRelativeTime(result.created_at)}
                        </span>
                        <ArrowRight className="h-3.5 w-3.5 shrink-0 text-zinc-600" />
                      </button>
                    );
                  })
                )}
              </div>
            )}

            {!query.trim() && (
              <div className="p-4 text-center text-sm text-zinc-600">
                Type to search your posts, code, and bookmarks
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
