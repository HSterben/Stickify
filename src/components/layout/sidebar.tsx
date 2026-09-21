"use client";

import { useState, useRef, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { User } from "@supabase/supabase-js";
import { Category, Profile } from "@/lib/types/database";
import { createClient } from "@/lib/supabase/client";
import { slugify, cn } from "@/lib/utils";
import { getBoardVisibility } from "@/lib/sharing";
import {
  DEFAULT_BOARD_COLOR,
  DEFAULT_BOARD_ICON,
  isBoardColorId,
  isBoardIconId,
  nextBoardColor,
  type BoardColorId,
  type BoardIconId,
} from "@/lib/board-appearance";
import { CreatorCredit } from "@/components/ui/creator-credit";
import { StickifyLogo, StickifyWordmark } from "@/components/brand/stickify-logo";
import { BoardIcon } from "@/components/board/board-icon";
import { BoardAppearanceModal } from "@/components/board/board-appearance-modal";
import { toast } from "sonner";
import {
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  FolderOpen,
  X,
  Check,
  Globe,
  Archive,
  Palette,
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

function appearanceFromCategory(cat: Category): {
  icon: BoardIconId;
  color: BoardColorId;
} {
  return {
    icon: isBoardIconId(cat.icon) ? cat.icon : DEFAULT_BOARD_ICON,
    color: isBoardColorId(cat.color) ? cat.color : DEFAULT_BOARD_COLOR,
  };
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
  const [newIcon, setNewIcon] = useState<BoardIconId>(DEFAULT_BOARD_ICON);
  const [newColor, setNewColor] = useState<BoardColorId>(DEFAULT_BOARD_COLOR);
  const [createLookOpen, setCreateLookOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [appearanceCat, setAppearanceCat] = useState<Category | null>(null);
  const [editIcon, setEditIcon] = useState<BoardIconId>(DEFAULT_BOARD_ICON);
  const [editColor, setEditColor] = useState<BoardColorId>(DEFAULT_BOARD_COLOR);
  const [appearanceSaving, setAppearanceSaving] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [menuPlacement, setMenuPlacement] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const menuButtonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const menuPanelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const currentSlug = pathname.split("/dashboard/")[1] ?? "";

  useLayoutEffect(() => {
    if (!menuOpenId) {
      setMenuPlacement(null);
      return;
    }

    const updatePlacement = () => {
      const anchor = menuButtonRefs.current.get(menuOpenId);
      const panel = menuPanelRef.current;
      if (!anchor) return;

      const ar = anchor.getBoundingClientRect();
      const margin = 8;
      const menuWidth = panel?.offsetWidth || 160;
      const menuHeight = panel?.offsetHeight || 120;

      let top = ar.bottom + 4;
      let left = ar.right - menuWidth;

      if (top + menuHeight > window.innerHeight - margin) {
        top = ar.top - menuHeight - 4;
      }
      if (top < margin) top = margin;
      if (left < margin) left = margin;
      if (left + menuWidth > window.innerWidth - margin) {
        left = window.innerWidth - menuWidth - margin;
      }

      setMenuPlacement({ top, left });
    };

    updatePlacement();
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(updatePlacement);
    });

    window.addEventListener("resize", updatePlacement);
    document.addEventListener("scroll", updatePlacement, true);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", updatePlacement);
      document.removeEventListener("scroll", updatePlacement, true);
    };
  }, [menuOpenId]);

  const startCreating = () => {
    setIsCreating(true);
    setCreateLookOpen(false);
    setNewIcon(DEFAULT_BOARD_ICON);
    setNewColor(nextBoardColor(categories.length));
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    const slug = slugify(newName.trim());
    const position = categories.length;

    const base = {
      user_id: user.id,
      name: newName.trim(),
      slug,
      position,
      icon: newIcon,
    };

    let { data, error } = await (supabase as any)
      .from("categories")
      .insert({ ...base, color: newColor })
      .select()
      .single();

    // Older DBs may not have categories.color yet, retry without it.
    if (error && /color|schema cache|column/i.test(error.message ?? "")) {
      ({ data, error } = await (supabase as any)
        .from("categories")
        .insert(base)
        .select()
        .single());
    }

    if (error) {
      const msg = String(error.message ?? "");
      if (/duplicate|unique/i.test(msg)) {
        toast.error("A board with that name already exists");
      } else if (/color/i.test(msg)) {
        toast.error("Run sql/add_category_color.sql in Supabase, then try again");
      } else {
        toast.error(msg || "Failed to create board");
      }
      return;
    }

    onCategoryCreated(data as Category);
    setNewName("");
    setIsCreating(false);
    setCreateLookOpen(false);
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

  const openAppearanceEditor = (cat: Category) => {
    const look = appearanceFromCategory(cat);
    setEditIcon(look.icon);
    setEditColor(look.color);
    setAppearanceCat(cat);
    setMenuOpenId(null);
  };

  const handleAppearanceSave = async (icon: BoardIconId, color: BoardColorId) => {
    if (!appearanceCat) return;

    setAppearanceSaving(true);
    let { data, error } = await (supabase as any)
      .from("categories")
      .update({ icon, color })
      .eq("id", appearanceCat.id)
      .select()
      .single();

    if (error && /color|schema cache|column/i.test(error.message ?? "")) {
      ({ data, error } = await (supabase as any)
        .from("categories")
        .update({ icon })
        .eq("id", appearanceCat.id)
        .select()
        .single());
      if (!error) {
        toast.message("Icon saved. Run sql/add_category_color.sql to enable colors.");
      }
    }

    setAppearanceSaving(false);

    if (error) {
      toast.error(error.message || "Failed to update board look");
      return;
    }

    onCategoryUpdated(data as Category);
    setAppearanceCat(null);
    toast.success("Board look updated");
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
      <Link
        href="/dashboard/boards"
        className="px-5 py-5 transition-opacity hover:opacity-90"
        onClick={() => onClose()}
      >
        <StickifyLogo size="md" />
      </Link>

      <div className="flex items-center justify-between px-5 py-2">
        <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">
          Boards
        </span>
        <button
          onClick={startCreating}
          className="flex h-6 w-6 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-4">
        {categories.length === 0 && !isCreating && (
          <div className="mt-8 text-center">
            <FolderOpen className="mx-auto mb-3 h-10 w-10 text-zinc-700" />
            <p className="text-sm text-zinc-500">No boards yet</p>
            <button
              onClick={startCreating}
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
                <Link
                  href={`/dashboard/${cat.slug}`}
                  onClick={() => onClose()}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-sm transition-all",
                    isActive
                      ? "bg-violet-500/10 font-medium text-violet-300"
                      : "text-sidebar-foreground hover:bg-zinc-800/50 hover:text-white"
                  )}
                >
                  <BoardIcon icon={cat.icon} color={cat.color} />
                  <span className="truncate" title={cat.name}>
                    {cat.name}
                  </span>
                  {getBoardVisibility(cat) === "public" && (
                    <Globe
                      className="h-3 w-3 shrink-0 text-emerald-500/80"
                      aria-label="Public"
                    />
                  )}

                  <button
                    type="button"
                    ref={(el) => {
                      if (el) menuButtonRefs.current.set(cat.id, el);
                      else menuButtonRefs.current.delete(cat.id);
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setMenuOpenId(menuOpenId === cat.id ? null : cat.id);
                    }}
                    className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-md opacity-0 transition-opacity group-hover:opacity-100 hover:bg-zinc-700"
                    aria-label={`Board options for ${cat.name}`}
                    aria-expanded={menuOpenId === cat.id}
                    aria-haspopup="menu"
                  >
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </button>
                </Link>
              )}

              {menuOpenId === cat.id &&
                !isEditing &&
                typeof document !== "undefined" &&
                createPortal(
                  <>
                    <div
                      className="fixed inset-0 z-[60]"
                      onClick={() => setMenuOpenId(null)}
                      aria-hidden
                    />
                    <div
                      ref={menuPanelRef}
                      role="menu"
                      style={
                        menuPlacement
                          ? {
                              position: "fixed",
                              top: menuPlacement.top,
                              left: menuPlacement.left,
                              zIndex: 70,
                            }
                          : {
                              position: "fixed",
                              top: 0,
                              left: 0,
                              zIndex: 70,
                              visibility: "hidden",
                              pointerEvents: "none",
                            }
                      }
                      className="min-w-[10.5rem] overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 py-1 shadow-xl ring-1 ring-black/20"
                    >
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setEditingId(cat.id);
                          setEditName(cat.name);
                          setMenuOpenId(null);
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-zinc-300 hover:bg-zinc-800"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Rename
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => openAppearanceEditor(cat)}
                        className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-zinc-300 hover:bg-zinc-800"
                      >
                        <Palette className="h-3.5 w-3.5" />
                        Icon & color
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => handleDelete(cat)}
                        className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-red-400 hover:bg-zinc-800"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </div>
                  </>,
                  document.body
                )}
            </div>
          );
        })}

        {isCreating && (
          <div className="mt-1 flex items-center gap-2 rounded-xl p-1">
            <button
              type="button"
              onClick={() => setCreateLookOpen(true)}
              className="shrink-0 rounded-lg ring-offset-2 ring-offset-sidebar transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
              aria-label="Choose board icon and color"
              title="Choose icon and color"
            >
              <BoardIcon icon={newIcon} color={newColor} />
            </button>
            <input
              ref={inputRef}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreate();
                if (e.key === "Escape") {
                  setIsCreating(false);
                  setNewName("");
                  setCreateLookOpen(false);
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
                setCreateLookOpen(false);
              }}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-zinc-500 hover:bg-zinc-800"
              aria-label="Cancel"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      <div className="shrink-0 px-3 pb-3">
        <Link
          href="/dashboard/archived"
          onClick={() => onClose()}
          className={cn(
            "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
            pathname === "/dashboard/archived"
              ? "bg-violet-500/10 text-violet-300"
              : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
          )}
        >
          <Archive className="h-4 w-4 shrink-0" />
          Archived
        </Link>
      </div>

      <div className="shrink-0 border-t border-sidebar-border px-5 py-4">
        <p className="text-center text-[11px] text-zinc-600">
          <StickifyWordmark className="text-[11px] text-zinc-600" />{" "}
          <CreatorCredit className="text-zinc-600" />
        </p>
      </div>

      <BoardAppearanceModal
        open={createLookOpen}
        title="Board look"
        initialIcon={newIcon}
        initialColor={newColor}
        onClose={() => setCreateLookOpen(false)}
        onSave={(icon, color) => {
          setNewIcon(icon);
          setNewColor(color);
          setCreateLookOpen(false);
        }}
      />

      <BoardAppearanceModal
        open={!!appearanceCat}
        title="Board look"
        initialIcon={editIcon}
        initialColor={editColor}
        saving={appearanceSaving}
        onClose={() => setAppearanceCat(null)}
        onSave={handleAppearanceSave}
      />
    </div>
  );
}
