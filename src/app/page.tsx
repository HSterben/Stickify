"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Layers,
  Code2,
  Link2,
  FileText,
  Sparkles,
  Search,
  Tags,
  ArrowRight,
  Zap,
  Shield,
  Globe,
} from "lucide-react";
import { StickifyGrainient } from "@/components/ui/stickify-grainient";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const features = [
  {
    icon: FileText,
    title: "Text Notes",
    description: "Capture thoughts, ideas, and snippets with rich formatting and color accents.",
    gradient: "from-rose-500/20 to-pink-500/20",
    iconColor: "text-rose-400",
  },
  {
    icon: Code2,
    title: "Code Snippets",
    description: "Save code with syntax highlighting, language detection, and one-click copy.",
    gradient: "from-emerald-500/20 to-teal-500/20",
    iconColor: "text-emerald-400",
  },
  {
    icon: Link2,
    title: "Website Cards",
    description: "Paste a URL and get a beautiful preview card with title, image, and favicon.",
    gradient: "from-sky-500/20 to-blue-500/20",
    iconColor: "text-sky-400",
  },
  {
    icon: Layers,
    title: "Category Boards",
    description: "Organize everything into visual boards with smooth swipe transitions.",
    gradient: "from-brand/25 to-brand-light/20",
    iconColor: "text-brand-light",
  },
  {
    icon: Tags,
    title: "Smart Tags",
    description: "Tag posts for instant filtering. AI can suggest tags based on your content.",
    gradient: "from-amber-500/20 to-orange-500/20",
    iconColor: "text-amber-400",
  },
  {
    icon: Search,
    title: "Instant Search",
    description: "Find anything across all boards with global search and type filters.",
    gradient: "from-indigo-500/20 to-blue-500/20",
    iconColor: "text-indigo-400",
  },
];

export default function LandingPage() {
  return (
    <div className="page-marketing relative flex min-h-screen flex-col overflow-hidden">
      <StickifyGrainient className="pointer-events-none fixed inset-0 z-0" />

      {/* Nav */}
      <nav className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-5 md:px-12">
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

      {/* Hero */}
      <main className="relative z-10 flex flex-1 flex-col">
        <section className="mx-auto max-w-5xl px-6 pt-20 pb-32 text-center md:pt-32 md:pb-40">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.1 } },
            }}
          >
            <motion.div variants={fadeUp} custom={0} className="mb-6">
              <span className="badge-brand inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium">
                <Zap className="h-3.5 w-3.5 text-brand-light" />
                Your personal knowledge board
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              custom={1}
              className="mx-auto max-w-4xl text-5xl leading-[1.1] font-extrabold tracking-tight md:text-7xl"
            >
              Save everything.{" "}
              <span className="gradient-text">Find it instantly.</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              custom={2}
              className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-zinc-300/90 md:text-xl"
            >
              Notes, code snippets, and bookmarks, organized into visual boards
              that feel like your second brain. Not another messy note app.
            </motion.p>

            <motion.div
              variants={fadeUp}
              custom={3}
              className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
            >
              <Link
                href="/login"
                className="btn-brand group inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-semibold text-white transition-all hover:brightness-110"
              >
                Get Started, Free
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <a
                href="#features"
                className="btn-ghost inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-medium text-zinc-300 transition-colors hover:text-white"
              >
                See how it works
              </a>
            </motion.div>
          </motion.div>

          {/* Hero visual - abstract board preview */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="relative mx-auto mt-20 max-w-4xl"
          >
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-brand/30 via-brand-light/20 to-brand/10 blur-2xl" />
            <div className="glass-strong relative overflow-hidden rounded-2xl p-1">
              <div className="rounded-xl bg-surface p-6">
                {/* Mock dashboard */}
                <div className="flex gap-4">
                  {/* Mini sidebar */}
                  <div className="hidden w-40 shrink-0 rounded-lg bg-background/50 p-3 md:block">
                    <div className="mb-3 h-2 w-16 rounded bg-brand/30" />
                    {["Frontend", "Backend", "Design", "Ideas"].map((cat, i) => (
                      <div
                        key={cat}
                        className={`mb-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium ${
                          i === 0
                            ? "bg-brand/20 text-brand-light"
                            : "text-zinc-500"
                        }`}
                      >
                        {cat}
                      </div>
                    ))}
                  </div>
                  {/* Mini board */}
                  <div className="flex-1">
                    <div className="mb-4 flex items-center gap-2">
                      <div className="h-2 w-24 rounded bg-zinc-700" />
                      <div className="ml-auto h-6 w-6 rounded-md bg-zinc-800" />
                    </div>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5">
                      {/* Text card mock */}
                      <div className="rounded-lg border border-rose-500/10 bg-rose-500/5 p-3">
                        <div className="mb-2 flex items-center gap-1.5">
                          <FileText className="h-3 w-3 text-rose-400" />
                          <div className="h-1.5 w-14 rounded bg-rose-400/30" />
                        </div>
                        <div className="space-y-1">
                          <div className="h-1 w-full rounded bg-zinc-700/50" />
                          <div className="h-1 w-3/4 rounded bg-zinc-700/50" />
                          <div className="h-1 w-1/2 rounded bg-zinc-700/50" />
                        </div>
                      </div>
                      {/* Code card mock */}
                      <div className="rounded-lg border border-emerald-500/10 bg-emerald-500/5 p-3">
                        <div className="mb-2 flex items-center gap-1.5">
                          <Code2 className="h-3 w-3 text-emerald-400" />
                          <div className="h-1.5 w-16 rounded bg-emerald-400/30" />
                        </div>
                        <div className="space-y-1 font-mono">
                          <div className="h-1 w-full rounded bg-zinc-700/50" />
                          <div className="h-1 w-4/5 rounded bg-zinc-700/50" />
                          <div className="h-1 w-3/5 rounded bg-zinc-700/50" />
                          <div className="h-1 w-full rounded bg-zinc-700/50" />
                        </div>
                      </div>
                      {/* Link card mock */}
                      <div className="rounded-lg border border-sky-500/10 bg-sky-500/5 p-3">
                        <div className="mb-2 h-12 w-full rounded bg-sky-500/10" />
                        <div className="flex items-center gap-1.5">
                          <Globe className="h-3 w-3 text-sky-400" />
                          <div className="h-1.5 w-16 rounded bg-sky-400/30" />
                        </div>
                        <div className="mt-1 h-1 w-full rounded bg-zinc-700/50" />
                      </div>
                      {/* More mocks */}
                      <div className="hidden rounded-lg border border-violet-500/10 bg-violet-500/5 p-3 sm:block">
                        <div className="mb-2 flex items-center gap-1.5">
                          <FileText className="h-3 w-3 text-violet-400" />
                          <div className="h-1.5 w-12 rounded bg-violet-400/30" />
                        </div>
                        <div className="space-y-1">
                          <div className="h-1 w-full rounded bg-zinc-700/50" />
                          <div className="h-1 w-2/3 rounded bg-zinc-700/50" />
                        </div>
                      </div>
                      <div className="hidden rounded-lg border border-amber-500/10 bg-amber-500/5 p-3 sm:block">
                        <div className="mb-2 flex items-center gap-1.5">
                          <Code2 className="h-3 w-3 text-amber-400" />
                          <div className="h-1.5 w-14 rounded bg-amber-400/30" />
                        </div>
                        <div className="space-y-1">
                          <div className="h-1 w-full rounded bg-zinc-700/50" />
                          <div className="h-1 w-3/4 rounded bg-zinc-700/50" />
                          <div className="h-1 w-1/2 rounded bg-zinc-700/50" />
                        </div>
                      </div>
                      <div className="rounded-lg border border-zinc-700/50 bg-zinc-800/50 p-3">
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

        {/* Features */}
        <section
          id="features"
          className="section-fade-top relative mx-auto mt-16 max-w-6xl px-6 pt-16 pb-32 md:mt-24"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="mb-16 text-center"
          >
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Everything you need.{" "}
              <span className="text-zinc-400">Nothing you don&apos;t.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-zinc-300/80">
              Three content types, visual boards, tags, and search. Simple enough
              to use daily, powerful enough to replace scattered bookmarks and
              notes.
            </p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 sm:gap-7 lg:grid-cols-3 lg:gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="glass-on-gradient group relative rounded-2xl p-6 transition-all hover:border-brand-light/25"
              >
                <div
                  className={`mb-4 inline-flex rounded-xl bg-gradient-to-br ${feature.gradient} p-3`}
                >
                  <feature.icon className={`h-5 w-5 ${feature.iconColor}`} />
                </div>
                <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-zinc-300/75">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* AI Section */}
        <section className="mx-auto mt-16 max-w-4xl px-6 pb-32 md:mt-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="glass-on-gradient relative overflow-hidden rounded-3xl border-brand-light/20 p-8 md:p-12"
          >
            <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-brand/20 blur-[80px]" />
            <div className="relative">
              <div className="badge-brand mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium">
                <Sparkles className="h-3.5 w-3.5" />
                AI-Assisted
              </div>
              <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
                Smart suggestions,<br />not autopilot.
              </h2>
              <p className="mb-8 max-w-lg text-zinc-300/80">
                AI that helps you tag, categorize, and discover connections in
                your saved content. It suggests, you decide. No forced
                auto-organization.
              </p>
              <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
                {[
                  "Suggest tags from content",
                  "Detect code vs. plain text",
                  "Recommend the right board",
                  "Find related saved posts",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-xl border border-brand-light/10 bg-white/[0.04] px-4 py-3 text-sm text-zinc-200"
                  >
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand/25">
                      <Sparkles className="h-3 w-3 text-brand-light" />
                    </div>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </section>

        {/* Bottom CTA */}
        <section className="mx-auto mt-16 max-w-4xl px-6 pb-32 text-center md:mt-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-4 inline-flex items-center gap-2 text-sm text-zinc-400">
              <Shield className="h-4 w-4 text-brand-light" />
              Private by default. Your data, your boards.
            </div>
            <h2 className="mb-6 text-3xl font-bold tracking-tight md:text-4xl">
              Stop losing what matters.
            </h2>
            <Link
              href="/login"
              className="btn-brand group inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-semibold text-white transition-all hover:brightness-110"
            >
              Start organizing for free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="glass-on-gradient mx-6 mt-auto rounded-2xl border-t-0 px-6 py-8 text-center text-xs text-zinc-400 md:mx-12">
          <div className="flex items-center justify-center gap-2">
            <Layers className="h-4 w-4" />
            <span>Stickify</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
