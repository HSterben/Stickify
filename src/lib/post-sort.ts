import type { PostWithTags } from "@/lib/types/database";

export type BoardSortMode = "custom" | "newest" | "oldest";

export function getBoardSortStorageKey(categoryId: string) {
  return `stickify-board-sort-${categoryId}`;
}

export function sortBoardPosts(
  posts: PostWithTags[],
  sortBy: BoardSortMode
): PostWithTags[] {
  const result = [...posts];

  if (sortBy === "custom") {
    return result.sort((a, b) => {
      const posA = a.position ?? Number.MAX_SAFE_INTEGER;
      const posB = b.position ?? Number.MAX_SAFE_INTEGER;
      if (posA !== posB) return posA - posB;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }

  const pinned = result.filter((post) => post.is_pinned);
  const unpinned = result.filter((post) => !post.is_pinned);

  unpinned.sort((a, b) => {
    const aTime = new Date(a.created_at).getTime();
    const bTime = new Date(b.created_at).getTime();
    return sortBy === "newest" ? bTime - aTime : aTime - bTime;
  });

  return [...pinned, ...unpinned];
}

export function assignSequentialPositions(posts: PostWithTags[]): PostWithTags[] {
  return posts.map((post, index) => ({
    ...post,
    position: index,
  }));
}
