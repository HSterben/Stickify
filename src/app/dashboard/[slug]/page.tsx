import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { BoardView } from "@/components/board/board-view";
import type { Category, Post } from "@/lib/types/database";

interface BoardPageProps {
  params: Promise<{ slug: string }>;
}

export default async function BoardPage({ params }: BoardPageProps) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: categoryData } = await supabase
    .from("categories")
    .select("*")
    .eq("user_id", user.id)
    .eq("slug", slug)
    .single();

  const category = categoryData as Category | null;

  if (!category) {
    redirect("/dashboard");
  }

  const { data: postsData } = await supabase
    .from("posts")
    .select("*")
    .eq("category_id", category.id)
    .eq("is_archived", false)
    .order("position", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  const posts = (postsData ?? []) as Post[];
  const postIds = posts.map((p) => p.id);
  let postTags: { post_id: string; tag_id: string; tags: { id: string; name: string } | null }[] = [];

  if (postIds.length > 0) {
    const { data } = await supabase
      .from("post_tags")
      .select("post_id, tag_id, tags:tags(id, name)")
      .in("post_id", postIds);
    postTags = (data as any) ?? [];
  }

  const postsWithTags = posts.map((post) => ({
    ...post,
    tags: postTags
      .filter((pt) => pt.post_id === post.id && pt.tags)
      .map((pt) => pt.tags!),
  }));

  return <BoardView category={category} initialPosts={postsWithTags} />;
}
