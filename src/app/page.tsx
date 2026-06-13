"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Layers,
  Code2,
  FileText,
  Sparkles,
  ArrowRight,
  Shield,
  Globe,
} from "lucide-react";
import { StickifyGrainient } from "@/components/ui/stickify-grainient";
import { CreatorCredit } from "@/components/ui/creator-credit";
import { FeaturesScrollSection } from "@/components/landing/features-scroll-section";
import { blurRevealStagger, scrollViewport } from "@/lib/motion";

export default function LandingPage() {
  return (
    <div className="page-marketing relative flex min-h-screen flex-col overflow-x-hidden">
      <StickifyGrainient className="pointer-events-none fixed inset-0 z-0" />

      <nav className="relative z-10 mx-auto flex w-full max-w-6xl shrink-0 items-center justify-between px-6 py-5 md:px-12">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="btn-brand flex h-9 w-9 items-center justify-center rounded-xl">
            <Layers className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">Stickify</span>
        </Link>
        <Link
          href="/login"
          className="btn-ghost group flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-white/90 transition-all"
        >
          Sign in
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </nav>

      <main className="relative z-10 flex flex-1 flex-col">
        <section className="mx-auto max-w-5xl px-6 pt-20 pb-32 text-center md:pt-32 md:pb-40">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.14 } },
            }}
          >
            <motion.div variants={blurRevealStagger(0)} className="mb-8 flex flex-col items-center gap-3">
              <span className="h-px w-12 bg-gradient-to-r from-transparent via-violet-400/50 to-transparent" />
              <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-zinc-500">
                Notes · Code · Links
              </p>
            </motion.div>

            <motion.h1
              variants={blurRevealStagger(0.08)}
              className="mx-auto max-w-4xl text-5xl leading-[1.1] font-extrabold tracking-tight md:text-7xl"
            >
              Digital sticky notes.{" "}
              <span className="gradient-text">On boards.</span>
            </motion.h1>

            <motion.p
              variants={blurRevealStagger(0.16)}
              className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-zinc-300/90 md:text-xl"
            >
              Save things so you can find them later. No mess. No digging through
              random tabs.
            </motion.p>

            <motion.div
              variants={blurRevealStagger(0.24)}
              className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
            >
              <Link
                href="/login"
                className="btn-brand group inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-semibold text-white transition-all hover:brightness-110"
              >
                Start free
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <a
                href="#features"
                className="btn-ghost inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-medium text-zinc-300 transition-colors hover:text-white"
              >
                See what it does
              </a>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 56, filter: "blur(16px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ delay: 0.55, duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            className="relative mx-auto mt-20 max-w-4xl"
          >
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-brand/30 via-brand-light/20 to-brand/10 blur-2xl" />
            <div className="glass-strong relative overflow-hidden rounded-2xl p-1">
              <div className="rounded-xl bg-surface p-6">
                <div className="flex gap-4">
                  <div className="hidden w-40 shrink-0 rounded-lg bg-background/50 p-3 md:block">
                    <div className="mb-3 h-2 w-16 rounded bg-zinc-700/80" />
                    {["Frontend", "Backend", "Design", "Ideas"].map((cat, i) => (
                      <div
                        key={cat}
                        className={`mb-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium ${
                          i === 0
                            ? "bg-violet-500/10 text-violet-300"
                            : "text-zinc-500"
                        }`}
                      >
                        {cat}
                      </div>
                    ))}
                  </div>
                  <div className="flex-1">
                    <div className="mb-4 flex items-center gap-2">
                      <div className="h-2 w-24 rounded bg-zinc-700" />
                      <div className="ml-auto h-6 w-6 rounded-md bg-zinc-800" />
                    </div>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5">
                      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
                        <div className="mb-2 flex items-center gap-1.5">
                          <FileText className="h-3 w-3 text-rose-400/80" />
                          <div className="h-1.5 w-14 rounded bg-zinc-700" />
                        </div>
                        <div className="space-y-1">
                          <div className="h-1 w-full rounded bg-zinc-700/50" />
                          <div className="h-1 w-3/4 rounded bg-zinc-700/50" />
                          <div className="h-1 w-1/2 rounded bg-zinc-700/50" />
                        </div>
                      </div>
                      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
                        <div className="mb-2 flex items-center gap-1.5">
                          <Code2 className="h-3 w-3 text-emerald-400/80" />
                          <div className="h-1.5 w-16 rounded bg-zinc-700" />
                        </div>
                        <div className="space-y-1 font-mono">
                          <div className="h-1 w-full rounded bg-zinc-700/50" />
                          <div className="h-1 w-4/5 rounded bg-zinc-700/50" />
                          <div className="h-1 w-3/5 rounded bg-zinc-700/50" />
                          <div className="h-1 w-full rounded bg-zinc-700/50" />
                        </div>
                      </div>
                      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
                        <div className="mb-2 h-12 w-full rounded bg-zinc-800/80" />
                        <div className="flex items-center gap-1.5">
                          <Globe className="h-3 w-3 text-sky-400/80" />
                          <div className="h-1.5 w-16 rounded bg-zinc-700" />
                        </div>
                        <div className="mt-1 h-1 w-full rounded bg-zinc-700/50" />
                      </div>
                      <div className="hidden rounded-lg border border-zinc-800 bg-zinc-900/50 p-3 sm:block">
                        <div className="mb-2 flex items-center gap-1.5">
                          <FileText className="h-3 w-3 text-violet-400/80" />
                          <div className="h-1.5 w-12 rounded bg-zinc-700" />
                        </div>
                        <div className="space-y-1">
                          <div className="h-1 w-full rounded bg-zinc-700/50" />
                          <div className="h-1 w-2/3 rounded bg-zinc-700/50" />
                        </div>
                      </div>
                      <div className="hidden rounded-lg border border-zinc-800 bg-zinc-900/50 p-3 sm:block">
                        <div className="mb-2 flex items-center gap-1.5">
                          <Code2 className="h-3 w-3 text-amber-400/80" />
                          <div className="h-1.5 w-14 rounded bg-zinc-700" />
                        </div>
                        <div className="space-y-1">
                          <div className="h-1 w-full rounded bg-zinc-700/50" />
                          <div className="h-1 w-3/4 rounded bg-zinc-700/50" />
                          <div className="h-1 w-1/2 rounded bg-zinc-700/50" />
                        </div>
                      </div>
                      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
                        <div className="flex h-full items-center justify-center">
                          <div className="text-xs text-zinc-500">+ Add post</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        <FeaturesScrollSection />

        <section className="mx-auto mt-16 max-w-4xl px-6 pb-32 md:mt-24">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={scrollViewport}
            variants={{
              hidden: { opacity: 0, y: 40, filter: "blur(14px)" },
              visible: {
                opacity: 1,
                y: 0,
                filter: "blur(0px)",
                transition: { duration: 0.95, ease: [0.16, 1, 0.3, 1] },
              },
            }}
            className="glass-on-gradient relative overflow-hidden rounded-3xl border-zinc-800/80 p-8 md:p-12"
          >
            <div className="absolute top-0 right-0 h-48 w-48 rounded-full bg-violet-950/40 blur-[80px]" />
            <div className="relative border-l-2 border-violet-500/40 pl-6 md:pl-8">
              <div className="mb-3 flex items-center gap-2 text-violet-400/80">
                <Sparkles className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-[0.2em]">
                  AI
                </span>
              </div>
              <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
                It can suggest tags.
                <br />
                You still pick.
              </h2>
              <p className="mb-8 max-w-lg text-zinc-400">
                When you add a post, AI can guess tags or whether it&apos;s
                text, code, or a link. You can ignore it.
              </p>
              <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
                {[
                  "Suggests tags",
                  "Guesses if it's code or text",
                  "Picks a board for you",
                  "Finds similar posts",
                ].map((item, i) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
                    whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 + i * 0.08, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-3 text-sm text-zinc-300"
                  >
                    <Sparkles className="h-3.5 w-3.5 shrink-0 text-violet-400/70" />
                    {item}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </section>

        <section className="mx-auto mt-16 max-w-4xl px-6 pb-32 text-center md:mt-24">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={scrollViewport}
            variants={{
              hidden: { opacity: 0, y: 40, filter: "blur(14px)" },
              visible: {
                opacity: 1,
                y: 0,
                filter: "blur(0px)",
                transition: { duration: 0.95, ease: [0.16, 1, 0.3, 1] },
              },
            }}
          >
            <div className="mb-4 inline-flex items-center gap-2 text-sm text-zinc-500">
              <Shield className="h-4 w-4 text-violet-400/70" />
              Private by default. Share a board only if you want to.
            </div>
            <h2 className="mb-6 text-3xl font-bold tracking-tight md:text-4xl">
              Stop losing stuff.
            </h2>
            <Link
              href="/login"
              className="btn-brand group inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-semibold text-white transition-all hover:brightness-110"
            >
              Start free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </motion.div>
        </section>

        <motion.footer
          initial={{ opacity: 0, y: 72 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35, margin: "0px 0px -40px 0px" }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="glass-on-gradient mt-auto w-screen border-t border-zinc-800/60 px-6 py-10 text-center text-xs text-zinc-400"
        >
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-2 gap-y-1">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4" />
              <span>Stickify</span>
            </div>
            <CreatorCredit />
          </div>
          <p className="mt-4">
            <Link href="/privacy" className="text-zinc-500 transition-colors hover:text-zinc-300">
              Privacy Policy
            </Link>
          </p>
        </motion.footer>
      </main>
    </div>
  );
}
