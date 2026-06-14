"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
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
import { blurReveal, scrollViewport } from "@/lib/motion";

type Feature = {
  icon: LucideIcon;
  title: string;
  description: string;
  accent: string;
  iconBg: string;
};

const features: Feature[] = [
  {
    icon: FileText,
    title: "Notes",
    description: "Write stuff down. Keep it on a board.",
    accent: "text-rose-300/90",
    iconBg: "bg-rose-500/10 ring-rose-500/15",
  },
  {
    icon: Code2,
    title: "Code",
    description: "Save snippets. Copy them with one click.",
    accent: "text-emerald-300/90",
    iconBg: "bg-emerald-500/10 ring-emerald-500/15",
  },
  {
    icon: Link2,
    title: "Links",
    description: "Paste a URL. You get a preview card.",
    accent: "text-sky-300/90",
    iconBg: "bg-sky-500/10 ring-sky-500/15",
  },
  {
    icon: Layers,
    title: "Boards",
    description: "Put your stuff in boards so it's not all over the place.",
    accent: "text-violet-300/90",
    iconBg: "bg-violet-500/10 ring-violet-500/15",
  },
  {
    icon: Tags,
    title: "Tags",
    description: "Tag posts. Filter by tag when you need to.",
    accent: "text-amber-300/90",
    iconBg: "bg-amber-500/10 ring-amber-500/15",
  },
  {
    icon: Search,
    title: "Search",
    description: "Search all your boards at once.",
    accent: "text-indigo-300/90",
    iconBg: "bg-indigo-500/10 ring-indigo-500/15",
  },
  {
    icon: Share2,
    title: "Share",
    description: "Make a board public and send the link to anyone.",
    accent: "text-teal-300/90",
    iconBg: "bg-teal-500/10 ring-teal-500/15",
  },
];

function FeatureCard({ feature }: { feature: Feature }) {
  const Icon = feature.icon;

  return (
    <article className="glass-on-gradient w-[min(85vw,22rem)] shrink-0 rounded-2xl border-zinc-800/80 p-6 transition-colors hover:border-zinc-700 md:w-[24rem]">
      <div
        className={`mb-4 inline-flex rounded-xl p-3 ring-1 ring-inset ${feature.iconBg}`}
      >
        <Icon className={`h-5 w-5 ${feature.accent}`} />
      </div>
      <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
      <p className="text-sm leading-relaxed text-zinc-400">{feature.description}</p>
    </article>
  );
}

export function FeaturesScrollSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const pin = pinRef.current;
    const track = trackRef.current;

    if (!section || !pin || !track) return;

    const media = window.matchMedia("(min-width: 768px)");
    if (!media.matches) return;

    let tween: { kill: () => void; scrollTrigger?: { kill: () => void } } | null = null;

    const setup = async () => {
      const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);

      gsap.registerPlugin(ScrollTrigger);

      const getScrollDistance = () =>
        Math.max(track.scrollWidth - window.innerWidth, 0);

      tween = gsap.to(track, {
        x: () => -getScrollDistance(),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${getScrollDistance()}`,
          pin: pin,
          scrub: 0.8,
          invalidateOnRefresh: true,
          anticipatePin: 1,
        },
      });
    };

    void setup();

    return () => {
      tween?.scrollTrigger?.kill();
      tween?.kill();
    };
  }, []);

  return (
    <section
      id="features"
      ref={sectionRef}
      className="relative mt-5 md:mt-8"
    >
      <div
        ref={pinRef}
        className="relative hidden min-h-screen flex-col justify-center overflow-hidden md:flex"
      >
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={scrollViewport}
          variants={blurReveal}
          className="relative z-10 mb-10 px-6 text-center md:mb-14"
        >
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            What it does
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-zinc-400">
            Notes, code, links, boards, tags, search, and share.
          </p>
          <p className="mx-auto mt-3 hidden text-xs tracking-wide text-zinc-500 md:block">
            Scroll to explore
          </p>
        </motion.div>

        <div className="relative w-full overflow-hidden">
          <div
            ref={trackRef}
            className="flex w-max items-stretch gap-6 px-6 pb-8 will-change-transform md:gap-8 md:px-[max(1.5rem,calc((100vw-72rem)/2+1.5rem))] md:pb-12"
          >
            {features.map((feature) => (
              <FeatureCard key={feature.title} feature={feature} />
            ))}
          </div>
        </div>
      </div>

      <div className="px-6 pt-20 pb-8 md:hidden">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            What it does
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-zinc-400">
            Notes, code, links, boards, tags, search, and share.
          </p>
        </div>
      </div>

      <div className="grid gap-6 px-6 pb-32 sm:grid-cols-2 sm:gap-7 md:hidden">
        {features.map((feature) => (
          <article
            key={feature.title}
            className="glass-on-gradient rounded-2xl border-zinc-800/80 p-6"
          >
            <div
              className={`mb-4 inline-flex rounded-xl p-3 ring-1 ring-inset ${feature.iconBg}`}
            >
              <feature.icon className={`h-5 w-5 ${feature.accent}`} />
            </div>
            <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
            <p className="text-sm leading-relaxed text-zinc-400">
              {feature.description}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
