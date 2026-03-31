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
    gradient: "from-violet-500/20 to-purple-500/20",
    iconColor: "text-violet-400",
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
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Abstract background */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute top-0 left-1/4 h-[600px] w-[600px] rounded-full bg-violet-600/[0.07] blur-[120px]" />
        <div className="absolute top-1/3 right-1/4 h-[500px] w-[500px] rounded-full bg-indigo-600/[0.05] blur-[100px]" />
        <div className="absolute bottom-0 left-1/2 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-purple-600/[0.06] blur-[100px]" />
      </div>

      {/* Floating abstract shapes */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <motion.div
          animate={{ y: [-10, 10, -10], rotate: [0, 5, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-[10%] h-20 w-20 rounded-2xl border border-violet-500/10 bg-violet-500/5"
        />
        <motion.div
          animate={{ y: [10, -15, 10], rotate: [0, -3, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-40 right-[15%] h-14 w-14 rounded-full border border-indigo-500/10 bg-indigo-500/5"
        />
        <motion.div
          animate={{ y: [-5, 15, -5], x: [-5, 5, -5] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[60%] left-[8%] h-24 w-24 rounded-3xl border border-purple-500/10 bg-purple-500/5 rotate-12"
        />
        <motion.div
          animate={{ y: [8, -12, 8], rotate: [45, 50, 45] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[30%] right-[8%] h-16 w-16 rounded-xl border border-fuchsia-500/10 bg-fuchsia-500/5 rotate-45"
        />
        <motion.div
          animate={{ y: [-8, 8, -8] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[25%] right-[20%] h-10 w-10 rounded-lg border border-sky-500/10 bg-sky-500/5"
        />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 md:px-12">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/25">
            <Layers className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">Stickify</span>
        </Link>
        <Link
          href="/login"
          className="group flex items-center gap-2 rounded-full bg-white/5 px-5 py-2.5 text-sm font-medium text-white/90 ring-1 ring-white/10 transition-all hover:bg-white/10 hover:ring-white/20"
        >
          Sign in
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </nav>

      {/* Hero */}
      <main className="relative z-10">
        <section className="mx-auto max-w-5xl px-6 pt-20 pb-32 text-center md:pt-32 md:pb-40">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.1 } },
            }}
          >
            <motion.div variants={fadeUp} custom={0} className="mb-6">
              <span className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-1.5 text-xs font-medium text-violet-300">
                <Zap className="h-3.5 w-3.5" />
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
              className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-zinc-400 md:text-xl"
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
                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-8 py-3.5 text-sm font-semibold text-white shadow-xl shadow-violet-500/25 transition-all hover:shadow-violet-500/40 hover:brightness-110"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Get Started, Free
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
              <a
                href="#features"
                className="inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-medium text-zinc-400 transition-colors hover:text-white"
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
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-violet-600/20 via-indigo-600/20 to-purple-600/20 blur-2xl" />
            <div className="glass-strong relative overflow-hidden rounded-2xl p-1 shadow-2xl">
              <div className="rounded-xl bg-surface p-6">
                {/* Mock dashboard */}
                <div className="flex gap-4">
                  {/* Mini sidebar */}
                  <div className="hidden w-40 shrink-0 rounded-lg bg-background/50 p-3 md:block">
                    <div className="mb-3 h-2 w-16 rounded bg-violet-500/30" />
                    {["Frontend", "Backend", "Design", "Ideas"].map((cat, i) => (
                      <div
                        key={cat}
                        className={`mb-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium ${
                          i === 0
                            ? "bg-violet-500/15 text-violet-300"
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
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
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
        <section id="features" className="mx-auto max-w-6xl px-6 pb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="mb-16 text-center"
          >
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Everything you need.{" "}
              <span className="text-zinc-500">Nothing you don&apos;t.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-zinc-400">
              Three content types, visual boards, tags, and search. Simple enough
              to use daily, powerful enough to replace scattered bookmarks and
              notes.
            </p>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="group relative rounded-2xl border border-zinc-800/50 bg-card/50 p-6 transition-all hover:border-zinc-700/50 hover:bg-card/80"
              >
                <div
                  className={`mb-4 inline-flex rounded-xl bg-gradient-to-br ${feature.gradient} p-3`}
                >
                  <feature.icon className={`h-5 w-5 ${feature.iconColor}`} />
                </div>
                <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-zinc-400">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* AI Section */}
        <section className="mx-auto max-w-4xl px-6 pb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-3xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 via-indigo-500/5 to-transparent p-8 md:p-12"
          >
            <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-violet-600/10 blur-[80px]" />
            <div className="relative">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-violet-500/15 px-4 py-1.5 text-xs font-medium text-violet-300">
                <Sparkles className="h-3.5 w-3.5" />
                AI-Assisted
              </div>
              <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
                Smart suggestions,<br />not autopilot.
              </h2>
              <p className="mb-8 max-w-lg text-zinc-400">
                AI that helps you tag, categorize, and discover connections in
                your saved content. It suggests, you decide. No forced
                auto-organization.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  "Suggest tags from content",
                  "Detect code vs. plain text",
                  "Recommend the right board",
                  "Find related saved posts",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-xl bg-white/[0.03] px-4 py-3 text-sm text-zinc-300"
                  >
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-500/20">
                      <Sparkles className="h-3 w-3 text-violet-400" />
                    </div>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </section>

        {/* Bottom CTA */}
        <section className="mx-auto max-w-4xl px-6 pb-32 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-4 inline-flex items-center gap-2 text-sm text-zinc-500">
              <Shield className="h-4 w-4" />
              Private by default. Your data, your boards.
            </div>
            <h2 className="mb-6 text-3xl font-bold tracking-tight md:text-4xl">
              Stop losing what matters.
            </h2>
            <Link
              href="/login"
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-8 py-3.5 text-sm font-semibold text-white shadow-xl shadow-violet-500/25 transition-all hover:shadow-violet-500/40 hover:brightness-110"
            >
              Start organizing for free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="border-t border-zinc-800/50 px-6 py-8 text-center text-xs text-zinc-500">
          <div className="flex items-center justify-center gap-2">
            <Layers className="h-4 w-4" />
            <span>Stickify</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
