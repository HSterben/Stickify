"use client";

import { useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { User } from "@supabase/supabase-js";
import { Category, Profile } from "@/lib/types/database";
import { createClient } from "@/lib/supabase/client";
import { slugify, cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Layers,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  FolderOpen,
  Hash,
  X,
  Check,
} from "lucide-react";

interface SidebarProps {
  user: User;
  profile: Profile | null;
  categories: Category[];
  onCategoryCreated: (cat: Category) => void;
  onCategoryDeleted: (id: string) => void;
  onCategoryUpdated: (cat: Category) => void;
  onClose: () => void;
}

export function Sidebar({
  user,
  categories,
  onCategoryCreated,
  onCategoryDeleted,
  onCategoryUpdated,
  onClose,
}: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const currentSlug = pathname.split("/dashboard/")[1] ?? "";

  const handleCreate = async () => {
    if (!newName.trim()) return;
    const slug = slugify(newName.trim());
    const position = categories.length;

    const { data, error } = await (supabase as any)
      .from("categories")
      .insert({
        user_id: user.id,
        name: newName.trim(),
        slug,
        position,
      })
      .select()
      .single();

    if (error) {
      toast.error("Failed to create board");
      return;
    }

    onCategoryCreated(data as Category);
    setNewName("");
    setIsCreating(false);
    router.push(`/dashboard/${slug}`);
    onClose();
  };

  const handleRename = async (cat: Category) => {
    if (!editName.trim() || editName.trim() === cat.name) {
      setEditingId(null);
      return;
    }

    const newSlug = slugify(editName.trim());
    const { data, error } = await (supabase as any)
      .from("categories")
      .update({ name: editName.trim(), slug: newSlug })
      .eq("id", cat.id)
      .select()
      .single();

    if (error) {
      toast.error("Failed to rename board");
      return;
    }

    onCategoryUpdated(data as Category);
    setEditingId(null);
    if (currentSlug === cat.slug) {
      router.push(`/dashboard/${newSlug}`);
    }
  };

  const handleDelete = async (cat: Category) => {
    const { error } = await (supabase as any)
      .from("categories")
      .delete()
      .eq("id", cat.id);

    if (error) {
      toast.error("Failed to delete board");
      return;
    }

    onCategoryDeleted(cat.id);
    setMenuOpenId(null);
    if (currentSlug === cat.slug) {
      router.push("/dashboard");
    }
    toast.success("Board deleted");
  };

  return (
    <div className="flex h-full flex-col border-r border-sidebar-border bg-sidebar">
      {/* Logo */}
      <Link
        href="/dashboard/boards"
        className="flex items-center gap-2.5 px-5 py-5 transition-opacity hover:opacity-90"
        onClick={() => onClose()}
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 shadow-md shadow-violet-500/20">
          <Layers className="h-4 w-4 text-white" />
        </div>
        <span className="text-lg font-bold tracking-tight">Stickify</span>
      </Link>

      {/* Boards header */}
      <div className="flex items-center justify-between px-5 py-2">
        <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">
          Boards
        </span>
        <button
          onClick={() => {
            setIsCreating(true);
            setTimeout(() => inputRef.current?.focus(), 50);
          }}
          className="flex h-6 w-6 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Category list */}
      <div className="flex-1 overflow-y-auto px-3 pb-4">
        {categories.length === 0 && !isCreating && (
          <div className="mt-8 text-center">
            <FolderOpen className="mx-auto mb-3 h-10 w-10 text-zinc-700" />
            <p className="text-sm text-zinc-500">No boards yet</p>
            <button
              onClick={() => {
                setIsCreating(true);
                setTimeout(() => inputRef.current?.focus(), 50);
              }}
              className="mt-2 text-xs font-medium text-violet-400 transition-colors hover:text-violet-300"
            >
              Create your first board
            </button>
          </div>
        )}

        {categories.map((cat) => {
          const isActive = currentSlug === cat.slug;
          const isEditing = editingId === cat.id;

          return (
            <div key={cat.id} className="group relative">
              {isEditing ? (
                <div className="flex items-center gap-2 rounded-lg p-1">
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleRename(cat);
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    className="min-w-0 flex-1 rounded-md bg-zinc-800 px-2.5 py-1.5 text-sm text-white outline-none ring-1 ring-violet-500/50 focus:ring-violet-500"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => handleRename(cat)}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-emerald-400 hover:bg-zinc-800"
                    aria-label="Save name"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-zinc-500 hover:bg-zinc-800"
                    aria-label="Cancel rename"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    router.push(`/dashboard/${cat.slug}`);
                    onClose();
                  }}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-all",
                    isActive
                      ? "bg-violet-500/10 text-violet-300 font-medium"
                      : "text-sidebar-foreground hover:bg-zinc-800/50 hover:text-white"
                  )}
                >
                  <Hash className={cn("h-4 w-4 shrink-0", isActive ? "text-violet-400" : "text-zinc-600")} />
                  <span className="truncate">{cat.name}</span>

                  {/* Context menu trigger */}
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpenId(menuOpenId === cat.id ? null : cat.id);
                    }}
                    className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-md opacity-0 transition-opacity group-hover:opacity-100 hover:bg-zinc-700"
                  >
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </div>
                </button>
              )}

              {/* Dropdown menu */}
              {menuOpenId === cat.id && !isEditing && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setMenuOpenId(null)}
                  />
                  <div className="absolute right-2 top-full z-20 mt-1 w-36 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900 shadow-xl">
                    <button
                      onClick={() => {
                        setEditingId(cat.id);
                        setEditName(cat.name);
                        setMenuOpenId(null);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Rename
                    </button>
                    <button
                      onClick={() => handleDelete(cat)}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-zinc-800"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        })}

        {/* Create new board input */}
        {isCreating && (
          <div className="mt-1 flex items-center gap-2 rounded-lg p-1">
            <input
              ref={inputRef}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreate();
                if (e.key === "Escape") {
                  setIsCreating(false);
                  setNewName("");
                }
              }}
              placeholder="Board name..."
              className="min-w-0 flex-1 rounded-md bg-zinc-800 px-2.5 py-1.5 text-sm text-white placeholder-zinc-500 outline-none ring-1 ring-violet-500/50 focus:ring-violet-500"
            />
            <button
              type="button"
              onClick={handleCreate}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-emerald-400 hover:bg-zinc-800"
              aria-label="Create board"
            >
              <Check className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                setIsCreating(false);
                setNewName("");
              }}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-zinc-500 hover:bg-zinc-800"
              aria-label="Cancel"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
