import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Layers, Hash, ChevronRight } from "lucide-react";
import type { Category } from "@/lib/types/database";

export default async function YourBoardsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: categoriesData } = await supabase
    .from("categories")
    .select("*")
    .eq("user_id", user.id)
    .order("position", { ascending: true });

  const categories = (categoriesData ?? []) as Category[];

  const { data: postsData } = await supabase
    .from("posts")
    .select("category_id")
    .eq("is_archived", false);

  const countByCategory = new Map<string, number>();
  for (const row of postsData ?? []) {
    const id = (row as { category_id: string }).category_id;
    countByCategory.set(id, (countByCategory.get(id) ?? 0) + 1);
  }

  return (
    <div className="h-full p-4 lg:p-6">
      <div className="mb-8">
        <div className="mb-2 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/15">
            <Layers className="h-6 w-6 text-violet-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Your Boards</h1>
            <p className="mt-0.5 text-sm text-zinc-500">
              {categories.length === 0
                ? "Create a board from the sidebar to get started"
                : `${categories.length} ${categories.length === 1 ? "board" : "boards"}`}
            </p>
          </div>
        </div>
      </div>

      {categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/30 py-20">
          <p className="text-sm text-zinc-500">No boards yet — use the + next to Boards in the sidebar</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {categories.map((cat) => {
            const n = countByCategory.get(cat.id) ?? 0;
            return (
              <Link
                key={cat.id}
                href={`/dashboard/${cat.slug}`}
                className="group relative flex flex-col rounded-2xl border border-zinc-800 bg-card/50 p-5 transition-all hover:border-zinc-700 hover:bg-card/80 hover:shadow-lg hover:shadow-black/20 cursor-pointer"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-500/10">
                      <Hash className="h-4 w-4 text-violet-400" />
                    </div>
                    <h2 className="truncate text-lg font-semibold text-zinc-100 group-hover:text-white">
                      {cat.name}
                    </h2>
                  </div>
                  <ChevronRight className="h-5 w-5 shrink-0 text-zinc-600 transition-transform group-hover:translate-x-0.5 group-hover:text-zinc-400" />
                </div>
                <p className="text-sm text-zinc-500">
                  {n} {n === 1 ? "post" : "posts"}
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
