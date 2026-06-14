import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { BoardView } from "@/components/board/board-view";
import type { Category, Post, Profile } from "@/lib/types/database";
import type { Metadata } from "next";

interface PublicBoardPageProps {
  params: Promise<{ shareId: string }>;
}

export async function generateMetadata({
  params,
}: PublicBoardPageProps): Promise<Metadata> {
  const { shareId } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from("categories")
    .select("name")
    .eq("share_id", shareId)
    .eq("visibility", "public")
    .single();

  const category = data as Pick<Category, "name"> | null;

  if (!category) {
    return { title: "Board not found | Stickify" };
  }

  return {
    title: `${category.name} | Stickify`,
    description: `Shared board: ${category.name}`,
    robots: { index: false, follow: false },
  };
}

export default async function PublicBoardPage({ params }: PublicBoardPageProps) {
  const { shareId } = await params;
  const supabase = await createClient();

  const { data: categoryData } = await supabase
    .from("categories")
    .select("*")
    .eq("share_id", shareId)
    .eq("visibility", "public")
    .single();

  const category = categoryData as Category | null;

  if (!category) {
    notFound();
  }

  const { data: profileData } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", category.user_id)
    .single();

  const profile = profileData as Pick<Profile, "full_name" | "email"> | null;
  const ownerName =
    profile?.full_name || profile?.email?.split("@")[0] || "Someone";

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

  return (
    <BoardView
      category={category}
      initialPosts={postsWithTags}
      readOnly
      ownerName={ownerName}
    />
  );
}
