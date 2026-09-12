"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

export function HeroProductShot() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 48 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.45, duration: 1.05, ease: [0.16, 1, 0.3, 1] }}
      className="relative mx-auto mt-14 w-full max-w-3xl md:mt-20"
    >
      <div
        className="pointer-events-none absolute -inset-x-8 -inset-y-10 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(133,78,254,0.28),transparent_65%)] blur-2xl md:-inset-x-16"
        aria-hidden
      />

      <motion.div
        animate={
          reduceMotion
            ? undefined
            : { y: [0, -8, 0] }
        }
        transition={
          reduceMotion
            ? undefined
            : { duration: 7, repeat: Infinity, ease: "easeInOut" }
        }
        className="relative"
      >
        <div className="relative overflow-hidden rounded-xl border border-white/10 bg-zinc-950/40 shadow-[0_30px_80px_-28px_rgba(0,0,0,0.85)] ring-1 ring-violet-500/15 sm:rounded-2xl">
          <Image
            src="/app-ss-1.png"
            alt="Stickify board view with sidebar and post cards"
            width={2487}
            height={1231}
            priority
            sizes="(max-width: 768px) 92vw, (max-width: 1024px) 70vw, 768px"
            className="h-auto w-full object-cover object-top"
          />
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#141414] via-[#141414]/70 to-transparent sm:h-28"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-violet-950/10 via-transparent to-transparent"
            aria-hidden
          />
        </div>
      </motion.div>
    </motion.div>
  );
}
