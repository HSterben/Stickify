"use client";

import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { StickifyMark } from "@/components/brand/stickify-logo";

export function WelcomeView() {
  return (
    <div className="flex h-full items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <div className="mx-auto mb-6 flex justify-center">
          <StickifyMark size="xl" />
        </div>
        <h2 className="mb-2 text-2xl font-bold">No boards yet</h2>
        <p className="mb-6 max-w-sm text-zinc-400">
          Use the + next to Boards in the sidebar to create your first board.
        </p>
        <div className="inline-flex items-center gap-2 rounded-full bg-violet-500/10 px-4 py-2 text-sm text-violet-300">
          <Plus className="h-4 w-4" />
          + in the sidebar
        </div>
      </motion.div>
    </div>
  );
}
