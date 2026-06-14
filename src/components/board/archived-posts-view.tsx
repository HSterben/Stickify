"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PostWithTags, PostWithTagsAndBoard } from "@/lib/types/database";
import { PostCard } from "./post-card";
import { EditPostModal } from "@/components/posts/edit-post-modal";
import { PostViewModal } from "@/components/posts/post-view-modal";
import { motion, AnimatePresence } from "framer-motion";
import { Archive, ArrowLeft } from "lucide-react";

interface ArchivedPostsViewProps {
  initialPosts: PostWithTagsAndBoard[];
}

export function ArchivedPostsView({ initialPosts }: ArchivedPostsViewProps) {
  const [posts, setPosts] = useState(initialPosts);
  const [editingPost, setEditingPost] = useState<PostWithTagsAndBoard | null>(null);
  const [viewingPost, setViewingPost] = useState<PostWithTagsAndBoard | null>(null);

  const boardCount = useMemo(() => {
    return new Set(posts.map((post) => post.category_id)).size;
  }, [posts]);

  const handleRestored = (id: string) => {
    setPosts((prev) => prev.filter((post) => post.id !== id));
  };

  const handleDeleted = (id: string) => {
    setPosts((prev) => prev.filter((post) => post.id !== id));
  };

  const handlePostUpdated = (updated: PostWithTags) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === updated.id ? { ...post, ...updated } : post
      )
    );
  };

  return (
    <div className="h-full p-4 lg:p-6">
      <div className="mb-8">
        <Link
          href="/dashboard/boards"
          className="mb-4 inline-flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-zinc-300"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to boards
        </Link>

        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-zinc-700/80 bg-zinc-800/50">
            <Archive className="h-5 w-5 text-zinc-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Archived</h1>
            <p className="mt-0.5 text-sm text-zinc-500">
              {posts.length === 0
                ? "Archived posts are hidden from your boards but kept here"
                : `${posts.length} archived ${posts.length === 1 ? "post" : "posts"} across ${boardCount} ${boardCount === 1 ? "board" : "boards"}`}
            </p>
          </div>
        </div>
      </div>

      {posts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/30 py-20"
        >
          <Archive className="mb-4 h-10 w-10 text-zinc-700" />
          <p className="text-sm font-medium text-zinc-400">No archived posts</p>
          <p className="mt-1 max-w-sm text-center text-xs text-zinc-600">
            Archive a post from any board to hide it without deleting it.
          </p>
        </motion.div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {posts.map((post) => (
              <motion.div
                key={post.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.2 }}
              >
                <PostCard
                  post={post}
                  archived
                  boardName={post.category_name}
                  onEdit={() => setEditingPost(post)}
                  onOpen={() => setViewingPost(post)}
                  onDeleted={handleDeleted}
                  onRestored={handleRestored}
                  onUpdated={handlePostUpdated}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <PostViewModal
        open={!!viewingPost}
        post={viewingPost}
        onClose={() => setViewingPost(null)}
        onEdit={(post) => {
          setViewingPost(null);
          setEditingPost(post as PostWithTagsAndBoard);
        }}
      />

      {editingPost && (
        <EditPostModal
          key={editingPost.id}
          open={!!editingPost}
          onClose={() => setEditingPost(null)}
          post={editingPost}
          onUpdated={(post) => {
            handlePostUpdated({ ...editingPost, ...post });
            setEditingPost(null);
          }}
        />
      )}
    </div>
  );
}
