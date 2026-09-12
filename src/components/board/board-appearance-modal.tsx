"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { MODAL_BACKDROP, MODAL_MAX_HEIGHT, MODAL_ROOT } from "@/lib/modal-classes";
import {
  type BoardColorId,
  type BoardIconId,
} from "@/lib/board-appearance";
import { BoardAppearancePicker } from "./board-appearance-picker";

type BoardAppearanceModalProps = {
  open: boolean;
  title?: string;
  initialIcon: BoardIconId;
  initialColor: BoardColorId;
  onClose: () => void;
  onSave: (icon: BoardIconId, color: BoardColorId) => void;
  saving?: boolean;
};

export function BoardAppearanceModal({
  open,
  title = "Board look",
  initialIcon,
  initialColor,
  onClose,
  onSave,
  saving = false,
}: BoardAppearanceModalProps) {
  const [icon, setIcon] = useState(initialIcon);
  const [color, setColor] = useState(initialColor);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    setIcon(initialIcon);
    setColor(initialColor);
  }, [open, initialIcon, initialColor]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className={MODAL_ROOT}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className={MODAL_BACKDROP}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="board-appearance-title"
            className={`relative w-full max-w-md overflow-y-auto rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl ${MODAL_MAX_HEIGHT}`}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-800 bg-zinc-900 px-5 py-4">
              <div>
                <h2
                  id="board-appearance-title"
                  className="text-lg font-semibold text-white"
                >
                  {title}
                </h2>
                <p className="mt-0.5 text-xs text-zinc-500">
                  Pick an icon and color
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-800 hover:text-white"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5">
              <BoardAppearancePicker
                icon={icon}
                color={color}
                onIconChange={setIcon}
                onColorChange={setColor}
                embedded
              />
            </div>

            <div className="sticky bottom-0 flex items-center justify-end gap-2 border-t border-zinc-800 bg-zinc-900 px-5 py-4">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="rounded-lg px-4 py-2 text-sm text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => onSave(icon, color)}
                disabled={saving}
                className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-violet-500/20 transition-colors hover:bg-violet-500 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
