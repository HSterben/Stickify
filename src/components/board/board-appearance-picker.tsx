"use client";

import { cn } from "@/lib/utils";
import {
  BOARD_COLORS,
  BOARD_ICONS,
  type BoardColorId,
  type BoardIconId,
} from "@/lib/board-appearance";
import { BoardIcon } from "./board-icon";

type BoardAppearancePickerProps = {
  icon: BoardIconId;
  color: BoardColorId;
  onIconChange: (icon: BoardIconId) => void;
  onColorChange: (color: BoardColorId) => void;
  className?: string;
  /** When true, skip the outer card chrome (used inside a modal). */
  embedded?: boolean;
};

export function BoardAppearancePicker({
  icon,
  color,
  onIconChange,
  onColorChange,
  className,
  embedded = false,
}: BoardAppearancePickerProps) {
  return (
    <div
      className={cn(
        "space-y-5",
        !embedded && "rounded-xl border border-zinc-800 bg-zinc-950/80 p-3",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <BoardIcon icon={icon} color={color} size="lg" />
        <div className="min-w-0">
          <p className="text-sm font-medium text-zinc-200">Preview</p>
          <p className="text-xs text-zinc-500">How this board will look in the sidebar</p>
        </div>
      </div>

      <div>
        <p className="mb-2.5 text-[10px] font-medium uppercase tracking-wider text-zinc-500">
          Color
        </p>
        <div className="flex flex-wrap gap-2.5">
          {BOARD_COLORS.map((option) => (
            <button
              key={option.id}
              type="button"
              title={option.name}
              onClick={() => onColorChange(option.id)}
              className={cn(
                "h-8 w-8 rounded-full border-2 transition-transform",
                color === option.id
                  ? "scale-110 border-white"
                  : "border-transparent hover:scale-105"
              )}
              style={{ backgroundColor: option.swatch }}
            />
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2.5 text-[10px] font-medium uppercase tracking-wider text-zinc-500">
          Icon
        </p>
        <div className="grid grid-cols-6 gap-2 sm:grid-cols-8">
          {BOARD_ICONS.map((option) => {
            const selected = icon === option.id;
            return (
              <button
                key={option.id}
                type="button"
                title={option.name}
                onClick={() => onIconChange(option.id)}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl transition-colors",
                  selected
                    ? "bg-zinc-800 ring-1 ring-violet-500/50"
                    : "hover:bg-zinc-800/70"
                )}
              >
                <option.Icon
                  className={cn(
                    "h-4 w-4",
                    selected ? "text-zinc-100" : "text-zinc-500"
                  )}
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
