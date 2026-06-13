import type { Variants } from "framer-motion";

const smoothEase = [0.16, 1, 0.3, 1] as const;

export const blurReveal: Variants = {
  hidden: {
    opacity: 0,
    y: 40,
    filter: "blur(14px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.95,
      ease: smoothEase,
    },
  },
};

export const blurRevealStagger = (delay = 0): Variants => ({
  hidden: {
    opacity: 0,
    y: 36,
    filter: "blur(12px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      delay,
      duration: 0.85,
      ease: smoothEase,
    },
  },
});

export const scrollViewport = {
  once: true,
  margin: "-80px" as const,
  amount: 0.25 as const,
};
