"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type SortDropdownOption<T extends string> = {
  value: T;
  label: string;
};

interface SortDropdownProps<T extends string> {
  value: T;
  options: SortDropdownOption<T>[];
  onChange: (value: T) => void;
  className?: string;
}

export function SortDropdown<T extends string>({
  value,
  options,
  onChange,
  className,
}: SortDropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState<{
    top: number;
    left: number;
    minWidth: number;
  } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const selected = options.find((option) => option.value === value);

  useLayoutEffect(() => {
    if (!open || !rootRef.current) {
      setPlacement(null);
      return;
    }

    const updatePlacement = () => {
      if (!rootRef.current) return;
      const rect = rootRef.current.getBoundingClientRect();
      setPlacement({
        top: rect.bottom + 6,
        left: rect.left,
        minWidth: rect.width,
      });
    };

    updatePlacement();
    window.addEventListener("resize", updatePlacement);
    window.addEventListener("scroll", updatePlacement, true);

    return () => {
      window.removeEventListener("resize", updatePlacement);
      window.removeEventListener("scroll", updatePlacement, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        !rootRef.current?.contains(target) &&
        !menuRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-800/50 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:border-zinc-700 hover:bg-zinc-800 hover:text-white"
      >
        <span>{selected?.label ?? "Sort"}</span>
        <ChevronDown
          className={cn("h-3.5 w-3.5 text-zinc-500 transition-transform", open && "rotate-180")}
        />
      </button>

      {open &&
        placement &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={menuRef}
            style={{
              position: "fixed",
              top: placement.top,
              left: placement.left,
              minWidth: placement.minWidth,
              zIndex: 30,
            }}
            className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 py-1 shadow-xl ring-1 ring-black/20"
          >
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-xs transition-colors hover:bg-zinc-800",
                  value === option.value ? "text-violet-300" : "text-zinc-300"
                )}
              >
                <span>{option.label}</span>
                {value === option.value && (
                  <Check className="h-3.5 w-3.5 shrink-0" />
                )}
              </button>
            ))}
          </div>,
          document.body
        )}
    </div>
  );
}
