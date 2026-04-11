"use client";

import { useEffect, useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  POST_COLORS,
  parseHexColor,
  colorsEqual,
  isPresetAccentColor,
  cn,
} from "@/lib/utils";

const FALLBACK_PICKER = "#64748b";

interface AccentColorPickerProps {
  value: string | null;
  onChange: (color: string | null) => void;
}

function accentSummary(value: string | null): string {
  if (value == null) return "None (default)";
  const p = parseHexColor(value);
  if (!p) return "Custom";
  const preset = POST_COLORS.find(
    (c) => c.value != null && colorsEqual(c.value, p)
  );
  if (preset) return preset.name;
  return p;
}

export function AccentColorPicker({ value, onChange }: AccentColorPickerProps) {
  const [open, setOpen] = useState(false);
  const wheelId = useId();
  const hexId = useId();
  const [hexDraft, setHexDraft] = useState("");

  useEffect(() => {
    setHexDraft(value ? parseHexColor(value) ?? value : "");
  }, [value]);

  const pickerValue = parseHexColor(value ?? "") ?? FALLBACK_PICKER;
  const swatchBg = value ? parseHexColor(value) ?? value : "#27272a";

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-800/90 bg-zinc-950/30">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-zinc-800/40"
        aria-expanded={open}
        aria-controls="accent-color-panel"
        id="accent-color-trigger"
      >
        <div className="min-w-0 flex-1">
          <span className="block text-xs font-medium text-zinc-400">Accent color</span>
          <span className="mt-0.5 block truncate text-[11px] text-zinc-600">
            {accentSummary(value)}
          </span>
        </div>
        <span
          className="h-7 w-7 shrink-0 rounded-full border-2 border-zinc-700/80 shadow-inner"
          style={{ backgroundColor: swatchBg }}
          aria-hidden
        />
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-zinc-500 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div
          id="accent-color-panel"
          role="region"
          aria-labelledby="accent-color-trigger"
          className="space-y-3 border-t border-zinc-800/80 px-3 pb-3 pt-3"
        >
          <div className="flex flex-wrap gap-2">
            {POST_COLORS.map((c) => (
              <button
                key={c.name}
                type="button"
                title={c.name}
                onClick={() => onChange(c.value)}
                className={cn(
                  "h-7 w-7 shrink-0 rounded-full border-2 transition-all",
                  colorsEqual(value, c.value)
                    ? "border-white scale-110"
                    : "border-transparent hover:scale-105"
                )}
                style={{
                  backgroundColor: c.value || "#27272a",
                }}
              />
            ))}
          </div>

          <div className="rounded-lg border border-zinc-800/80 bg-zinc-900/40 p-2.5">
            <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-zinc-500">
              Custom
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <label htmlFor={wheelId} className="text-xs text-zinc-500">
                  Wheel
                </label>
                <input
                  id={wheelId}
                  type="color"
                  value={pickerValue}
                  onChange={(e) => onChange(e.target.value)}
                  className="h-9 w-14 cursor-pointer rounded-md border border-zinc-700 bg-zinc-800 p-0.5 shadow-inner [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded [&::-webkit-color-swatch]:border-0 [&::-moz-color-swatch]:rounded"
                />
              </div>
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <label htmlFor={hexId} className="shrink-0 text-xs text-zinc-500">
                  Hex
                </label>
                <input
                  id={hexId}
                  type="text"
                  value={hexDraft}
                  placeholder="#aabbcc"
                  spellCheck={false}
                  autoCapitalize="off"
                  autoCorrect="off"
                  onChange={(e) => {
                    const next = e.target.value;
                    if (next.trim() === "") {
                      setHexDraft("");
                      onChange(null);
                      return;
                    }
                    setHexDraft(next);
                    const p = parseHexColor(next);
                    if (p) onChange(p);
                  }}
                  onBlur={() => {
                    const t = hexDraft.trim();
                    if (!t) {
                      onChange(null);
                      setHexDraft("");
                      return;
                    }
                    const p = parseHexColor(t);
                    if (p) {
                      onChange(p);
                      setHexDraft(p);
                    } else {
                      setHexDraft(value ? parseHexColor(value) ?? value : "");
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.currentTarget.blur();
                    }
                  }}
                  className="min-w-0 flex-1 rounded-lg border border-zinc-800 bg-zinc-800/50 px-2.5 py-1.5 font-mono text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20"
                />
              </div>
            </div>
            {value != null && !isPresetAccentColor(value) && (
              <p className="mt-2 text-[11px] text-zinc-600">Custom accent (not a preset swatch).</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
