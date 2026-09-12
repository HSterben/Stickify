import type { LucideIcon } from "lucide-react";
import {
  Bookmark,
  Briefcase,
  Code2,
  FileText,
  Folder,
  GraduationCap,
  Heart,
  Home,
  LayoutGrid,
  Lightbulb,
  Link2,
  Music,
  Palette,
  Rocket,
  Star,
  Target,
  UtensilsCrossed,
} from "lucide-react";

export type BoardColorId =
  | "violet"
  | "blue"
  | "pink"
  | "emerald"
  | "orange"
  | "amber"
  | "sky"
  | "indigo";

export type BoardIconId =
  | "layout-grid"
  | "folder"
  | "lightbulb"
  | "bookmark"
  | "target"
  | "graduation-cap"
  | "utensils"
  | "code"
  | "file-text"
  | "link"
  | "heart"
  | "star"
  | "briefcase"
  | "home"
  | "rocket"
  | "palette"
  | "music";

export type BoardColor = {
  id: BoardColorId;
  name: string;
  /** Icon glyph class */
  fg: string;
  /** Soft square behind the icon */
  bg: string;
  /** Hex used for picker swatches */
  swatch: string;
};

export type BoardIconOption = {
  id: BoardIconId;
  name: string;
  Icon: LucideIcon;
};

export const BOARD_COLORS: BoardColor[] = [
  {
    id: "violet",
    name: "Violet",
    fg: "text-violet-400",
    bg: "bg-violet-500/15",
    swatch: "#8b5cf6",
  },
  {
    id: "blue",
    name: "Blue",
    fg: "text-blue-400",
    bg: "bg-blue-500/15",
    swatch: "#3b82f6",
  },
  {
    id: "pink",
    name: "Pink",
    fg: "text-pink-400",
    bg: "bg-pink-500/15",
    swatch: "#ec4899",
  },
  {
    id: "emerald",
    name: "Emerald",
    fg: "text-emerald-400",
    bg: "bg-emerald-500/15",
    swatch: "#10b981",
  },
  {
    id: "orange",
    name: "Orange",
    fg: "text-orange-400",
    bg: "bg-orange-500/15",
    swatch: "#f97316",
  },
  {
    id: "amber",
    name: "Amber",
    fg: "text-amber-400",
    bg: "bg-amber-500/15",
    swatch: "#f59e0b",
  },
  {
    id: "sky",
    name: "Sky",
    fg: "text-sky-400",
    bg: "bg-sky-500/15",
    swatch: "#0ea5e9",
  },
  {
    id: "indigo",
    name: "Indigo",
    fg: "text-indigo-400",
    bg: "bg-indigo-500/15",
    swatch: "#6366f1",
  },
];

export const BOARD_ICONS: BoardIconOption[] = [
  { id: "layout-grid", name: "Grid", Icon: LayoutGrid },
  { id: "folder", name: "Folder", Icon: Folder },
  { id: "lightbulb", name: "Ideas", Icon: Lightbulb },
  { id: "bookmark", name: "Bookmark", Icon: Bookmark },
  { id: "target", name: "Goals", Icon: Target },
  { id: "graduation-cap", name: "Study", Icon: GraduationCap },
  { id: "utensils", name: "Food", Icon: UtensilsCrossed },
  { id: "code", name: "Code", Icon: Code2 },
  { id: "file-text", name: "Notes", Icon: FileText },
  { id: "link", name: "Links", Icon: Link2 },
  { id: "heart", name: "Favorites", Icon: Heart },
  { id: "star", name: "Star", Icon: Star },
  { id: "briefcase", name: "Work", Icon: Briefcase },
  { id: "home", name: "Home", Icon: Home },
  { id: "rocket", name: "Launch", Icon: Rocket },
  { id: "palette", name: "Design", Icon: Palette },
  { id: "music", name: "Music", Icon: Music },
];

export const DEFAULT_BOARD_ICON: BoardIconId = "layout-grid";
export const DEFAULT_BOARD_COLOR: BoardColorId = "violet";

const ICON_MAP = Object.fromEntries(
  BOARD_ICONS.map((item) => [item.id, item])
) as Record<BoardIconId, BoardIconOption>;

const COLOR_MAP = Object.fromEntries(
  BOARD_COLORS.map((item) => [item.id, item])
) as Record<BoardColorId, BoardColor>;

export function isBoardIconId(value: string | null | undefined): value is BoardIconId {
  return !!value && value in ICON_MAP;
}

export function isBoardColorId(value: string | null | undefined): value is BoardColorId {
  return !!value && value in COLOR_MAP;
}

export function resolveBoardIcon(icon: string | null | undefined): BoardIconOption {
  if (isBoardIconId(icon)) return ICON_MAP[icon];
  return ICON_MAP[DEFAULT_BOARD_ICON];
}

export function resolveBoardColor(color: string | null | undefined): BoardColor {
  if (isBoardColorId(color)) return COLOR_MAP[color];
  return COLOR_MAP[DEFAULT_BOARD_COLOR];
}

/** Cycle a default color when creating boards so they don't all look the same. */
export function nextBoardColor(index: number): BoardColorId {
  return BOARD_COLORS[index % BOARD_COLORS.length].id;
}
