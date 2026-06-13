"use client";

import { motion } from "framer-motion";
import { Layers, Plus } from "lucide-react";

export function WelcomeView() {
  return (
    <div className="flex h-full items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/10">
          <Layers className="h-9 w-9 text-violet-400" />
        </div>
        <h2 className="mb-2 text-2xl font-bold">No boards yet</h2>
        <p className="mb-6 max-w-sm text-zinc-400">
          Hit the + next to Boards in the sidebar to make your first one.
        </p>
        <div className="inline-flex items-center gap-2 rounded-full bg-violet-500/10 px-4 py-2 text-sm text-violet-300">
          <Plus className="h-4 w-4" />
          + in the sidebar
        </div>
      </motion.div>
    </div>
  );
}
