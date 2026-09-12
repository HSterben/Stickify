"use client";

import { cn } from "@/lib/utils";
import {
  resolveBoardColor,
  resolveBoardIcon,
} from "@/lib/board-appearance";

type BoardIconProps = {
  icon?: string | null;
  color?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const SIZES = {
  sm: { box: "h-7 w-7 rounded-lg", glyph: "h-3.5 w-3.5" },
  md: { box: "h-8 w-8 rounded-lg", glyph: "h-4 w-4" },
  lg: { box: "h-10 w-10 rounded-xl", glyph: "h-5 w-5" },
} as const;

export function BoardIcon({
  icon,
  color,
  size = "sm",
  className,
}: BoardIconProps) {
  const { Icon } = resolveBoardIcon(icon);
  const tone = resolveBoardColor(color);
  const dims = SIZES[size];

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center",
        dims.box,
        tone.bg,
        className
      )}
      aria-hidden
    >
      <Icon className={cn(dims.glyph, tone.fg)} />
    </span>
  );
}
