"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Sparkles, ArrowRight, Shield } from "lucide-react";
import { StickifyLogo } from "@/components/brand/stickify-logo";
import { LandingBackground } from "@/components/landing/landing-background";
import { HeroProductShot } from "@/components/landing/hero-product-shot";
import { FeaturesLineSection } from "@/components/landing/features-line-section";
import { CreatorCredit } from "@/components/ui/creator-credit";
import { blurRevealStagger, lightRevealStagger, scrollViewport } from "@/lib/motion";

export default function LandingPage() {
  const [useRichMotion, setUseRichMotion] = useState(false);

  useEffect(() => {
    setUseRichMotion(window.matchMedia("(min-width: 768px)").matches);
  }, []);

  const reveal = useRichMotion ? blurRevealStagger : lightRevealStagger;
  return (
    <div className="page-marketing relative overflow-x-clip">
      <LandingBackground />

      <nav className="relative z-10 mx-auto flex w-full max-w-6xl shrink-0 items-center justify-between px-6 py-5 md:px-12">
        <Link href="/" className="transition-opacity hover:opacity-90">
          <StickifyLogo size="lg" wordmarkClassName="text-white" priority />
        </Link>
        <Link
          href="/login"
          className="btn-ghost group flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-white/90 transition-all"
        >
          Sign in
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </nav>

      <main className="relative z-10">
        <section className="mx-auto max-w-6xl px-4 pt-20 pb-16 text-center sm:px-6 md:pt-28 md:pb-20">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.14 } },
            }}
          >
            <motion.div variants={reveal(0)} className="mb-8 flex flex-col items-center gap-3">
              <span className="h-px w-12 bg-gradient-to-r from-transparent via-violet-400/50 to-transparent" />
              <p className="text-sm font-medium tracking-wide text-zinc-300 md:text-base">
                Notes app, but better.
              </p>
            </motion.div>

            <motion.h1
              variants={reveal(0.08)}
              className="mx-auto max-w-4xl text-5xl leading-[1.1] font-extrabold tracking-tight md:text-7xl"
            >
              Digital Sticky Notes
            </motion.h1>

            <motion.p
              variants={reveal(0.16)}
              className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-zinc-300/90 md:text-xl"
            >
              Keep what you save in one place so you can find it later. No pile of
              stray tabs to dig through.
            </motion.p>

            <motion.div
              variants={reveal(0.24)}
              className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
            >
              <Link
                href="/login"
                className="btn-brand group inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-semibold text-white transition-all hover:brightness-110"
              >
                Create a free account
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <a
                href="#features"
                className="btn-ghost inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-medium text-zinc-300 transition-colors hover:text-white"
              >
                Browse features
              </a>
            </motion.div>
          </motion.div>

          <HeroProductShot />
        </section>

        <FeaturesLineSection />

        <section className="mx-auto mt-16 max-w-4xl px-6 pb-32 md:mt-24">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={scrollViewport}
            variants={{
              hidden: { opacity: 0, y: 40 },
              visible: {
                opacity: 1,
                y: 0,
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
                AI can rewrite for you.
                <br />
                You still decide.
              </h2>
              <p className="mb-8 max-w-lg text-zinc-400">
                Improve with AI can tighten or rephrase a draft while you edit.
                Keep what you like and skip it anytime.
              </p>
              <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
                {[
                  "Rewrites your draft",
                  "Cleans up structure",
                  "Keeps the same meaning",
                  "Optional, use when you want",
                ].map((item, i) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
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
              hidden: { opacity: 0, y: 40 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.95, ease: [0.16, 1, 0.3, 1] },
              },
            }}
          >
            <div className="mb-4 inline-flex items-center gap-2 text-sm text-zinc-500">
              <Shield className="h-4 w-4 text-violet-400/70" />
              Boards stay private until you share one.
            </div>
            <h2 className="mb-6 text-3xl font-bold tracking-tight md:text-4xl">
              Put your saves in one place.
            </h2>
            <Link
              href="/login"
              className="btn-brand group inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-semibold text-white transition-all hover:brightness-110"
            >
              Create a free account
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </motion.div>
        </section>

        <footer className="glass-on-gradient relative z-10 w-full border-t border-zinc-800/60 px-6 py-10 text-center text-xs text-zinc-400">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-2 gap-y-1">
            <StickifyLogo size="xs" wordmarkClassName="text-xs text-zinc-400" />
            <CreatorCredit />
          </div>
          <p className="mt-4">
            <Link href="/privacy" className="text-zinc-500 transition-colors hover:text-zinc-300">
              Privacy Policy
            </Link>
          </p>
        </footer>
      </main>
    </div>
  );
}
