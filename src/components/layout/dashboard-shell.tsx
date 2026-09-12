"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { User } from "@supabase/supabase-js";
import { Category, Profile } from "@/lib/types/database";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import {
  loadSidebarWidth,
  saveSidebarWidth,
  SIDEBAR_WIDTH_MAX,
  SIDEBAR_WIDTH_MIN,
} from "@/lib/note-content";

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
  const [sidebarWidth, setSidebarWidth] = useState(256);
  const dragging = useRef(false);

  useEffect(() => {
    setSidebarWidth(loadSidebarWidth());
  }, []);

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

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      const next = Math.min(
        SIDEBAR_WIDTH_MAX,
        Math.max(SIDEBAR_WIDTH_MIN, e.clientX)
      );
      setSidebarWidth(next);
    };
    const onUp = () => {
      if (!dragging.current) return;
      dragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      setSidebarWidth((w) => {
        saveSidebarWidth(w);
        return w;
      });
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-800/50 bg-card/80 backdrop-blur-sm lg:hidden"
      >
        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

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

      <aside
        style={{ width: sidebarWidth }}
        className={`fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-out lg:relative lg:translate-x-0 lg:transition-none ${
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
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize sidebar"
          onMouseDown={() => {
            dragging.current = true;
            document.body.style.cursor = "col-resize";
            document.body.style.userSelect = "none";
          }}
          className="absolute top-0 right-0 hidden h-full w-1 cursor-col-resize bg-transparent transition-colors hover:bg-violet-500/40 lg:block"
        />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar user={user} profile={profile} />
        <main className="flex-1 overflow-y-auto">
          <div className="h-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
