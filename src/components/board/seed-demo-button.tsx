"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { seedDemoData } from "@/lib/seed-demo-data";
import { toast } from "sonner";
import { Loader2, Sparkles } from "lucide-react";

/**
 * TEMPORARY — remove after homepage screenshots are done.
 * Fills the current account with sample boards + posts.
 */
export function SeedDemoButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSeed = async () => {
    const ok = window.confirm(
      "Fill this account with demo boards and posts for screenshots?\n\n(Safe on an alt account. Adds data; does not delete existing boards.)"
    );
    if (!ok) return;

    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Sign in first");
        return;
      }

      const result = await seedDemoData(supabase, user.id);
      toast.success(
        `Added ${result.boards} boards and ${result.posts} posts`
      );
      // Full reload so sidebar picks up new categories from the server layout.
      window.location.href = "/dashboard/boards";
    } catch (err) {
      const message = err instanceof Error ? err.message : "Seed failed";
      toast.error(message);
    } finally {
      setLoading(false);
      router.refresh();
    }
  };

  return (
    <button
      type="button"
      onClick={handleSeed}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-sm font-medium text-amber-100 transition-colors hover:bg-amber-500/15 disabled:opacity-50"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Sparkles className="h-4 w-4 text-amber-300" />
      )}
      {loading ? "Seeding…" : "TEMP: Fill demo data"}
    </button>
  );
}
