"use client";

import { useEffect, useMemo, useState } from "react";
import { Category, PostWithTags } from "@/lib/types/database";
import { createClient } from "@/lib/supabase/client";
import {
  assignSequentialPositions,
  getBoardSortStorageKey,
  sortBoardPosts,
  type BoardSortMode,
} from "@/lib/post-sort";
import { PostCard } from "./post-card";
import { CreatePostModal } from "@/components/posts/create-post-modal";
import { EditPostModal } from "@/components/posts/edit-post-modal";
import { PostViewModal } from "@/components/posts/post-view-modal";
import { BoardSharePanel } from "./board-share-panel";
import { SortDropdown } from "@/components/ui/sort-dropdown";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Plus,
  Filter,
  FileText,
  Code2,
  Link2,
  SlidersHorizontal,
  X,
  LayoutGrid,
  Check,
} from "lucide-react";

interface BoardViewProps {
  category: Category;
  initialPosts: PostWithTags[];
  readOnly?: boolean;
  ownerName?: string | null;
}

type FilterType = "all" | "text" | "code" | "link";

const SORT_OPTIONS: { value: BoardSortMode; label: string }[] = [
  { value: "custom", label: "Custom" },
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
];

export function BoardView({
  category: initialCategory,
  initialPosts,
  readOnly = false,
  ownerName,
}: BoardViewProps) {
  const [category, setCategory] = useState(initialCategory);
  const [posts, setPosts] = useState<PostWithTags[]>(initialPosts);
  const [createOpen, setCreateOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<PostWithTags | null>(null);
  const [viewingPost, setViewingPost] = useState<PostWithTags | null>(null);
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [sortBy, setSortBy] = useState<BoardSortMode>("newest");
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [isLayoutEditing, setIsLayoutEditing] = useState(false);
  const [layoutPosts, setLayoutPosts] = useState<PostWithTags[]>([]);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [savingLayout, setSavingLayout] = useState(false);

  const supabase = createClient();
  const filtersActive = filterType !== "all" || !!filterTag;

  useEffect(() => {
    const stored = localStorage.getItem(getBoardSortStorageKey(category.id));
    if (stored === "custom" || stored === "newest" || stored === "oldest") {
      setSortBy(stored);
    }
  }, [category.id]);

  const handleSortChange = (value: BoardSortMode) => {
    setSortBy(value);
    localStorage.setItem(getBoardSortStorageKey(category.id), value);
  };

  const allTags = useMemo(() => {
    const tagMap = new Map<string, { id: string; name: string }>();
    posts.forEach((post) => post.tags.forEach((tag) => tagMap.set(tag.id, tag)));
    return Array.from(tagMap.values());
  }, [posts]);

  const sortedPosts = useMemo(() => sortBoardPosts(posts, sortBy), [posts, sortBy]);

  const filteredPosts = useMemo(() => {
    let result = [...sortedPosts];

    if (filterType !== "all") {
      result = result.filter((post) => post.type === filterType);
    }

    if (filterTag) {
      result = result.filter((post) => post.tags.some((tag) => tag.id === filterTag));
    }

    return result;
  }, [sortedPosts, filterType, filterTag]);

  const startLayoutEdit = () => {
    if (filtersActive) {
      toast.error("Clear filters before editing layout");
      return;
    }

    setLayoutPosts([...filteredPosts]);
    setIsLayoutEditing(true);
  };

  const cancelLayoutEdit = () => {
    setIsLayoutEditing(false);
    setDraggingId(null);
    setLayoutPosts([]);
  };

  const handleLayoutDrop = (targetId: string) => {
    if (!draggingId || draggingId === targetId) return;

    setLayoutPosts((prev) => {
      const next = [...prev];
      const fromIndex = next.findIndex((post) => post.id === draggingId);
      const toIndex = next.findIndex((post) => post.id === targetId);
      if (fromIndex < 0 || toIndex < 0) return prev;

      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
    setDraggingId(null);
  };

  const saveLayout = async () => {
    setSavingLayout(true);

    try {
      const positioned = assignSequentialPositions(layoutPosts);

      await Promise.all(
        positioned.map((post) =>
          (supabase as any)
            .from("posts")
            .update({ position: post.position })
            .eq("id", post.id)
        )
      );

      setPosts((prev) => {
        const byId = new Map(positioned.map((post) => [post.id, post.position]));
        return prev.map((post) =>
          byId.has(post.id) ? { ...post, position: byId.get(post.id)! } : post
        );
      });

      handleSortChange("custom");
      setIsLayoutEditing(false);
      setLayoutPosts([]);
      toast.success("Layout saved");
    } catch {
      toast.error("Failed to save layout");
    } finally {
      setSavingLayout(false);
    }
  };

  const handlePostCreated = (post: PostWithTags) => {
    if (post.category_id === category.id) {
      setPosts((prev) => [post, ...prev]);
    }
  };

  const handlePostUpdated = (updated: PostWithTags) => {
    setPosts((prev) => prev.map((post) => (post.id === updated.id ? updated : post)));
    setEditingPost(null);
  };

  const handlePostDeleted = (id: string) => {
    setPosts((prev) => prev.filter((post) => post.id !== id));
  };

  const filterButtons: { type: FilterType; icon: typeof FileText; label: string }[] = [
    { type: "all", icon: SlidersHorizontal, label: "All" },
    { type: "text", icon: FileText, label: "Text" },
    { type: "code", icon: Code2, label: "Code" },
    { type: "link", icon: Link2, label: "Links" },
  ];

  const displayPosts = isLayoutEditing ? layoutPosts : filteredPosts;

  return (
    <div className="h-full p-4 lg:p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{category.name}</h1>
            <p className="mt-1 text-sm text-zinc-500">
              {posts.length} {posts.length === 1 ? "post" : "posts"}
              {readOnly && ownerName && <span> · by {ownerName}</span>}
              {isLayoutEditing && (
                <span className="text-violet-300"> · drag posts to reposition</span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!readOnly && !isLayoutEditing && (
              <button
                onClick={startLayoutEdit}
                disabled={posts.length < 2 || filtersActive}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                title={filtersActive ? "Clear filters first" : "Edit layout"}
              >
                <LayoutGrid className="h-4 w-4" />
                <span className="hidden sm:inline">Edit layout</span>
              </button>
            )}
            {!readOnly && isLayoutEditing && (
              <>
                <button
                  onClick={cancelLayoutEdit}
                  disabled={savingLayout}
                  className="rounded-lg px-3 py-2 text-sm text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={saveLayout}
                  disabled={savingLayout}
                  className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-violet-500/20 transition-all hover:bg-violet-500 disabled:opacity-50"
                >
                  {savingLayout ? (
                    <span>Saving...</span>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      Done
                    </>
                  )}
                </button>
              </>
            )}
            {!isLayoutEditing && (
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                  showFilters || filtersActive
                    ? "bg-violet-500/10 text-violet-300"
                    : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                }`}
              >
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">Filter</span>
              </button>
            )}
            {!readOnly && !isLayoutEditing && (
              <>
                <BoardSharePanel category={category} onCategoryUpdated={setCategory} />
                <button
                  onClick={() => setCreateOpen(true)}
                  className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-violet-500/20 transition-all hover:bg-violet-500 hover:shadow-violet-500/30 active:scale-[0.97]"
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Add Post</span>
                </button>
              </>
            )}
          </div>
        </div>

        <AnimatePresence>
          {showFilters && !isLayoutEditing && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-4 flex flex-wrap items-center gap-2">
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

                <SortDropdown
                  value={sortBy}
                  options={SORT_OPTIONS}
                  onChange={handleSortChange}
                />

                {allTags.length > 0 && (
                  <>
                    <div className="mx-1 h-5 w-px bg-zinc-800" />
                    {allTags.map((tag) => (
                      <button
                        key={tag.id}
                        onClick={() => setFilterTag(filterTag === tag.id ? null : tag.id)}
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

                {filtersActive && (
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

      {displayPosts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20"
        >
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-800/50">
            <Plus className="h-7 w-7 text-zinc-600" />
          </div>
          <p className="mb-1 text-sm font-medium text-zinc-400">
            {filtersActive
              ? "No posts match your filters"
              : readOnly
                ? "Nothing here yet"
                : "Add your first post"}
          </p>
          <p className="text-xs text-zinc-600">
            {filtersActive
              ? "Clear your filters and try again"
              : readOnly
                ? "The owner hasn't added anything"
                : "Hit Add Post above"}
          </p>
        </motion.div>
      ) : (
        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
          <AnimatePresence mode="popLayout">
            {displayPosts.map((post, i) => (
              <motion.div
                key={post.id}
                layout={!isLayoutEditing}
                initial={{ opacity: 0, scale: isLayoutEditing ? 1 : 0.9 }}
                animate={{
                  opacity:
                    isLayoutEditing && draggingId && draggingId !== post.id ? 0.72 : 1,
                  scale: 1,
                }}
                exit={{ opacity: 0, scale: isLayoutEditing ? 1 : 0.9 }}
                transition={{ delay: isLayoutEditing ? 0 : i * 0.03, duration: 0.3 }}
                className="mb-4 break-inside-avoid"
                draggable={isLayoutEditing}
                onDragStart={() => setDraggingId(post.id)}
                onDragEnd={() => setDraggingId(null)}
                onDragOver={(event) => {
                  if (isLayoutEditing) event.preventDefault();
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  if (isLayoutEditing) handleLayoutDrop(post.id);
                }}
              >
                <div
                  className={cn(
                    isLayoutEditing && "layout-edit-card h-full",
                    draggingId === post.id && "layout-edit-dragging"
                  )}
                >
                  <PostCard
                    post={post}
                    readOnly={readOnly || isLayoutEditing}
                    onOpen={() => {
                      if (!isLayoutEditing) setViewingPost(post);
                    }}
                    onEdit={() => {
                      if (!isLayoutEditing) setEditingPost(post);
                    }}
                    onDeleted={handlePostDeleted}
                    onUpdated={handlePostUpdated}
                  />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {!readOnly && (
        <CreatePostModal
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          categoryId={category.id}
          onCreated={handlePostCreated}
        />
      )}

      <PostViewModal
        open={!!viewingPost}
        post={viewingPost}
        readOnly={readOnly}
        onClose={() => setViewingPost(null)}
        onEdit={(post) => {
          setViewingPost(null);
          setEditingPost(post);
        }}
      />

      {!readOnly && editingPost && (
        <EditPostModal
          key={editingPost.id}
          open={!!editingPost}
          onClose={() => setEditingPost(null)}
          post={editingPost}
          onUpdated={handlePostUpdated}
        />
      )}
    </div>
  );
}
