"use client";

import { useState, useMemo } from "react";
import { Category, PostWithTags } from "@/lib/types/database";
import { PostCard } from "./post-card";
import { CreatePostModal } from "@/components/posts/create-post-modal";
import { EditPostModal } from "@/components/posts/edit-post-modal";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Filter,
  FileText,
  Code2,
  Link2,
  SlidersHorizontal,
  X,
} from "lucide-react";

interface BoardViewProps {
  category: Category;
  initialPosts: PostWithTags[];
}

type FilterType = "all" | "text" | "code" | "link";
type SortBy = "newest" | "oldest";

export function BoardView({ category, initialPosts }: BoardViewProps) {
  const [posts, setPosts] = useState<PostWithTags[]>(initialPosts);
  const [createOpen, setCreateOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<PostWithTags | null>(null);
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [sortBy, setSortBy] = useState<SortBy>("newest");
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const allTags = useMemo(() => {
    const tagMap = new Map<string, { id: string; name: string }>();
    posts.forEach((p) =>
      p.tags.forEach((t) => tagMap.set(t.id, t))
    );
    return Array.from(tagMap.values());
  }, [posts]);

  const filteredPosts = useMemo(() => {
    let result = [...posts];

    if (filterType !== "all") {
      result = result.filter((p) => p.type === filterType);
    }

    if (filterTag) {
      result = result.filter((p) => p.tags.some((t) => t.id === filterTag));
    }

    const pinned = result.filter((p) => p.is_pinned);
    const unpinned = result.filter((p) => !p.is_pinned);

    unpinned.sort((a, b) => {
      if (sortBy === "newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });

    return [...pinned, ...unpinned];
  }, [posts, filterType, sortBy, filterTag]);

  const handlePostCreated = (post: PostWithTags) => {
    setPosts((prev) => [post, ...prev]);
  };

  const handlePostUpdated = (updated: PostWithTags) => {
    setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setEditingPost(null);
  };

  const handlePostDeleted = (id: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
  };

  const filterButtons: { type: FilterType; icon: typeof FileText; label: string }[] = [
    { type: "all", icon: SlidersHorizontal, label: "All" },
    { type: "text", icon: FileText, label: "Text" },
    { type: "code", icon: Code2, label: "Code" },
    { type: "link", icon: Link2, label: "Links" },
  ];

  return (
    <div className="h-full p-4 lg:p-6">
      {/* Board header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{category.name}</h1>
            <p className="mt-1 text-sm text-zinc-500">
              {posts.length} {posts.length === 1 ? "post" : "posts"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                showFilters || filterType !== "all" || filterTag
                  ? "bg-violet-500/10 text-violet-300"
                  : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
              }`}
            >
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Filter</span>
            </button>
            <button
              onClick={() => setCreateOpen(true)}
              className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-violet-500/20 transition-all hover:bg-violet-500 hover:shadow-violet-500/30 active:scale-[0.97]"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Post</span>
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {/* Type filters */}
                {filterButtons.map((fb) => (
                  <button
                    key={fb.type}
                    onClick={() => setFilterType(fb.type)}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                      filterType === fb.type
                        ? "bg-violet-500/15 text-violet-300 ring-1 ring-violet-500/30"
                        : "bg-zinc-800/50 text-zinc-400 hover:text-zinc-300"
                    }`}
                  >
                    <fb.icon className="h-3.5 w-3.5" />
                    {fb.label}
                  </button>
                ))}

                <div className="mx-1 h-5 w-px bg-zinc-800" />

                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortBy)}
                  className="rounded-lg bg-zinc-800/50 px-3 py-1.5 text-xs text-zinc-400 outline-none"
                >
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                </select>

                {/* Tag filter */}
                {allTags.length > 0 && (
                  <>
                    <div className="mx-1 h-5 w-px bg-zinc-800" />
                    {allTags.map((tag) => (
                      <button
                        key={tag.id}
                        onClick={() =>
                          setFilterTag(filterTag === tag.id ? null : tag.id)
                        }
                        className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                          filterTag === tag.id
                            ? "bg-violet-500/15 text-violet-300 ring-1 ring-violet-500/30"
                            : "bg-zinc-800/50 text-zinc-500 hover:text-zinc-300"
                        }`}
                      >
                        #{tag.name}
                      </button>
                    ))}
                  </>
                )}

                {(filterType !== "all" || filterTag) && (
                  <button
                    onClick={() => {
                      setFilterType("all");
                      setFilterTag(null);
                    }}
                    className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-zinc-500 hover:text-zinc-300"
                  >
                    <X className="h-3 w-3" />
                    Clear
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Posts grid */}
      {filteredPosts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20"
        >
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-800/50">
            <Plus className="h-7 w-7 text-zinc-600" />
          </div>
          <p className="mb-1 text-sm font-medium text-zinc-400">
            {filterType !== "all" || filterTag
              ? "No posts match your filters"
              : "This board is empty"}
          </p>
          <p className="text-xs text-zinc-600">
            {filterType !== "all" || filterTag
              ? "Try adjusting your filters"
              : "Add your first post to get started"}
          </p>
        </motion.div>
      ) : (
        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
          <AnimatePresence mode="popLayout">
            {filteredPosts.map((post, i) => (
              <motion.div
                key={post.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.03, duration: 0.3 }}
                className="mb-4 break-inside-avoid"
              >
                <PostCard
                  post={post}
                  onEdit={() => setEditingPost(post)}
                  onDeleted={handlePostDeleted}
                  onUpdated={handlePostUpdated}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <CreatePostModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        categoryId={category.id}
        onCreated={handlePostCreated}
      />

      {editingPost && (
        <EditPostModal
          open={!!editingPost}
          onClose={() => setEditingPost(null)}
          post={editingPost}
          onUpdated={handlePostUpdated}
        />
      )}
    </div>
  );
}
