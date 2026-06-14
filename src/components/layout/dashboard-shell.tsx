"use client";

import { useState, useCallback } from "react";
import { User } from "@supabase/supabase-js";
import { Category, Profile } from "@/lib/types/database";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";

interface DashboardShellProps {
  user: User;
  profile: Profile | null;
  initialCategories: Category[];
  children: React.ReactNode;
}

export function DashboardShell({
  user,
  profile,
  initialCategories,
  children,
}: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>(initialCategories);

  const handleCategoryCreated = useCallback((cat: Category) => {
    setCategories((prev) => [...prev, cat]);
  }, []);

  const handleCategoryDeleted = useCallback((id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const handleCategoryUpdated = useCallback((updated: Category) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === updated.id ? updated : c))
    );
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 flex h-10 w-10 items-center justify-center rounded-xl bg-card/80 backdrop-blur-sm border border-zinc-800/50 lg:hidden"
      >
        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-out lg:relative lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar
          user={user}
          profile={profile}
          categories={categories}
          onCategoryCreated={handleCategoryCreated}
          onCategoryDeleted={handleCategoryDeleted}
          onCategoryUpdated={handleCategoryUpdated}
          onClose={() => setSidebarOpen(false)}
        />
      </aside>

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar user={user} profile={profile} />
        <main className="flex-1 overflow-y-auto">
          <div className="h-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
