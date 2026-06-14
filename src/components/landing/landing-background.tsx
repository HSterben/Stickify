"use client";

import dynamic from "next/dynamic";

const StickifyGrainient = dynamic(
  () =>
    import("@/components/ui/stickify-grainient").then((mod) => mod.StickifyGrainient),
  { ssr: false }
);

const FALLBACK_GRADIENT =
  "radial-gradient(ellipse 120% 80% at 50% -20%, rgba(89, 63, 248, 0.35) 0%, transparent 55%), linear-gradient(180deg, #1a1630 0%, #141414 45%, #141414 100%)";

export function LandingBackground() {
  return (
    <>
      <div
        className="pointer-events-none fixed inset-0 z-0"
        aria-hidden
        style={{ background: FALLBACK_GRADIENT }}
      />
      <StickifyGrainient className="pointer-events-none fixed inset-0 z-0" />
    </>
  );
}
