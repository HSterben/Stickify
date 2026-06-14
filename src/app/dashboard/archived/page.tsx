import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ArchivedPostsView } from "@/components/board/archived-posts-view";
import type { Post, PostWithTagsAndBoard } from "@/lib/types/database";

export default async function ArchivedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: postsData } = await supabase
    .from("posts")
    .select("*, categories!inner(name, slug)")
    .eq("user_id", user.id)
    .eq("is_archived", true)
    .order("updated_at", { ascending: false });

  const posts = (postsData ?? []) as (Post & {
    categories: { name: string; slug: string };
  })[];
  const postIds = posts.map((post) => post.id);
  let postTags: {
    post_id: string;
    tag_id: string;
    tags: { id: string; name: string } | null;
  }[] = [];

  if (postIds.length > 0) {
    const { data } = await supabase
      .from("post_tags")
      .select("post_id, tag_id, tags:tags(id, name)")
      .in("post_id", postIds);
    postTags = (data as typeof postTags | null) ?? [];
  }

  const postsWithTags: PostWithTagsAndBoard[] = posts.map((post) => {
    const { categories, ...rest } = post;
    return {
      ...rest,
      category_name: categories.name,
      category_slug: categories.slug,
      tags: postTags
        .filter((pt) => pt.post_id === post.id && pt.tags)
        .map((pt) => pt.tags!),
    };
  });

  return <ArchivedPostsView initialPosts={postsWithTags} />;
}
