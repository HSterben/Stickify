import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { WelcomeView } from "@/components/board/welcome-view";
import type { Category } from "@/lib/types/database";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await supabase
    .from("categories")
    .select("*")
    .eq("user_id", user.id)
    .order("position", { ascending: true })
    .limit(1);

  const categories = (data ?? []) as Category[];

  if (categories.length > 0) {
    redirect(`/dashboard/${categories[0].slug}`);
  }

  return <WelcomeView />;
}
