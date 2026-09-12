"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import {
  Layers,
  Code2,
  Link2,
  FileText,
  Search,
  Tags,
  Share2,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { blurReveal, scrollViewport } from "@/lib/motion";

type Feature = {
  icon: LucideIcon;
  title: string;
  description: string;
  accent: string;
  iconBg: string;
  tint: string;
};

const features: Feature[] = [
  {
    icon: FileText,
    title: "Notes",
    description: "Write freely with checklists, code blocks, and images in one post.",
    accent: "text-rose-300/90",
    iconBg: "bg-rose-500/10 ring-rose-500/15",
    tint: "from-rose-500/10",
  },
  {
    icon: Code2,
    title: "Code blocks",
    description: "Insert a code block inside any note and copy it in one click.",
    accent: "text-emerald-300/90",
    iconBg: "bg-emerald-500/10 ring-emerald-500/15",
    tint: "from-emerald-500/10",
  },
  {
    icon: Link2,
    title: "Links",
    description: "Paste a URL for a preview card, or keep it as a plain link.",
    accent: "text-sky-300/90",
    iconBg: "bg-sky-500/10 ring-sky-500/15",
    tint: "from-sky-500/10",
  },
  {
    icon: Layers,
    title: "Boards",
    description: "Group posts on boards instead of leaving them scattered.",
    accent: "text-violet-300/90",
    iconBg: "bg-violet-500/10 ring-violet-500/15",
    tint: "from-violet-500/10",
  },
  {
    icon: Tags,
    title: "Tags",
    description: "Add tags to posts, then filter by tag.",
    accent: "text-amber-300/90",
    iconBg: "bg-amber-500/10 ring-amber-500/15",
    tint: "from-amber-500/10",
  },
  {
    icon: Search,
    title: "Search",
    description: "Search across every board at once.",
    accent: "text-indigo-300/90",
    iconBg: "bg-indigo-500/10 ring-indigo-500/15",
    tint: "from-indigo-500/10",
  },
  {
    icon: Share2,
    title: "Share",
    description: "Publish a board and send the link to anyone.",
    accent: "text-teal-300/90",
    iconBg: "bg-teal-500/10 ring-teal-500/15",
    tint: "from-teal-500/10",
  },
];

/** Soft vertical path — gentle sway, not a hard zigzag. */
const SPINE_PATH =
  "M 50 4 C 48 40, 54 70, 50 100 C 46 130, 53 160, 50 190 C 47 220, 54 250, 50 280 C 46 310, 53 340, 50 370 C 47 400, 54 430, 50 460 C 46 490, 53 520, 50 550 C 48 580, 52 610, 50 640 C 49 660, 50 680, 50 696";

function FeatureMiniCard({
  feature,
  side,
  progress,
  index,
  total,
}: {
  feature: Feature;
  side: "left" | "right";
  progress: MotionValue<number>;
  index: number;
  total: number;
}) {
  const Icon = feature.icon;
  const start = index / total;
  const mid = Math.min(start + 0.14, 0.98);
  const opacity = useTransform(progress, [start, mid], [0, 1]);
  const y = useTransform(progress, [start, mid], [28, 0]);
  const scale = useTransform(progress, [start, mid], [0.97, 1]);

  return (
    <motion.article
      style={{ opacity, y, scale }}
      className={cn(
        "relative w-full max-w-sm",
        side === "left" ? "md:mr-auto md:pr-12 lg:pr-16" : "md:ml-auto md:pl-12 lg:pl-16",
      )}
    >
      <div
        className={cn(
          "glass-on-gradient relative overflow-hidden rounded-2xl border-zinc-800/80 p-5 md:p-6",
          "bg-gradient-to-br to-transparent",
          feature.tint,
        )}
      >
        <div className="mb-3 flex items-center gap-3">
          <div
            className={cn(
              "inline-flex rounded-xl p-2.5 ring-1 ring-inset",
              feature.iconBg,
            )}
          >
            <Icon className={cn("h-4 w-4", feature.accent)} />
          </div>
          <h3 className="text-base font-semibold tracking-tight md:text-lg">
            {feature.title}
          </h3>
        </div>
        <p className="text-sm leading-relaxed text-zinc-400">{feature.description}</p>
      </div>
    </motion.article>
  );
}

function SpineDash({
  progress,
  index,
  total,
}: {
  progress: MotionValue<number>;
  index: number;
  total: number;
}) {
  const start = index / total;
  const mid = Math.min(start + 0.1, 0.98);
  const scaleY = useTransform(progress, [start, mid], [0.35, 1]);
  const opacity = useTransform(progress, [start, mid], [0.2, 1]);

  return (
    <motion.span
      style={{ scaleY, opacity }}
      className="absolute top-1/2 left-1/2 z-10 hidden h-4 w-[2.5px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-300/90 shadow-[0_0_10px_rgba(167,139,250,0.45)] md:block"
      aria-hidden
    />
  );
}

export function FeaturesLineSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.85", "end 0.5"],
  });
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 70,
    damping: 26,
    restDelta: 0.001,
  });
  const pathLength = useTransform(smoothProgress, [0, 1], [0, 1]);

  return (
    <section id="features" className="relative mt-6 md:mt-12">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={scrollViewport}
        variants={blurReveal}
        className="relative z-10 mb-8 px-6 text-center md:mb-10"
      >
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
          What you can do in Stickify
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-zinc-400">
          Save posts on boards, then tag, search, or share them.
        </p>
      </motion.div>

      <div
        ref={containerRef}
        className="relative mx-auto max-w-5xl px-6 pb-20 md:pb-28"
      >
        <div className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-24 -translate-x-1/2 md:block">
          <svg
            viewBox="0 0 100 700"
            preserveAspectRatio="none"
            className="h-full w-full"
            aria-hidden
          >
            <path
              d={SPINE_PATH}
              fill="none"
              stroke="rgba(113, 113, 122, 0.28)"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeDasharray="5 9"
            />
            <motion.path
              d={SPINE_PATH}
              fill="none"
              stroke="url(#feature-line-gradient)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="5 9"
              style={{ pathLength }}
            />
            <defs>
              <linearGradient
                id="feature-line-gradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor="#854efe" stopOpacity="0.2" />
                <stop offset="45%" stopColor="#a78bfa" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#593ff8" stopOpacity="0.45" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="pointer-events-none absolute top-2 bottom-2 left-[1.65rem] w-px overflow-hidden md:hidden">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "repeating-linear-gradient(to bottom, rgba(113,113,122,0.45) 0 5px, transparent 5px 14px)",
            }}
          />
          <motion.div
            className="absolute inset-x-0 top-0 h-full origin-top"
            style={{
              scaleY: pathLength,
              backgroundImage:
                "repeating-linear-gradient(to bottom, rgba(167,139,250,0.95) 0 5px, transparent 5px 14px)",
            }}
          />
        </div>

        <div className="relative space-y-6 md:space-y-8">
          {features.map((feature, index) => {
            const side = index % 2 === 0 ? "left" : "right";

            return (
              <div
                key={feature.title}
                className="relative grid md:grid-cols-2 md:items-center"
              >
                <div
                  className={cn(
                    "col-start-1 row-start-1 pl-8 md:pl-0",
                    side === "right" && "md:col-start-2",
                  )}
                >
                  <FeatureMiniCard
                    feature={feature}
                    side={side}
                    progress={smoothProgress}
                    index={index}
                    total={features.length}
                  />
                </div>
                <SpineDash
                  progress={smoothProgress}
                  index={index}
                  total={features.length}
                />
                <span
                  className="absolute top-6 left-[1.65rem] z-10 h-3.5 w-[2px] -translate-x-1/2 rounded-full bg-violet-300/90 md:hidden"
                  aria-hidden
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
